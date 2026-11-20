import { palmAngle, brightnessForAngle } from './gesture-math.mjs';

const $ = id => document.getElementById(id);
const video = $('video');
const overlay = $('overlay');
const cameraPanel = $('cameraPanel');
const context = overlay.getContext('2d');
const startButton = $('start');
const stopButton = $('stop');
const calibrateButton = $('calibrate');
let recognizer, stream, frameId;
let neutralAngle = 0;
let currentAngle = null;
let lampOn = false;
let savedBrightness = 55;
let shownBrightness = 55;
let candidate = '', candidateSince = 0;

function status(message) { $('status').textContent = message; }

function showLamp() {
  const value = lampOn ? savedBrightness : 0;
  const bulb = $('bulb');
  bulb.style.opacity = lampOn ? value / 100 : 0;
  bulb.setAttribute('aria-label', lampOn ? `Lamp on at ${value}%` : 'Lamp off');
  $('brightness').textContent = `${value}%`;
}

function drawHand(landmarks) {
  context.clearRect(0, 0, overlay.width, overlay.height);
  if (!landmarks) return;
  context.fillStyle = '#4285f4';
  context.strokeStyle = '#fff';
  context.lineWidth = 2;
  for (const point of landmarks) {
    context.beginPath();
    context.arc(point.x * overlay.width, point.y * overlay.height, 5, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
}

function processResult(result, now) {
  const top = result.gestures[0]?.[0];
  const label = top?.score >= 0.65 ? top.categoryName : '';
  const landmarks = result.landmarks[0];
  drawHand(landmarks);
  $('gesture').textContent = label ? `${label.replace('_', ' ')} · ${Math.round(top.score * 100)}%` : 'No clear gesture';

  if (label !== candidate) { candidate = label; candidateSince = now; }
  if (now - candidateSince >= 250) {
    if (label === 'Closed_Fist') lampOn = false;
    if (label === 'Open_Palm') lampOn = true;
  }

  currentAngle = label === 'Open_Palm' && landmarks ? palmAngle(landmarks, video.videoWidth, video.videoHeight) : null;
  calibrateButton.disabled = currentAngle === null;
  if (lampOn && currentAngle !== null && now - candidateSince >= 250) {
    const target = brightnessForAngle(currentAngle, neutralAngle);
    shownBrightness += (target - shownBrightness) * 0.25;
    if (Math.abs(savedBrightness - shownBrightness) >= 2) savedBrightness = Math.round(shownBrightness);
  }
  showLamp();
}

function loop() {
  if (!stream) return;
  if (video.readyState >= 2) {
    if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;
    }
    processResult(recognizer.recognizeForVideo(video, performance.now()), performance.now());
  }
  frameId = requestAnimationFrame(loop);
}

startButton.addEventListener('click', async () => {
  startButton.disabled = true;
  status('Loading MediaPipe…');
  try {
    if (!recognizer) {
      const { FilesetResolver, GestureRecognizer } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/+esm');
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm');
      recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task' },
        runningMode: 'VIDEO',
        numHands: 1
      });
    }
    status('MediaPipe ready. Requesting camera access…');
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    video.srcObject = stream;
    await video.play();
    cameraPanel.classList.add('live');
    stopButton.disabled = false;
    status('Camera running. Show one open palm or closed fist.');
    loop();
  } catch (error) {
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
    cameraPanel.classList.remove('live');
    startButton.disabled = false;
    status(`Could not start: ${error.message}`);
  }
});

stopButton.addEventListener('click', () => {
  cancelAnimationFrame(frameId);
  stream?.getTracks().forEach(track => track.stop());
  stream = null;
  cameraPanel.classList.remove('live');
  video.srcObject = null;
  context.clearRect(0, 0, overlay.width, overlay.height);
  lampOn = false;
  currentAngle = null;
  candidate = '';
  showLamp();
  $('gesture').textContent = 'No hand detected';
  startButton.disabled = false;
  stopButton.disabled = true;
  calibrateButton.disabled = true;
  status('Camera stopped.');
});

calibrateButton.addEventListener('click', () => {
  if (currentAngle === null) return;
  neutralAngle = currentAngle;
  shownBrightness = 55;
  savedBrightness = 55;
  showLamp();
  status('Neutral angle set. Rotate your open palm left or right.');
});

showLamp();
