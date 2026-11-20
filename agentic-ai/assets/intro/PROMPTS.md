# Google Flow clips for the agentic AI intro deck

Eight short looping clips, one per illustration card in `agentic-ai/intro.html`.
The diagrams (chatbot vs agent, the loop, the rings) are animated in code and need nothing from Flow.

## Settings for every clip

| Setting | Value |
|---|---|
| Mode | Frames to Video |
| First frame | the PNG listed for that clip, from `assets/intro/flow/` |
| Last frame | the **same** PNG, so the clip ends where it starts and loops cleanly |
| Aspect ratio | 16:9 |
| Model | Omni 1.1 Flash, 4 seconds, 720p (about 7 credits each). Veo 3.1 Lite also works (about 10 credits, fixed 8 seconds). |
| Save as | the file name in the table, into `assets/intro/` |

The start frames are 1920×1080. The picture sits in the middle with plain colour at the sides; the deck crops the sides off again, so nothing you care about is lost.

## Paste this after every prompt (style lock)

> Static locked-off camera, no zoom, no pan, no cuts. Keep the exact flat 2D hand-drawn comic style of the image: thick black outlines, flat colours, light paper grain. Nothing new enters the picture. No text, no captions, no subtitles. Silent, no music, no sound effects. The last frame matches the first frame.

## The eight clips

| # | First and last frame | Save as | Prompt |
|---|---|---|---|
| 1 | `flow/01-cover.png` | `01-cover.mp4` | The small white intern robot bobs gently on the spot and waves its raised hand side to side twice at the viewer. Its curved eyes blink once. The desk lamp glows a little brighter for a moment, then settles. The plant's leaves sway slightly. |
| 2 | `flow/02-chatbot.png` | `02-chatbot.mp4` | The robot behind the counter keeps pointing to the right and nods twice, as if giving directions. The three empty speech bubbles above it bounce one after another, from left to right, then settle back. |
| 3 | `flow/03-agent.png` | `03-agent.mp4` | The robot proudly lifts the stack of papers with the clipboard a little toward the viewer, holds it, then lowers it back. The yellow tick mark above the stack pulses once. Its curved eyes blink once. |
| 4 | `flow/04-brain.png` | `04-brain.mp4` | The robot taps its chin twice with its hand, thinking. The light bulb above its antenna dims, then lights up bright. The red arrow on the left pulses once, then the blue arrow on the right pulses once. |
| 5 | `flow/05-tools.png` | `05-tools.mp4` | The four items standing in the open orange toolbox hop one after another from left to right, each with one small bounce: the magnifying glass, the wrench, the calendar, the envelope. The toolbox itself stays still. |
| 6 | `flow/06-memory.png` | `06-memory.mp4` | The yellow pencil traces along one wavy line on the right-hand page of the open notebook, moving left to right as if writing, then glides back to where it started. The three coloured tabs on the left edge flutter slightly. |
| 7 | `flow/07-instructions.png` | `07-instructions.mp4` | On the clipboard, a small black tick appears in each of the three empty boxes, one by one from top to bottom. The ticks hold for a moment, then fade away together. The card leaning beside the clipboard rocks slightly. |
| 8 | `flow/08-boss.png` | `08-boss.mp4` | The hand lifts the wooden stamp straight up off the paper, pauses, then presses it firmly back down on the same spot next to the orange tick mark. As it lands, the robot gives one small happy bounce. |

## After generating

1. Watch each clip all the way through. Check that the robot's face and outline don't warp mid-move, and that no extra object or lettering appears.
2. If the style drifts toward 3D or realistic, regenerate that one and add "strictly 2D, no shading, no depth" to the prompt.
3. Drop the `.mp4` files into `assets/intro/`. The deck plays a clip over its card automatically, muted and looping. A card with no clip keeps its still picture.

`flow/09-loop.png` (the robot on a running track) is ready as a start frame too, but no slide uses that picture yet.
