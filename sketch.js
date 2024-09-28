let osc;
function setup() {
  // create the canvas using the full browser window
  createCanvas(windowWidth, windowHeight);

  // draw a border to help you see the size
  // this isn't compulsory (remove this code if you like)
  strokeWeight(5);
  // Note the use of width and height here, you will probably use this a lot 
  // in your sketch.
  rect(0, 0, width, height);
  osc = new sound.osc
}

function draw() {
  // your cool abstract sonic artwork code goes in this draw function
  background(255);
  
}

// when you hit the spacebar, what's currently on the canvas will be saved (as a
// "thumbnail.png" file) to your downloads folder
function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  }
}


class ripples {
  constructor(){
    this.x = mouseX;
    this.y = mouseY;
    this.r = 0;
    this.rMax = random(100,200);
    this.isBloomed = false;
    
    let colors = [color("red"),color("blue"),color("purple"),color("green"),color("yellow"), color("orange")];
    this.color = colors[int(random(colors.length))];
    this.color.setAlpha(20);
  }
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.r = 0;
    this.rMax = random(100,200);
    this.isBloomed = false;
    
    let colors = [color("red"),color("blue"),color("purple"),color("green"),color("yellow"), color("orange")];
    this.color = colors[int(random(colors.length))];
    this.color.setAlpha(20);
  }
}