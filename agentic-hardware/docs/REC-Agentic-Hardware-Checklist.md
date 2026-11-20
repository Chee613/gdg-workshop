# REC preparation: AI Hardware Lab Assistant

GDGoC UM × Robotics Engineering Club. Prepared 5 October 2026.

Participants connect a small LED circuit and watch an ADK agent use board replies to diagnose a prepared software mapping fault. The agent restores GPIO25, runs a test and asks a participant to confirm the visible light.

**Status:** workshop concept and teaching simulation. Live ESP32 firmware, the serial adapter and ADK integration still require implementation and a physical pilot. The slides do not connect to hardware or an AI API.

## Hardware to prepare

Use one standard **ESP32-DevKitC V4 with an ESP32-WROOM module and fitted headers**. Check the actual supplier's board before ordering.

| Item | Per pair | 20 pairs + 2 complete spares | REC preparation |
|---|---:|---:|---|
| ESP32-DevKitC V4 | 1 | 22 | Same model. Pre-flash tested firmware. |
| Micro-USB data cable | 1 | 22 | Test data transfer. Supply laptop USB adapters where necessary. |
| Breadboard | 1 | 22 | Verify width and access to GPIO25/GND. Use a wider board or two joined boards if required. |
| Ordinary 5 mm red LED | 1 | 22 | Low current. Mark polarity. |
| 220 Ω, ¼ W resistor | 1 | 22 | Series resistor. Check current for the actual LED. |
| Male-to-male jumper wires | 2 | 44 | Two wires for the checked breadboard arrangement. |
| Printed wiring/command card | 1 | 22 | Photo of REC's tested circuit and exact pin labels. |

Shared: multimeter, spare LEDs/resistors/data cables/wires, USB adapters, projector, facilitator's proven kit and laptop charging access.

Each pair brings one laptop and completes the Python/API/USB setup before the event. Internet is required for Gemini requests. The ESP32 uses USB for commands and needs no Wi-Fi in this design.

The example of 40 participants / 20 pairs is a planning assumption. Adjust to registration. Obtain local quotes after the pilot passes. No prices have been verified.

## Exact circuit

<pre>
ESP32 GPIO25 ── 220 Ω resistor ── LED anode (+)
LED cathode (−) ── ESP32 GND
Laptop ── USB data cable ── ESP32
</pre>

The LED long leg normally indicates the anode. The short leg and flat side of the body indicate the cathode. If the legs have been cut, verify the component.

Keep the resistor and LED in series, with LED legs in separate breadboard strips. Follow printed GPIO labels rather than copying pin positions from another ESP32 variant. Use only USB power in the core kit. Unplug it before changing wires.

GPIO25 HIGH lights this LED, and LOW turns it off. REC verifies actual current against the purchased component. For an illustrative red LED forward voltage of 2 V, the estimated current is (3.3 − 2.0) / 220 = 5.9 mA. This estimate is not a measured kit value.

See the existing [detailed LED wiring guide](Simple-ESP32-LED-Wiring.md). Its generated image is illustrative. Use REC's tested circuit photo for participant assembly.

## How the agent reaches the hardware

<pre>
Participant request
       │
ADK agent on laptop ⇄ Gemini model over internet
       │ selects a registered tool
Python serial adapter on laptop
       │ newline-terminated command over USB
ESP32 firmware → GPIO25 → LED
       │ JSON reply over USB
Tool result → ADK agent → next action or explanation
       │
Participant confirms whether the physical LED lights up
</pre>

The ESP32 executes approved commands. The model runs outside the board. A software acknowledgement does not measure physical light.

### Proposed tool and firmware contract

These are commands we propose to implement, not an existing standard or working firmware in this repository.

| Agent tool | USB command | Firmware behaviour |
|---|---|---|
| <code>read_board_status()</code> | <code>STATUS</code> | Reply with firmware version, active_pin and commanded LED state. |
| <code>set_led(on: bool)</code> | <code>LED ON</code> / <code>LED OFF</code> | Set the configured output HIGH/LOW. Reply with ok, active_pin and commanded state. |
| <code>restore_workshop_config()</code> | <code>RESTORE</code> | Set the previous output LOW, restore GPIO25 as OUTPUT, leave the LED OFF and acknowledge. |

Commands and replies each end with a newline. Replies are one JSON object per line. Unknown commands return explicit errors.

**Prepared fault:** a facilitator-only command selects unused GPIO26 with outputs initially LOW. REC verifies that pin is unconnected in the fixture. The agent's tools do not expose the fault command or arbitrary GPIO selection.

The serial adapter opens one selected port, validates input, serializes requests, and uses a short reply timeout. It rejects malformed JSON and returns explicit errors for disconnects/timeouts. Opening a USB-UART port may reset the board, so the adapter waits for READY before sending requests.

### ADK starter

GDGoC provides the three Python functions and an ADK Agent with those functions registered in its tools list. Instructions tell it to:

1. Read board status and compare it with the approved GPIO25 wiring card.
2. Restore the fixed workshop configuration only when needed.
3. Run the LED test and read the software state.
4. Ask a person to confirm the visible light.
5. Stop on a connection error. Request REC's physical inspection when software reports ON but the LED is dark.

Use ADK's local development chat interface and keep tool calls visible. Store Gemini API keys in the laptop environment or a local .env file outside version control. Firmware needs no model API key.

MCP is an alternative bridge. It is optional for this custom Python-tool design. Compile/upload tools are outside the core participant exercise.

## Responsibilities

| REC | GDGoC | Joint |
|---|---|---|
| Board selection, circuit, firmware, fault/reset modes, kit inspection and wiring cards. | ADK starter, serial adapter, simulator, tool traces, Python/API access and exercises. | Beginner pilot, freeze parts/software, confirm budget/capacity and rehearse. |

## Acceptance checks before bulk ordering

1. A fresh laptop following the guide finds the port and receives READY and status replies.
2. Manual LED ON/OFF works for 20 cycles without the agent.
3. Normal-mode agent reads status, skips restoration and waits for visual confirmation.
4. Fault mode reports GPIO26. The agent restores GPIO25 and retests without changing the circuit.
5. Disconnected USB returns an error and stops actions. Reconnection recovers normally.
6. A valid software state with an unlit LED causes a physical inspection request rather than a success claim. REC unplugs power before changing the circuit.
7. Two or three beginner pilot participants complete the exercise within the proposed session.

Then freeze board model, firmware, dependency versions, circuit, cable, tool contract and setup guide. Number and test every kit before workshop day.

## Sources and presentation

- [ADK Python quickstart](https://adk.dev/get-started/python/) and [function tools](https://adk.dev/tools-custom/function-tools/).
- [mcp-serial](https://github.com/HumbertoBernal/mcp-serial), an existing serial bridge. Its example temperature is simulated.
- [Arduino MCP Server](https://github.com/hardware-mcp/arduino-mcp-server), a broader compile/upload/monitor workflow.
- [Espressif board pinout and USB interface](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html).
- [Adafruit LED wiring basics](https://learn.adafruit.com/adafruit-arduino-lesson-2-leds/breadboard-layout).
- [Interactive HTML slides](../agentic-hardware-slides.html). Use arrow keys. Slide 9 has working, wrong-pin and disconnected scenarios.

Cover: assets/agentic/ai-hardware-hero.png, generated with the built-in imagegen tool. Prompt summary: ivory ceramic laptop, ESP32-inspired LED circuit and friendly robot on pale wood, Google-colour accents, white background. It is concept artwork rather than a wiring guide.
