function setup(){
    var canvasWidth = windowWidth*0.8;
    var canvasHeight = windowHeight*0.8;
    createCanvas(canvasWidth,canvasHeight, P2D);
    background(200,0,0);
    frameRate(200);
}

function draw(){
    brushRadius = 10;
    if(mouseIsPressed){
        fill(0);
        ellipse(mouseX, mouseY, brushRadius, brushRadius);
    }
    
}