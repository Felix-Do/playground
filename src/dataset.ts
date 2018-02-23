/* Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

/**
 * A two dimensional example: x and y coordinates with the label.
 */
export type Example2D = {
  x: number,
  y: number,
  label: number
};

type Point = {
  x: number,
  y: number
};

/**
 * Shuffles the array using Fisher-Yates algorithm. Uses the seedrandom
 * library as the random generator.
 */
export function shuffle(array: any[]): void {
  let counter = array.length;
  let temp = 0;
  let index = 0;
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);
    // Decrease counter by 1
    counter--;
    // And swap the last element with it
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
}

export type DataGenerator = (numSamples: number, noise: number) => Example2D[];

export function classifyTwoGaussData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];

  let varianceScale = d3.scale.linear().domain([0, .5]).range([0.5, 4]);
  let variance = varianceScale(noise);

  function genGauss(cx: number, cy: number, label: number) {
    for (let i = 0; i < numSamples / 2; i++) {
      let x = normalRandom(cx, variance);
      let y = normalRandom(cy, variance);
      points.push({x, y, label});
    }
  }

  genGauss(2, 2, 1); // Gaussian with positive examples.
  genGauss(-2, -2, -1); // Gaussian with negative examples.
  return points;
}

export function regressPlane(numSamples: number, noise: number):
  Example2D[] {
  let radius = 6;
  let labelScale = d3.scale.linear()
    .domain([-10, 10])
    .range([-1, 1]);
  let getLabel = (x, y) => labelScale(x + y);

  let points: Example2D[] = [];
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-radius, radius);
    let y = randUniform(-radius, radius);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getLabel(x + noiseX, y + noiseY);
    points.push({x, y, label});
  }
  return points;
}

export function regressGaussian(numSamples: number, noise: number):
  Example2D[] {
  let points: Example2D[] = [];

  let labelScale = d3.scale.linear()
    .domain([0, 2])
    .range([1, 0])
    .clamp(true);

  let gaussians = [
    [-4, 2.5, 1],
    [0, 2.5, -1],
    [4, 2.5, 1],
    [-4, -2.5, -1],
    [0, -2.5, 1],
    [4, -2.5, -1]
  ];

  function getLabel(x, y) {
    // Choose the one that is maximum in abs value.
    let label = 0;
    gaussians.forEach(([cx, cy, sign]) => {
      let newLabel = sign * labelScale(dist({x, y}, {x: cx, y: cy}));
      if (Math.abs(newLabel) > Math.abs(label)) {
        label = newLabel;
      }
    });
    return label;
  }
  let radius = 6;
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-radius, radius);
    let y = randUniform(-radius, radius);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getLabel(x + noiseX, y + noiseY);
    points.push({x, y, label});
  };
  return points;
}

export function classifySpiralData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let n = numSamples / 2;

  function genSpiral(deltaT: number, label: number) {
    let rMax = 5.2;
    let tMax = 2.5;
    for (let i = 0; i < n; i++) {
      let r = (i + 1) / n * rMax;
      // let t = 1.75 * i / n * 2 * Math.PI + deltaT;
      let t = tMax * (i + 1) / n * 2 * Math.PI + deltaT;
      let x = r * Math.sin(t) + randUniform(-1, 1) * noise;
      let y = r * Math.cos(t) + randUniform(-1, 1) * noise;
      points.push({x, y, label});
    }
  }

  genSpiral(0, 1); // Positive examples.
  genSpiral(Math.PI, -1); // Negative examples.
  return points;
}

export function classifyCircleData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  // let radius = 5;
  let radius = 5.2;
  let rSize = .4;
  let rGap = .05;
  function getCircleLabel(p: Point, center: Point) {
    return (dist(p, center) < (radius * rSize)) ? 1 : -1;
  }

  // Generate positive points inside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    // let r = randUniform(0, radius * 0.5);
    let r = randUniform(0, rSize - rGap) * radius;
    let angle = randUniform(0, 2 * Math.PI);
    let x = r * Math.sin(angle);
    let y = r * Math.cos(angle);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getCircleLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
    points.push({x, y, label});
  }

  // Generate negative points outside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    // let r = randUniform(radius * 0.7, radius);
    let r = randUniform(rSize + rGap, 1) * radius;
    let angle = randUniform(0, 2 * Math.PI);
    let x = r * Math.sin(angle);
    let y = r * Math.cos(angle);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getCircleLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
    points.push({x, y, label});
  }
  return points;
}

export function classifyDonutData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  // let radius = 5;
  let radius = 5;
  let rSize = .5;
  let rThickness = .2; // each side, actual thickness = this * 2
  let rGap = .02;
  
  function getDonutLabel(p: Point, center: Point) {
    if (dist(p, center) < (radius * (rSize - rThickness))) return -1;
    if (dist(p, center) > (radius * (rSize + rThickness))) return -1;
    return 1;
  }

  function genDonut(label: number) {
    for (let i = 0; i < numSamples / 2; i++) {
      let r = (randUniform(-1, 1) * (rThickness - rGap) + rSize) * radius;
      if ( label < 0 ) {
        r = (1 - randUniform(1, 0) * (rSize - rThickness - rGap * 2)) * radius;
        if ( i < numSamples / 5 ) {
          // points inside the inner circle of the donut
          r = (randUniform(0, 1) * (rSize - rThickness - rGap * 2)) * radius;
        }
      }
      let angle = randUniform(0, 2 * Math.PI);
      let x = r * Math.sin(angle);
      let y = r * Math.cos(angle);
      let noiseX = randUniform(-radius, radius) * noise;
      let noiseY = randUniform(-radius, radius) * noise;
      // let label = getDonutLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
      points.push({x, y, label});
    }
  }

  genDonut(1);
  genDonut(-1);
  
  return points;
}

export function classifyBullseyeData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let radius = 5;
  let ringCount = 4;
  let ringThickness = 1 / ringCount;
  let rGapRatio = .1;
  let rGap = ringThickness * rGapRatio;
  
  function getBullseyeLabel(p: Point, center: Point) {
    let type = Math.floor((dist(p, center) / radius * ringCount + 1) % 2);
    if ( type < 1 ) return -1;
    return 1;
  }

  function genBullseye(ringIndex: number) {
    if ( ringCount <= 0 ) return;
    let label = 1;
    let type = Math.floor((ringIndex + 1) % 2);
    if ( type < 1 ) label = -1;
    for (let i = 0; i < numSamples / ringCount; i++) {
      let r = ((randUniform(rGapRatio, 1 - rGapRatio) + ringIndex) * ringThickness) * radius;
      let angle = randUniform(0, 2 * Math.PI);
      let x = r * Math.sin(angle);
      let y = r * Math.cos(angle);
      let noiseX = randUniform(-radius, radius) * noise;
      let noiseY = randUniform(-radius, radius) * noise;
      // let label = getBullseyeLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
      points.push({x, y, label});
    }
  }

  for (let i = 0; i < ringCount; i++) {
    genBullseye(i);
  }
  
  return points;
}

// WORK_IN_PROGESS
export function classifyStarData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  // let radius = 5;
  let radius = 5.6;
  let bladeCount = 6;
  let bodyRatio = .5;
  let ringCount = 4;
  let ringThickness = 1 / ringCount;
  let rGapRatio = .4;
  let rGap = ringThickness * rGapRatio;
  
  function getStarLabel(p: Point, center: Point) {
    return 1;
  }

  function genStar(ringIndex: number) {
    if ( ringCount <= 0 ) return;
    let label = 1;
    let type = Math.floor((ringIndex + 1) % 2);
    if ( type < 1 ) label = -1;
    for (let i = 0; i < numSamples / ringCount; i++) {
      let phase = randUniform(0, bladeCount);
      let valleyA = (Math.floor(phase) % bladeCount + .5) / bladeCount * 2 * Math.PI;
      let peakA = (Math.floor(phase + .5) % bladeCount) / bladeCount * 2 * Math.PI;
      // let y = r * Math.cos(angle);
      let dist = randUniform(0, 1);
      let r = ((randUniform(rGapRatio, 1 - rGapRatio) + ringIndex) * ringThickness) * radius;
      let x = r * (dist * bodyRatio * Math.sin(valleyA) + (1 - dist) * Math.sin(peakA));
      let y = r * (dist * bodyRatio * Math.cos(valleyA) + (1 - dist) * Math.cos(peakA));
      // let valleyX = 
      // let phase = (rand * Math.round(bladeCount)) % 1 * 2;
      let noiseX = randUniform(-radius, radius) * noise;
      let noiseY = randUniform(-radius, radius) * noise;
      // let label = getStarLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
      points.push({x, y, label});
    }
  }

  for (let i = 0; i < ringCount; i++) {
    genStar(i);
  }
  
  return points;
}

export function classifyXORData(numSamples: number, noise: number):
    Example2D[] {
  function getXORLabel(p: Point) { return p.x * p.y >= 0 ? 1 : -1; }

  let points: Example2D[] = [];
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-5, 5);
    let padding = 0.3;
    x += x > 0 ? padding : -padding;  // Padding.
    let y = randUniform(-5, 5);
    y += y > 0 ? padding : -padding;
    let noiseX = randUniform(-5, 5) * noise;
    let noiseY = randUniform(-5, 5) * noise;
    let label = getXORLabel({x: x + noiseX, y: y + noiseY});
    points.push({x, y, label});
  }
  return points;
}

/**
 * Returns a sample from a uniform [a, b] distribution.
 * Uses the seedrandom library as the random generator.
 */
function randUniform(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

/**
 * Samples from a normal distribution. Uses the seedrandom library as the
 * random generator.
 *
 * @param mean The mean. Default is 0.
 * @param variance The variance. Default is 1.
 */
function normalRandom(mean = 0, variance = 1): number {
  let v1: number, v2: number, s: number;
  do {
    v1 = 2 * Math.random() - 1;
    v2 = 2 * Math.random() - 1;
    s = v1 * v1 + v2 * v2;
  } while (s > 1);

  let result = Math.sqrt(-2 * Math.log(s) / s) * v1;
  return mean + Math.sqrt(variance) * result;
}

/** Returns the eucledian distance between two points in space. */
function dist(a: Point, b: Point): number {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
