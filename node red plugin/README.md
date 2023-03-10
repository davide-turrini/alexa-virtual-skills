# Features

- A wide variety of supported device types and capabilities/ traits (details below)
- Real-time state reporting in the Alexa and Google Home apps.
- Alexa _and_ Google Home support, you can choose to use either, or both (note Google Home integration is currently awaiting certification but you can request access)

To enable Google Home/ Google Assistant functionality follow the instructions [here](https://github.com/coldfire84/node-red-alexa-home-skill-v3-web/wiki/Use-the-Hosted-Instance#google-assistant).

# Getting Started

Using the (free to use) hosted instance you can be up and running in just a few minutes:

1. Setup an account [here](https://red.cb-net.co.uk).
2. Once logged in, create your devices [here](https://red.cb-net.co.uk/devices).
3. Install and configure these nodes to your Node-RED instance.
4. Build relevant flows, see examples [here](https://red.cb-net.co.uk/docs).

Alternatively, you can deploy your own instance of this service, follow [these instructions](https://github.com/coldfire84/node-red-alexa-home-skill-v3-web/wiki/Deploy-Your-Own).

# Supported Devices/ Capabilities

| Alexa Interface                             | Google Trait                | Supported Controls                                                                                                      | Example Usage               | Useful Links                                                                              |
| ------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| Brightness Control                          | Brightness                  | 0-100%, increase, reduce, dim                                                                                           | MQTT Out                    | Any MQTT-enabled bulb/ smart light                                                        |
| Channel Control                             | Experimental (number only)  | Any number or name, i.e. 101, BBC 1, Channel 4                                                                          | HTTP Out                    | Any HTTP-enabled endpoint                                                                 |
| Contact Sensor                              | ContactSensor               | _No commands_ Note you can also use this interface as a trigger.                                                        | N/A                         | "Alexa, is the Kitchen window open?"                                                      |
| Color Control                               | ColorSetting                | Red, Green, Blue, Purple, Yellow etc.                                                                                   | MQTT Out                    | Any MQTT-enabled bulb/ smart light                                                        |
| Color Temperature Control                   | ColorTemperature            | Increase, Decrease, Warm, Warm White, Incandescent, Soft White, White, Daylight, Daylight White, Cool, Cool White\*\*\* | MQTT Out                    | Any MQTT-enabled bulb/ smart light                                                        |
| Input Control                               | Not Supported               | HDMI1, HDMI2, HDMI3, HDMI4, phono, audio1, audio2 and "chromecast"                                                      | Yamaha Music Cast Amplifier | [node-red-contrib-avr-yamaha](https://flows.nodered.org/node/node-red-contrib-avr-yamaha) |
| Lock Control                                | Experimental                | Lock, Unlock                                                                                                            | MQTT Out                    | Any MQTT connected Lock                                                                   |
| Motion Sensor                               | MotionSensor                | _No commands_ You can use this interface as a trigger with Alexa                                                        | N/A                         |                                                                                           |
| Playback Control                            | Experimental                | Play, Pause, Stop, FastForward, Rewind, StartOver, Next, Previous                                                       | Kodi RPC                    | Http Response Node with [Kodi RPC Commands](https://kodi.wiki/view/JSON-RPC_API/Examples) |
| Percentage Controller                       | Not Supported               | 0-100%, increase %, decrease %                                                                                          | HTTP Out, MQTT Out          | Fans, AC Unit                                                                             |
| Power Control                               | OnOff                       | On, Off                                                                                                                 | MQTT Out                    | Any MQTT-enabled switch, Socket etc                                                       |
| Scene Control                               | Scene                       | Turn On                                                                                                                 | Multiple                    | String together a number of nodes for your scene, i.e. lighting, TV on, ACR on            |
| Speaker                                     | Experimental                | +/- volume, set to specific number, mute                                                                                | Yamaha Music Cast Amplifier | [node-red-contrib-avr-yamaha](https://flows.nodered.org/node/node-red-contrib-avr-yamaha) |
| Speaker (Step)                              | Not Supported (use Speaker) | +/- volume, mute                                                                                                        | Yamaha Music Cast Amplifier | [node-red-contrib-avr-yamaha](https://flows.nodered.org/node/node-red-contrib-avr-yamaha) |
| Temperature Sensor                          | Not Supported               | No commands                                                                                                             | N/A                         | View/ query temperature in any room by voice or Alexa App                                 |
| Thermostats Control (Single set-point only) | TemperatureSetting          | Set specific temp\*\*, increase/ decrease                                                                               | MQTT Out                    | Any MQTT connected thermostat/HVAC                                                        |

# Further Information

Please see [Wiki](https://github.com/coldfire84/node-red-alexa-home-skill-v3-web/wiki) for additional information.
