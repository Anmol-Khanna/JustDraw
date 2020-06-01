var WILL = {
    backgroundColor: Module.Color.BLUE,
    color: Module.Color.from(255, 204, 204),

    init: function(width, height) {
        this.initInkEngine(width, height);
        this.initEvents();
    },
    initInkEngine: function(width, height) {
        this.canvas = new Module.InkCanvas(document.getElementById("canvas"), width, height); //canvas property in Module namespace. Needs to be set up for anything to work
        this.canvas.clear(this.backgroundColor);
        this.brush = new Module.DirectBrush();
        this.speedPathBuilder = new Module.SpeedPathBuilder();
        this.speedPathBuilder.setNormalizationConfig(182, 3547);
        this.speedPathBuilder.setPropertyConfig(Module.PropertyName.Width, 2.05, 34.53, 0.72, NaN, Module.PropertyFunction.Power, 1.19, false);
        if (window.PointerEvent) {
            this.pressurePathBuilder = new Module.PressurePathBuilder();
            this.pressurePathBuilder.setNormalizationConfig(0.195, 0.88);
            this.pressurePathBuilder.setPropertyConfig(Module.PropertyName.Width, 2.05, 34.53, 0.72, NaN, Module.PropertyFunction.Power, 1.19, false);
        }
        this.strokeRenderer = new Module.StrokeRenderer(this.canvas, this.canvas);
        this.strokeRenderer.configure({brush: this.brush, color: this.color});
    },
    initEvents: function() {
        var self = this;

        if (window.PointerEvent) {
            Module.canvas.addEventListener("pointerdown", function(e) {self.beginStroke(e);});
            Module.canvas.addEventListener("pointermove", function(e) {self.moveStroke(e);});
            document.addEventListener("pointerup", function(e) {self.endStroke(e);});
        }
        else {
            Module.canvas.addEventListener("mousedown", function(e) {self.beginStroke(e);});
            Module.canvas.addEventListener("mousemove", function(e) {self.moveStroke(e);});
            document.addEventListener("mouseup", function(e) {self.endStroke(e);});

            if (window.TouchEvent) {
                Module.canvas.addEventListener("touchstart", function(e) {self.beginStroke(e);});
                Module.canvas.addEventListener("touchmove", function(e) {self.moveStroke(e);});
                document.addEventListener("touchend", function(e) {self.endStroke(e);});
            }
        }
    },
    getPressure: function(e) {
        return (window.PointerEvent && e instanceof PointerEvent && e.pressure !== 0.5)?e.pressure:NaN;
    },

    beginStroke: function(e) {
        if (["mousedown", "mouseup"].contains(e.type) && e.button != 0) return;
        if (e.changedTouches) e = e.changedTouches[0];

        this.inputPhase = Module.InputPhase.Begin;
        
        //console.log("ip phase "+JSON.stringify(this.inputPhase));
        this.pressure = this.getPressure(e);
        console.log(" pressure is "+this.pressure);
        //this.pathBuilder = isNaN(this.pressure)?this.speedPathBuilder:this.pressurePathBuilder;
        this.pathBuilder = this.pressurePathBuilder;
        console.log("Path builder is " + JSON.stringify(this.pathBuilder));

        this.buildPath({x: e.clientX, y: e.clientY});
        this.drawPath();
    },

    moveStroke: function(e) {
        if (!this.inputPhase) { //if I'm just moving the cursor but not clicking, simply return
            return;
        }
        //console.log("move 2");
        //console.log("pointer type is is " + e.pointerType);
        //console.log("ip phase in move is " + JSON.stringify(this.inputPhase));

        this.inputPhase = Module.InputPhase.Move;
        this.pointerPos = {x: e.clientX, y: e.clientY};
        this.pressure = this.getPressure(e);
        //console.log(" pressure is "+this.presure);

        if (WILL.frameID != WILL.canvas.frameID) {
            var self = this;

            WILL.frameID = WILL.canvas.requestAnimationFrame(function() { // This function doesn't seem to be called when using a pen AS a pen. Using the tablet with Win Ink turned off just has it emulate a mouse, as far as the computer knows
                if (self.inputPhase && self.inputPhase == Module.InputPhase.Move) {
                    console.log("pos " + JSON.stringify(self.pointerPos));
                    self.buildPath(self.pointerPos);
                    self.drawPath();
                }
            }, true);
        }
    },
    endStroke: function(e) {
        if (!this.inputPhase) return;

        this.inputPhase = Module.InputPhase.End;
        this.pressure = this.getPressure(e);

        this.buildPath({x: e.clientX, y: e.clientY});
        this.drawPath();

        delete this.inputPhase;
    },
    buildPath: function(pos) {
        var pathBuilderValue = isNaN(this.pressure)?Date.now() / 1000:this.pressure;

        var pathPart = this.pathBuilder.addPoint(this.inputPhase, pos, pathBuilderValue);
        var pathContext = this.pathBuilder.addPathPart(pathPart);

        this.pathPart = pathContext.getPathPart();
    },
    drawPath: function() {
        this.strokeRenderer.draw(this.pathPart, this.inputPhase == Module.InputPhase.End);
    },
    clear: function() {
        this.canvas.clear(this.backgroundColor);
    }
};

Module.addPostScript(function() {
    WILL.init(800, 600);
});


/*
var brushRadius = 10;
    var bCanPaint = false;
    var windowDownHandler = window.onpointerdown; //downHandler is the event
    var cnv = document.getElementById("defaultCanvas0");
    if(cnv){
        cnv.onpointerdown = handlePointerDown;
        cnv.onpointerup = handlePointerUp;
        cnv.onpointermove = handlePointerMove;
    }
    function handlePointerDown(event){
        //console.log("Pointer type is "+ event.pointerType);
        //console.log("Pointer pressure is "+ event.pressure);
        brushRadius = event.pressure*50;
        bCanPaint = true;
    }
    function handlePointerMove(event){
        if(bCanPaint === true){
            ellipse(mouseX,mouseY,brushRadius);
        }
    }

    function handlePointerUp(event){
        bCanPaint = false;
    }
*/


/*
Issues-

1) Pen uses SpeedPathBuilder when it should be using PressurePathBuilder.

2) There's an issue with Windows Ink- If I'm using Ink enabled from Wacom pen settings -> Mapping, if I ever click the canvas using the mouse, it'll use the SpeedPathBuilder, but then any succcessive pen input
won't render correctly. They'll all fail to refister a move event when the pen is pressed down- only registering move events when hovering. Refreshing doesn't fix it, the only thing that does is going into Wacom settings and unchecking 'Windows Ink'. Without Windows Ink, 
pen input works using the SpeedPathBuilder (may be Issue 1, potentially unrelated) but never fails to register a touchMove event again. Unsure why Windows Ink works fine UP UNTIL mouse is used and then never after.

Going to check using Win INK, switching to mouse, using pen (shouldn't work), turning off the server, turning on server and checking pen input again- 
- Same behaviour. Pen inoput functions as mouse input using SpeedPathBuilder until the actual mouse offers input, and then fails to register move events when pen is pressed down, instead only registering move events when 
pen is hovering. 
    INTERESTINGLY, When pen is hovering, SPEEDPATHBUILDER IS NOT USED. Makes sense, since the path builder works by using the move event, which is disabled at that time.

Hypothesis- once mouse enters the picture, Windows Ink just treats any pointing device as though it's definitely the mouse?Thus there is no meaning to the pen "being pressed", and pen hover is equated to being 
mouse movement. Turning off Windows Ink at this point re-registers the pen, and non-Windows Ink drivers don't get confused the same way afterwards. This could be why the non Win Ink drivers manage to register move
events even if the mouse is used between pen inputs.


HOWEVER, using Windows Ink seems to be the only way to get pressure information- and EVEN THEN, pressure info is ONLY RETRIEVED AFTER MOUSE IS USED ONCE. Basically only when move event stops being registered.
Need to figure out how to use Windows Ink to get BOTH pressure info AND to register the move event
*/