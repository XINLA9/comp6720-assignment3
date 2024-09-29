let osc;
let env;
var ripples = [];
var balls = [];

// Define standard notes and their frequencies
const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const noteFrequencies = {
  "C4": 261.63,
  "D4": 293.66,
  "E4": 329.63,
  "F4": 349.23,
  "G4": 392.00,
  "A4": 440.00,
  "B4": 493.88
};

function setup() {
  // create the canvas using the full browser window
  createCanvas(windowWidth, windowHeight);

  // Initialize oscillator and envelope
  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0);

   env = new p5.Envelope();
  env.setADSR(0.01, 0.2, 0.5, 0.1);
  env.setRange(1, 0);

  // draw a border to help you see the size
  // this isn't compulsory (remove this code if you like)
  strokeWeight(5);
  // Note the use of width and height here, you will probably use this a lot 
  // in your sketch.
  rect(0, 0, width, height);
}


function draw() {
  // your cool abstract sonic artwork code goes in this draw function
  background(255);

  // 绘制所有 bloomers
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].display();

    // 如果 bloomer 已经完全绽放并消失，则从数组中删除
    if (ripples[i].isBloomed) {
      ripples.splice(i, 1);
    }
  }
}

// 鼠标点击时添加新的 bloomer，并根据点击位置播放不同音调
function mousePressed() {
  let newBloomer = new bloomer(mouseX, mouseY);
  ripples.push(newBloomer);
  
  // 根据鼠标的 X 位置映射到 notes 数组中的一个音符
  let noteIndex = int(map(mouseX, 0, width, 0, notes.length));
  noteIndex = constrain(noteIndex, 0, notes.length - 1); // 确保索引在有效范围内
  let selectedNote = notes[noteIndex];

  // 设置振荡器的频率为选中的音符的频率
  let freq = noteFrequencies[selectedNote];
  
  osc.freq(freq);

  
  
  // 触发包络播放音符
  env.play(osc, 0, 0.1);
}

// when you hit the spacebar, what's currently on the canvas will be saved (as a
// "thumbnail.png" file) to your downloads folder
function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  }
}

class ripples{
  constructor(x,y){
    this.x = x;
    this.y = y;
    
  }
}

// Ripple 类定义
class bloomer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 0;
    this.rMax = random(200, 400);
    this.speed = random(4,5);
    this.isBloomed = false;

    // 设置随机颜色
    let colors = [color("red"), color("blue"), color("purple"), color("green"), color("yellow"), color("orange")];
    this.color = colors[int(random(colors.length))];
    this.color.setAlpha(80);
  }

  // 更新 bloomer 的半径，直到达到最大值
  update() {
    if (this.r <= this.rMax) {
      this.r += this.speed;
    } else {
      this.isBloomed = true;
    }
    let tsp = map(this.r, 0, this.rMax, 40, 0);
    this.color.setAlpha(tsp);
  }

  // 绘制 bloomer
  display() {
    push();
    // stroke(this.color);
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
    pop();
  }
}