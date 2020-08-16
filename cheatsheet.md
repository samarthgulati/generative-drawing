```js
createCanvas(width, height);

point(x, y);
// for the generative drawing session
// we will keep x, y for point 0, 0
// and use translate and rotate to position instead
point(0, 0); 

// translates point to position
translate(x, y); 

// frameCount gives the current frame
// increases by 1 each frame / draw call
var x = frameCount;

// background for the canvas
// grey from 0 (black) to 255 (white)
// alpha from 0 (transparent) to 255 (opaque)
background(grey, alpha);

// angle in radians by default
rotate(angle);

// brush size
strokeWeight(size);

random(min, max);

var noiseSpeed = frameCount * 0.01;
noise(speed);

// hue - roygbiv - color wheel
// saturation from 0 grey to 100 full saturation
// lightness from 0 black to 50 normal to 100 white
colorMode(HSL, 100);
stroke(hue, saturation, lightness);
```