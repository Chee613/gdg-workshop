# Beginner guide: MediaPipe hand keypoints and your gesture lamp

This guide assumes you have never used computer vision or trained a model. You can follow the first part with the [gesture lamp demo](../README.md) already in this folder.

## 1. The important distinction

Your webcam produces **images**. MediaPipe's pretrained hand model finds **21 hand landmarks** (also called keypoints) in each image. A landmark is a numbered point such as the wrist or a fingertip. MediaPipe's Gesture Recognizer can also name familiar poses, including `Open_Palm` and `Closed_Fist`.

```text
Camera image → pretrained MediaPipe model → 21 landmark positions + gesture label
                                                     ↓
                                      our code decides lamp brightness
```

**You do not need to train a keypoint model for the lamp.** The supplied model already locates the points. We use simple geometry on those points to measure palm rotation. Training a *custom gesture classifier* is a separate, optional task for a new hand pose that MediaPipe does not already name. Google explains that the Gesture Recognizer bundle contains both a hand-landmark model and a gesture-classification model. [Source](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer)

## 2. Five words to know

| Word | Plain meaning | Lamp example |
|---|---|---|
| Model | A program that learned patterns from examples | MediaPipe finds a hand in webcam frames. |
| Landmark / keypoint | A numbered location on the hand | Point 0 is the wrist; point 9 is the base of the middle finger. |
| Inference | Asking a trained model for its answer | “Where is the wrist in this frame?” |
| Gesture class | A name assigned to a hand pose | `Open_Palm` or `Closed_Fist`. |
| Training | Teaching a model from labelled examples | Needed only if you want a new pose label. |

## 3. Try the existing demo first

1. Open a terminal in this project folder.
2. Run `python -m http.server 8000`. Leave the terminal open.
3. Open `http://localhost:8000` in a desktop browser. Internet is needed on first run to load MediaPipe and its model.
4. Click **Start camera** and allow camera access for this local page.
5. Show **one** open palm: the preview lamp turns on. Make a fist: it turns off.
6. Show an upright open palm and click **Set neutral palm angle**. Rotate that same open palm like a steering wheel to change the preview brightness.

Good lighting helps. Keep your whole hand in frame, with the palm facing the camera. The current page shows a **simulated** lamp; no ESP32 is connected yet.

## 4. See what MediaPipe gives us

The demo uses `GestureRecognizer` in [main.js](../main.js). On each camera frame, this line asks the model for a result:

```js
const result = recognizer.recognizeForVideo(video, performance.now());
```

The useful parts of that result are:

```js
result.gestures[0]?.[0]?.categoryName  // for example, "Open_Palm"
result.landmarks[0]                    // an array of 21 hand points
result.landmarks[0][0]                 // wrist
result.landmarks[0][9]                 // base of middle finger
```

Each point has `x`, `y`, and `z` coordinates. `x` and `y` are proportions of the video width and height: `(0, 0)` is the top-left and `(1, 1)` is the bottom-right. The model returns these points; our code does **not** train or guess them. [Google's Web guide](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/web_js)

For this project, these numbers are enough:

| Landmark number | Hand part | Why it matters |
|---:|---|---|
| 0 | Wrist | Starting point for the palm direction. |
| 9 | Base of middle finger | End point for the palm direction. |
| 5 | Base of index finger | Useful if you later want to study palm width. |
| 17 | Base of little finger | Useful if you later want to study palm width. |

You can see every detected point as a small yellow dot over the webcam image in the demo. Google lists all 21 landmark names in its [hand-landmark reference](https://developers.google.com/edge/api/mediapipe/python/mp/tasks/vision/drawing_styles/hand_landmarker/HandLandmark).

## 5. How palm rotation becomes brightness

Imagine drawing an arrow from the wrist (point 0) to the middle-finger base (point 9). When your palm rotates in the camera image, the arrow rotates too. [gesture-math.mjs](../gesture-math.mjs) calculates that arrow's angle.

```text
Palm upright       Arrow angle near neutral       Medium brightness
Palm turned left   Arrow angle moves one way      Dimmer
Palm turned right  Arrow angle moves other way    Brighter
```

The **Set neutral palm angle** button saves your comfortable upright angle. The app compares later angles with that saved value and maps them to a brightness percentage. It limits the result to a safe range of 10–100% and smooths quick changes so the preview does not jump. If your hand leaves the frame briefly, the lamp keeps its last setting.

This is **geometry**, not new model training. For the workshop, it is easier to explain and test than collecting hundreds of training photos. Rotating the palm in the camera image works best; twisting until the palm faces sideways hides the features the camera needs.

## 6. When would training actually be useful?

Train a custom gesture classifier only if you want a **new fixed hand pose** that the built-in recognizer cannot label well, such as a club-specific sign. A classifier answers “Which pose is this?” It does not directly provide a smooth numeric rotation angle. For brightness, landmark geometry remains the better fit.

Google provides a Model Maker tutorial for custom gesture classes, but **Model Maker is deprecated and no longer actively maintained**. Treat the following as an optional learning exercise, not a requirement for the lamp workshop. [Google's customization guide](https://developers.google.com/edge/mediapipe/solutions/customization/gesture_recognizer)

### Optional exercise: train one new pose in Google Colab

**What you need:** a Google account, a browser, a folder of hand photos, and time to experiment. Colab runs the Python training steps on a hosted notebook, so you do not need to install TensorFlow on your laptop.

1. Pick a clear, *static* pose that is different from an open palm or fist. Call it `lamp_mode`.
2. Collect roughly **100 photos** of `lamp_mode` and **100 photos** of other hand poses. Use several people, backgrounds, distances, and lighting conditions. Do not place the same near-identical burst of photos in both training and test sets. Google's general Model Maker guidance suggests around 100 samples per class as a starting target. [Source](https://developers.google.com/edge/mediapipe/solutions/model_maker)
3. Make folders like this, then zip the `gesture_data` folder:

   ```text
   gesture_data/
     lamp_mode/
       photo001.jpg
       photo002.jpg
       ...
     none/
       photo001.jpg
       photo002.jpg
       ...
   ```

   The `none` folder is required by Google's gesture training workflow. It means “not my new gesture.” Avoid putting sensitive photos in a shared notebook or dataset.

4. Open a new [Google Colab notebook](https://colab.research.google.com/). Name your zip file `gesture_data.zip`. Click the **folder** icon at the left, then **Upload**, and choose that zip. It should appear as `/content/gesture_data.zip`. Run this cell to unpack it, then check that both label folders are listed:

   ```python
   !unzip -q /content/gesture_data.zip -d /content
   !ls /content/gesture_data
   ```

   If you see another `gesture_data` folder nested inside, move the photos into `/content/gesture_data/<label>/` before training.
5. Run these cells **one at a time**. The first installation may take several minutes. If it fails because of package compatibility, use Google's linked Colab notebook from the customization guide rather than changing packages at random.

   ```python
   !pip install mediapipe-model-maker
   ```

   ```python
   from mediapipe_model_maker import gesture_recognizer

   data = gesture_recognizer.Dataset.from_folder(
       dirname='/content/gesture_data',
       hparams=gesture_recognizer.HandDataPreprocessingParams()
   )
   train_data, rest_data = data.split(0.8)
   validation_data, test_data = rest_data.split(0.5)
   ```

   Google Model Maker uses its hand detector to extract landmarks from the labelled images, then trains the gesture classifier from that processed data. If some images contain no detectable hand, replace those images before continuing.

   ```python
   options = gesture_recognizer.GestureRecognizerOptions(
       hparams=gesture_recognizer.HParams(export_dir='/content/exported_model')
   )
   model = gesture_recognizer.GestureRecognizer.create(
       train_data=train_data,
       validation_data=validation_data,
       options=options
   )
   loss, accuracy = model.evaluate(test_data, batch_size=1)
   print('Test accuracy:', accuracy)
   model.export_model()
   ```

6. Download `/content/exported_model/gesture_recognizer.task` from Colab's Files panel. This `.task` file is the trained model bundle. Test it on **new people and backgrounds**, not only the photos used for training. The test accuracy is useful, but a live camera check tells you whether the pose is practical.
7. To try it in this project, place the downloaded `.task` file in this folder and change `modelAssetPath` in [main.js](../main.js) to `'./gesture_recognizer.task'`. The app's current logic only reacts to `Open_Palm` and `Closed_Fist`; you would also need to decide what the new `lamp_mode` label should do.

**Important:** This optional exercise trains a *gesture label classifier*. It does not retrain MediaPipe's hand-keypoint locator. For your lamp's on/off and rotation controls, the pretrained model and the existing demo already do the needed work.

## 7. If something goes wrong

| Problem | Try this |
|---|---|
| Page says it cannot start | Check internet access for the model download, then reload. |
| Camera stays blank | Allow camera permission, close other camera apps, and use `localhost` rather than opening the HTML file directly. |
| Hand dots do not appear | Put one whole hand in frame and improve front lighting. |
| Gesture label changes rapidly | Hold a clear pose for a moment; reduce background clutter. |
| Brightness goes the opposite way you expect | Calibrate upright again; the mirrored preview can make direction feel reversed. |
| Colab training fails during installation | Model Maker is deprecated. Follow Google's current customization notebook, or continue with pretrained landmarks for the lamp. |

## 8. What to learn next

Once the webcam preview feels reliable, the next hardware step is to send the brightness number over USB to an ESP32. The vision model can stay exactly as it is. See the [realisation plan](Gesture-Lamp-Realisation-Plan.md) for that sequence.
