const axios = require('axios')
// const querystring = require('querystring')
// var AlexaAuth = require('../__models/__alexa-auth')
// const removeUserServices = require('./__func-services').removeUserServices
var _ = require('lodash');
// const { db } = require('../__models/__account');


var enableAlexaAuthorization = false
if (process.env.ALEXA_CLIENTID || process.env.ALEXA_CLIENTSECRET) {
  var client_id = process.env.ALEXA_CLIENTID
  var client_secret = process.env.ALEXA_CLIENTSECRET
  enableAlexaAuthorization = true
}

const saveGrant = async (user, grantCode) => {
// const saveGrantAsync = async (user, grantCode) => {
  // try {
    // await AlexaAuth.AlexaAuthGrantCode.deleteMany({ user: user })
    // await AlexaAuth.AlexaAuthRefreshToken.deleteMany({ user: user })
    // await AlexaAuth.AlexaAuthAccessToken.deleteMany({ user: user })

    const newGrant = {
      user: user,
      code: grantCode,
    }

    db.data.alexaAuth.grantCodes = [newGrant]
    db.data.alexaAuth.refreshTokens = []
    db.data.alexaAuth.accessTokens = []
    db.save()

    // var newGrant = new AlexaAuth.AlexaAuthGrantCode({
    //   user: user,
    //   code: grantCode,
    // })
    // await newGrant.save()

    return newGrant
  // } catch (e) {
    
  //   return undefined
  // }
}

const requestAccessTokenAsync = async (user) => {
  // try {
    // if (enableAlexaAuthorization == true) {
      if (!enableAlexaAuthorization) 
        return;
      
      const now = new Date().getTime() + 1000 * 5 // TODO: capire cosa fa sta cosa? 
      
      // var grant = await AlexaAuth.AlexaAuthGrantCode.findOne({ user: user })
      const grant = _.find(db.data.alexaAuth.grantCodes, { user })
      
      // var refresh = await AlexaAuth.AlexaAuthRefreshToken.findOne({ user: user })
      const refresh = _.find(db.data.alexaAuth.refreshTokens, { user })
      
      // var access = await AlexaAuth.AlexaAuthAccessToken.findOne({ user: user, expires: { $gt: now } })
      const access = _.find(db.data.alexaAuth.accessTokens, at => _.every([ _.isEqual(at.user, user), _.gt(at.expires, now) ]))
      
      // var hasGrantCode = !!grant.code
      // var hasRefreshToken = !!refresh.token
      // var hasAccessToken = !!access.token
      
      if (_.every[
        !_.isNil(grant),
        !_.isNil(refresh),
        !_.isNil(access)
      ]) 
        return access

      // if (
      //   grant.code &&  // hasGrantCode != undefined &&
      //   refresh.token && // hasRefreshToken != undefined &&
      //   access.token //hasAccessToken != undefined
      // ) {
      //   return access
      // }

      if (_.every[
        !_.isNil(grant),
        !_.isNil(refresh),
        _.isNil(access)
      ]) {

      // else if (
      //   hasGrantCode != undefined &&
      //   hasRefreshToken != undefined &&
      //   hasAccessToken == undefined
      // ) {
        
        // var formData = {
        //   grant_type: 'refresh_token',
        //   refresh_token: refresh.token,
        //   client_id: client_id,
        //   client_secret: client_secret,
        // }
        
        const response = await axios({
          method: 'post',
          url: 'https://api.amazon.com/auth/o2/token',
          data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh.token,
            client_id: client_id,
            client_secret: client_secret
          }// formData
          ),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        })
      
        const today = new Date()
        const expires = today.getTime() + response.data.expires_in * 1000
        
        const accessToken = {
          token: response.data.access_token,
          user: user,
          grant: grant,
          expires: expires
        }

        // await accessToken.save()

        db.data.alexaAuth.accessTokens.push(accessToken)
        db.save()

        return accessToken
      } 
      
      if (_.every[
        !_.isNil(grant),
        _.isNil(refresh),
        _.isNil(access)
      ]) {

      // else if (
      //   hasGrantCode != undefined &&
      //   hasRefreshToken == undefined &&
      //   hasAccessToken == undefined
      // ) {
        
        // var formData = {
        //   grant_type: 'authorization_code',
        //   code: grant.code,
        //   client_id: client_id,
        //   client_secret: client_secret,
        // }
        var response = await axios({
          method: 'post',
          url: 'https://api.amazon.com/auth/o2/token',
          data: querystring.stringify({
            grant_type: 'authorization_code',
            code: grant.code,
            client_id: client_id,
            client_secret: client_secret,
          }
          // formData
          ),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        
        var today = new Date()
        var expires = today.getTime() + response.data.expires_in * 1000
        
        var refreshToken = {
          token: response.data.refresh_token,
          user
        }
        
        var accessToken = {
          token: response.data.access_token,
          user,
          grant: grant,
          expires: expires
        }

        db.data.alexaAuth.refreshTokens.push(refreshToken)
        db.data.alexaAuth.accessTokens.push(accessToken)
        db.save()

        // await refreshToken.save()
        // await accessToken.save()

        return accessToken
      }

      return;
      
      // else if (hasGrantCode == undefined) {

      //   return undefined
      // }
    // } else {
    //   return undefined
    // }
  // } catch (e) {
  //   return undefined
  // }
}


// const queryDeviceStateAsync = async (device) => {
const queryDeviceState = async (device) => {
  // try {
    
    // var deviceJSON = JSON.parse(JSON.stringify(device))
    const deviceJSON = _.cloneDeep(device)
    
    // if (
    //   deviceJSON &&
    //   deviceJSON.hasOwnProperty('reportState') &&
    //   deviceJSON.reportState == true
    // ) {

    if (!_.has(deviceJSON, 'reportState'))
      return;
    
    if (!_.get(deviceJSON, 'reportState'))

      return [{
        namespace: 'Alexa.EndpointHealth',
        name: 'connectivity',
        value: {
          value: 'OK',
        },
        timeOfSample: deviceJSON.state.time,
        uncertaintyInMilliseconds: 1000,
      }]  

    // if (_.get(deviceJSON, 'reportState')) {
      
      // if (deviceJSON.hasOwnProperty('state')) {
      
    if (!_.has(deviceJSON, 'state'))
      return;

    // if (_.has(deviceJSON, 'state')) {
      
      // var properties =

    return _.flatten([
      {
        namespace: 'Alexa.EndpointHealth',
        name: 'connectivity',
        value: {
          value: 'OK',
        },
        timeOfSample: deviceJSON.state.time,
        uncertaintyInMilliseconds: 1000,
      },
      ...deviceJSON.capabilities.map(capability => {
        // switch (capability) {
        //   case 'BrightnessController':
        if (_.every([
          _.isEqual(capability, 'BrightnessController'),
          // capability === 'BrightnessController',
          _.has(deviceJSON, 'state.brightness'),
          _.has(deviceJSON, 'state.time')
        ]))

          return {
            namespace: 'Alexa.BrightnessController',
            name: 'brightness',
            value: deviceJSON.state.brightness,
            timeOfSample: deviceJSON.state.time,
            uncertaintyInMilliseconds: 1000,
          }
        
        if (_.isEqual(capability, 'BrightnessController'))
          // capability === 'ChannelController') 
          return []
          //   // break
          // case 'ChannelController':
            
          //   break
          // case 'ColorController':
            
        if (_.every([
          _.isEqual(capability, 'ColorController'),
          // capability === 'ColorController',
          _.has(deviceJSON, 'state.colorHue'),
          _.has(deviceJSON, 'state.colorSaturation'),
          _.has(deviceJSON, 'state.colorBrightness'),
          _.has(deviceJSON, 'state.time')
        ]))
          
        // ) {
          return {
            namespace: 'Alexa.ColorController',
            name: 'color',
            value: {
              hue: deviceJSON.state.colorHue,
              saturation: deviceJSON.state.colorSaturation,
              brightness: deviceJSON.state.colorBrightness,
            },
            timeOfSample: deviceJSON.state.time,
            uncertaintyInMilliseconds: 1000,
          }
            // }
            // break
          // case 'ContactSensor':
            
        if (_.every([
          _.isEqual(capability, 'ContactSensor'),
          // capability === 'ContactSensor',
          _.has(deviceJSON, 'state.contact'),
          _.has(deviceJSON, 'state.time')
        ]))
          
        // ) {
          return {
            namespace: 'Alexa.ContactSensor',
            name: 'detectionState',
            value: deviceJSON.state.contact,
            timeOfSample: deviceJSON.state.time,
            uncertaintyInMilliseconds: 1000,
          }
            // }
            // break
          // case 'ColorTemperatureController':
            
        if (_.every([
          _.isEqual(capability, 'ColorTemperatureController'),
          // capability === 'ColorTemperatureController',
          _.has(deviceJSON, 'state.colorTemperature'),
          _.has(deviceJSON, 'state.time')
        ]))
          
        // ) {
          return {
            namespace: 'Alexa.ColorTemperatureController',
            name: 'colorTemperatureInKelvin',
            value: deviceJSON.state.colorTemperature,
            timeOfSample: deviceJSON.state.time,
            uncertaintyInMilliseconds: 1000,
          }

          //   }
          //   break
          // case 'InputController':

        if (_.every([
          _.isEqual(capability, 'InputController'),
          // capability === 'InputController',
          _.has(deviceJSON, 'state.input'),
          _.has(deviceJSON, 'state.time')
        ]))
          
            // ) {
          return {
            namespace: 'Alexa.InputController',
            name: 'input',
            value: deviceJSON.state.input,
            timeOfSample: deviceJSON.state.time,
            uncertaintyInMilliseconds: 1000,
          }
          //   }
          //   break
          // case 'LockController':

        if (_.every([
          _.isEqual(capability, 'LockController'),
          // capability === 'LockController',
          _.has(deviceJSON, 'state.lock'),
          _.has(deviceJSON, 'state.time')
        ]))
            
            // ) {
          return {
            namespace: 'Alexa.LockController',
            name: 'lockState',
            value: deviceJSON.state.lock,
            timeOfSample: deviceJSON.state.time,
            uncertaintyInMilliseconds: 1000,
          }
          //   }
          //   break
          // case 'MotionSensor':

        if (_.every([
          _.isEqual(capability, 'MotionSensor'),
          // capability === 'MotionSensor',
          _.has(deviceJSON, 'state.motion'),
          _.has(deviceJSON, 'state.time')
        ]))
            
            // ) {
          return {
            namespace: 'Alexa.MotionSensor',
            name: 'detectionState',
            value: deviceJSON.state.motion,
            timeOfSample: deviceJSON.state.time,
            uncertaintyInMilliseconds: 1000,
          }
          //   }
          //   break
          // case 'PlaybackController':
        if (_.isEqual(capability, 'PlaybackController'))
          // capability === 'PlaybackController') 
          return []
            
          //   break
          // case 'PercentageController':
            
          if (_.every([
            _.isEqual(capability, 'PercentageController'),
            // capability === 'PercentageController',
            _.has(deviceJSON, 'state.percentage'),
            _.has(deviceJSON, 'state.time')
          ]))
            // if (
            //   deviceJSON.state.hasOwnProperty('percentage') &&
            //   deviceJSON.state.hasOwnProperty('time')
            // ) {
            return {
              namespace: 'Alexa.PercentageController',
              name: 'percentage',
              value: deviceJSON.state.percentage,
              timeOfSample: deviceJSON.state.time,
              uncertaintyInMilliseconds: 1000,
            }
          //   }
          //   break
          // case 'PowerController':
          if (_.every([
            _.isEqual(capability, 'PowerController'),
            // capability === 'PowerController',
            _.has(deviceJSON, 'state.power'),
            _.has(deviceJSON, 'state.time')
          ]))
            
            // if (
            //   deviceJSON.state.hasOwnProperty('power') &&
            //   deviceJSON.state.hasOwnProperty('time')
            // ) {
            return {
              namespace: 'Alexa.PowerController',
              name: 'powerState',
              value: deviceJSON.state.power,
              timeOfSample: deviceJSON.state.time,
              uncertaintyInMilliseconds: 1000,
            }
          //   }
          //   break
          // case 'RangeController':
          if (_.every([
            _.isEqual(capability, 'RangeController'),
            // capability === 'RangeController',
            _.has(deviceJSON, 'state.rangeValue'),
            _.has(deviceJSON, 'state.time'),
            (_.includes(deviceJSON.displayCategories, 'INTERIOR_BLIND') || 
              _.includes(deviceJSON.displayCategories, 'EXTERIOR_BLIND'))
          ]))
            
            // if (
            //   deviceJSON.state.hasOwnProperty('rangeValue') &&
            //   deviceJSON.state.hasOwnProperty('time') &&
            //   (deviceJSON.displayCategories.indexOf('INTERIOR_BLIND') > -1 ||
            //     deviceJSON.displayCategories.indexOf('EXTERIOR_BLIND') > -1)
            // ) {
            return {
              namespace: 'Alexa.RangeController',
              instance: 'Blind.Lift',
              name: 'rangeValue',
              value: deviceJSON.state.rangeValue,
              timeOfSample: deviceJSON.state.time,
              uncertaintyInMilliseconds: 1000,
            }
            // }
            
            // else if (
            //   deviceJSON.state.hasOwnProperty('rangeValue') &&
            //   deviceJSON.state.hasOwnProperty('time')
            // ) {

          if (_.every([
              _.isEqual(capability, 'RangeController'),
              // capability === 'RangeController',
              _.has(deviceJSON, 'state.rangeValue'),
              _.has(deviceJSON, 'state.time')
            ]))
            return {
              namespace: 'Alexa.RangeController',
              instance: 'NodeRed.Fan.Speed',
              name: 'rangeValue ',
              value: deviceJSON.state.rangeValue,
              timeOfSample: deviceJSON.state.time,
              uncertaintyInMilliseconds: 1000
            }

          //   }
          //   break

          // case 'TemperatureSensor':
            
          if (_.every([
            _.isEqual(capability, 'TemperatureSensor'),
            // capability === 'TemperatureSensor',
            _.has(deviceJSON, 'state.temperature'),
            _.has(deviceJSON, 'state.time')
          ]))

            // if (
            //   deviceJSON.state.hasOwnProperty('temperature') &&
            //   deviceJSON.state.hasOwnProperty('time')
            // ) {
            return {
              namespace: 'Alexa.TemperatureSensor',
              name: 'temperature',
              value: {
                value: deviceJSON.state.temperature,
                scale: deviceJSON.attributes.temperatureScale.toUpperCase(),
              },
              timeOfSample: deviceJSON.state.time,
              uncertaintyInMilliseconds: 1000
            }

          //   }
          //   break
          // case 'ThermostatController':
            
          if (_.every([
            _.isEqual(capability, 'BrightnessController'),
            // capability === 'ThermostatController',
            _.has(deviceJSON, 'state.thermostatSetPoint'),
            _.has(deviceJSON, 'state.thermostatMode'),
            _.has(deviceJSON, 'state.time')
          ]))

            // if (
            //   deviceJSON.state.hasOwnProperty('thermostatSetPoint') &&
            //   deviceJSON.state.hasOwnProperty('thermostatMode') &&
            //   deviceJSON.state.hasOwnProperty('time')
            // ) {
            return [{
                namespace: 'Alexa.ThermostatController',
                name: 'targetSetpoint',
                value: {
                  value: deviceJSON.state.thermostatSetPoint,
                  scale: deviceJSON.attributes.temperatureScale.toUpperCase(),
                },
                timeOfSample: deviceJSON.state.time,
                uncertaintyInMilliseconds: 1000,
              }, {
                namespace: 'Alexa.ThermostatController',
                name: 'thermostatMode',
                value: deviceJSON.state.thermostatMode,
                timeOfSample: deviceJSON.state.time,
                uncertaintyInMilliseconds: 1000,
              }]

            // }
            // break
        // }
        return []
      })])
      
      // return properties
      // } 
      // else {
      //   return undefined
      // }
    // }
    //  else if (
    //   deviceJSON &&
    //   deviceJSON.hasOwnProperty('reportState') &&
    //   deviceJSON.reportState == false
    // ) {
      // var properties = []
      
      // properties.push({
      //   namespace: 'Alexa.EndpointHealth',
      //   name: 'connectivity',
      //   value: {
      //     value: 'OK',
      //   },
      //   timeOfSample: deviceJSON.state.time,
      //   uncertaintyInMilliseconds: 1000,
      // })
      
      // return properties
    // }
    //  else {
    //   return undefined
    // }
  // } catch (e) {

  //   return undefined
  // }
}

const sendStateAsync = async (user, state) => {
  // try {
    
    var stateURI = {
      'Europe': 'https://api.eu.amazonalexa.com/v3/events',
      'Americas': 'https://api.amazonalexa.com/v3/events',
      'Asia': 'https://api.fe.amazonalexa.com/v3/events',
      'Oceania': 'https://api.fe.amazonalexa.com/v3/events',
    }[user.region] || ''

    // switch (user.region) {
    //   case 'Europe': 
    //     stateURI = 'https://api.eu.amazonalexa.com/v3/events';
    //     break
    //   case 'Americas': 
    //     stateURI = 'https://api.amazonalexa.com/v3/events';
    //     break
    //   case 'Asia': 
    //     stateURI = 'https://api.fe.amazonalexa.com/v3/events';
    //     break
    //   case 'Oceania': 
    //     stateURI = 'https://api.fe.amazonalexa.com/v3/events';
    //     break
    // }
    
    var accessToken = await requestAccessTokenAsync(user)
    
    // if (accessToken == undefined) return false
    if (!accessToken) 
      return false
    
    state.event.endpoint.scope.token = accessToken.token
    
    try {
      await axios({
        method: 'post',
        url: stateURI,
        data: state,
        headers: {
          Authorization: 'Bearer ' + accessToken.token,
          'Content-Type': 'application/json',
        }
      })
    } catch (e) {
      
      // if (e.response && e.response.data && e.response.status) {
      //   if (e.response.status == 403) removeUserServices(user.username, 'Amazon')
      // }

      if (_.every([
        _.has(e, 'response.data'),
        _.get(e, 'response.status' === 403)
        // e.response.status === 403
      ]))
        // removeUserServices(user.username, 'Amazon')  
        _.remove(db.account.activeServices, 'Amazon')
    }
}

const validateCommandAsync = async (device, req) => {
  // try {
    // var deviceJSON = JSON.parse(JSON.stringify(device))  
    const deviceJSON = _.cloneDeep(device)
    
    const name = req.body.directive.header.name
    // var name = req.body.directive.header.name
    
    const namespace = req.body.directive.header.namespace
    // var namespace = req.body.directive.header.namespace
    
    if (_.every([
      _.isEqual(namespace, 'Alexa.ColorTemperatureController'),
      _.isEqual(name, 'SetColorTemperature')
    ])) {
    // if (
    //   namespace == 'Alexa.ColorTemperatureController' &&
    //   name == 'SetColorTemperature'
    // ) {

      var compare = req.body.directive.payload.colorTemperatureInKelvin

      // var hasColorTemperatureRange = getSafe(() => deviceJSON.attributes.colorTemperatureRange)
      // if (hasColorTemperatureRange != undefined) {
        
      if (!_.has(deviceJSON, 'attributes.colorTemperatureRange')) 
        return { status: true }
      
      if (_.some([
        compare < deviceJSON.attributes.colorTemperatureRange.temperatureMinK,
        compare > deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
      ]))
        return { status: false, response: 417 }
    
        // return { status: true }

      //   if (
      //     compare < deviceJSON.attributes.colorTemperatureRange.temperatureMinK ||
      //     compare > deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
      //   ) {
      //     return { status: false, response: 417 }
      //   } else {
      //     return { status: true }
      //   }
      // } else {

      //   return { status: true }
      // }
    }

    if (_.every([
      _.isEqual(namespace, 'Alexa.ThermostatController'),
      _.isEqual(name, 'SetTargetTemperature')
    ])) {
    
    // else if (
    //   req.body.directive.header.namespace == 'Alexa.ThermostatController' &&
    //   req.body.directive.header.name == 'SetTargetTemperature'
    // ) {

      var compare = req.body.directive.payload.targetSetpoint.value

      if (!_.has(deviceJSON, 'attributes.temperatureRange')) 
        return { status: true }
      
      if (_.some([
        compare < deviceJSON.attributes.temperatureRange.temperatureMin,
        compare > deviceJSON.attributes.temperatureRange.temperatureMax
      ]))
        return { status: false, response: 416 }
      
      // var hasTemperatureRange = getSafe(() => deviceJSON.attributes.temperatureRange)
      // if (hasTemperatureRange != undefined) {
        // if (
        //   compare < deviceJSON.attributes.temperatureRange.temperatureMin ||
        //   compare > deviceJSON.attributes.temperatureRange.temperatureMax
        // ) {
        //   return { status: false, response: 416 }
        // } else {
        //   return { status: true }
        // }
      // } else {

      //   return { status: true }
      // }
    }

    // else {
    //   return { status: true }
    // }
  // } catch (e) {

  //   return { status: false, response: undefined }
  // }
  return { status: true }
}
const buildCommandResponseAsync = async (device, req) => {
  // try {
    // var deviceJSON = JSON.parse(JSON.stringify(device))
    var deviceJSON = _.cloneDeep(device)

    var endpointId = req.body.directive.endpoint.endpointId
    var messageId = req.body.directive.header.messageId
    var oauth_id = req.body.directive.endpoint.scope.token
    var correlationToken = req.body.directive.header.correlationToken
    
    var dt = new Date()
    const name = req.body.directive.header.name
    const namespace = req.body.directive.header.namespace

    //TODO properties

    var context = {
      properties: [],
    }

    var event = {
      header: {
        namespace: 'Alexa',
        name: 'Response',
        payloadVersion: '3',
        messageId: messageId + '-R',
        correlationToken: correlationToken,
      },
      endpoint = {
        scope: {
          type: 'BearerToken',
          token: oauth_id,
        },
        endpointId: endpointId,
      },
      payload: {}
    }
    
    if (_.every([
      _.isEqual(namespace, 'Alexa.BrightnessController'),
      _.isEqual(name, 'AdjustBrightness')
    ]))
    
    // if (namespace == 'Alexa.BrightnessController' &&
    //     (name == 'AdjustBrightness' || name == 'SetBrightness')
    // ) {
    //   if (name == 'AdjustBrightness') {
        
      // var brightness = 
        

      // if (req.body.directive.payload.brightnessDelta < 0) {
      //   brightness = req.body.directive.payload.brightnessDelta + 100
      // } else {
      //   brightness = req.body.directive.payload.brightnessDelta
      // }
        
        // var contextResult = {
        return {
          contextOverride: {
            properties: [
              {
                namespace: 'Alexa.BrightnessController',
                name: 'brightness',
                value: (req.body.directive.payload.brightnessDelta < 0)
                ? req.body.directive.payload.brightnessDelta + 100
                : req.body.directive.payload.brightnessDelta,
                timeOfSample: dt.toISOString(),
                uncertaintyInMilliseconds: 50
              }
            ]
          }
        }
      // }

      if (_.every([
        _.isEqual(namespace, 'Alexa.BrightnessController'),
        _.isEqual(name, 'SetBrightness')
      ]))

      // if (name == 'SetBrightness') {
        
        // var contextResult = {
        return {
          contextOverride: {
            properties: [
              {
                namespace: 'Alexa.BrightnessController',
                name: 'brightness',
                value: req.body.directive.payload.brightness,
                timeOfSample: dt.toISOString(),
                uncertaintyInMilliseconds: 50
              }
            ]
          }
        }
      // }
    // }

    if (_.every([
      _.isEqual(namespace, 'Alexa.ChannelController'),
      _.isEqual(name, 'ChangeChannel'),
      _.has(req.body.directive.payload.channel, 'number')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.ChannelController',
              name: 'channel',
              value: {
                number: req.body.directive.payload.channel.number
              },
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }
    
    // else if (namespace == 'Alexa.ChannelController') {
      // if (name == 'ChangeChannel') {

        // if (req.body.directive.payload.channel.hasOwnProperty('number')) {
        
          // var contextResult = {
        //   return {
        //     properties: [
        //       {
        //         namespace: 'Alexa.ChannelController',
        //         name: 'channel',
        //         value: {
        //           number: req.body.directive.payload.channel.number,
        //         },
        //         timeOfSample: dt.toISOString(),
        //         uncertaintyInMilliseconds: 50,
        //       },
        //     ],
        //   }
        // } else if (
        //   req.body.directive.payload.channel.hasOwnProperty('callSign')
        // ) {
        //   var contextResult = {

    if (_.every([
      _.isEqual(namespace, 'Alexa.ChannelController'),
      _.isEqual(name, 'ChangeChannel'),
      _.has(req.body.directive.payload.channel, 'callSign')
    ])) 

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.ChannelController',
              name: 'channel',
              value: {
                callSign: req.body.directive.payload.channel.callSign
              },
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }
        // }
      // }

    // } else if (namespace == 'Alexa.ColorController') {
    if(_.isEqual(namespace, 'Alexa.ColorController'))

      // var contextResult = {
      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.ColorController',
              name: 'color',
              value: {
                hue: req.body.directive.payload.color.hue,
                saturation: req.body.directive.payload.color.saturation,
                brightness: req.body.directive.payload.color.brightness,
              },
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }

    if (_.every([
      _.isEqual(namespace, 'Alexa.ColorTemperatureController'),
      !_.has(deviceJSON.state, 'colorTemperature')
    ])) 

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.ColorTemperatureController',
              name: 'colorTemperatureInKelvin',
              value: _.mean([
                deviceJSON.attributes.colorTemperatureRange.temperatureMinK,
                deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
              ]),
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }
    
    if (_.every([
      _.isEqual(namespace, 'Alexa.ColorTemperatureController'),
      _.isEqual(name, 'IncreaseColorTemperature')
    ]))   

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.ColorTemperatureController',
              name: 'colorTemperatureInKelvin',
              value: _.min([
                deviceJSON.state.colorTemperature + 500,
                deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
              ]),
              // deviceJSON.state.colorTemperature + 500 > deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
              //   ? deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
              //   : deviceJSON.state.colorTemperature + 500,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }

    if (_.every([
      _.isEqual(namespace, 'Alexa.ColorTemperatureController'),
      _.isEqual(name, 'DecreaseColorTemperature')
    ]))   

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.ColorTemperatureController',
              name: 'colorTemperatureInKelvin',
              value: _.max([
                deviceJSON.state.colorTemperature - 500,
                deviceJSON.attributes.colorTemperatureRange.temperatureMinK
              ]),
              // deviceJSON.state.colorTemperature - 500 < deviceJSON.attributes.colorTemperatureRange.temperatureMinK
              //   ? deviceJSON.attributes.colorTemperatureRange.temperatureMinK
              //   : deviceJSON.state.colorTemperature - 500,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }

    if (_.every([
      _.isEqual(namespace, 'Alexa.ColorTemperatureController'),
      _.isEqual(name, 'SetColorTemperature')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.ColorTemperatureController',
              name: 'colorTemperatureInKelvin',
              value: (typeof req.body.directive.payload.colorTemperatureInKelvin != 'number') 
              ? {
                  'warm': 2200,
                  'warm white': 2200,
                  'incandescent': 2700,
                  'soft white': 2700,
                  'white': 4000,
                  'daylight': 5500,
                  'daylight white': 5500,
                  'cool': 7000,
                  'cool white': 7000
                }[req.body.directive.payload.colorTemperatureInKelvin] || 4000
              : req.body.directive.payload.colorTemperatureInKelvin,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }
      
      // var strPayload = req.body.directive.payload.colorTemperatureInKelvin

      // colorTemp = 
      
      // if (typeof strPayload != 'number') {
      //   colorTemp = {
      //     'warm': 2200,
      //     'warm white': 2200,
      //     'incandescent': 2700,
      //     'soft white': 2700,
      //     'white': 4000,
      //     'daylight': 5500,
      //     'daylight white': 5500,
      //     'cool': 7000,
      //     'cool white': 7000
      //   }[strPayload] || 4000
        
        // if (strPayload == 'warm' || strPayload == 'warm white') {
        //   colorTemp = 2200
        // }
        // if (strPayload == 'incandescent' || strPayload == 'soft white') {
        //   colorTemp = 2700
        // }
        // if (strPayload == 'white') {
        //   colorTemp = 4000
        // }
        // if (strPayload == 'daylight' || strPayload == 'daylight white') {
        //   colorTemp = 5500
        // }
        // if (strPayload == 'cool' || strPayload == 'cool white') {
        //   colorTemp = 7000
        // }
      // } else {
      //   colorTemp = req.body.directive.payload.colorTemperatureInKelvin
      // }

      // var contextResult = {
      
    // }

    // if (namespace == 'Alexa.ColorTemperatureController') {
      

      

    // } else if (namespace == 'Alexa.ColorTemperatureController') {

      // var strPayload = req.body.directive.payload.colorTemperatureInKelvin
      // var hasColorTemperatureState = getSafe(
      //   () => deviceJSON.state.colorTemperature
      // )
      
      // var colorTemp
      
      // if (
      //   name === 'IncreaseColorTemperature' ||
      //   name === 'DecreaseColorTemperature'
      // ) {
        
        // if (hasColorTemperatureState != undefined) {
        // if (!_.has(deviceJSON.state, 'colorTemperature'))
        //   colorTemp = _.mean([
        //     deviceJSON.attributes.colorTemperatureRange.temperatureMinK,
        //     deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
        //   ])
          // (deviceJSON.attributes.colorTemperatureRange.temperatureMinK +
          //   deviceJSON.attributes.colorTemperatureRange.temperatureMaxK) /
          // 2
          
          // if (name === 'IncreaseColorTemperature') {
          //   colorTemp =
          //     deviceJSON.state.colorTemperature + 500 >
          //     deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
          //       ? deviceJSON.attributes.colorTemperatureRange.temperatureMaxK
          //       : deviceJSON.state.colorTemperature + 500
          // }
          // if (name === 'DecreaseColorTemperature') {
          //   colorTemp =
          //     deviceJSON.state.colorTemperature - 500 <
          //     deviceJSON.attributes.colorTemperatureRange.temperatureMinK
          //       ? deviceJSON.attributes.colorTemperatureRange.temperatureMinK
          //       : deviceJSON.state.colorTemperature - 500
          // }
        // } else {
          
        // }
      // }
      
    //   if (name == 'SetColorTemperature') {
    //     if (typeof strPayload != 'number') {
    //       if (strPayload == 'warm' || strPayload == 'warm white') {
    //         colorTemp = 2200
    //       }
    //       if (strPayload == 'incandescent' || strPayload == 'soft white') {
    //         colorTemp = 2700
    //       }
    //       if (strPayload == 'white') {
    //         colorTemp = 4000
    //       }
    //       if (strPayload == 'daylight' || strPayload == 'daylight white') {
    //         colorTemp = 5500
    //       }
    //       if (strPayload == 'cool' || strPayload == 'cool white') {
    //         colorTemp = 7000
    //       }
    //     } else {
    //       colorTemp = req.body.directive.payload.colorTemperatureInKelvin
    //     }
    //   }

    //   var contextResult = {
    //     properties: [
    //       {
    //         namespace: 'Alexa.ColorTemperatureController',
    //         name: 'colorTemperatureInKelvin',
    //         value: colorTemp,
    //         timeOfSample: dt.toISOString(),
    //         uncertaintyInMilliseconds: 50,
    //       },
    //     ],
    //   }
    // }
    
    // else if (namespace == 'Alexa.InputController') {

    if (_.isEqual(namespace, 'Alexa.InputController'))

    // var contextResult = {
      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.InputController',
              name: 'input',
              value: req.body.directive.payload.input,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ],
        },
        eventOverride: {
          endpoint: {
            endpointId
          }
        }
      }

      // endpoint = { 
      //   endpointId: endpointId,
      // }
    // }

    if (_.every([
      _.isEqual(namespace, 'Alexa.LockController'),
      _.isEqual(name, 'Lock')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.LockController',
              name: 'lockState',
              value: 'LOCKED',
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 500
            }
          ]
        }
      }

    if (_.every([
      _.isEqual(namespace, 'Alexa.LockController'),
      _.isEqual(name, 'Unlock')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.LockController',
              name: 'lockState',
              value: 'UNLOCKED',
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 500
            }
          ]
        }
      }

    // else if (namespace == 'Alexa.LockController') {
    //   var lockState
    //   if (name == 'Lock') {
    //     lockState = 'LOCKED'
    //   }
    //   if (name == 'Unlock') {
    //     lockState = 'UNLOCKED'
    //   }
    //   var contextResult = {
    //     properties: [
    //       {
    //         namespace: 'Alexa.LockController',
    //         name: 'lockState',
    //         value: lockState,
    //         timeOfSample: dt.toISOString(),
    //         uncertaintyInMilliseconds: 500,
    //       },
    //     ],
    //   }
    // }

    if (_.every([
      _.isEqual(namespace, 'Alexa.PercentageController'),
      _.isEqual(name, 'SetPercentage')
    ]))

    // else if (namespace == 'Alexa.PercentageController') {
    //   if (name == 'SetPercentage') {
    //     var contextResult = {
      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.PercentageController',
              name: 'percentage',
              value: req.body.directive.payload.percentage,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 500
            }
          ]
        }
      }
      // }

    if (_.every([
      _.isEqual(namespace, 'Alexa.PercentageController'),
      _.isEqual(name, 'AdjustPercentage'),
      _.has(deviceJSON.state, 'percentage')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.PercentageController',
              name: 'percentage',
              value: _.min([_.max([percentage + req.body.directive.payload.percentageDelta, 0]), 100]),
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 500
            }
          ]
        }
      }


      // if (name == 'AdjustPercentage') {
        // var percentage
        // var hasPercentage = getSafe(() => deviceJSON.state.percentage)
        // if (hasPercentage != undefined) {
          // if (
          //   deviceJSON.state.percentage +
          //     req.body.directive.payload.percentageDelta >
          //   100
          // ) {
          //   percentage = 100
          // } else if (
          //   deviceJSON.state.percentage -
          //     req.body.directive.payload.percentageDelta <
          //   0
          // ) {
          //   percentage = 0
          // } else {
          //   percentage =
          //     deviceJSON.state.percentage +
          //     req.body.directive.payload.percentageDelta
          // }
    //       var contextResult = {
    //         properties: [
    //           {
    //             namespace: 'Alexa.PercentageController',
    //             name: 'percentage',
    //             value: percentage,
    //             timeOfSample: dt.toISOString(),
    //             uncertaintyInMilliseconds: 500,
    //           },
    //         ],
    //       }
    //     }
    //   }
    // }
    
    if (_.isEqual(namespace, 'Alexa.PlaybackController'))
      return

    if (_.every([
      _.isEqual(namespace, 'Alexa.PowerController'),
      _.isEqual(name, 'TurnOn')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.PowerController',
              name: 'powerState',
              value: 'ON',
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }

    if (_.every([
      _.isEqual(namespace, 'Alexa.PowerController'),
      _.isEqual(name, 'TurnOff')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.PowerController',
              name: 'powerState',
              value: 'OFF',
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }

    // else if (namespace == 'Alexa.PlaybackController') {
    //   var contextResult = {
    //     properties: [],
    //   }
    // }
    
    // else if (namespace == 'Alexa.PowerController') {
    //   if (name == 'TurnOn') {
    //     var newState = 'ON'
    //   }
    //   if (name == 'TurnOff') {
    //     var newState = 'OFF'
    //   }
    //   var contextResult = {
    //     properties: [
    //       {
    //         namespace: 'Alexa.PowerController',
    //         name: 'powerState',
    //         value: newState,
    //         timeOfSample: dt.toISOString(),
    //         uncertaintyInMilliseconds: 50,
    //       },
    //     ],
    //   }
    // }

  if (_.every([
    _.isEqual(namespace, 'Alexa.RangeController'),
    _.isEqual(name, 'SetRangeValue'),
    (_.includes(deviceJSON.displayCategories, 'INTERIOR_BLIND') || 
    _.includes(deviceJSON.displayCategories, 'EXTERIOR_BLIND'))
  ]))

    return {
      contextOverride: {
        properties: [
          {
            namespace: 'Alexa.RangeController',
            instance: 'Blind.Lift',
            name: 'rangeValue',
            value: req.body.directive.payload.rangeValue,
            timeOfSample: dt.toISOString(),
            uncertaintyInMilliseconds: 50
          }
        ]
      }
    }
    
  if (_.every([
    _.isEqual(namespace, 'Alexa.RangeController'),
    _.isEqual(name, 'AdjustRangeValue'),
    (_.includes(deviceJSON.displayCategories, 'INTERIOR_BLIND') || 
    _.includes(deviceJSON.displayCategories, 'EXTERIOR_BLIND'))
  ]))

    return {
      contextOverride: {
        properties: [
          {
            namespace: 'Alexa.RangeController',
            instance: 'Blind.Lift',
            name: 'rangeValue',
            value: _.max([0, _.min([100, deviceJSON.state.rangeValue + req.body.directive.payload.rangeValueDelta])]),
            timeOfSample: dt.toISOString(),
            uncertaintyInMilliseconds: 50,
          }
        ]
      }
    }


    // else if (
    //   namespace == 'Alexa.RangeController' &&
    //   (deviceJSON.displayCategories.indexOf('INTERIOR_BLIND') > -1 ||
    //     deviceJSON.displayCategories.indexOf('EXTERIOR_BLIND') > -1)
    // ) {
    //   if (name == 'SetRangeValue') {
    //     var contextResult = {
    //       properties: [
    //         {
    //           namespace: 'Alexa.RangeController',
    //           instance: 'Blind.Lift',
    //           name: 'rangeValue',
    //           value: req.body.directive.payload.rangeValue,
    //           timeOfSample: dt.toISOString(),
    //           uncertaintyInMilliseconds: 50,
    //         },
    //       ],
    //     }
    //   } else if (name == 'AdjustRangeValue') {
    //     var rangeValue
    //     var hasrangeValue = getSafe(() => deviceJSON.state.rangeValue)
    //     if (hasrangeValue != undefined) {
    //       if (
    //         deviceJSON.state.rangeValue +
    //           req.body.directive.payload.rangeValueDelta >
    //         100
    //       ) {
    //         rangeValue = 100
    //       } else if (
    //         deviceJSON.state.rangeValue +
    //           req.body.directive.payload.rangeValueDelta <
    //         0
    //       ) {
    //         rangeValue = 0
    //       } else {
    //         rangeValue =
    //           deviceJSON.state.rangeValue +
    //           req.body.directive.payload.rangeValueDelta
    //       }
    //       var contextResult = {
    //         properties: [
    //           {
    //             namespace: 'Alexa.RangeController',
    //             instance: 'Blind.Lift',
    //             name: 'rangeValue',
    //             value: rangeValue,
    //             timeOfSample: dt.toISOString(),
    //             uncertaintyInMilliseconds: 50,
    //           },
    //         ],
    //       }
    //     }
    //   }
    // }


    if (_.every([
      _.isEqual(namespace, 'Alexa.RangeController'),
      _.isEqual(name, 'SetRangeValue')
    ]))
      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.RangeController',
              instance: 'NodeRed.Fan.Speed',
              name: 'rangeValue',
              value: req.body.directive.payload.rangeValue,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50,
            }
          ]
        }
      }

      if (_.every([
        _.isEqual(namespace, 'Alexa.RangeController'),
        _.isEqual(name, 'AdjustRangeValue')
      ]))
        return {
          contextOverride: {
            properties: [
              {
                namespace: 'Alexa.RangeController',
                instance: 'NodeRed.Fan.Speed',
                name: 'rangeValue',
                value: _.max([1, _.min([10, deviceJSON.state.rangeValue + req.body.directive.payload.rangeValueDelta])]),
                timeOfSample: dt.toISOString(),
                uncertaintyInMilliseconds: 50,
              }
            ]
          }
        }


    // else if (namespace == 'Alexa.RangeController') {
    //   if (name == 'SetRangeValue') {
    //     var contextResult = {
    //       properties: [
    //         {
    //           namespace: 'Alexa.RangeController',
    //           instance: 'NodeRed.Fan.Speed',
    //           name: 'rangeValue',
    //           value: req.body.directive.payload.rangeValue,
    //           timeOfSample: dt.toISOString(),
    //           uncertaintyInMilliseconds: 50,
    //         },
    //       ],
    //     }
    //   } else if (name == 'AdjustRangeValue') {
    //     var rangeValue
    //     var hasrangeValue = getSafe(() => deviceJSON.state.rangeValue)
    //     if (hasrangeValue != undefined) {
    //       if ( deviceJSON.state.rangeValue + req.body.directive.payload.rangeValueDelta > 10) {
    //         rangeValue = 10
    //       } else if ( deviceJSON.state.rangeValue + req.body.directive.payload.rangeValueDelta < 1) {
    //         rangeValue = 1
    //       } else {
    //         rangeValue = deviceJSON.state.rangeValue + req.body.directive.payload.rangeValueDelta
    //       }
    //       var contextResult = {
    //         properties: [
    //           {
    //             namespace: 'Alexa.RangeController',
    //             instance: 'NodeRed.Fan.Speed',
    //             name: 'rangeValue',
    //             value: rangeValue,
    //             timeOfSample: dt.toISOString(),
    //             uncertaintyInMilliseconds: 50,
    //           },
    //         ],
    //       }
    //     }
    //   }
    // }

    if (_.isEqual(namespace, 'Alexa.SceneController'))

      return {
        eventOverride: {
          header: {
            namespace: 'Alexa.SceneController',
            name: 'ActivationStarted'
          },
          payload: {
            cause: {
              type: 'VOICE_INTERACTION',
            },
            timestamp: dt.toISOString()
          }
        }
      }
    
    // else if (namespace == 'Alexa.SceneController') {
    //   header.namespace = 'Alexa.SceneController'
    //   header.name = 'ActivationStarted'
    //   var contextResult = {}
    //   var payload = {
    //     cause: {
    //       type: 'VOICE_INTERACTION',
    //     },
    //     timestamp: dt.toISOString(),
    //   }
    // }
    
    if (_.every([
      _.isEqual(namespace, 'Alexa.Speaker'),
      _.isEqual(name, 'SetVolume')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.Speaker',
              name: 'volume',
              value: req.body.directive.payload.volume,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }

    // else if (namespace == 'Alexa.Speaker') {
    //   if (name == 'SetVolume') {
    //     var contextResult = {
    //       properties: [
    //         {
    //           namespace: 'Alexa.Speaker',
    //           name: 'volume',
    //           value: req.body.directive.payload.volume,
    //           timeOfSample: dt.toISOString(),
    //           uncertaintyInMilliseconds: 50,
    //         },
    //       ],
    //     }

    if (_.every([
      _.isEqual(namespace, 'Alexa.Speaker'),
      _.isEqual(name, 'SetMute')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.Speaker',
              name: 'muted',
              value: req.body.directive.payload.mute,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 50
            }
          ]
        }
      }

      // } else if (name == 'SetMute') {
      //   var contextResult = {
      //     properties: [
      //       {
      //         namespace: 'Alexa.Speaker',
      //         name: 'muted',
      //         value: req.body.directive.payload.mute,
      //         timeOfSample: dt.toISOString(),
      //         uncertaintyInMilliseconds: 50
      //       },
      //     ],
      //   }

    if (_.isEqual(namespace, 'Alexa.Speaker'))
      return;

      // } else {
      //   var contextResult = {
      //     properties: [],
      //   }
      // }
    // }
    

    if (_.isEqual(namespace, 'Alexa.StepSpeaker'))
      return;

    // else if (namespace == 'Alexa.StepSpeaker') {
    //   var contextResult = {
    //     properties: [],
    //   }
    // }
    
    if (_.every([
      _.isEqual(namespace, 'Alexa.ThermostatController'),
      _.isEqual(name, 'AdjustTargetTemperature')
    ])) //TODO: HEAT

    {
    
    // else if (
    //   namespace == 'Alexa.ThermostatController' &&
    //   (name == 'AdjustTargetTemperature' || name == 'SetTargetTemperature')
    // ) {
      
      var hasTemperatureScale = getSafe( () => deviceJSON.attributes.temperatureScale )
      var hasThermostatSetPoint = getSafe( () => deviceJSON.state.thermostatSetPoint )
      var hasThermostatModes = getSafe( () => deviceJSON.attributes.thermostatModes)
      
      var targetTemp, scale, thermostatMode
      
      if (name == 'AdjustTargetTemperature') {
        
        if (hasThermostatSetPoint != undefined) {
          targetTemp =
            deviceJSON.state.thermostatSetPoint +
            req.body.directive.payload.targetSetpointDelta.value
        }
        
        else {
          targetTemp = req.body.directive.payload.targetSetpointDelta.value
        }
        
        if (hasTemperatureScale != undefined) {
          scale = deviceJSON.attributes.temperatureScale
        }
        
        else {
          scale = req.body.directive.payload.targetSetpointDelta.scale
        }
      }
      
      else if (name == 'SetTargetTemperature') {
        targetTemp = req.body.directive.payload.targetSetpoint.value
        scale = req.body.directive.payload.targetSetpoint.scale
      }
      
      else if (name == 'SetThermostatMode') {
        if (hasThermostatSetPoint != undefined)
          targetTemp = deviceJSON.state.thermostatSetPoint
        if (hasTemperatureScale != undefined)
          scale = deviceJSON.attributes.temperatureScale
        
        thermostatMode = req.body.directive.payload.thermostatMode.value
      }
      
      if (hasThermostatModes != undefined && thermostatMode == undefined) {
        thermostatMode = deviceJSON.state.thermostatMode
      } else {
        thermostatMode = 'HEAT'
      }
      
      // var targetSetPointValue = {
      //   value: targetTemp,
      //   scale: scale,
      // }
      
      // var contextResult = {
        return {
          contextOverride: {
            properties: [
              {
                namespace: 'Alexa.ThermostatController',
                name: 'targetSetpoint',
                value: {
                  value: targetTemp,
                  scale: scale
                },
                timeOfSample: dt.toISOString(),
                uncertaintyInMilliseconds: 50
              }, {
                namespace: 'Alexa.ThermostatController',
                name: 'thermostatMode',
                value: thermostatMode,
                timeOfSample: dt.toISOString(),
                uncertaintyInMilliseconds: 50
              }, {
                namespace: 'Alexa.EndpointHealth',
                name: 'connectivity',
                value: {
                  value: 'OK'
                },
                timeOfSample: dt.toISOString(),
                uncertaintyInMilliseconds: 50
              }
            ]
          }
        }
        
      }
    
    if (_.every([
      _.isEqual(namespace, 'Alexa.ThermostatController'),
      _.isEqual(name, 'SetThermostatMode')
    ]))

      return {
        contextOverride: {
          properties: [
            {
              namespace: 'Alexa.ThermostatController',
              name: 'thermostatMode',
              value: req.body.directive.payload.thermostatMode.value,
              timeOfSample: dt.toISOString(),
              uncertaintyInMilliseconds: 500
            }
          ]
        }
      }

    
    // else if (
    //   namespace == 'Alexa.ThermostatController' &&
    //   name == 'SetThermostatMode'
    // ) {
    //   var contextResult = {
    //     properties: [
    //       {
    //         namespace: 'Alexa.ThermostatController',
    //         name: 'thermostatMode',
    //         value: req.body.directive.payload.thermostatMode.value,
    //         timeOfSample: dt.toISOString(),
    //         uncertaintyInMilliseconds: 500,
    //       },
    //     ],
    //   }
    // }
    
    
    if (_.isEqual(namespace, 'Alexa.SceneController')) 
      return {
        context: contextOverride,
        event: {
          header: header,
          endpoint: endpoint,
          payload: payload
        }
      }

    // if (namespace != 'Alexa.SceneController') {
      
      // var response = {
      //   context: contextResult,
      //   event: {
      //     header: header,
      //     endpoint: endpoint,
      //     payload: {},
      //   },
      // }
    return {
      context: contextOverride,
      event: {
        header: header,
        endpoint: endpoint,
        payload: {}
      }
    }
    // }
    
    // else {
    //   var response = {
    //     context: contextResult,
    //     event: {
    //       header: header,
    //       endpoint: endpoint,
    //       payload: payload,
    //     },
    //   }
    // }
    
    // return response
  // } catch (e) {
  //   return undefined
  // }

  // return undefined
}


const replaceCapability = (capability, reportState, attributes, type) => {
// const replaceCapabilityAsync = async (capability, reportState, attributes, type) => {
  
  if (_.isEqual(capability, 'BrightnessController'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.BrightnessController',
      version: '3',
      properties: {
        supported: [
          { name: 'brightness' }
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      }
    }

  if (_.isEqual(capability, 'ChannelController'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.ChannelController',
      version: '3',
    }
  
  if (_.isEqual(capability, 'ColorController'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.ColorController',
      version: '3',
      properties: {
        supported: [
          { name: 'color' }
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      }
    }
  
  if (_.isEqual(capability, 'ContactSensor'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.ContactSensor',
      version: '3',
      properties: {
        supported: [
          { name: 'detectionState' }
        ],
        proactivelyReported: reportState,
        retrievable: reportState,
      }
    }
  
  if (_.isEqual(capability, 'ColorTemperatureController'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.ColorTemperatureController',
      version: '3',
      properties: {
        supported: [
          { name: 'colorTemperatureInKelvin' },
        ],
        proactivelyReported: reportState,
        retrievable: reportState,
      }
    }
  
  if (_.isEqual(capability, 'InputController'))   
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.InputController',
      version: '3',
      inputs: [
        { name: 'HDMI1' },
        { name: 'HDMI2' },
        { name: 'HDMI3' },
        { name: 'HDMI4' },
        { name: 'phono' },
        { name: 'audio1' },
        { name: 'audio2' },
        { name: 'chromecast' }
      ]
    }
  
  if (_.isEqual(capability, 'LockController'))   
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.LockController',
      version: '3',
      properties: {
        supported: [
          { name: 'lockState' }
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      }
    }
  
  if (_.isEqual(capability, 'MotionSensor'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.MotionSensor',
      version: '3',
      properties: {
        supported: [
          { name: 'detectionState' },
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      }
    }
  
  if (_.isEqual(capability, 'PercentageController'))    
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.PercentageController',
      version: '3',
      properties: {
        supported: [
          { name: 'percentage' }
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      }
    }
  
  if (_.isEqual(capability, 'PlaybackController'))    
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.PlaybackController',
      version: '3',
      supportedOperations: [
        'Play',
        'Pause',
        'Stop',
        'FastForward',
        'StartOver',
        'Previous',
        'Rewind',
        'Next'
      ]
    }
  
  if (_.isEqual(capability, 'PowerController'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.PowerController',
      version: '3',
      properties: {
        supported: [
          { name: 'powerState' }
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      }
    }
  
  if (_.every([
    _.isEqual(capability, 'RangeController'),
    _.some([
      _.includes(type, 'INTERIOR_BLIND'),
      _.includes(type, 'EXTERIOR_BLIND')
    ])
  ]))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.RangeController',
      instance: 'Blind.Lift',
      version: '3',
      properties: {
        supported: [
          { name: 'rangeValue' }
        ],
        proactivelyReported: true,
        retrievable: true
      },
      capabilityResources: {
        friendlyNames: [
          {
            '@type': 'asset',
            value: {
              assetId: 'Alexa.Setting.Opening'
            }
          }
        ]
      },
      configuration: {
        supportedRange: {
          minimumValue: 0,
          maximumValue: 100,
          precision: 1
        },
        unitOfMeasure: 'Alexa.Unit.Percent',
      },
      semantics: {
        actionMappings: [
          {
            '@type': 'ActionsToDirective',
            actions: ['Alexa.Actions.Close'],
            directive: {
              name: 'SetRangeValue',
              payload: {
                rangeValue: 0
              }
            }
          }, {
            '@type': 'ActionsToDirective',
            actions: ['Alexa.Actions.Open'],
            directive: {
              name: 'SetRangeValue',
              payload: {
                rangeValue: 100
              }
            }
          }, {
            '@type': 'ActionsToDirective',
            actions: ['Alexa.Actions.Lower'],
            directive: {
              name: 'AdjustRangeValue',
              payload: {
                rangeValueDelta: -10,
                rangeValueDeltaDefault: false
              }
            }
          }, {
            '@type': 'ActionsToDirective',
            actions: ['Alexa.Actions.Raise'],
            directive: {
              name: 'AdjustRangeValue',
              payload: {
                rangeValueDelta: 10,
                rangeValueDeltaDefault: false
              }
            }
          }
        ],
        stateMappings: [
          {
            '@type': 'StatesToValue',
            states: ['Alexa.States.Closed'],
            value: 0
          }, {
            '@type': 'StatesToRange',
            states: ['Alexa.States.Open'],
            range: {
              minimumValue: 1,
              maximumValue: 100
            }
          }
        ]
      }
    }
  
  if (_.isEqual(capability, 'RangeController'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.RangeController',
      version: '3',
      instance: 'NodeRed.Fan.Speed',
      capabilityResources: {
        friendlyNames: [
          {
            '@type': 'text',
            value: {
              text: 'Fan Speed',
              locale: 'en-US'
            },
          }, {
            '@type': 'text',
            value: {
              text: 'Position',
              locale: 'en-US'
            }
          }
        ]
      },
      properties: {
        supported: [
          { name: 'rangeValue' }
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      },
      configuration: {
        supportedRange: {
          minimumValue: 0,
          maximumValue: 10,
          precision: 1
        },
        presets: [
          {
            rangeValue: 1,
            presetResources: {
              friendlyNames: [
                {
                  '@type': 'asset',
                  value: {
                    assetId: 'Alexa.Value.Low'
                  }
                },
                {
                  '@type': 'asset',
                  value: {
                    assetId: 'Alexa.Value.Minimum'
                  }
                },
              ],
            },
          }, {
            rangeValue: 5,
            presetResources: {
              friendlyNames: [
                {
                  '@type': 'asset',
                  value: {
                    assetId: 'Alexa.Value.Medium'
                  }
                }
              ]
            }
          }, {
            rangeValue: 10,
            presetResources: {
              friendlyNames: [
                {
                  '@type': 'asset',
                  value: {
                    assetId: 'Alexa.Value.Maximum'
                  }
                }, {
                  '@type': 'asset',
                  value: {
                    assetId: 'Alexa.Value.High'
                  }
                }
              ]
            }
          }
        ]
      }
    }
  
  if (_.isEqual(capability, 'Speaker'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.Speaker',
      version: '3',
      properties: {
        supported: [
          { name: 'volume' },
          { name: 'muted' },
        ]
      }
    }
  
  if (_.isEqual(capability, 'SceneController'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.SceneController',
      version: '3',
      supportsDeactivation: false,
    }
  
  if (_.isEqual(capability, 'StepSpeaker'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.StepSpeaker',
      version: '3',
      properties: {
        supported: [
          {
            name: 'volume',
          },
          {
            name: 'muted',
          },
        ],
      },
    }
  
  if (_.isEqual(capability, 'TemperatureSensor'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.TemperatureSensor',
      version: '3',
      properties: {
        supported: [
          { name: 'temperature' },
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      }
    }

  if (_.isEqual(capability, 'ThermostatController'))
    return {
      type: 'AlexaInterface',
      interface: 'Alexa.ThermostatController',
      version: '3',
      properties: {
        supported: [
          { name: 'targetSetpoint' },
          { name: 'thermostatMode' }
        ],
        proactivelyReported: reportState,
        retrievable: reportState
      },
      configuration: {
        supportsScheduling: false,
        supportedModes: _.filter(attributes.thermostatModes || ['HEAT', 'COOL', 'AUTO'], 'ON')
      }
    }
  
  // if (capability === 'ThermostatController') {
  //   var supportedModes
  //   var hasModes = getSafe(() => attributes.thermostatModes)
  //   if (attributes != null && hasModes != undefined) {
  //     supportedModes = attributes.thermostatModes.filter(function (
  //       value
  //     ) {
  //       return value != 'ON'
  //     })
  //   } else {
  //     supportedModes = ['HEAT', 'COOL', 'AUTO']
  //   }
  //   return {
  //     type: 'AlexaInterface',
  //     interface: 'Alexa.ThermostatController',
  //     version: '3',
  //     properties: {
  //       supported: [
  //         { name: 'targetSetpoint' },
  //         { name: 'thermostatMode' }
  //       ],
  //       proactivelyReported: reportState,
  //       retrievable: reportState
  //     },
  //     configuration: {
  //       supportsScheduling: false,
  //       supportedModes: supportedModes
  //     }
  //   }
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
//   saveGrantAsync,
//   queryDeviceStateAsync,
//   requestAccessTokenAsync,
//   sendStateAsync,
//   // replaceCapabilityAsync,
//   validateCommandAsync,
//   buildCommandResponseAsync,
// }
