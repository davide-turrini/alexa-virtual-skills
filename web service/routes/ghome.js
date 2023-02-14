var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

// var Account = require('../__models/__account')
// var oauthModels = require('../__models/__oauth')
// var Devices = require('../__models/__devices')
var passport = require('passport')

// var mqttClient = require('../loaders/mqtt').mqttClient
// var ongoingCommands = require('../loaders/mqtt').ongoingCommands

// const gHomeFunc = require('../services/func-ghome')
// const gHomeReplaceCapability = require('../services/func-ghome').gHomeReplaceCapability
// const gHomeReplaceType = require('../services/func-ghome').gHomeReplaceType
// const validateCommandAsync = require('../services/func-ghome').validateCommandAsync
// const servicesFunc = require('../services/__func-services')

// const defaultLimiter = require('../loaders/limiter').defaultLimiter

// const queryDeviceStateAsync = gHomeFunc.queryDeviceStateAsync
// const updateUserServices = servicesFunc.updateUserServices
// const removeUserServices = servicesFunc.removeUserServices

router.post('/action', passport.authenticate('bearer', { session: false }), async (req, res) => {
    
    var intent = req.body.inputs[0].intent
    var requestId = req.body.requestId
    var serviceName = 'Google' 

    if (
      !req.user.activeServices ||
      (req.user.activeServices &&
        req.user.activeServices.indexOf(serviceName)) == -1
    ) {
      updateUserServices(req.user.username, serviceName)
    }
    
    switch (intent) {
      case 'action.devices.SYNC':
        try {

          var user = await Account.find({ username: req.user.username })
          
          var devices = await Devices.find({ username: req.user.username })
          
          var devs = []
          
          for (let device of devices) {
            var deviceJSON = JSON.parse(JSON.stringify(device))
            
            var dev = {}
            dev.id = '' + device.endpointId
            dev.type = await gHomeReplaceType(device.displayCategories)
            dev.traits = []
            
            if (dev.type != 'NA') {
              
              for (let capability of device.capabilities) {
                var trait = await gHomeReplaceCapability(capability, dev.type)
                
                if (
                  trait != 'Not Supported' &&
                  dev.traits.indexOf(trait) == -1
                ) {
                  dev.traits.push(trait)
                }
              }
            }

            dev.name = {
              name: device.friendlyName,
            }

            dev.willReportState = device.reportState
            var hasAttributes = 'attributes' in deviceJSON
            if (hasAttributes == true) {
              dev.attributes = device.attributes
            } else {
              dev.attributes = {}
            }
            
            if (deviceJSON.hasOwnProperty('attributes')) {
              if (deviceJSON.attributes.hasOwnProperty('roomHint')) {
                delete dev.attributes.roomHint
                if (deviceJSON.attributes.roomHint != '') {
                  dev.roomHint = deviceJSON.attributes.roomHint
                }
              }
            }
            
            if (device.capabilities.indexOf('ColorController') > -1) {
              dev.attributes.colorModel = 'hsv'
              delete dev.attributes.commandOnlyColorSetting 
            }
            
            if ( device.capabilities.indexOf('ColorTemperatureController') > -1 ) {
              dev.attributes.colorTemperatureRange.temperatureMinK = parseInt( dev.attributes.colorTemperatureRange.temperatureMinK )
              dev.attributes.colorTemperatureRange.temperatureMaxK = parseInt( dev.attributes.colorTemperatureRange.temperatureMaxK )
            }
            
            if (
              device.capabilities.indexOf('RangeController') > -1 &&
              (dev.type.indexOf('action.devices.types.FAN') > -1 || dev.type.indexOf('action.devices.types.THERMOSTAT') > -1)
            ) {
              
              dev.attributes.availableFanSpeeds = {
                availableFanSpeeds: {
                  speeds: [ 
                    {
                      speed_name: 'S1',
                      speed_values: [ { speed_synonym: ['low', 'speed 1'], lang: 'en' } ]
                    }, {
                      speed_name: 'S2',
                      speed_values: [ { speed_synonym: ['speed 2'], lang: 'en' } ]
                    }, {
                      speed_name: 'S3',
                      speed_values: [ { speed_synonym: ['speed 3'], lang: 'en' } ]
                    }, {
                      speed_name: 'S4',
                      speed_values: [ { speed_synonym: ['speed 4'], lang: 'en' } ]
                    }, {
                      speed_name: 'S5',
                      speed_values: [ { speed_synonym: ['medium', 'speed 5'], lang: 'en' } ]
                    }, {
                      speed_name: 'S6',
                      speed_values: [ { speed_synonym: ['speed 6'], lang: 'en' } ]
                    }, {
                      speed_name: 'S7',
                      speed_values: [ { speed_synonym: ['speed 7'], lang: 'en' } ]
                    }, {
                      speed_name: 'S8',
                      speed_values: [ { speed_synonym: ['speed 8'], lang: 'en' } ]
                    }, {
                      speed_name: 'S9',
                      speed_values: [ { speed_synonym: ['speed 9'], lang: 'en' } ]
                    }, {
                      speed_name: 'S10',
                      speed_values: [ { speed_synonym: ['high', 'maximum', 'speed 10'], lang: 'en' } ]
                    } 
                  ],
                  ordered: true,
                },
                reversible: false
              }
            }
            
            if ( dev.traits.indexOf('action.devices.traits.TemperatureSetting') > -1 ) {
              dev.attributes.availableThermostatModes = dev.attributes.thermostatModes.join().toLowerCase() 
              dev.attributes.thermostatTemperatureUnit = dev.attributes.temperatureScale.substring(0, 1) 
              delete dev.attributes.temperatureRange
              delete dev.attributes.temperatureScale
              delete dev.attributes.thermostatModes
            }
            dev.deviceInfo = {
              manufacturer: 'Node-RED',
              model: 'Node-RED',
              hwVersion: '0.1',
              swVersion: '0.1',
            }
            
            if (dev.traits.length > 0 && dev.type != 'NA') {
              devs.push(dev)
            }
          }
          
          var response = {
            requestId: requestId,
            payload: {
              agentUserId: user[0]._id,
              devices: devs
            }
          }
          
          res.status(200).json(response)
        } catch (e) {
          res.status(500).json({ message: 'An error occurred.' })
        }
        break
      
      
      
      case 'action.devices.EXECUTE':
        try {
          
          
          var devices = await Devices.find({ username: req.user.username })
          
          var arrCommands = req.body.inputs[0].payload.commands
          
          for (let command of arrCommands) {
            
            
            var params = command.execution[0].params
            
            for (let commandDevice of command.devices) {
              
              var dbDevice = devices.find(
                (obj) => obj.endpointId == commandDevice.id
              )
              if (dbDevice == undefined) {
              } else {
              }
              
              var validation = await validateCommandAsync( command, commandDevice, dbDevice, req)
              
              if (validation.status == false) {
                if (validation.response != undefined)
                  return res.status(200).json(validation.response)
                else {
                  return res.status(500).send()
                }
              }
              
              var topic = 'command/' + req.user.username + '/' + commandDevice.id
              
              var message = JSON.stringify({
                requestId: requestId,
                id: commandDevice.id,
                execution: command,
              })
              
              mqttClient.publish(topic, message)
              
              var response = {
                requestId: requestId,
                payload: {
                  commands: [
                    {
                      ids: [commandDevice.id],
                      status: 'SUCCESS',
                      state: params
                    }
                  ]
                }
              }
              
              var commandTracker = {
                user: req.user.username,
                userId: req.user._id,
                requestId: requestId,
                res: res,
                response: response,
                source: 'Google',
                devices: [],
                acknowledged: false,
                timestamp: Date.now()
              }
              
              for (let device of command.devices) {
                if (device.id != undefined && device.id != commandDevice.id) {
                  commandTracker.devices.push(device.id)
                }
              }
              
              ongoingCommands[requestId + commandDevice.id] = commandTracker
              
            }
          }
        } catch (e) {
          res.status(500).json({ message: 'An error occurred.' })
        }
        break
      
      case 'action.devices.QUERY':
        try {
          var user = await Account.find({ username: req.user.username })
          var devices = await Devices.find({ username: req.user.username })
          var arrQueryDevices = req.body.inputs[0].payload.devices
          
          var response = {
            requestId: requestId,
            payload: {
              devices: {}
            }
          }
          
          await Promise.all(
            arrQueryDevices.map(async (dev) => {
              
              var data = devices.find((obj) => obj.endpointId == dev.id)
              
              if (data) {
                var state = await queryDeviceStateAsync(data)
                if (state != undefined) {
                  response.payload.devices[data.endpointId] = state
                }
              }
            })
          )

          res.status(200).json(response)
        } catch (e) {
          res.status(500).json({ message: 'An error occurred.' })
        }
        break
      
      case 'action.devices.DISCONNECT':
        try {
          var userId = req.user._id

          var appGHome = await oauthModels.Application.findOne({
            domains: 'oauth-redirect.googleusercontent.com',
          })
          
          await oauthModels.GrantCode.deleteMany({
            user: userId,
            application: appGHome._id
          })
          await oauthModels.AccessToken.deleteMany({
            user: userId,
            application: appGHome._id
          })
          await oauthModels.RefreshToken.deleteMany({
            user: userId,
            application: appGHome._id
          })
          
          res.status(200).send()
          
          removeUserServices(req.user.username, 'Google')
        } catch (e) {
          res.status(500).json({ error: err })
        }
        break
    }
  }
)

// function getSafe(fn) {
//   try {
//     return fn()
//   } catch (e) {
//     return undefined
//   }
// }

// module.exports = router
