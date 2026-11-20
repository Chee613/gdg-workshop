export function palmAngle(landmarks, width = 1, height = 1) {
  const wrist = landmarks[0];
  const middleBase = landmarks[9];
  return Math.atan2((middleBase.x - wrist.x) * width, (wrist.y - middleBase.y) * height) * 180 / Math.PI;
}

export function brightnessForAngle(angle, neutral) {
  // ponytail: a fixed ±50° range is enough for the workshop; tune only if the pilot needs it.
  return Math.round(Math.max(10, Math.min(100, 55 + (angle - neutral) * 0.9)));
}

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('gesture-math.mjs')) {
  const hand = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
  hand[0] = { x: 0.5, y: 0.8 };
  hand[9] = { x: 0.5, y: 0.4 };
  console.assert(palmAngle(hand) === 0);
  console.assert(brightnessForAngle(0, 0) === 55);
  console.assert(brightnessForAngle(-100, 0) === 10);
  console.assert(brightnessForAngle(100, 0) === 100);
  hand[9] = { x: 0.8, y: 0.8 };
  console.assert(Math.round(palmAngle(hand)) === 90);
  console.log('gesture math checks passed');
}
