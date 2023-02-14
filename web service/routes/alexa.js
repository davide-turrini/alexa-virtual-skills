

var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

// TODO: READ FROM JSON DB
// ask for username
//
// var username = require('../__models/__devices').username
// var devices = require('../__models/__devices').devices

var passport = require('passport')

const db = {
  devices: [],
  tokens: [],
  account: {
    username: null,
    password: null,
    activeServices: []
  }
}

// var mqttClient = require('../loaders/mqtt').mqttClient // TODO: MQTT?
// var ongoingCommands = require('../loaders/mqtt').ongoingCommands// TODO: MQTT?

// const defaultLimiter = require('../loaders/limiter').defaultLimiter
// const getStateLimiter = require('../loaders/limiter').getStateLimiter

// const updateUserServices = require('../services/__func-services').updateUserServices

// const queryDeviceStateAsync = require('../services/func-alexa').queryDeviceStateAsync
// const replaceCapability = require('../services/func-alexa').replaceCapabilityAsync
// const saveGrantAsync = require('../services/func-alexa').saveGrantAsync
// const validateCommandAsync = require('../services/func-alexa').validateCommandAsync
// const buildCommandResponseAsync = require('../services/func-alexa').buildCommandResponseAsync

router.get('/devices', passport.authenticate(['bearer', 'basic'], { session: false }), async (req, res) => {
    // try {
      // const devs = []
      if (!_.isEqual(req.user.username, account.username))
      // if (req.user.username != account.username)
        return res.send([])

      // const devs = []  
      // // if (req.user.username === username) {
      //   for (let device of devices) {
      //     const dev = {}
      //     dev.endpointId = '' + device.endpointId
      //     dev.friendlyName = device.friendlyName
      //     dev.description = device.description
      //     dev.displayCategories = device.displayCategories
      //     dev.capabilities = []
      //     var devAttributes = device.attributes || null
      //     for (let capability of device.capabilities) {
      //       let alexaCapability = await replaceCapability(
      //         capability,
      //         device.reportState,
      //         devAttributes,
      //         dev.displayCategories
      //       )
      //       dev.capabilities.push(alexaCapability)
      //     }
      //     if (_.includes(device.capabilities, 'RangeController'))
      //     // if (device.capabilities.indexOf('RangeController') > -1) {
      //       dev.capabilities.push({
      //         type: 'AlexaInterface',
      //         interface: 'Alexa',
      //         version: '3'
      //       })
      //     // }
      //     dev.cookie = device.cookie
      //     dev.version = '0.0.3'
      //     dev.manufacturerName = 'Node-RED'
      //     devs.push(dev)
      //   }
        
      res.send(devices.map(dev => ({
        endpointId: dev.endpointId,
        friendlyName: dev.friendlyName,
        description: dev.description,
        displayCategories: dev.displayCategories,
        capabilities: [
          ...dev.capabilities.map(capability => replaceCapability(capability, dev.reportState, dev.attributes, dev.displayCategories)),
          {
            type: 'AlexaInterface',
            interface: 'Alexa',
            version: '3'
          }
        ],
        cookie: dev.cookie,
        version: '0.0.3',
        manufacturerName: 'dt'
      })))
      // }
      // res.send(devs)
    // } catch (e) {
    //   res.status(500).send()
    // }
  }
)

router.get('/getstate/:dev_id', passport.authenticate(['bearer', 'basic'], { session: false }), async (req, res) => {
    // try {
      const id = req.params.dev_id
      
      if (!_.isEqual(req.user.username, db.account.username))
        return;

      // se utente non fa parte di gruppo amazon metto nel gruppo amazon
      if (!_.includes(db.account.activeServices, 'Amazon'))
        db.account.activeServices.push('Amazon')

      // if (
      //   !req.user.activeServices ||
      //   (req.user.activeServices &&
      //     req.user.activeServices.indexOf('Amazon')) == -1
      // ) {
        
        // updateUserServices(req.user.username, 'Amazon')
      // }

      // const username = req.user.username

      const device = _.find(devices, {
        // username: req.user.username,
        endpointId: id,
      })

      // const device = await Devices.findOne({
      //   username: req.user.username,
      //   endpointId: id,
      // })

      // if (device) var state = await queryDeviceStateAsync(device)
      
      if (!device) 
        return res.status(500).send()

      const state = await queryDeviceStateAsync(device)
      
      if (!state) 
        return res.status(500).send()

      // if (state && state != undefined) {
      //   res.status(200).json(state)
      // }
      // else {
      //   res.status(500).send()
      // }
      res.status(200).json(state)
    // } catch (e) {
    // }
  }
)

router.post('/command2', passport.authenticate('bearer', { session: false }), async (req, res) => {
  
  if (!_.isEqual(req.user.username, db.account.username))
    return;

  if (!_.includes(db.account.activeServices, 'Amazon'))
        db.account.activeServices.push('Amazon')
  
  // if (!_.includes(req.user.activeServices, 'Amazon'))
  //   updateUserServices(req.user.username, 'Amazon')

    // try {
    //   if (
    //     !req.user.activeServices ||
    //     (req.user.activeServices &&
    //       req.user.activeServices.indexOf('Amazon')) == -1
    //   ) {
    //     updateUserServices(req.user.username, 'Amazon')
    //   }
    // const username = req.user.username

    const endpointId = req.body.directive.endpoint.endpointId
    const device = _.find(db.devices, { 
      // username, 
      endpointId 
    })
      // var device = await Devices.findOne({
      //   username: req.user.username,
      //   endpointId: req.body.directive.endpoint.endpointId,
      // })

      const validation = await validateCommandAsync(device, req)

      if (_.every([
        _.isEqual(validation, 'status', false),
        _.isEqual(validation, 'response', 416)
      ]))
        return res.status(416).send()

      if (_.every([
        _.isEqual(validation, 'status', false),
        _.isEqual(validation, 'response', 417)
      ]))
        return res.status(417).send()


      // if (!_.get(validation, 'status')) {
      //   if (validation.response == 416) return res.status(416).send()
      //   else if (validation.response == 417) return res.status(417).send()
      //   else {
      //     return res.status(500).send()
      //   }
      // }

      const response = await buildCommandResponseAsync(device, req)

      if (_.isNil(response))
        return res.status(500).send()

      // if (response == undefined) return res.status(500).send()

      // const topic = 'command/' + req.user.username + '/' + req.body.directive.endpoint.endpointId

      _.unset(req, 'body.directive.header.correlationToken')
      _.unset(req, 'body.directive.endpoint.scope.token')
      // delete req.body.directive.header.correlationToken
      // delete req.body.directive.endpoint.scope.token

      // const message = JSON.stringify(req.body)      
      
      // mqttClient.publish(topic, message)
      
      const user = req.user.username
      const userId = req.user._id
      const source = 'Alexa'
      const timestamp = Date.now()
      // const command = {
      //   user,
      //   userId,
      //   res,
      //   response,
      //   source,
      //   timestamp
      // }
      
      // ongoingCommands[req.body.directive.header.messageId] = command
      ongoingCommands[req.body.directive.header.messageId] = {
        user,
        userId,
        res,
        response,
        source,
        timestamp
      }
      
    res.status(404).send()
    // } catch (e) {
    //   res.status(404).send()
    // }
  }
)

router.post('/authorization', passport.authenticate(['bearer', 'basic'], { session: false }), async (req, res) => {
    
  const payloadGrantType = _.get(req, 'body.directive.payload.grant.type')
  if (!_.isEqual(payloadGrantType, 'OAuth2.AuthorizationCode'))
    return;

  // const type = _.get(req, 'body.directive.payload.grant.type')

  // if (type != 'OAuth2.AuthorizationCode')
  //   return;

    // if (req.body.directive.payload.grant.type == 'OAuth2.AuthorizationCode') {
  const messageId = _.get(req, 'body.directive.header.messageId')
  const grantcode = _.get(req, 'body.directive.payload.grant.code')
      
      // var success = {
      //   event: {
      //     header: {
      //       namespace: 'Alexa.Authorization',
      //       name: 'AcceptGrant.Response',
      //       messageId: messageId,
      //       payloadVersion: '3',
      //     },
      //     payload: {}
      //   }
      // }
      // var failure = {
      //   event: {
      //     header: {
      //       messageId: messageId,
      //       namespace: 'Alexa.Authorization',
      //       name: 'ErrorResponse',
      //       payloadVersion: '3',
      //     },
      //     payload: {
      //       type: 'ACCEPT_GRANT_FAILED',
      //       message: 'Failed to handle the AcceptGrant directive',
      //     }
      //   }
      // }
      
    const grant = await saveGrantAsync(req.user, grantcode)

    if (!grant) {

      res.status(200).json({
        event: {
          header: {
            messageId: messageId,
            namespace: 'Alexa.Authorization',
            name: 'ErrorResponse',
            payloadVersion: '3'
          },
          payload: {
            type: 'ACCEPT_GRANT_FAILED',
            message: 'Failed to handle the AcceptGrant directive'
          }
        }
      }) //failure

      return;
    }
        
    res.status(200).json({
      event: {
        header: {
          namespace: 'Alexa.Authorization',
          name: 'AcceptGrant.Response',
          messageId: messageId,
          payloadVersion: '3'
        },
        payload: {}
      }
    }) //sucess
        
    //   } else {

        
    //   }
    // }
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