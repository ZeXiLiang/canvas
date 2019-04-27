

function $(s){
    return document.querySelectorAll(s);
}
var lis = $("#list li");
for (var i = 0; i < lis.length; i++){
    lis[i].onclick = function(){
        for(var j = 0; j <lis.length;j++){
            lis[j].className = "";
        }
        this.className= "selected";
        load("/media/"+this.title);
    }
}

var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext||window.webkitAudioContext)();
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);
var analyser = ac.createAnalyser();
var size = 128;
analyser.fftSize = size * 2;
analyser.connect(gainNode);

var source = null;
var count =0;
var box =$("#box")[0];
var height,widht;

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots =[];//2
function random(m,n){ //2
    return Math.round(Math.random()*(n - m)+m);
}
function getDots(){ //2
    Dots = [];
 for(var i = 0;i<size;i++){
   var x = random(0,width);
   var y = random(0,height);
   var color = "rgb("+random(0,255)+","+random(0,255)+","+random(0,255)+")";
   Dots.push({
       x:x,
       y:y,
       color:color
   })
 }
}
function resize(){
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    var line = ctx.createLinearGradient(0,0,0,height);
    line.addColorStop(0,"red");
    line.addColorStop(.5,"yellow");
    line.addColorStop(1,"green");
    ctx.fillStyle = line;
getDots();//2
}
resize();

window.onresize =resize;
/**************************** */
function draw(arr){
    ctx.clearRect(0,0,width,height);
    var w = width /size;
    for(var i = 0; i < size;i++){
        if(draw.type == "column"){ //2
        var h = arr[i]/256 * height;

        ctx.fillRect(w * i,height-h,w*.6,h);
        console.log("1");
    } else if(draw.type == "dot"){
        ctx.beginPath();
        var o = Dots[i];
        var r = arr[i]/256 *50;
        ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
        ctx.strokeStyle = "#f60";
        ctx.stroke();
        
    }}
}
draw.type = "dot";//2

var types =$("#type li");
for(var i = 0; i < types.length; i++){
    types[i].onclick = function(){
        for(var j = 0;j < types.length;j++){
            types[j].className = "";
        }
        this.className = "selected";
        draw.type = this.getAttribute("data-type");
    }
}


/***************************** */
function load(url){

    var n = ++count;

    source && source[source.stop ? "stop" : "noteOff"]();
    xhr.abort();
    xhr.open("GET",url);
    xhr.responseType = "arraybuffer";//服务器端返回文件以二进制文件保存
    xhr.onload = function(){
        console.log(xhr.response);
        if(n != count)return;
        ac.decodeAudioData(xhr.response, function(buffer){
            if(n != count)return;
            var bufferSouse = ac.createBufferSource();
           bufferSouse.buffer =buffer;
           bufferSouse.connect(analyser);
            
            bufferSouse[bufferSouse.start?"start":"noteOn"](0);
            source = bufferSouse;
          
        },function(err){
            console.log(err);
        });

    }
    xhr.send();
}

function visualizer(){
    var arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);
    console.log(arr);
    requestAnimationFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame;
    function v() {
        analyser.getByteFrequencyData(arr);
        draw(arr);
        requestAnimationFrame(v);
    }

    requestAnimationFrame(v);

}
visualizer();

function changeVolume(percent) {
gainNode.gain.value = percent * percent;
}
$("#volume")[0].onchange = function(){
    changeVolume(this.value/this.max);
}
$("#volume")[0].onchange();