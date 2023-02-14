var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())
var oauthModels = require('../__models/__oauth')
var passport = require('passport')

var oauthServer = require('../services/oauth')
var url = require('url')

router.get('/start', oauthServer.authorize((applicationID, redirectURI, done) => {
    if (typeof applicationID == 'string') {
      applicationID = parseInt(applicationID)
    }
    oauthModels.Application.findOne(
      { oauth_id: applicationID },
      function (error, application) {
        if (application) {
          var match = false,
            uri = url.parse(redirectURI || '')
          for (var i = 0; i < application.domains.length; i++) {
            if (
              uri.host == application.domains[i] ||
              (uri.protocol == application.domains[i] &&
                uri.protocol != 'http' &&
                uri.protocol != 'https')
            ) {
              match = true
              break
            }
          }
          if (match && redirectURI && redirectURI.length > 0) {
            done(null, application, redirectURI)
          } else {
            done(
              new Error(
                'ERROR: Could not find service definition associated with redirectURI: ',
                redirectURI
              ),
              false
            )
          }
        } else if (!error) {
          done(
            new Error(
              'ERROR: No service definition associated with oauth client_id: ',
              applicationID
            ),
            false
          )
        } else {
          done(error)
        }
      }
    )
    
  }),
  function (req, res) {
    var scopeMap = {
      access_devices: 'access your devices',
      create_devices: 'create new devices',
    }

    res.render('pages/oauth', {
      transaction_id: req.oauth2.transactionID,
      currentURL: encodeURIComponent(req.originalUrl),
      response_type: req.query.response_type,
      errors: req.flash('error'),
      scopes: req.oauth2.req.scope,
      application: req.oauth2.client,
      user: req.user,
      map: scopeMap,
      brand: process.env.BRAND,
      title: 'Link Account | ' + process.env.BRAND,
    })
  }
)

router.post('/finish', (req, res, next) => {
    if (req.user) {
      next()
    } else {
      passport.authenticate(
        'local',
        {
          session: false,
        },
        (error, user, info) => {
          
          if (user) {
            req.user = user
            next()
          } else if (!error) {
            req.flash(
              'error',
              'Your email or password was incorrect. Please try again.'
            )
            res.redirect(req.body['auth_url'])
          } else {
          }
        }
      )(req, res, next)
    }
  },
  oauthServer.decision((req, done) => {
    done(null, { scope: req.oauth2.req.scope })
  })
)

router.post('/exchange', (req, res, next) => {
    var appID = req.body['client_id']
    var appSecret = req.body['client_secret']

    oauthModels.Application.findOne(
      { oauth_id: appID, oauth_secret: appSecret },
      function (error, application) {
        if (application) {
          req.appl = application
          next()
        } else if (!error) {
          error = new Error(
            'ERROR: Could not find service definition associated with applicationID: ' +
              appID +
              ' or secret: ' +
              appSecret
          )
          next(error)
        } else {
          next(error)
        }
      }
    )
  },
  oauthServer.token(),
  oauthServer.errorHandler()
)

module.exports = router
