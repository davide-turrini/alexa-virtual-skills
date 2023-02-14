// var Account = require('../__models/__account')
// var Devices = require('../__models/__devices')

const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const util = require('util')

// const gHomeFunc = require('./func-ghome')
// const alexaFunc = require('./func-alexa')
const ghomeJWT_file = './ghomejwt.json'

// const gHomeSendState = gHomeFunc.sendStateAsync
// const gHomeQueryDeviceState = gHomeFunc.queryDeviceStateAsync
// const alexaSendState = alexaFunc.sendStateAsync
// const alexaQueryDeviceState = alexaFunc.queryDeviceStateAsync
// const requestToken2Async = gHomeFunc.requestToken2Async

const readFile = util.promisify(fs.readFile)

var gToken = undefined 
var gHomeReportState = false
var keys 

var alexaReportState = false
if (!process.env.ALEXA_CLIENTID && !process.env.ALEXA_CLIENTSECRET) {
} else {
  alexaReportState = true
}

const setupHomeGraph = async () => {
  // try {
    // var data = await readFile(ghomeJWT_file, 'utf8')
    const data = await readFile(ghomeJWT_file, 'utf8')
    gHomeReportState = true
    keys = JSON.parse(data)
    gToken = await requestToken2Async(keys)
  // } catch (e) {
  // }
}

setupHomeGraph()

var refreshToken = setInterval( () => {
  setupHomeGraph()
}, 3540000)


const devices = []

const updateDeviceState = (username, endpointId, payload) => {
// const updateDeviceState = async (username, endpointId, payload) => {
  // try {
    
    const dev = _.find(devices, {
      username,
      endpointId
    })
    // var dev = await Devices.findOne({
    //   username: username,
    //   endpointId: endpointId,
    // })
    
    if (!dev)
      return;
    // if (!dev) return false
    
    const dt = new Date().toISOString()
    // var dt = new Date().toISOString()
    
    const deviceJSON = _.cloneDeep(device)

    // var deviceJSON = JSON.parse(JSON.stringify(dev))
    
    // const alerts = [] // non dovrebbero servire
    // var alerts = []
    
    dev.state = dev.state || {}
    dev.state.time = dt
    
    // var stateUnchanged = false

    if (_.every([
      _.has(payload, 'state.brightness'),
      _.isNumber(payload.state.brightness),
      _.inRange(payload.state.brightness, 0, 100)
    ]))
      _.set(device, 'state.brightness', payload.state.brightness) //TODO: attento al device.. controlla gli altri
      // device.state.brightness = payload.state.brightness
      
    
    // if (payload.state.hasOwnProperty('brightness')) {
      
    //   if (
    //     typeof payload.state.brightness == 'number' &&
    //     payload.state.brightness >= 0 &&
    //     payload.state.brightness <= 100
    //   ) {
    //     dev.state.brightness = payload.state.brightness
    //   // } else {
    //   //   alerts.push('[' + dev.friendlyName + '] ' + 'Invalid brightness state, expecting payload.state.brightness (number, 0-100)' )
    //   // }
    // }

    if (_.every([
      _.has(payload, 'state.channel'),
      _.isString(payload.state.channel)
    ]))
      _.set(dev, 'state.channel', payload.state.channel)
      // dev.state.channel = payload.state.channel


    // if (payload.state.hasOwnProperty('channel')) {
      
    //   if (
    //     typeof payload.state.channel == 'string' ||
    //     payload.state.channel == 'number'
    //   ) {
    //     dev.state.channel = payload.state.channel
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid channel state, expecting payload.state.channel (either string or number)')
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.colorBrightness'),
      _.has(payload, 'state.colorHue'),
      _.has(payload, 'state.colorSaturation'),
      _.isNumber(payload.state.colorHue),
      _.isNumber(payload.state.colorSaturation),
      _.isNumber(payload.state.colorBrightness),
      _.inRange(payload.state.colorHue, 0, 360),
      _.inRange(payload.state.colorSaturation, 0, 1),
      _.inRange(payload.state.colorBrightness, 0, 1)
    ])) {
      _.set(dev, 'state.colorBrightness', payload.state.colorBrightness)
      _.set(dev, 'state.colorHue', payload.state.colorHue)
      _.set(dev, 'state.colorSaturation', payload.state.colorSaturation)
        // dev.state.colorBrightness = payload.state.colorBrightness
        // dev.state.colorHue = payload.state.colorHue
        // dev.state.colorSaturation = payload.state.colorSaturation
      _.unset(dev, 'state.colorTemperature')
      // delete dev.state.colorTemperature
    }

    // if (
    //   payload.state.hasOwnProperty('colorBrightness') &&
    //   payload.state.hasOwnProperty('colorHue') &&
    //   payload.state.hasOwnProperty('colorSaturation')
    // ) {
      
    //   if (
    //     typeof payload.state.colorHue == 'number' &&
    //     typeof payload.state.colorSaturation == 'number' &&
    //     typeof payload.state.colorBrightness == 'number' &&
    //     payload.state.colorHue >= 0 &&
    //     payload.state.colorHue <= 360 &&
    //     payload.state.colorSaturation >= 0 &&
    //     payload.state.colorSaturation <= 1 &&
    //     payload.state.colorBrightness >= 0 &&
    //     payload.state.colorBrightness <= 1
    //   ) {
    //     dev.state.colorBrightness = payload.state.colorBrightness
    //     dev.state.colorHue = payload.state.colorHue
    //     dev.state.colorSaturation = payload.state.colorSaturation
    //     delete dev.state.colorTemperature
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid color state, expecting payload.state.colorHue (number, 0-360), payload.state.colorSaturation (number, 0-1) and payload.state.colorBrightness (number, 0-1)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.colorTemperature'),
      _.isNumber(payload.state.colorTemperature),
      _.inRange(payload.state.colorTemperature, 0, 10000)
    ])) {
      _.set(dev, 'state.colorTemperature', payload.state.colorTemperature)
      // dev.state.colorTemperature = payload.state.colorTemperature
      _.unset(dev, 'state.colorBrightness')
      _.unset(dev, 'state.colorHue')
      _.unset(dev, 'state.colorSaturation')
      // delete dev.state.colorBrightness
      // delete dev.state.colorHue
      // delete dev.state.colorSaturation
    }

    // if (payload.state.hasOwnProperty('colorTemperature')) {
      
    //   if (
    //     typeof payload.state.colorTemperature == 'number' &&
    //     (payload.state.colorTemperature >= 0 &&
    //       payload.state.colorTemperature) <= 10000
    //   ) {
    //     dev.state.colorTemperature = payload.state.colorTemperature
    //     delete dev.state.colorBrightness
    //     delete dev.state.colorHue
    //     delete dev.state.colorSaturation
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid colorTemperature state, expecting payload.state.colorTemperature (number, 0-10000)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.contact'),
      _.isString(payload.state.contact),
      _.some([
        _.isEqual(payload.state.contact, 'DETECTED'),
        _.isEqual(payload.state.contact, 'NOT_DETECTED')
      ])
    ]))
      _.set(dev, 'state.contact', payload.state.contact)
      // dev.state.contact = payload.state.contact

    // if (payload.state.hasOwnProperty('contact')) {
      
    //   if (
    //     typeof payload.state.contact == 'string' &&
    //     (payload.state.contact == 'DETECTED' ||
    //       payload.state.contact == 'NOT_DETECTED')
    //   ) {
    //     dev.state.contact = payload.state.contact
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid contact state, expecting payload.state.contact (string, DETECTED or NOT_DETECTED)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.input'),
      _.isString(payload.state.input)
    ]))
      _.set(dev, 'state.input', payload.state.input)
      // dev.state.input = payload.state.input

    // if (payload.state.hasOwnProperty('input')) {      
    //   if (typeof payload.state.input == 'string') {
    //     dev.state.input = payload.state.input
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid input state, expecting payload.state.input (string)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.lock'),
      _.isString(payload.state.lock),
      _.some([
        _.isEqual(payload.state.lock, 'LOCKED'),
        _.isEqual(payload.state.lock, 'UNLOCKED')
      ])
    ]))
      _.set(dev, 'state.lock', payload.state.lock)
      // dev.state.lock = payload.state.lock

    // if (payload.state.hasOwnProperty('lock')) {
      
    //   if (
    //     typeof payload.state.lock == 'string' &&
    //     (payload.state.lock == 'LOCKED' || payload.state.lock == 'UNLOCKED')
    //   ) {
    //     dev.state.lock = payload.state.lock
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid lock state, expecting payload.state.lock (string, LOCKED or UNLOCKED)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.mode'),
      _.isString(payload.state.mode)
    ]))
      _.set(dev, 'state.mode', payload.state.mode)
      // dev.state.mode = payload.state.mode

    // if (payload.state.hasOwnProperty('mode')) {
      
    //   if (typeof payload.state.mode == 'string') {
    //     dev.state.mode = payload.state.mode
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid mode state, expecting payload.state.mode (string)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.motion'),
      _.isString(payload.state.motion),
      _.some([
        _.isEqual(payload.state.motion, 'DETECTED'),
        _.isEqual(payload.state.motion, 'NOT_DETECTED')
      ])
    ]))
      _.set(dev, 'state.motion', payload.state.motion)
      // dev.state.motion = payload.state.motion

    // if (payload.state.hasOwnProperty('motion')) {
    //   if (
    //     typeof payload.state.motion == 'string' &&
    //     (payload.state.motion == 'DETECTED' ||
    //       payload.state.motion == 'NOT_DETECTED')
    //   ) {
    //     dev.state.motion = payload.state.motion
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid motion state, expecting payload.state.motion (string, DETECTED or NOT_DETECTED)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.mute'),
      _.isBoolean(payload.state.mute),
      _.some([
        _.isEqual(payload.state.mute, true),
        _.isEqual(payload.state.mute, false)
      ])
    ]))
      _.set(dev, 'state.mute', payload.state.mute)
      // dev.state.mute = payload.state.mute

    // if (payload.state.hasOwnProperty('mute')) {
    //   if (
    //     typeof payload.state.mute == 'boolean' &&
    //     (payload.state.mute == true || payload.state.mute == false)
    //   ) {
    //     dev.state.mute = payload.state.mute
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid mute state, expecting payload.state.mute (boolean)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.percentage'),
      _.isNumber(payload.state.percentage),
      _.inRange(payload.state.percentage, 0, 100)
    ]))
      _.set(dev, 'state.percentage', payload.state.percentage)
      // dev.state.percentage = payload.state.percentage

    // if (payload.state.hasOwnProperty('percentage')) {
    //   if (
    //     typeof payload.state.percentage == 'number' &&
    //     payload.state.percentage >= 0 &&
    //     payload.state.percentage <= 100
    //   ) {
    //     dev.state.percentage = payload.state.percentage
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid percentage state, expecting payload.state.percentage (number, 0-100)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.percentageDelta'),
      _.has(dev, 'state.percentage'),
      _.isNumber(payload.state.percentageDelta),
      _.isNumber(dev.state.percentage),
      _.inRange(payload.state.percentageDelta, -100, 100)
    ]))
      _.set(dev, 'state.percentage', _.max([0, _.min([100, dev.state.percentage + payload.state.percentageDelta])]))
      // dev.state.percentage = _.max([0, _.min([100, dev.state.percentage + payload.state.percentageDelta])])

    // if (payload.state.hasOwnProperty('percentageDelta')) {
    //   if (
    //     typeof payload.state.percentageDelta == 'number' &&
    //     payload.state.percentageDelta >= -100 &&
    //     payload.state.percentageDelta <= 100
    //   ) {
    //     if (dev.state.hasOwnProperty('percentage')) {
    //       var newPercentage = dev.state.percentage + payload.state.percentageDelta
    //       if (newPercentage > 100) {
    //         newPercentage = 100
    //       } else if (newPercentage < 0) {
    //         newPercentage = 0
    //       }
    //       dev.state.percentage = newPercentage
    //     }
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid percentageDelta state, expecting payload.state.percentageDelta (number, -100-100)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.playback'),
      _.isString(payload.state.playback)
    ]))
      _.set(dev, 'state.playback', payload.state.playback)  
      // dev.state.playback = payload.state.playback

    // if (payload.state.hasOwnProperty('playback')) {
      
    //   if (typeof payload.state.playback == 'string') {
    //     dev.state.playback = payload.state.playback
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid playback state, expecting payload.state.playback (string)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.power'),
      _.isString(payload.state.power),
      _.some([
        _.isEqual(payload.state.power, 'ON'),
        _.isEqual(payload.state.power, 'OFF')
      ])
    ]))
      _.set(dev, 'state.power', payload.state.power)  
      // dev.state.power = payload.state.power

    // if (payload.state.hasOwnProperty('power')) {
      
    //   if (
    //     typeof payload.state.power == 'string' &&
    //     (payload.state.power == 'ON' || payload.state.power == 'OFF')
    //   ) {
        
    //     var storedPowerState = getSafe(() => dev.state.power)
    //     if (storedPowerState == payload.state.power) {
    //       stateUnchanged = true
    //     } else {
    //       dev.state.power = payload.state.power
    //     }
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid power state, expecting payload.state.power (string, ON or OFF)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.rangeValue'),
      _.isNumber(payload.state.rangeValue)
    ])) 
      _.set(dev, 'state.rangeValue', payload.state.rangeValue)  
      // dev.state.rangeValue = payload.state.rangeValue

    // if (payload.state.hasOwnProperty('rangeValue')) {
    //   if (typeof payload.state.rangeValue == 'number') {
    //     dev.state.rangeValue = payload.state.rangeValue
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid rangeValue state, expecting payload.state.rangeValue (number)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.rangeValueDelta'),
      _.has(dev, 'state.rangeValue'),
      _.isNumber(payload.state.rangeValueDelta),
      _.isNumber(dev.state.rangeValue)
    ])) 
      _.set(dev, 'state.percentage', dev.state.rangeValue + payload.state.rangeValueDelta)
      // dev.state.percentage = dev.state.rangeValue + payload.state.rangeValueDelta

    // if (payload.state.hasOwnProperty('rangeValueDelta')) {
    //   if (typeof payload.state.rangeValueDelta == 'number') {
    //     if (dev.state.hasOwnProperty('rangeValue')) {
    //       var newRangeValue =
    //         dev.state.rangeValue + payload.state.rangeValueDelta
    //       dev.state.rangeValue = newRangeValue
    //     }
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid rangeValueDelta state, expecting payload.state.rangeValueDelta (number)' )
    //   }
    // }
    
    if (_.every([
      _.some([
        _.has(payload, 'state.targetSetpointDelta'),
        _.has(payload, 'state.thermostatSetPoint'), 
        _.has(payload, 'state.thermostatMode')
      ]),
      _.has(payload, 'state.targetSetpointDelta'),
      _.has(dev, 'state.thermostatSetPoint'),
      _.isNumber(payload.state.targetSetpointDelta)
    ])) 
      _.set(dev, 'state.thermostatSetPoint', dev.state.thermostatSetPoint + payload.state.targetSetpointDelta)
      // dev.state.thermostatSetPoint = dev.state.thermostatSetPoint + payload.state.targetSetpointDelta

    if (_.every([
      _.some([
        _.has(payload, 'state.targetSetpointDelta'),
        _.has(payload, 'state.thermostatSetPoint'), 
        _.has(payload, 'state.thermostatMode')
      ]),
      _.has(payload, 'state.thermostatSetPoint'),
      _.has(dev, 'state.thermostatSetPoint'),
      _.isNumber(payload.state.thermostatSetPoint)
    ])) 
      _.set(dev, 'state.thermostatSetPoint', payload.state.thermostatSetPoint)
      // dev.state.thermostatSetPoint = payload.state.thermostatSetPoint

    if (_.every([
      _.some([
        _.has(payload, 'state.targetSetpointDelta'),
        _.has(payload, 'state.thermostatSetPoint'), 
        _.has(payload, 'state.thermostatMode')
      ]),
      _.has(payload, 'state.thermostatMode'),
      _.isString(payload.state.thermostatMode)
    ])) 
      _.set(dev, 'state.thermostatMode', payload.state.thermostatMode)
      // dev.state.thermostatMode = payload.state.thermostatMode

    if (_.every([
      _.some([
        _.has(payload, 'state.targetSetpointDelta'),
        _.has(payload, 'state.thermostatSetPoint'), 
        _.has(payload, 'state.thermostatMode')
      ]),
      !_.has(payload, 'state.thermostatMode'),
      _.has(deviceJSON, 'attributes.thermostatModes'),
      _.isString(payload.state.thermostatMode)
    ])) 
      _.set(dev, 'state.thermostatMode', dev.state.thermostatMode)
      // dev.state.thermostatMode = dev.state.thermostatMode

    if (_.every([
      _.some([
        _.has(payload, 'state.targetSetpointDelta'),
        _.has(payload, 'state.thermostatSetPoint'), 
        _.has(payload, 'state.thermostatMode')
      ]),
      !_.has(payload, 'state.thermostatMode')
    ])) 
      _.set(dev, 'state.thermostatMode', 'HEAT')
      // dev.state.thermostatMode = 'HEAT'


    // if (
    //   payload.state.hasOwnProperty('targetSetpointDelta') ||
    //   payload.state.hasOwnProperty('thermostatSetPoint') ||
    //   payload.state.hasOwnProperty('thermostatMode')
    // ) {
    //   var newTemp = undefined
    //   var newMode = undefined
    //   if (
    //     dev.state.hasOwnProperty('thermostatSetPoint') &&
    //     payload.state.hasOwnProperty('targetSetpointDelta')
    //   ) {
    //     if (typeof payload.state.targetSetpointDelta == 'number') {
          
    //       newTemp = dev.state.thermostatSetPoint + payload.state.targetSetpointDelta

    //     } else {
    //       alerts.push('[' + dev.friendlyName + '] ' + 'Invalid targetSetpointDelta state, expecting payload.state.targetSetpointDelta (number)' )
    //     }
    //   } else if (
    //     dev.state.hasOwnProperty('thermostatSetPoint') &&
    //     payload.state.hasOwnProperty('thermostatSetPoint')
    //   ) {
    //     if (typeof payload.state.thermostatSetPoint == 'number') {
          
    //       newTemp = payload.state.thermostatSetPoint
    //     } else {
    //       alerts.push('[' + dev.friendlyName + '] ' + 'Invalid thermostatSetPoint state, expecting payload.state.thermostatSetPoint (number)' )
    //     }
    //   }
      
    //   if (payload.state.hasOwnProperty('thermostatMode')) {
        
    //     if (typeof payload.state.thermostatMode == 'string') {
    //       newMode = payload.state.thermostatMode
    //     } else {
    //       alerts.push('[' + dev.friendlyName + '] ' + 'Invalid thermostatMode state, expecting payload.state.thermostatMode (string)' )
    //     }
    //   }
      
    //   else if (
    //     !payload.state.hasOwnProperty('thermostatMode') &&
    //     deviceJSON.attributes.hasOwnProperty('thermostatModes')
    //   ) {
    //     newMode = dev.state.thermostatMode
    //   }
      
    //   else if (!payload.state.hasOwnProperty('thermostatMode')) {
    //     newMode = 'HEAT'
    //   }

      // if (newTemp != undefined) {
      //   dev.state.thermostatSetPoint = newTemp
      // }
      // if (newMode != undefined) {
      //   dev.state.thermostatMode = newMode
      // }
    // }

    if (_.every([
      _.has(payload, 'state.temperature'),
      _.isNumber(payload.state.temperature),
    ])) 
      _.set(dev, 'state.temperature', payload.state.temperature)
      // dev.state.temperature = payload.state.temperature

    // if (payload.state.hasOwnProperty('temperature')) {
      
    //   if (typeof payload.state.temperature == 'number') {
        
    //     var storedTemperatureState = getSafe(() => dev.state.temperature)
    //     if (storedTemperatureState == payload.state.temperature) {
    //       stateUnchanged = true
    //     } else {
    //       dev.state.temperature = payload.state.temperature
    //     }
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid temperature state, expecting payload.state.temperature (number)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.volume'),
      _.isNumber(payload.state.volume),
    ])) 
      _.set(dev, 'state.volume', payload.state.volume)
      // dev.state.volume = payload.state.volume

    // if (payload.state.hasOwnProperty('volume')) {
      
    //   if (typeof payload.state.volume == 'number') {
    //     dev.state.volume = payload.state.volume
    //   } else {
    //     alerts.push('[' + dev.friendlyName + '] ' + 'Invalid volume state, expecting payload.state.volume (number)' )
    //   }
    // }

    if (_.every([
      _.has(payload, 'state.volumeDelta'),
      _.has(dev, 'state.volume'),
      _.isNumber(payload.state.volumeDelta)
    ])) 
      _.set(dev, 'state.volume', dev.state.volume + payload.state.volumeDelta)
      // dev.state.volume = dev.state.volume + payload.state.volumeDelta

    // if (payload.state.hasOwnProperty('volumeDelta')) {
      
    //   if (dev.state.hasOwnProperty('volume')) {
    //     if (typeof payload.state.volumeDelta == 'number') {
    //       var newVolume = dev.state.volume + payload.state.volumeDelta
    //       dev.state.volume = newVolume
    //     } else {
    //       alerts.push('[' + dev.friendlyName + '] ' + 'Invalid volumeDelta state, expecting payload.state.volumeDelta (number)')
    //     }
    //   }
    // }
    
    // if (alerts.length > 0) {
      
    //   return alerts
    // }
    
    // else if (stateUnchanged == true) {
    //   return true
    // }
    
    // TODO: MANCA CONTROLLO DEV DEVICE DELLO STATO.. SE eè cambiato allora lo notifico allo user service di competenza (Google e/o Alexa)

    // else {
      
      // await Devices.updateOne(
      //   { username: username, endpointId: endpointId },
      //   { $set: { state: dev.state } }
      // )
      
      const device = _.find(devices, { username, endpointId })

      if (!device)
        return;

      device.state = dev.state

      // var device = await Devices.findOne({
      //   username: username,
      //   endpointId: endpointId,
      // })
      
      // var user = await Account.findOne({ username: username })
      // const user = account.findOne({ username: username })
      
      if (_.includes(user.activeServices, 'Google'))
        sendGoogleHomeState(user, device)

      // if (user.activeServices && user.activeServices.indexOf('Google') > -1) {
      //   sendGoogleHomeState(user, device)
      // }
      
      if (_.includes(user.activeServices, 'Amazon'))
        sendAlexaState(user, device)

      // if (user.activeServices && user.activeServices.indexOf('Amazon') > -1) {
      //   sendAlexaState(user, device)
      // }
      
    //   return true
    // }
  // } catch (e) {
  
    
  //   return false
  // }
}


const sendGoogleHomeState = async (user, device) => {
  // try {
    
    if (_.some([
      !gHomeReportState,
      !_.has(device, 'displayCategories'),
      _.isEmpty(
        _.intersection(device.displayCategories, [
        // 'CONTACT_SENSOR', //TODO: da capire se ci vuole oppure no
        'INTERIOR_BLIND',
        'EXTERIOR_BLIND',
        'FAN',
        'LIGHT',
        'MOTION_SENSOR',
        'THERMOSTAT',
        'SMARTPLUG',
        'SMARTLOCK'
      ]))
    ]))
      return;

    // var enableDevTypeStateReport = false
    // var sendGoogleStateUpdate = false 
    // var hasdisplayCategories = getSafe(() => device.displayCategories)
    // if (hasdisplayCategories != undefined) {
      
    //   if (device.displayCategories.indexOf('CONTACT_SENSOR') > -1) {
    //     enableDevTypeStateReport = true
        
    //   } else if (device.displayCategories.indexOf('INTERIOR_BLIND') > -1) {
    //     enableDevTypeStateReport = true
    //     sendGoogleStateUpdate = true
    //   } else if (device.displayCategories.indexOf('EXTERIOR_BLIND') > -1) {
    //     enableDevTypeStateReport = true
    //     sendGoogleStateUpdate = true
    //   } else if (device.displayCategories.indexOf('FAN') > -1) {
    //     enableDevTypeStateReport = true
    //     sendGoogleStateUpdate = true
    //   } else if (device.displayCategories.indexOf('LIGHT') > -1) {
    //     enableDevTypeStateReport = true
    //     sendGoogleStateUpdate = true
    //   } else if (device.displayCategories.indexOf('MOTION_SENSOR') > -1) {
    //     enableDevTypeStateReport = true
    //   } else if (device.displayCategories.indexOf('THERMOSTAT') > -1) {
    //     enableDevTypeStateReport = true
    //     sendGoogleStateUpdate = true
    //   } else if (device.displayCategories.indexOf('SMARTPLUG') > -1) {
    //     enableDevTypeStateReport = true
    //     sendGoogleStateUpdate = true
    //   } else if (device.displayCategories.indexOf('SMARTLOCK') > -1) {
    //     enableDevTypeStateReport = true
    //     sendGoogleStateUpdate = true
    //   } else {
        
    //   }
    // }

    
    // if (
    //   gHomeReportState == true &&
    //   sendGoogleStateUpdate == true &&
    //   enableDevTypeStateReport == true
    // ) {
      // var response = await gHomeQueryDeviceState(device)
    const response = await gHomeQueryDeviceState(device)

    if (!response) 
      return;

      // if (response != undefined) {
        var stateReport = {
          requestId: uuidv4(),
          agentUserId: user._id,
          payload: {
            devices: {
              states: {}
            }
          }
        }
        var countProps = Object.keys(response).length 
        if (countProps >= 2) {
          stateReport.payload.devices.states[device.endpointId] = response
          delete stateReport.payload.devices.states[device.endpointId].online
          if (gToken != undefined) {
            
            gHomeSendState(gToken, stateReport, user.username)
          }
        }
      // }
    // } else {
    // }
  // } catch (e) {
  // }
}

const sendAlexaState = async (user, device) => {
  // try {
    
    var enableDevTypeStateReport = false
    var sendAlexaStateUpdate = true 
    var hasdisplayCategories = getSafe(() => device.displayCategories)
    if (hasdisplayCategories != undefined) {
      
      if (device.displayCategories.indexOf('CONTACT_SENSOR') > -1) {
        enableDevTypeStateReport = true
        
      } else if (device.displayCategories.indexOf('INTERIOR_BLIND') > -1) {
        enableDevTypeStateReport = true
        sendGoogleStateUpdate = true
      } else if (device.displayCategories.indexOf('EXTERIOR_BLIND') > -1) {
        enableDevTypeStateReport = true
        sendGoogleStateUpdate = true
      } else if (device.displayCategories.indexOf('FAN') > -1) {
        enableDevTypeStateReport = true
        sendGoogleStateUpdate = true
      } else if (device.displayCategories.indexOf('LIGHT') > -1) {
        enableDevTypeStateReport = true
        sendGoogleStateUpdate = true
      } else if (device.displayCategories.indexOf('MOTION_SENSOR') > -1) {
        enableDevTypeStateReport = true
      } else if (device.displayCategories.indexOf('THERMOSTAT') > -1) {
        enableDevTypeStateReport = true
        sendGoogleStateUpdate = true
      } else if (device.displayCategories.indexOf('SMARTPLUG') > -1) {
        enableDevTypeStateReport = true
        sendGoogleStateUpdate = true
      } else if (device.displayCategories.indexOf('SMARTLOCK') > -1) {
        enableDevTypeStateReport = true
        sendGoogleStateUpdate = true
      } else {
        
      }
    }
    if (
      alexaReportState == true &&
      sendAlexaStateUpdate == true &&
      enableDevTypeStateReport == true
    ) {
      var state = await alexaQueryDeviceState(device)
      if (state != undefined) {
        var messageId = uuidv4() 
        var changeReport = {
          event: {
            header: {
              namespace: 'Alexa',
              name: 'ChangeReport',
              payloadVersion: '3',
              messageId: messageId,
            },
            endpoint: {
              scope: {
                type: 'BearerToken',
                token: 'placeholder',
              },
              endpointId: device.endpointId,
            },
            payload: {
              change: {
                cause: {
                  type: 'APP_INTERACTION',
                },
                properties: state,
              },
            },
          },
        }
        alexaSendState(user, changeReport)
      }
    }
  // } catch (e) {

  //   return false
  // }
}


// function getSafe(fn) {
  
//   try {
//     return fn()
//   } catch (e) {
    
//     return undefined
//   }
// }

// module.exports = {
//   updateDeviceState,
// }
