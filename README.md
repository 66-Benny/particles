## 演示页面
[初级版](https://66-benny.github.io/particles/初级版.html)

[初级多坐标版](https://66-benny.github.io/particles/初级多坐标版.html)

[初级多坐标移动版](https://66-benny.github.io/particles/初级多坐标移动版.html)

[中级连线版](https://66-benny.github.io/particles/中级连线版.html)

[高级鼠标事件版](https://66-benny.github.io/particles/高级鼠标事件版.html)

## particles 的分步实现
### 从初级版到中级版，再到最后的高级版，我将一步步展示 particles 的实现效果。

#### **1. 先来看下最初级的这个版本 ([初级版](https://66-benny.github.io/particles/初级版.html))**, 其实现原理就是单个粒子给定 X 轴和 Y 轴的偏移量，从原点出发，遇到边界后反向90度变向，继续沿轨迹行走。

#### **2. 了解了基本的实现原理后，我们可以接着实现多坐标的版本了([初级多坐标版](https://66-benny.github.io/particles/初级多坐标版.html))**, 首先我们得有个画布，那么 HTML5 的 Canvas 就是很好选择，就像下面这样，一行代码就生成了一个画布
```
 <canvas id="myCanvas"></canvas>
```

#### 多坐标的原理就是先随机生成若干个粒子
```
//粒子的相关属性数值
var args = {
    num: 50,
    color: 'red'
}
var myCanvas = document.getElementById('myCanvas');
var points = new Array(args.num);
//生成粒子的随机坐标
for (let i = 0; i < points.length; i++) {
    points[i] = {
        x: Math.floor(Math.random() * myCanvas.width),
        y: Math.floor(Math.random() * myCanvas.height)
    };
}
```
#### 根据 [Canvas API](http://javascript.ruanyifeng.com/htmlapi/canvas.html) 再将这些粒子绘画在画布上。 (这里有个性能优化问题，文章后面将会提到【优化1】)
```
function show() {
    points.sort((a, b) =>
        a.x - b.x
    );
    // 画出每一个粒子点
    var cxt = myCanvas.getContext('2d');
    cxt.fillStyle = args.color;
    cxt.clearRect(0, 0, myCanvas.width, myCanvas.height);
    cxt.strokeStyle = args.color;
    for (let i = 0; i < points.length; i++) {
        var p1 = points[i];
        cxt.beginPath();
        cxt.arc(p1.x, p1.y, args.scrilWidth, 0, Math.PI * 2, true);
        cxt.closePath();
        cxt.fill();
    }
}
show()
setInterval(show, 1000 / 60)
```
#### 考虑到随着浏览器的放大和缩小，粒子的相对位置也得跟随变化，所以我们要写个函数，来自适应浏览器的 resize问题。 （这里有个小的性能优化可以优化，文章后面部分将会提到【优化2】）
```
// 处理浏览器窗口的resize
function resizeCanvas() {
    for (let i = 0; i < points.length; i++) {
        var p = points[i];
        p.x = (p.x / myCanvas.width) * document.body.clientWidth;
        p.y = (p.y / myCanvas.height) * document.body.clientHeight;
    }
    myCanvas.width = document.body.clientWidth;
    myCanvas.height = document.body.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);
```
#### 好了，到目前为止，在画布上随机分布指定数目的粒子算是大功告成了。

#### **3. 现在我们要让粒子们动起来 ([初级多坐标移动版](https://66-benny.github.io/particles/初级多坐标移动版.html))**，
```
//粒子移动
function pointMove(ps) {
    for (let i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.x += args.speed * Math.sin(p.move);
        p.y += args.speed * Math.cos(p.move);
        //如果粒子触碰到边界，
        X 轴方向朝着 （2π - 起始角）方向运行，
        Y 轴方向朝着起始位置的负方向运行
        if (p.x < 0 || p.x > myCanvas.width) {
            p.move = 2 * Math.PI - p.move;
        } else if (p.y > myCanvas.height || p.y < 0) {
            p.move = Math.PI - p.move;
        }
    }
}
```
#### **4. 下面将是为为各个圆点连线 ([中级连线版](https://66-benny.github.io/particles/中级连线版.html))**，我认为这是实现 particles 的难点与重点，理解起来很麻烦。
> - 1.首先要运用三角函数计算出每个连接线的长度
> - 2.其次要实现出连接线近大远小的视觉特点
> - 3.如果两个粒子的距离超出一个指定的值，线将会断开
```
 //粒子间的连接线
 function theLineOfTwoPoints(p1, p2, cxt, d_connect) {
     //用三角函数计算两点间的距离
     var d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
     //利用 Canvas 的 globalAlpha 实现连接线的透明度
     cxt.globalAlpha = (d_connect - d) / d_connect;
     //判断两个粒子是否在指定距离内
     if (d < d_connect) {
         cxt.moveTo(p1.x, p1.y);
         cxt.lineTo(p2.x, p2.y);
         cxt.stroke();
         cxt.lineWidth = args.lineWidth;
     }
 }
 ```
 > - 4.找出所有满足条件可以与自身相连的粒子
 ```
 function show() {
    // 画出每一个粒子点
    var cxt = myCanvas.getContext('2d');
    cxt.fillStyle = args.color;
    cxt.clearRect(0, 0, myCanvas.width, myCanvas.height);
    cxt.strokeStyle = args.color;
    var d_connect = Math.max(myCanvas.width, myCanvas.height) * args.dist;
    for (let i = 0; i < length; i++) {
        //debugger
        var p1 = points[i];
        cxt.globalAlpha = 1;
        cxt.beginPath();
        cxt.arc(p1.x, p1.y, args.scrilWidth, 0, Math.PI * 2, true);
        cxt.closePath();
        cxt.fill();
        //找出所有满足条件可以与自身相连的粒子，连线
        for (let j = i + 1; j < length; j++) {
            var p2 = points[j];
            theLineOfTwoPoints(p1, p2, cxt, d_connect);
        }
    }
    pointMove(points)
}
show()
setInterval(show, 1000 / 60)
 ```