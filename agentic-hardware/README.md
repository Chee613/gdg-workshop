# Gesture Lamp & AI Hardware

GDGoC UM AI/ML × Robotics Engineering Club (REC), September 2026. Participants turn an LED lamp on and off with hand gestures: open palm turns it on, a closed fist turns it off, and rotating the palm changes brightness.

**Hand → webcam → MediaPipe in the browser → USB serial → ESP32 → MOSFET → 5 V LED**

**Demo:** https://chee613.github.io/gdg-workshop1/agentic-hardware/

| File | What it is |
| --- | --- |
| `index.html`, `main.js`, `gesture-math.mjs` | Browser gesture demo. Allow camera access when asked. |
| `mediapipe-slides.html` | Slides on MediaPipe hand tracking |
| `agentic-hardware-slides.html` | AI Hardware Lab Assistant slides |
| `hardware-wiring.html` | Wiring diagram for the lamp kit |
| `docs/` | Proposal, realisation plan, beginner guide, ESP32 wiring and the event checklist |
| `assets/` | Illustrations, wiring photos and diagrams |

## Run locally

The camera only works over `http://localhost` or HTTPS, so start a small server from the repository root:

```powershell
python -m http.server 8000
```

Then open http://localhost:8000/agentic-hardware/.
