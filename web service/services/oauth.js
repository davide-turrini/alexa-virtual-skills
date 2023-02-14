const oauth2orize = require('oauth2orize')
// var oauth2orize = require('oauth2orize')
// var OAuth = require('../__models/__oauth')

const server = oauth2orize.createServer()
// var server = oauth2orize.createServer()

server.grant(oauth2orize.grant.code( { scopeSeparator: [' ', ','], },(application, redirectURI, user, ares, done) => {
      OAuth.GrantCode.findOne(
        { application: application, user: user },
        (error, grant) => {
          if (!error && grant) {
            done(null, grant.code) 
          } else if (!error) {
            var grant = new OAuth.GrantCode({
              application: application,
              user: user,
              scope: ares.scope,
            })
            grant.save((error) => {
              done(error, error ? null : grant.code)
            })
          } else {
            done(error, null) 
          }
        }
      )
    }
  )
)

server.exchange(oauth2orize.exchange.code({ userProperty: 'appl', }, (application, code, redirectURI, done) => {
      OAuth.GrantCode.findOne({ code: code }, (error, grant) => {
        if (grant && grant.active && grant.application == application.id) {
          var now = new Date().getTime()
          OAuth.AccessToken.findOne(
            {
              application: application,
              user: grant.user,
              expires: { $gt: now },
            },
            (error, token) => {
              if (token) {
                OAuth.RefreshToken.findOne(
                  { application: application, user: grant.user },
                  (error, refreshToken) => {
                    if (refreshToken) {
                      var expires = Math.round(
                        (token.expires - new Date().getTime()) / 1000
                      )
                      done(null, token.token, refreshToken.token, {
                        token_type: 'Bearer',
                        expires_in: expires,
                      })
                    } else {
                      done(error)
                    }
                  }
                )
              } else if (!error) {
                var token = new OAuth.AccessToken({
                  application: grant.application,
                  user: grant.user,
                  grant: grant,
                  scope: grant.scope,
                })
                token.save((error) => {
                  var expires = Math.round(
                    (token.expires - new Date().getTime()) / 1000
                  )
                  
                  OAuth.RefreshToken.findOne(
                    { application: application, user: grant.user },
                    (error, refreshToken) => {
                      if (refreshToken) {

                        done(
                          error,
                          error ? null : token.token,
                          refreshToken.token,
                          error
                            ? null
                            : {
                                token_type: 'Bearer',
                                expires_in: expires,
                                scope: token.scope,
                              }
                        )
                      } else if (!error) {
                        var refreshToken = new OAuth.RefreshToken({
                          user: grant.user,
                          application: grant.application,
                        })

                        refreshToken.save((error) => {

                          done(
                            error,
                            error ? null : token.token,
                            refreshToken.token,
                            error
                              ? null
                              : {
                                  token_type: 'Bearer',
                                  expires_in: expires,
                                  scope: token.scope,
                                }
                          )
                        })
                      } else {
                        done(error)
                      }
                    }
                  )
                })
              } else {
                done(error)
              }
            }
          )
        } else {
          done(error, false)
        }
      })
    }
  )
)

server.exchange(oauth2orize.exchange.refreshToken({ userProperty: 'appl', }, (application, token, scope, done) => {
      OAuth.RefreshToken.findOne({ token: token }, (error, refresh) => {
        if (refresh && refresh.application == application.id) {
          
          OAuth.GrantCode.findOne(
            { application: application.id },
            (error, grant) => {
              if (
                grant &&
                grant.active &&
                grant.application == application.id
              ) {
                var newToken = new OAuth.AccessToken({
                  application: refresh.application,
                  user: refresh.user,
                  grant: grant,
                  scope: grant.scope,
                })
                newToken.save((error) => {
                  var expires = Math.round(
                    (newToken.expires - new Date().getTime()) / 1000
                  )
                  if (!error) {

                    done(null, newToken.token, refresh.token, {
                      token_type: 'Bearer',
                      expires_in: expires,
                      scope: newToken.scope,
                    })
                  } else {

                    done(error, false)
                  }
                })
              } else {
                // if (!grant) {

                // }
                // if (!grant.active) {
                // }
                // if (grant.application != application.id) {

                // }
                // if (error) {

                // }
                done(error, null)
              }
            }
          )
        } else {
          // if (!refresh && application != null) {

          // } else if (!application) {

          // }

          // if (error) {

          // }
          done(error, false)
        }
      })
    }
  )
)

server.serializeClient((application, done) => {
  done(null, application.id)
})

server.deserializeClient((id, done) => {
  OAuth.Application.findById(id, (error, application) => {
    done(error, error ? null : application)
  })
})

// module.exports = server
