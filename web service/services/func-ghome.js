const axios = require('axios')
const querystring = require('querystring')
var Account = require('../__models/__account')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const util = require('util')
const removeUserServices = require('./__func-services').removeUserServices

const ghomeJWT_file = 'ghomejwt.json'
const readFile = util.promisify(fs.readFile)

var reportState = false
var keys 

//TODO: LEGGERE FILE JWT in maniera intelligente
const readFileAsync = async () => {
  var data = await readFile(ghomeJWT_file, 'utf8')
  return data
}

readFileAsync()
  .then((result) => {
    reportState = true
    keys = JSON.parse(result)
  })
  .catch((err) => {
  })

var enableGoogleHomeSync = true
if (!process.env.HOMEGRAPH_APIKEY) {
  enableGoogleHomeSync = false
} else {
  var SYNC_API = 'https://homegraph.googleapis.com/v1/devices:requestSync?key=' + process.env.HOMEGRAPH_APIKEY;
}

// notifica google del cambiamento di stato, google poi fa il polling
const gHomeSyncAsync = async (userId) => {
  try {
    var user = await Account.findOne({ _id: userId })
    if (user.activeServices && user.activeServices.indexOf('Google') != -1) {
      
      var response = await axios({
        method: 'post',
        url: SYNC_API,
        data: { agentUserId: user._id },
        headers: {
          'User-Agent': 'request',
          Referer: 'https://' + process.env.WEB_HOSTNAME
        }
      })
    }
  } catch (e) {
  }
}

const requestToken2Async = async (keys) => {
  // try {
    if (reportState == true) {
      
      var payload = {
        iss: keys.client_email,
        scope: 'https://www.googleapis.com/auth/homegraph',
        aud: 'https://accounts.google.com/o/oauth2/token',
        iat: new Date().getTime() / 1000,
        exp: new Date().getTime() / 1000 + 3600,
      }
      var privKey = keys.private_key
      
      var token = jwt.sign(payload, privKey, { algorithm: 'RS256' })
      
      var formData = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token,
      }
      
      var response = await axios({
        method: 'post',
        url: 'https://accounts.google.com/o/oauth2/token',
        data: querystring.stringify(formData),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      if (response.status == 200) {
        return response.data.access_token
      }
      
      // else {
      //   return undefined
      // }
    }
  // } catch (e) {
  //   return undefined
  // }
}

const sendStateAsync = async (token, response, username) => {
  try {
    if (reportState == true && token != undefined) {
      
      var response = await axios({
        method: 'post',
        url: 'https://homegraph.googleapis.com/v1/devices:reportStateAndNotification',
        data: response,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'X-GFE-SSL': 'yes',
        },
      })

    }
  } catch (e) {
    
    if (e.response && e.response.data && e.response.status) {

      
      if (e.response.status == 404) removeUserServices(username, 'Google')
    }
  }
}

const queryDeviceStateAsync = async (device) => {
  try {
    var dev = {}
    
    dev.online = true
    
    var deviceType = await gHomeReplaceType(device.displayCategories)
    
    for (let capability of device.capabilities) {
      var trait = await gHomeReplaceCapability(capability, deviceType)
      
      if (trait == 'action.devices.traits.Brightness') {
        dev.brightness = device.state.brightness
      }
      if (trait == 'action.devices.traits.ColorSetting') {
        if (!dev.hasOwnProperty('on')) {
          dev.on = device.state.power.toLowerCase()
        }
        if (device.capabilities.indexOf('ColorController') > -1) {
          dev.color = {
            spectrumHsv: {
              hue: device.state.colorHue,
              saturation: device.state.colorSaturation,
              value: device.state.colorBrightness,
            },
          }
        }
        if (device.capabilities.indexOf('ColorTemperatureController') > -1) {
          var hasColorElement = getSafe(() => dev.color)
          if (hasColorElement != undefined) {
            dev.color.temperatureK = device.state.colorTemperature
          } else {
            dev.color = {
              temperatureK: device.state.colorTemperature,
            }
          }
        }
      }
      if (trait == 'action.devices.traits.FanSpeed') {
        dev.currentFanSpeedSetting = 'S' + device.state.rangeValue.toString()
      }
      if (trait == 'action.devices.traits.LockUnlock') {
        if (device.state.lock.toLowerCase() == 'locked') {
          dev.isLocked = true
        } else {
          dev.isLocked = false
        }
      }
      if (trait == 'action.devices.traits.OnOff') {
        if (device.state.power.toLowerCase() == 'on') {
          dev.on = true
        } else {
          dev.on = false
        }
      }
      if (trait == 'action.devices.traits.OpenClose') {
        dev.openPercent = device.state.rangeValue
      }
      
      if (trait == 'action.devices.traits.TemperatureSetting') {
        dev.thermostatMode = device.state.thermostatMode.toLowerCase()
        dev.thermostatTemperatureSetpoint = device.state.thermostatSetPoint
        if (device.state.hasOwnProperty('temperature')) {
          dev.thermostatTemperatureAmbient = device.state.temperature
        }
      }
      if ((trait = 'action.devices.traits.Volume')) {
        dev.currentVolume = device.state.volume
        dev.isMuted = device.state.mute
      }
    }
    
    return dev
  } catch (e) {

    return undefined
  }
}

const validateCommandAsync = async (command, commandDevice, dbDevice, req) => {
  try {
    
    var params = command.execution[0].params
    
    if (
      command.execution[0].command ==
      'action.devices.commands.ThermostatTemperatureSetpoint'
    ) {
      var hasTemperatureMax = getSafe(() => dbDevice.attributes.temperatureRange.temperatureMax)
      var hasTemperatureMin = getSafe(() => dbDevice.attributes.temperatureRange.temperatureMin)
      if (hasTemperatureMin != undefined && hasTemperatureMax != undefined) {
        var temperatureMin = dbDevice.attributes.temperatureRange.temperatureMin
        var temperatureMax = dbDevice.attributes.temperatureRange.temperatureMax
        if (
          params.thermostatTemperatureSetpoint > temperatureMax ||
          params.thermostatTemperatureSetpoint < temperatureMin
        ) {
          var errResponse = {
            requestId: req.body.requestId,
            payload: {
              errorCode: 'valueOutOfRange',
            },
          }
          return { status: false, response: errResponse }
        }
      }
    }
    
    if (command.execution[0].command == 'action.devices.commands.ColorAbsolute') {
      var hasTemperatureMaxK = getSafe(() => dbDevice.attributes.colorTemperatureRange.temperatureMaxK)
      var hasTemperatureMinK = getSafe(() => dbDevice.attributes.colorTemperatureRange.temperatureMinK)
      if (hasTemperatureMinK != undefined && hasTemperatureMaxK != undefined) {
        var temperatureMinK = dbDevice.attributes.colorTemperatureRange.temperatureMinK
        var temperatureMaxK = dbDevice.attributes.colorTemperatureRange.temperatureMaxK
        if (
          params.color.temperature > temperatureMaxK ||
          params.color.temperature < temperatureMinK
        ) {
          var errResponse = {
            requestId: req.body.requestId,
            payload: {
              errorCode: 'valueOutOfRange',
            },
          }
          return { status: false, response: errResponse }
        }
      }
    }
    
    var hasRequire2FA = getSafe(() => dbDevice.attributes.require2FA)
    if (hasRequire2FA == true) {
      var hasChallengeType = getSafe(() => dbDevice.attributes.type2FA) 
      var hasChallengePin = getSafe(() => command.execution[0].challenge.pin) 
      
      if (hasChallengeType == 'pin' && hasChallengePin == undefined) {
        var errResponse = {
          requestId: req.body.requestId,
          payload: {
            commands: [
              {
                ids: [commandDevice.id.toString()],
                status: 'ERROR',
                errorCode: 'challengeNeeded',
                challengeNeeded: {
                  type: 'pinNeeded',
                },
              },
            ],
          },
        }
        return { status: false, response: errResponse }
      }
      
      else if (
        hasChallengeType == 'pin' &&
        hasChallengePin != dbDevice.attributes.pin
      ) {
        var errResponse = {
          requestId: req.body.requestId,
          payload: {
            commands: [
              {
                ids: [commandDevice.id.toString()],
                status: 'ERROR',
                errorCode: 'challengeNeeded',
                challengeNeeded: {
                  type: 'challengeFailedPinNeeded',
                },
              },
            ],
          },
        }
        return { status: false, response: errResponse }
      }
    }
    
    return { status: true }
  } catch (e) {
    return { status: false, response: undefined }
  }
}


const gHomeReplaceCapability = async (capability, type) => {
  if (capability == 'PowerController')
    return 'action.devices.traits.OnOff'
  if (capability == 'BrightnessController')
    return 'action.devices.traits.Brightness'
  if (capability == 'ColorController' || capability == 'ColorTemperatureController') 
    return 'action.devices.traits.ColorSetting'
  if (capability == 'ChannelController')
    return 'action.devices.traits.Channel'
  if (capability == 'LockController') 
    return 'action.devices.traits.LockUnlock'
  if (capability == 'InputController') 
    return 'action.devices.traits.InputSelector'
  if (capability == 'PlaybackController') 
    return 'action.devices.traits.MediaState'
  if (capability == 'SceneController') 
    return 'action.devices.traits.Scene'
  if (capability == 'Speaker') 
    return 'action.devices.traits.Volume'
  if (capability == 'ThermostatController') 
    return 'action.devices.traits.TemperatureSetting'
  if (capability == 'RangeController' && (type.indexOf('action.devices.types.AWNING') > -1 || type.indexOf('action.devices.types.BLINDS') > -1))
    return 'action.devices.traits.OpenClose'
  if (capability == 'RangeController' && (type.indexOf('action.devices.types.FAN') > -1 || type.indexOf('action.devices.types.THERMOSTAT') > -1))
    return 'action.devices.traits.FanSpeed'
  return 'Not Supported'
}

const gHomeReplaceType = async (type) => {
  if (type == 'ACTIVITY_TRIGGER')
    return 'action.devices.types.SCENE'
  if (type == 'EXTERIOR_BLIND')
    return 'action.devices.types.AWNING'
  if (type == 'FAN')
    return 'action.devices.types.FAN'
  if (type == 'INTERIOR_BLIND')
    return 'action.devices.types.BLINDS'
  if (type == 'LIGHT')
    return 'action.devices.types.LIGHT'
  if (type == 'SPEAKER')
    return 'action.devices.types.SPEAKER'
  if (type == 'SMARTLOCK')
    return 'action.devices.types.LOCK'
  if (type == 'SMARTPLUG')
    return 'action.devices.types.OUTLET'
  if (type == 'SWITCH')
    return 'action.devices.types.SWITCH'
  if (type.indexOf('THERMOSTAT') > -1)
    return 'action.devices.types.THERMOSTAT'
  if (type == 'TV')
    return 'action.devices.types.TV'
  return 'NA'
}

// function getSafe(fn) {
//   try {
//     return fn()
//   } catch (e) {
//     return undefined
//   }
// }

// module.exports = {
//   queryDeviceStateAsync,
//   gHomeSyncAsync,
//   sendStateAsync,
//   requestToken2Async,
//   gHomeReplaceCapability,
//   gHomeReplaceType,
//   validateCommandAsync,
// }
