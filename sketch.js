let osc;
let env;
let ripples = [];
// let shapes = ["circle", "square", "triangle"];
let shapes = ["circle", "square"];
let notes = [];
let bgColor;
let count_whole = 0;
let playable_whole = true;

// Define sound properties for each shape type
const shapeSoundProperties = {
  "circle": { waveType: 'sine' },
  "square": { waveType: 'triangle' },
  "triangle": { waveType:  'cos'}
};
const notesType = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
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

  // set preset background color
  presetBgColors = [
    color(240),
    color(230),
    color(255)
  ];

  // Initialize oscillator and envelope
  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0);

  env = new p5.Envelope();
  env.setADSR(0.01, 0.2, 0.5, 0.1);
  env.setRange(1, 0);

  // // draw a border to help you see the size
  // // this isn't compulsory (remove this code if you like)
  // strokeWeight(5);
  // // Note the use of width and height here, you will probably use this a lot 
  // // in your sketch.
  // rect(0, 0, width, height);

  resetScene();

}

function draw() {
  // your cool abstract sonic artwork code goes in this draw function
  background(bgColor);

    // Update and display all ripple effects
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].update();
        ripples[i].display();

        // If a ripple hits a note, the note changes and plays a sound
        for (let j = notes.length - 1; j >= 0; j--) {
            if (ripples[i].hits(notes[j]) && !ripples[i].collisionRecord[j]) {
                // Push the note away based on ripple's position
                let angle = atan2(notes[j].y - ripples[i].y, notes[j].x - ripples[i].x);
                notes[j].vx = cos(angle) * 3; // Adjust push strength
                notes[j].vy = sin(angle) * 3; // Adjust push strength
                notes[j].changeShape();
                playNote(notes[j]); // Play the note sound
                ripples[i].collisionRecord[j] = true;
            }
        }

        // Remove ripple if it has fully bloomed
        if (ripples[i].isBloomed) {
            ripples.splice(i, 1);
        }
    }

    // Update and display all notes
    for (let note of notes) {
        note.update();
        note.display();
    }

    // Check if all notes are cleared, if yes, reset the scene
    if (notes.length === 0) {
        resetScene();
    }
}

// Generate non-overlapping notes
function generateNotes(count) {
  for (let i = 0; i < count; i++) {
      let note;
      let isOverlapping;

      do {
          note = new Note();
          isOverlapping = false;

          // Check for overlap with existing notes
          for (let other of notes) {
              let d = dist(note.x, note.y, other.x, other.y);
              if (d < note.r + other.r) {
                  isOverlapping = true;
                  break;
              }
          }
      } while (isOverlapping);

      notes.push(note);
  }
}

// Reset scene: switch background color, clear ripples, regenerate notes
function resetScene() {
  bgColor = random(presetBgColors);
  ripples = [];
  notes = [];
  generateNotes(random(10,20));

  // Randomly switch note shapes
  let newShape = random(shapes);
  Note.shape = newShape;
  console.log("Switched to shape:", newShape);
}

// Mouse press generates ripples
function mousePressed() {
  // Limit the number of ripples to 3; create new ones only after the previous ones disappear
  if (ripples.length < 3) {
      let newRipple = new Ripple(mouseX, mouseY);
      ripples.push(newRipple);
  }
}

// when you hit the spacebar, what's currently on the canvas will be saved (as a
// "thumbnail.png" file) to your downloads folder
function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  }
}

// Play note sound based on its shape and scale
function playNote(note) {
  if (note.canPlay){
    let shape = note.shape;
    let frequency = noteFrequencies[note.scale]; // Use the note's scale to determine frequency

    // Get wave type from shape properties
    let waveType = shapeSoundProperties[shape].waveType;
    osc.setType(waveType);
    osc.freq(frequency);
    env.play(osc, 0, 0.1);

    note.canPlay = false;
  }
}

// Note class representing the moving notes
class Note {
    static shape = "circle"; // Static variable to track the current shape

    constructor() {
        this.x = random(windowWidth / 5, (4 * windowWidth) / 5);
        this.y = random(windowHeight / 5, (4 * windowHeight) / 5);
        this.r = random(20, 40);
        this.color = color(random(255), random(255), random(255), 180);
        this.scale = random(notesType); // Randomly assign one of the seven notes
        this.vx = random(-3, 3);
        this.vy = random(-3, 3);
        this.shape = Note.shape; // Assign shape based on the static shape property
        
        this.canPlay = true;
        this.canPlayCount = 0;
    }

    update() {

        // Set a count to proforfid constant playing notes 
        if(!this.canPlay){
          this.canPlayCount ++;
        }
        
        if(!this.canPlay && this.canPlayCount>= 30)
        {
          this.canPlay = true;
          this.canPlayCount = 0;
        }

        // Notes move away from the mouse as it approaches
        let d = dist(mouseX, mouseY, this.x, this.y);
        if (d < 100) {
            let angle = atan2(this.y - mouseY, this.x - mouseX);
            this.vx = cos(angle) * 5;
            this.vy = sin(angle) * 5;
        }

        // Update note position
        this.x += this.vx;
        this.y += this.vy;

        // Check for collision with boundaries and bounce back
        if (this.x < this.r || this.x > width - this.r) {
            this.vx *= -1;
            playNote(this);
        }
        if (this.y < this.r || this.y > height - this.r) {
            this.vy *= -1;
            playNote(this);
        }
        // Check for collision with other notes
        for (let other of notes) {
            if (other !== this && this.intersects(other)) {
                this.resolveCollision(other);
                // playNote(this);
            }
        }

        // Add boundary constraints: ensure note is not pushed out of the boundaries when bouncing
        this.constrainToBounds();
    }

    // Check if two notes intersect
    intersects(other) {
        let d = dist(this.x, this.y, other.x, other.y);
        return d < this.r + other.r;
    }

    // Resolve note collision
    resolveCollision(other) {
        let tempVx = this.vx;
        let tempVy = this.vy;
        this.vx = other.vx;
        this.vy = other.vy;
        other.vx = tempVx;
        other.vy = tempVy;
    }

    // Boundary constraints: ensure notes do not get pushed out during collisions
    constrainToBounds() {
        if (this.x - this.r < 0) {
            this.x = this.r;
            this.vx = abs(this.vx);
        } else if (this.x + this.r > width) {
            this.x = width - this.r;
            this.vx = -abs(this.vx);
        }

        if (this.y - this.r < 0) {
            this.y = this.r;
            this.vy = abs(this.vy);
        } else if (this.y + this.r > height) {
            this.y = height - this.r;
            this.vy = -abs(this.vy);
        }
    }

    // Change the shape to a different one randomly
    changeShape() {
        let newShape;
        do {
            newShape = random(shapes);
        } while (newShape === this.shape); // Ensure the new shape is different

        this.shape = newShape; // Change to the new shape
    }

    // Check if hit by a ripple
    isHitByRipple(ripple) {
        let d = dist(this.x, this.y, ripple.x, ripple.y);
        return d < ripple.r;
    }

    // Draw the note based on its shape and color
    display() {
        push();
        translate(this.x, this.y);
        fill(this.color);
        noStroke();
        switch (this.shape) {
            case "circle":
                ellipse(0, 0, this.r * 2);
                break;
            case "square":
                rectMode(CENTER);
                rect(0, 0, this.r * 2, this.r * 2);
                break;
            case "triangle":
                triangle(-this.r, this.r, 0, -this.r, this.r, this.r);
                break;
        }
        pop();
    }
}

// Ripple class representing the expanding circles
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 0;
        this.rMax = random(200, 400);
        this.speed = random(4, 5);
        this.isBloomed = false;
        this.color = color(0, 0, 255, 80); 
        this.collisionRecord = Array(notes.length).fill(false);
    }

    update() {
        if (this.r < this.rMax) {
            this.r += this.speed;
        } else {
            this.isBloomed = true;
        }
        let transparent = map(this.r, 0, this.rMax, 80, 10);
        this.color.setAlpha(transparent);
    }

    display() {
        push();
        noStroke();
        fill(this.color);
        ellipse(this.x, this.y, this.r * 2);
        pop();
    }

    // Check if ripple hits a note
    hits(note) {
        let d = dist(this.x, this.y, note.x, note.y);
        return d < this.r + note.r;
    }
}
