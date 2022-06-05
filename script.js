var canvas = find('canvas');

var backBuffer = [];

function find(s) {
  return document.getElementById(s);
}

var ctx = canvas.getContext('2d');
var currentInterval;
ctx.imageSmoothingEnabled = true;
resizeWindow();

window.addEventListener("resize", () => {
  resizeWindow();
});

function resizeWindow() {
  //canvas.width = window.innerWidth //50 is for the right side bar
  //canvas.height = window.innerHeight;
}



// hsl to rgb conversion
//not mine - https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

//now add hexadecimal support
function HexToRGB(s) {
  //takes a hexadecimal color and converts it to rgb
  return {
    r: HexToDecimal(s[1] + s[2]),
    g: HexToDecimal(s[3] + s[4]),
    b: HexToDecimal(s[5] + s[6])
  };
}

function HexToDecimal(s) {
  //used only within the context of the function above
  //converts a two-letter string like "3a" to decimal, "58"
  var hex = "0123456789abcdef";
  return hex.indexOf(s[0]) * 16 + hex.indexOf(s[1]);
}

//these two functions below are the functions above but inverted
function RGBToHex(r) {
  //takes a rgb color and converts it to hex
  return "#" + DecimalToHex(r.r) + DecimalToHex(r.g) + DecimalToHex(r.b);
}

var red = "#d1303e";
var blue = "#3048d1";
var yellow = "#e3e32d";
//843 by 843 pixels
//field is 140.5 inches wide
//so 6 pixels for each inch
var size = 843;
var discsPos = [[.5, .5], [1, 1], [2, 2], [2.5, 2.5], [3.5, 3.5], [4, 4], [5, 5], [5.5, 5.5], [2.5, 1.5], [3.5, 4.5], [3, 2], [3, 4], [2.5, 3.5],
[3.5, 2.5], [1.14, 3.87], [1.52, 3.87], [1.9, 3.87], [3.87, 1.14], [3.87, 1.52], [3.87, 1.9], [4.86, 2.14], [4.48, 2.14], [4.1, 2.14], [2.14, 4.86],
[2.14, 4.48], [2.14, 4.1], [1.5, 1.5], [1.5, 1.5], [1.5, 1.5], [4.5, 4.5], [4.5, 4.5], [4.5, 4.5], [1.5, 2.5], [1.5, 2.5], [1.5, 2.5], [4.5, 3.5], [4.5, 3.5], [4.5, 3.5]];
var stacksOf3 = [[1.5, 1.5], [4.5, 4.5], [1.5, 2.5], [4.5, 3.5]];
//the position of the discs is fairly simple, measured in tile units:
//0, 0 is the top left corner of the top left tile
//1, 1, is the bottom right corner of the top left tile
//5, 1 is touching the blue high goal

renderField();

function renderField() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#717778";
  ctx.fillRect(0, 0, size, size);

  //now mark the tiles
  ctx.fillStyle = "#505154";
  for (var i = 1; i < 6; i++) {
  	ctx.fillRect(0, i * size / 6 - 1, size, 2);
  	ctx.fillRect(i * size / 6 - 1, 0, 2, size);
  }

  //draw goals
  ctx.beginPath();
  ctx.arc(size - 107, 107, 47, 0, 2 * Math.PI, false);
  ctx.fillStyle = blue;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(107, size - 107, 47, 0, 2 * Math.PI, false);
  ctx.fillStyle = red;
  ctx.fill();

  //draw barriers
  ctx.fillStyle = blue;
  ctx.fillRect(size - size / 3, size / 3, 12, -147);
  ctx.fillRect(size - size / 3, size / 3, 147, -12);

  ctx.fillStyle = red;
  ctx.fillRect(size / 3, size - size / 3, -12, 147);
  ctx.fillRect(size / 3, size - size / 3, -147, 12);

  //draw rollers (half blue, half red)
  ctx.fillStyle = red;
  ctx.fillRect(size / 6, 0, 79, 15);
  ctx.fillRect(0, size / 6, 15, 79);
  ctx.fillRect(size - size / 6, size, -79, -15);
  ctx.fillRect(size,size - size / 6, -15, -79);

  ctx.fillStyle = blue;
  ctx.fillRect(size / 6, 8, 79, 8);
  ctx.fillRect(0, size / 6, 8, 79);
  ctx.fillRect(size - size / 6, size, -79, -8);
  ctx.fillRect(size - 8, size - size / 6, -8, -79);

  //draw discs
  ctx.fillStyle = yellow;

  for (var i = 0; i < discsPos.length; i++) {
  	ctx.beginPath();
    //radius of 17 because 6 pixels / inch times 5.5 inches == 33 pixels
  	ctx.arc(size / 6 * discsPos[i][0], size / 6 * discsPos[i][1], 17, 0, 2 * Math.PI, false);
  	ctx.fill();
  }

  ctx.fillStyle = "#fcdb03"; //dark yellow for 3-stacks

  //draw stacks of 3 discs darker
  for (var i = 0; i < stacksOf3.length; i++) {
  	ctx.beginPath();
  	ctx.arc(size / 6 * stacksOf3[i][0], size / 6 * stacksOf3[i][1], 17, 0, 2 * Math.PI, false);
  	ctx.fill();
  }

  //draw loaders
  ctx.fillStyle = "#505154";
  ctx.fillRect(0, size / 2 - 21, 12, 42);
  ctx.fillRect(size - 12, size / 2 - 21, 12, 42);
}

//now make it a game
var pos = {x: .5, y: 2.5, angle: Math.PI / 2};
//keep track of which keys are held down for movement purposes
var keyDown = {w: false, a: false, s: false, d: false};
var heldDiscs = 0;
var shotDiscs = [];
var scoredInBlue = 0;
var scoredInRed = 0;

setInterval(() => {
  //main loop
  renderField();
  renderRobot(pos.x, pos.y, pos.angle);
  renderShotDiscs();
  //movement
  var speed = .04;
  var turnSpeed = .09;

  //forward
  if (keyDown.w) {
    pos.x += speed * Math.cos(pos.angle - Math.PI / 2);
    pos.y += speed * Math.sin(pos.angle - Math.PI / 2);
  }
  //backward
  if (keyDown.s) {
    pos.x -= speed * Math.cos(pos.angle - Math.PI / 2);
    pos.y -= speed * Math.sin(pos.angle - Math.PI / 2);
  }
  //turning
  if (keyDown.a) {
    pos.angle -= turnSpeed;
  }
  if (keyDown.d) {
    pos.angle += turnSpeed;
  }
  //picking up discs
  //a disc is considered "picked up" if it is touching 15 pixels in "front of" the center of the robot
  //stacks of 3 are picked up in one go
  //loop through every disc and check if the pick up point is within the radius of the center of the disc
  var pickupPoint = {x: pos.x + 15 * Math.cos(pos.angle - Math.PI / 2) / (size / 6), y : pos.y + 15 * Math.sin(pos.angle - Math.PI / 2) / (size / 6)};
  //the radius of the discs, in unit tiles, is 17 / (size / 6)
  for (var i = 0; i < discsPos.length; i++) {
    var distance = Math.sqrt((discsPos[i][0] - pickupPoint.x) * (discsPos[i][0] - pickupPoint.x) + (discsPos[i][1] - pickupPoint.y) * (discsPos[i][1] - pickupPoint.y));
    if (distance < 17 / (size / 6)) {
      pickupDisc(i);
    }
  }

}, 30);

function pickupDisc(i) {
  //i is the disc's i{ndex in the disc array
  if (heldDiscs < 3) {
    heldDiscs++;
    //remove disc from field
    var temp = discsPos[i];
    discsPos.splice(i, 1);

    //now make sure that stacks of 3 are deleted when only one disc is left in the pile
    //this gets rid of the darker shade during rendering

    //take a count of how many of the picked up disc are in the list
    var count = 0;
    for (var i = 0; i < discsPos.length; i++) {
      if (discsPos[i][0] == temp[0] && discsPos[i][1] == temp[1]) {
        count++;
      }
    }
    //if there is exactly one other disc at the same position, then it is the last one in stack of 3
    //and thus the 3-stack can be deleted
    if (count == 1) {
      for (var i = 0; i < stacksOf3.length; i++) {
        if (stacksOf3[i][0] == temp[0] && stacksOf3[i][1] == temp[1]) {
          stacksOf3.splice(i, 1);
        }
      }
    }
  }
}

function shootDisc() {
  //shoot a disc out of the robot
  if (heldDiscs <= 0) return;
  heldDiscs--;
  shotDiscs.push({x: pos.x + 15 * Math.cos(pos.angle + Math.PI / 2) / (size / 6), y: pos.y + 15 * Math.sin(pos.angle + Math.PI / 2) / (size / 6), angle: pos.angle + Math.PI / 2})
}

document.addEventListener("keydown", keyDown1);
document.addEventListener("keyup", keyUp1);

function keyDown1 (e) {
  e = e || window.event;
  if (e.keyCode == 87) {
    keyDown.w = true;
  } else if (e.keyCode == 65) {
    keyDown.a = true;
  } else if (e.keyCode == 83) {
    keyDown.s = true;
  } else if (e.keyCode == 68) {
    keyDown.d = true;
  } else if (e.keyCode == 32) {
    //space bar, shoot a disc
    shootDisc();
  }
};

function keyUp1 (e) {
    e = e || window.event;
    if (e.keyCode == 87) {
      keyDown.w = false;
    } else if (e.keyCode == 65) {
      keyDown.a = false;
    } else if (e.keyCode == 83) {
      keyDown.s = false;
    } else if (e.keyCode == 68) {
      keyDown.d = false;
    }
};



function renderRobot(x, y, angle) {
  //x, y should be in unit tiles (1, 1 is bottom right corner of top left tile)
  //angle in radians, bearing angle
  var img;
  if (heldDiscs == 0 ){
    img = document.getElementById("robot");
  } else if (heldDiscs == 1 ){
    img = document.getElementById("robot1");
  } else if (heldDiscs == 2 ){
    img = document.getElementById("robot2");
  } else if (heldDiscs == 3 ){
    img = document.getElementById("robot3");
  }

  //first handle rotation
  ctx.save();
  ctx.translate(x * size / 6, y * size / 6);
  ctx.rotate(angle);
  //assume robot is about 17" wide or 102 pixels
  ctx.drawImage(img, -51, -51, 102, 102);
  //revert transformation matrix back
  ctx.restore();
}

function renderShotDiscs() {
  //both update the position of shot discs and render them
  //but render them first
  ctx.fillStyle = yellow;
  for (var i = 0; i < shotDiscs.length; i++) {
    //render disc
    ctx.beginPath();
  	ctx.arc(size / 6 * shotDiscs[i].x, size / 6 * shotDiscs[i].y, 17, 0, 2 * Math.PI, false);
  	ctx.fill();

    //update position
    var speed = .13;
    shotDiscs[i].x += speed * Math.cos(shotDiscs[i].angle);
    shotDiscs[i].y += speed * Math.sin(shotDiscs[i].angle);

    //if it's at least halfway touching a goal (center is touching the goal), then make it disappear
    //the position of the goals is, in tile units:
    var redGoal = {x: 107 / (size / 6), y: (size - 107) / (size / 6)};
    var blueGoal = {x: (size - 107) / (size / 6), y: 107 / (size / 6)};
    //and the radius is 49 pixels
    var redDist = Math.sqrt((redGoal.x - shotDiscs[i].x) * (redGoal.x - shotDiscs[i].x) + (redGoal.y - shotDiscs[i].y) * (redGoal.y - shotDiscs[i].y));
    var blueDist = Math.sqrt((blueGoal.x - shotDiscs[i].x) * (blueGoal.x - shotDiscs[i].x) + (blueGoal.y - shotDiscs[i].y) * (blueGoal.y - shotDiscs[i].y));
    if (redDist < 49 / (size / 6)) {
      scoredInRed++;
      //delete this disc
      shotDiscs.splice(i, 1);
      i--;
    }
    if (blueDist < 49 / (size / 6)) {
      scoredInBlue++;
      //delete this disc
      shotDiscs.splice(i, 1);
      i--;
    }
  }

  //and while we're at it, lets have a little text in each goal showing how many discs are scored in it
  ctx.fillStyle = "#000000";

  if (scoredInRed > 0) {
    ctx.font = "24px Helvetica";
    ctx.fillText(scoredInRed, 107 - 6, size - 107 + 6);
  }
  if (scoredInBlue > 0) {
    ctx.font = "24px Helvetica";
    ctx.fillText(scoredInBlue, size - 107 - 6, 107 + 6);
  }
}
