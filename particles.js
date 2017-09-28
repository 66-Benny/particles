var args = {
    point_num: 50,
    point_color: '#fffef9',
    point_speed: 0.4,
    point_dist: 0.1
};
var particles = document.getElementById("particles");
var points = new Array(args.point_num);
var mouse_point = {
    x: -1,
    y: -1
};
//随机生成粒子的坐标
for (let i = 0; i < points.length; i++) {
    points[i] = {
        x: Math.floor(Math.random() * particles.width),
        y: Math.floor(Math.random() * particles.height),
        move: Math.random() * 2 * Math.PI
    };
}
// 处理浏览器窗口的resize
function resizeCanvas() {
    for (let i = 0; i < points.length; i++) {
        var p = points[i];
        p.x = (p.x / particles.width) * document.body.clientWidth;
        p.y = (p.y / particles.height) * document.body.clientHeight;
    }
    particles.width = document.body.clientWidth;
    particles.height = document.body.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);
//粒子移动
function pointsMove(ps) {
    for (let i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.x += args.point_speed * Math.sin(p.move);
        p.y += args.point_speed * Math.cos(p.move);
        if (p.x < 0 || p.x > particles.width) {
            p.move = 2 * Math.PI - p.move;
        } else if (p.y > particles.height || p.y < 0) {
            p.move = Math.PI - p.move;
        }
    }
}
//粒子间的连接线
function theLineOfTwoPoints(p1, p2, cxt, d_connect) {
    //求直径
    var d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    cxt.globaAlpha = (d_connect - d) / d_connect;
    if (d < d_connect) {
        cxt.moveTo(p1.x, p1.y);
        cxt.lineTo(p2.x, p2.y);
        cxt.stroke();
    }
}
//鼠标事件
function canvasMouseMove(e) {
    var position = particles.getBoundingClientRect();
    var pos = {
        x: e.clientX - position.left * (particles.width / position.width),
        y: e.clientY - position.top * (particles.height / position.height)
    };
    mouse_point = {
        x: pos.x,
        y: pos.y
    };
}

function canvasMouseOut() {
    mouse_point = {
        x: -1,
        y: -1
    };
}
particles.addEventListener('mousemove', canvasMouseMove, false);
particles.addEventListener('mouseout', canvasMouseOut, false)
// 显示逻辑
function show() {
    // 先排序，减少计算量
    points.sort(function (a, b) {
        return a.x - b.x;
    });
    // 画出每一个粒子点
    var cxt = particles.getContext("2d");
    cxt.clearRect(0, 0, particles.width, particles.height);
    cxt.fillStyle = args.point_color;
    cxt.strokeStyle = args.point_color;
    var d_connect = Math.max(particles.width, particles.height) * args.point_dist;
    // 画出粒子之间的连接线
    for (let i = 0; i < points.length; i++) {
        var p1 = points[i];
        cxt.globalAlpha = 1;
        cxt.beginPath();
        cxt.arc(p1.x, p1.y, 3, 0, Math.PI * 2, true);
        cxt.closePath();
        cxt.fill();
        for (let j = i + 1; j < points.length; j++) {
            var p2 = points[j];
            theLineOfTwoPoints(p1, p2, cxt, d_connect);
            if (p1.x + d_connect < p2.x) {
                break; // 减少计算量
            }
        }
    }
    // 画出粒子与鼠标当前位置的连接线
    if (mouse_point.x >= 0) {
        for (let i = 0; i < points.length; i++) {
            theLineOfTwoPoints(mouse_point, points[i], cxt, d_connect);
        }
    }
    pointsMove(points)
}
show();
setInterval(show, 1000 / 60); // 以60帧的频率进行刷新