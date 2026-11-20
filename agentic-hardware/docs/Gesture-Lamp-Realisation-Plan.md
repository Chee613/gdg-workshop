# Gesture-Controlled Lamp: Realisation Plan

**For:** GDGoC UM AI/ML × Robotics Engineering Club (REC)  
**Goal:** Run a beginner workshop where each pair builds a 5V LED light controlled by webcam gestures: open palm = on, closed fist = off, and rotating an open palm = brightness.

## The build in one line

**Hand → webcam → MediaPipe in browser → USB serial → ESP32 → MOSFET → 5V LED light**

The lamp is a small low-voltage LED module or strip in a diffuser or simple stand. It is not a household mains bulb. The browser interprets the hand; the ESP32 only receives a brightness command and drives the light.

## Success criteria

- A first-time participant can connect a prepared kit and make **open palm turn the light on** and **closed fist turn it off** during the session.
- With the palm still facing the webcam, a left/right rotation changes brightness smoothly and predictably over a useful range.
- The light stays steady when a hand briefly disappears or recognition misses a frame.
- The same kit and instructions work on all facilitator laptops and the main participant operating systems tested in the pilot.
- Every kit is inspected and proven before doors open.

## Phase 1 — Agree the event format (3–4 weeks before)

**Owners:** Both club leads  
**Deliverable:** One-page event brief and approved kit budget.

1. Set the date, room, capacity, and target audience. Plan for **two participants per kit**.
2. Decide whether kits are reusable club equipment or take-home items. Reusable kits are the lower-cost default.
3. Assign a technical lead from GDGoC UM for the browser/vision side and from REC for electronics/firmware.
4. Decide who buys parts, who stores kits afterward, and who handles registration and publicity.
5. Reserve a room with tables, reliable power, projector, and lighting that lets webcams see hands clearly.

**Gate:** Do not order the full batch until one complete kit passes Phase 2.

## Phase 2 — Build and prove one prototype (2–3 weeks before)

**Owners:** REC for hardware; GDGoC UM for browser app  
**Deliverable:** One repeatable working kit, a photo of its final wiring, and a short setup guide.

### Hardware selection and check

| Part | Per kit | Selection rule |
|---|---:|---|
| ESP32 development board | 1 | Same model for all kits; USB serial tested on intended laptops. |
| 5V LED module or short strip plus diffuser | 1 | Exposed low-voltage leads, specified current, visibly bright but comfortable at a desk. |
| 3.3V-compatible logic-level MOSFET module | 1 | Tested to switch the chosen LED at its rated current. |
| Breadboard and jumper wires | 1 set | Wires prepared to the right lengths; stable connections. |
| USB **data** cable | 1 | Fits the board; verify it carries data. |
| Regulated 5V LED supply | 1 | Rated above the chosen LED's current. |

REC should draw the wiring card for the *actual* purchased module, measure or verify LED current, and test full brightness for 15 minutes. Use a shared ground between the LED supply and ESP32 control circuit. The ESP32 GPIO must only drive the MOSFET input; it must not supply LED current. Disconnect power before changing wires.

### Software prototype, in this order

1. **Manual lamp control:** Flash simple ESP32 firmware that accepts one newline-terminated brightness value from **0 to 255** over USB serial. Verify the browser or a serial terminal can set off, half, and full brightness. This isolates the hardware path first.
2. **Camera and gesture display:** In a browser page, show the live camera and the recognised gesture label using MediaPipe Gesture Recognizer. Confirm **Open Palm** and **Closed Fist** under normal room lighting.
3. **On/off mapping:** Send `0` for closed fist. For open palm, restore the last nonzero brightness, initially full brightness. Require a brief stable gesture before changing state; do not send repeated unchanged commands.
4. **Palm rotation:** Use the recognizer's hand landmarks to estimate in-plane hand angle while the open palm faces the camera. Let the user set a comfortable neutral angle, then map a modest left/right range to brightness. Clamp at minimum and maximum, use a small dead zone, and smooth rapid frame-to-frame changes. Send only meaningful brightness changes rather than every video frame.
5. **Loss of tracking:** Keep the last light state during a short tracking gap. Provide a visible **Stop camera / Light off** control and release the serial port when leaving the page.

Rotation means turning the flat palm like a steering wheel. Twisting it until the palm faces sideways is harder for a webcam to track and is not the workshop gesture.

**Gate:** A fresh laptop, following only the setup guide, completes 20 on/off cycles and several slow brightness sweeps without visible flicker or lost USB connection. Test at least two users and two different laptops. If rotation is unreliable, adjust its range and filtering during the prototype phase before printing workshop instructions.

## Phase 3 — Pilot and freeze the kit (1–2 weeks before)

**Owners:** Both clubs  
**Deliverable:** Final wiring card, starter project, facilitator notes, and procurement quantity.

1. Recruit 2–3 people with little electronics experience. Give them the actual workshop instructions, not a verbal walkthrough.
2. Record where they get stuck: USB driver/cable, camera permission, serial-port selection, wiring, gestures, lighting, or rotation direction.
3. Fix the highest-friction steps. Keep the participant task small: connect the tested circuit, start the page, grant permissions, and change the gesture-to-command mapping or a clearly marked starter section.
4. Confirm that the page runs from `localhost` or HTTPS and that MediaPipe model files are available even if venue internet is weak.
5. Freeze the exact board, LED, MOSFET module, supply, firmware, browser version guidance, and printed wiring card. Obtain local quotes for those exact parts.

**Gate:** All pilot participants reach on/off; at least one reaches smooth palm-rotation dimming within the intended session time. If the extension is too slow, facilitators should provide a prepared rotation step so participants still see the complete concept.

## Phase 4 — Prepare the full workshop (3–7 days before)

**Owners:** REC assembles; GDGoC UM checks software; both rehearse  
**Deliverable:** Numbered, verified kits and ready-to-use teaching material.

- Buy **one kit per pair plus about 10% spares**. Example: 40 participants → 20 working kits + 2 spare kits.
- Label and pack each kit. Flash the same firmware. Run off, half, and full brightness on every unit.
- Put the browser starter files, model asset, and setup instructions in one easy-to-open location. Test the exact link or local package from a fresh laptop.
- Prepare a one-page handout: parts photo, wiring card, connection steps, three gestures, and fixes for common permission/cable problems.
- Rehearse a complete 2.5-hour session, including the opening demo and a room-wide final light-up.
- Staff with one lead from each club and roughly one helper per 8–10 pairs.

## Workshop-day run sheet (150 minutes)

| Time | Activity | Checkpoint |
|---|---|
| 0–15 min | Demo and explain the hand-to-light flow | Participants know the outcome. |
| 15–35 min | Show gesture recognition and permission prompts | Camera works on each pair's laptop. |
| 35–60 min | Build or connect the pre-checked circuit | Manual light test succeeds. |
| 60–105 min | Connect MediaPipe gestures to the lamp | Open palm on; closed fist off. |
| 105–130 min | Calibrate palm rotation and adjust brightness | Smooth dim-to-bright sweep. |
| 130–145 min | Pair showcase and room-wide demo | Every working kit lights together. |
| 145–150 min | Recap and quick feedback | Collect issues for next run. |

## Common problems and prepared fixes

| Symptom | First check |
|---|---|
| No serial port appears | Confirm desktop Chrome, data-capable USB cable, correct driver/board, and that another app has not opened the port. |
| Camera unavailable | Grant camera permission, close competing camera apps, and use `localhost` or HTTPS. |
| Gesture label jumps | Improve front lighting, show one hand, increase the stable hold time. |
| Brightness moves in the wrong direction | Flip the angle mapping for the displayed/mirrored camera image during calibration. |
| Light flickers | Check common ground and loose wires; increase the dead zone or smoothing. |
| Light never turns on | Use manual brightness control to separate circuit/firmware faults from camera/gesture faults. |

## Immediate next actions

1. **Both leads:** confirm event capacity, target date, kit ownership, and spending limit.
2. **REC:** choose one exact 5V LED + MOSFET + ESP32 combination and assemble one prototype.
3. **GDGoC UM:** build the manual browser-to-ESP32 control first, then add MediaPipe gestures and rotation.
4. **Both:** run the beginner pilot before placing the full parts order.

**References:** [MediaPipe Gesture Recognizer](https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer), [Web Serial](https://developer.chrome.com/docs/capabilities/serial), [ESP32 PWM](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html), [camera permission requirements](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).
