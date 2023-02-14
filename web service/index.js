
// var dotenv = require('dotenv').config()

// if (dotenv.error) {
//   throw dotenv.error
// }

// var favicon = require('serve-favicon')
// var flash = require('connect-flash')

var express = require('express')
// var bodyParser = require('body-parser')
// const session = require('express-session')

var passport = require('passport')
var BasicStrategy = require('passport-http').BasicStrategy
var LocalStrategy = require('passport-local').Strategy
var PassportOAuthBearer = require('passport-http-bearer')

// const path = require('path')

// var db = require('./loaders/db') 
// const redisSessionClient = require('./loaders/redis-sessions') 
// let RedisStore = require('connect-redis')(session)

// var Account = require('./models/account')
// var oauthModels = require('./models/oauth')

// const createACL = require('./services/__func-services').createACL
// const setupServiceAccount = require('./services/__func-services').setupServiceAccount
// var mqtt_user = process.env.MQTT_USER
// var mqtt_password = process.env.MQTT_PASSWORD

// var cookieSecret = process.env.COOKIE_SECRET || 'ihytsrf334'

// const authenticate = Account.authenticate()

//TODO: STRATEGIE DI AUTENTICAZIONE

const db = {
  devices: [],
  tokens: [],
  account: {
    username: null,
    password: null,
    activeServices: []
  }
}

passport.use(
  new LocalStrategy((username, password, done) => {
    if (_.every([
      _.isEqual(username, db.account.username),
      _.isEqual(password, db.account.password),
    ]))
      return done(null, db.account)

    return done(new Error('Wrong credentials'))
  })
)

passport.use(
  new BasicStrategy((username, password, done) => {
    if (_.every([
      _.isEqual(username, db.account.username),
      _.isEqual(password, db.account.password),
    ]))
      return done(null, db.account)
    
    return done(new Error('Wrong credentials'))
  })
)

passport.use(
  new PassportOAuthBearer((token, done) => {
    if (_.includes(db.tokens, token.data))
      // return done(null, token.account, { scope: token.scope })
      return done(null, db.account, { scope: token.scope })
    
    done(new Error('Wrong credentialss'))
  })
)

// passport.serializeUser(Account.serializeUser())
// passport.deserializeUser(Account.deserializeUser())


const app = express()
// app.use((req, res, next) => {
//   if (!req.session) {
//     return next(new Error('Internal Error'))
//   }
//   next() 
// })
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))
app.use('/api/ghome', require('./routes/ghome')) 
app.use('/api/v1', require('./routes/alexa')) 
app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.message)
})
app.listen(3000)
    

// const createServer = async () => {
//   // try {
//     // db.connect()

//     // var boolSetupServiceAccount = await setupServiceAccount( mqtt_user, mqtt_password)
    
//     // if (boolSetupServiceAccount == false) process.exit(1)
    
//     // let arrayACLs = [
//     //   'command/%u/#',
//     //   'message/%u/#',
//     //   'state/%u/#',
//     //   'response/%u/#',
//     // ]

//     // TODO: ACL VANNO DA QUALCHE PARTEEE MI RACCOMANDO

//     // let errACLs = false
//     // for (let acl of arrayACLs) {
//     //   var topic = await createACL(acl)
//     //   if (topic == undefined) errACLs = true
//     // }
    
//     // if (errACLs == true) process.exit(1)
    
//     var app = express()
//     // app.set('view engine', 'ejs')
    
//     // app.use(favicon(path.join(__dirname, '/interfaces/static', 'favicon.ico')))
    
//     // app.use(flash())
    
//     // if (app.get('env') === 'production') {
//     //   app.enable('trust proxy')
//     //   app.use(
//     //     session({
//     //       store: new RedisStore({ client: redisSessionClient }),
//     //       saveUninitialized: false,
//     //       secret: cookieSecret,
//     //       resave: false,
//     //       cookie: {
//     //         secure: true,
//     //         maxAge: 24 * 60 * 60 * 1000, 
//     //       },
//     //     })
//     //   )
//     // } else {
//     //   app.use(
//     //     session({
//     //       store: new RedisStore({ client: redisSessionClient }),
//     //       saveUninitialized: false,
//     //       secret: cookieSecret,
//     //       resave: false,
//     //       cookie: {
//     //         secure: false,
//     //         maxAge: 24 * 60 * 60 * 1000, 
//     //       },
//     //     })
//     //   )
//     // }

//     app.use((req, res, next) => {
//       if (!req.session) {
//         return next(new Error('Internal Error'))
//       }
//       next() 
//     })
    
//     app.use(bodyParser.json())
//     app.use(bodyParser.urlencoded({ extended: false }))

//     // app.use(passport.initialize())
//     // app.use(passport.session())
    
//     // const rtDefault = require('./routes/__default')
//     // const rtAdmin = require('./routes/__admin')
//     // const rtAuth = require('./routes/__auth')
//     const rtGhome = require('./routes/ghome')
//     const rtAlexa = require('./routes/alexa')
//     // app.use('/admin', rtAdmin) 
//     // app.use('/auth', rtAuth) 

//     app.use('/api/ghome', rtGhome) 
//     app.use('/api/v1', rtAlexa) 
//     // app.use('/', rtDefault)
    
//     // app.use((req, res, next) => {
//     //   const err = new Error('Not Found')
//     //   err.status = 404
//     //   next(err)
//     // })
    
//     app.use((err, req, res, next) => {
//       res.status(err.status || 500).send(err.message)
//     })

//     // var port, host, app_uri, app_id
    
//     // if (process.env.VCAP_APP_PORT) port = process.env.VCAP_APP_PORT
//     // else 
//     // port...
    
//     // if (process.env.VCAP_APP_HOST) port = process.env.VCAP_APP_HOST
//     // else host = process.env.WEB_APP_HOST || '0.0.0.0'
    
//     // if (process.env.VCAP_APPLICATION) {
//     //   var application = JSON.parse(process.env.VCAP_APPLICATION)
//     //   // app_uri = application['application_uris'][0]
//     //   app_id = 'https://' + app_uri;
//     // } else {
//     //   // app_uri = process.env.WEB_HOSTNAME || 'localhost'
//     //   app_id = 'https://' + app_uri;
//     // }
    
//     // var server = app.listen(3000)
//     app.listen(3000)
    
//     // server.setTimeout = 5000
//   // } catch (e) {
//   // }
// }

// createServer()
