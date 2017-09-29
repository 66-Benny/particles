// 处理窗口缩放
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