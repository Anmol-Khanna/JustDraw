function setup(){
    var canvasWidth = windowWidth*0.8;
    var canvasHeight = windowHeight*0.8;
    createCanvas(canvasWidth,canvasHeight, P2D);
    background(200,0,0);
    frameRate(200);
}

function draw(){
    brushRadius = 10;
    /*if(mouseIsPressed){
        fill(0);
        ellipse(mouseX, mouseY, brushRadius, brushRadius);
    }*/
    //var downHandler = window.onpointerdown; //downHandler is the event
    var windowDownHandler = window.onpointerdown; //downHandler is the event
    var cnv = document.getElementById("defaultCanvas0");
    if(cnv){
        
        cnv.onpointerdown = handlePointerDown;
        function handlePointerDown(event){
            console.log("Pointer type is "+ event.pointerType);
        }
        
    }
    

    
}