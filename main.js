function setup(){
    var canvasWidth = windowWidth*0.8;
    var canvasHeight = windowHeight*0.8;
    createCanvas(canvasWidth,canvasHeight, P2D);
    background(200,0,0);
    frameRate(200);
    
    noLoop();
}

function draw(){
    /*if(mouseIsPressed){
        fill(0);
        ellipse(mouseX, mouseY, brushRadius, brushRadius);
    }*/
    var brushRadius = 10;
    var bCanPaint = false;
    var windowDownHandler = window.onpointerdown; //downHandler is the event
    var cnv = document.getElementById("defaultCanvas0");
    if(cnv){
        cnv.onpointerdown = handlePointerDown;
        cnv.onpointerup = handlePointerUp;
        cnv.onpointermove = handlePointerMove;
    }
    if(cnv.onpointerdown && cnv.onpointermove){
        
    }
    function handlePointerDown(event){ // sets pressure
        //console.log("Pointer type is "+ event.pointerType);
        //console.log("Pointer pressure is "+ event.pressure);
        brushRadius = event.pressure*50;
        bCanPaint = true;
        
        //fill(0); // fill() only works for ellipse()
        //strokeWeight(event.pressure*50);
        //line(pMouseX,pMouseY, mouseX, mouseY);
    }
    function handlePointerMove(event){
        if(bCanPaint === true){
            ellipse(mouseX,mouseY,brushRadius);
        }
    }

    function handlePointerUp(event){
        bCanPaint = false;
    }

}