// var express = require('express')
// var router = express.Router()
// var bodyParser = require('body-parser')

// router.use(bodyParser.urlencoded({ extended: true }))
// router.use(bodyParser.json())

// const crypto = require('crypto')
// var sendemail = require('../services/sendemail')
// var mailer = new sendemail()
// var Account = require('../__models/__account')
// var oauthModels = require('../__models/__oauth')
// var alexaAuthModels = require('../__models/__alexa-auth')
// var Devices = require('../__models/__devices')
// var Topics = require('../__models/__topics')
// var LostPassword = require('../__models/__lostPassword')
// var verifyEmail = require('../__models/__verifyEmail')
// var passport = require('passport')
// // var countries = require('countries-api')

// // const defaultLimiter = require('../loaders/limiter').defaultLimiter
// // const restrictiveLimiter = require('../loaders/limiter').restrictiveLimiter
// // const removeUserServices = require('../services/__func-services').removeUserServices

// const gHomeFunc = require('../services/func-ghome')
// const gHomeSync = gHomeFunc.gHomeSyncAsync

// var mqtt_user = process.env.MQTT_USER

// // TODO: serve a notificare google del cambiamento di stato dispositivi, da collegare agli eventi nodered
// var enableGoogleHomeSync = true

// if (!process.env.HOMEGRAPH_APIKEY) {
//   enableGoogleHomeSync = false
// }

// // let passwordRegExp = /(?=^.{12,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
// // let emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// // let usernameRegExp = /^[a-z0-9]{5,15}$/

// // router.get('/', defaultLimiter, async (req, res) => {
// //   res.render('pages/index', {
// //     user: req.user,
// //     home: true,
// //     brand: process.env.BRAND,
// //     title: 'Home | ' + process.env.BRAND,
// //   })
// // })

// // router.get('/docs', defaultLimiter, async (req, res) => {
// //   res.status(301).redirect('https://docs.cb-net.co.uk');
// // })

// // router.get('/about', defaultLimiter, async (req, res) => {
// //   res.render('pages/about', {
// //     user: req.user,
// //     about: true,
// //     brand: process.env.BRAND,
// //     title: 'About | ' + process.env.BRAND,
// //   })
// // })

// // router.get('/privacy', defaultLimiter, async (req, res) => {
// //   res.render('pages/privacy', {
// //     user: req.user,
// //     privacy: true,
// //     brand: process.env.BRAND,
// //     title: 'Privacy Policy | ' + process.env.BRAND,
// //     fqdn: process.env.WEB_HOSTNAME,
// //   })
// // })

// // router.get('/tos', defaultLimiter, async (req, res) => {
// //   res.render('pages/tos', {
// //     user: req.user,
// //     tos: true,
// //     brand: process.env.BRAND,
// //     title: 'Terms of Service | ' + process.env.BRAND,
// //     fqdn: process.env.WEB_HOSTNAME,
// //   })
// // })

// // router.get('/login', defaultLimiter, async (req, res) => {
// //   res.render('pages/login', {
// //     user: req.user,
// //     login: true,
// //     brand: process.env.BRAND,
// //     title: 'Login | ' + process.env.BRAND,
// //     fqdn: process.env.WEB_HOSTNAME,
// //     message: req.flash('error'),
// //   })
// // })

// // router.get('/logout', defaultLimiter, (req, res) => {
// //   req.logout(function (err) {
// //     if (err) {
// //       return next(err)
// //     }
// //     res.redirect('/')
// //   })
// // })

// // router.post('/login', defaultLimiter, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true, session: true }), (req, res) => {
// //     if (req.query.next) {
// //       res.reconnect(req.query.next)
// //     } else {
// //       if (req.user.username != mqtt_user) {
// //         res.redirect('/devices')
// //       } else {
// //         res.redirect('/admin/users')
// //       }
// //     }
// //   }
// // )

// // router.get('/new-user', defaultLimiter, async (req, res) => {  
// //   res.render('pages/register', {
// //     user: req.user,
// //     newuser: true,
// //     brand: process.env.BRAND,
// //     title: 'Register | ' + process.env.BRAND,
// //     fqdn: process.env.WEB_HOSTNAME,
// //   })
// // })

// // router.post('/new-user', restrictiveLimiter, async (req, res) => {
// //   try {
// //     var body = JSON.parse(JSON.stringify(req.body))
// //     if (
// //       body.hasOwnProperty('username') &&
// //       body.hasOwnProperty('email') &&
// //       body.hasOwnProperty('country') &&
// //       body.hasOwnProperty('password')
// //     ) {
      
// //       if (passwordRegExp.test(req.body.password) == false)
// //         return res
// //           .status(400)
// //           .send('Password does not meet complexity requirements!')
      
// //       if (emailRegExp.test(req.body.email) == false)
// //         return res.status(400).send('Email address format incorrect!')
      
// //       if (usernameRegExp.test(req.body.username) == false)
// //         return res.status(400).send('Username format incorrect!')
      
// //       var userCountry = await countries.findByCountryCode(
// //         req.body.country.toUpperCase()
// //       )
      
// //       var users = await Account.findOne({ email: req.body.email })
      
// //       if (!users && userCountry.statusCode == 200) {
        
// //         var region = userCountry.data[0].region
        
// //         var username = req.body.username.toLowerCase()
        
// //         var mqttPass = crypto.randomBytes(16).toString('hex')
        
// //         var account = await Account.register(
// //           new Account({
// //             username: username,
// //             email: req.body.email,
// //             country: req.body.country.toUpperCase(),
// //             region: region,
// //             password: mqttPass,
// //             mqttPass: mqttPass,
// //             active: true,
// //           }),
// //           req.body.password
// //         )
        
// //         var mailToken = new verifyEmail({
// //           user: account,
// //           token: crypto.randomBytes(16).toString('hex'),
// //         })
        
// //         await mailToken.save()
        
// //         var body = mailer.buildVerifyEmail(
// //           mailToken.token,
// //           account.username,
// //           process.env.WEB_HOSTNAME
// //         )
        
// //         mailer.send(
// //           req.body.email,
// //           process.env.MAIL_USER,
// //           'Account Verification for ' + process.env.BRAND,
// //           body.text,
// //           body.html,
// //           function (returnValue) {
// //             if (returnValue == true) {
// //               res
// //                 .status(201)
// //                 .send(
// //                   'A verification email has been sent to: ' +
// //                     req.body.email +
// //                     ', you need to verify your account to use this service.'
// //                 )
// //             }
            
// //             else {
// //               res.status(500).send('Verification email failed to send!')
// //             }
// //           }
// //         )
// //       } else {
// //         if (users) {
// //           return res
// //             .status(409)
// //             .send('User with this email address already exists!')
// //         } else {
// //           return res.status(500).send('New user creation failed!')
// //         }
// //       }
// //     } else {
// //       return res.status(400).send('Please complete all required fields!')
// //     }
// //   } catch (e) {
// //     return res.status(500).send('New user creation failed!')
// //   }
// // })

// // router.get(['/verify', '/verify/:token'], defaultLimiter, async (req, res) => {
  
// //   let message = undefined
// //   if (!req.params.token) {
// //     message = 'No token value supplied in URL, please ensure you manually enter token value below!'
// //     res.render('pages/verify', {
// //       token: undefined,
// //       user: req.user,
// //       brand: process.env.BRAND,
// //       title: 'Verify Account | ' + process.env.BRAND,
// //       message: message,
// //     })
// //   } else {
// //     res.render('pages/verify', {
// //       token: req.params.token,
// //       user: req.user,
// //       brand: process.env.BRAND,
// //       title: 'Verify Account | ' + process.env.BRAND,
// //       message: message,
// //     })
// //   }
// // })

// // router.post('/verify', defaultLimiter, async (req, res) => {
// //   try {
// //     if (req.body.token) {
      
// //       var token = await verifyEmail
// //         .findOne({ token: req.body.token })
// //         .populate('user')
// //         .exec()
      
// //       if (!token) return res.status(400).send('Unable to find matching token!')
      
// //       var account = await Account.findByUsername(token.user.username, true)
      
// //       if (!account) {
// //         return res
// //           .status(400)
// //           .send('Unable to find account associated with token!')
// //       } else if (account.isVerified) {
// //         return res.status(400).send('Your account is already verified!')
// //       }      

// //       var aclUser = await Topics.findOne({
// //         topics: [
// //           'command/' + account.username + '/#',
// //           'state/' + account.username + '/#',
// //           'response/' + account.username + '/#',
// //           'message/' + account.username + '/#',
// //         ],
// //       })
      
// //       if (!aclUser) {
// //         var aclUser = new Topics({
// //           topics: [
// //             'command/' + account.username + '/#',
// //             'state/' + account.username + '/#',
// //             'response/' + account.username + '/#',
// //             'message/' + account.username + '/#',
// //           ],
// //         })
        
// //         await aclUser.save()
// //       }
      
// //       var mqttPass = 'PBKDF2$sha256$901$' + account.salt + '$' + account.hash
      
// //       await Account.updateOne(
// //         { username: account.username },
// //         {
// //           $set: {
// //             password: mqttPass,
// //             mqttPass: mqttPass,
// //             topics: aclUser._id,
// //             isVerified: true,
// //           },
// //         }
// //       )
      
// //       return res
// //         .status(202)
// //         .send('The account has been verified, you can now use the service!')
// //     } else {
// //       if (!req.body.token) {
// //         return res.status(400).send('Please ensure you fill-in token value!')
// //       }
// //     }
// //   } catch (e) {
// //     return res.status(500).send('Failed to update user account!')
// //   }
// // })

// // router.get('/verify-resend', defaultLimiter, async (req, res) => {
// //   res.render('pages/verify-resend', {
// //     user: req.user,
// //     brand: process.env.BRAND,
// //     title: 'Verify Re-Send | ' + process.env.BRAND,
// //   })
// // })

// // router.post('/verify-resend', defaultLimiter, async (req, res) => {
// //   try {
// //     if (req.body.email) {
      
// //       var account = await Account.findOne({ email: req.body.email })
      
// //       if (!account) {
// //         return res
// //           .status(400)
// //           .send( 'Unable to find matching account, check supplied email address!' )
// //       }
// //       if (
// //         !account.isVerified ||
// //         (account.isVerified && account.isVerified == false)
// //       ) {
        
// //         var mailToken = new verifyEmail({
// //           user: account,
// //           token: crypto.randomBytes(16).toString('hex'),
// //         })
        
// //         await mailToken.save()
        
// //         var body = mailer.buildVerifyEmail(
// //           mailToken.token,
// //           account.username,
// //           process.env.WEB_HOSTNAME
// //         )
        
// //         mailer.send(
// //           account.email,
// //           process.env.MAIL_USER,
// //           'Account Verification for ' + process.env.BRAND,
// //           body.text,
// //           body.html,
// //           function (returnValue) {
// //             if (returnValue == true) {
// //               return res
// //                 .status(202)
// //                 .send(
// //                   'A verification email has been sent to: ' + account.email
// //                 )
// //             } else {
// //               return res.status(500).send('Verification email failed to send!')
// //             }
// //           }
// //         )
// //       }
      
// //       else if (account && account.isVerified && account.isVerified == true) {
// //         return res.status(400).send('Your account is already verified!')
// //       }
// //     }
    
// //     else {
// //       return res.status(400).send('Missing email address!')
// //     }
// //   } catch (e) {
// //     return res
// //       .status(500)
// //       .send('Failed to generate and send email verification token!')
// //   }
// // })

// // router.get(['/change-password', '/change-password/:token'], restrictiveLimiter, async (req, res) => {
    
// //     let message = undefined
// //     if (!req.params.token && !req.user) {
// //       message = 'No token value supplied in URL, please ensure you manually enter token value below!'
// //       res.render('pages/change-password', {
// //         token: undefined,
// //         user: req.user,
// //         brand: process.env.BRAND,
// //         title: 'Change Password | ' + process.env.BRAND,
// //         message: message,
// //       })
// //     } else {
// //       res.render('pages/change-password', {
// //         token: req.params.token,
// //         user: req.user,
// //         brand: process.env.BRAND,
// //         title: 'Change Password | ' + process.env.BRAND,
// //         message: message,
// //       })
// //     }
// //   }
// // )

// // router.post('/change-password', defaultLimiter, async (req, res) => {
// //   if (req.isAuthenticated()) {
// //     try {
      
// //       if (passwordRegExp.test(req.body.password) == false)
// //         return res
// //           .status(400)
// //           .send('Password does not meet complexity requirements!')
// //       var result = await resetPassword(req.user.username, req.body.password)
      
// //       if (result == true) {
        
// //         res.status(202).send('Changed Password!')
// //       }
      
// //       else {
        
// //         res.status(500).send('Problem setting new password')
// //       }
// //     } catch (e) {
// //       res.status(500).send('Error setting new password!')
// //     }
// //   } else {
// //     try {
      
// //       if (req.body.token) {
        
// //         var token = req.body.token
// //         var lostPassword = await LostPassword.findOne({ uuid: token })
// //           .populate('user')
// //           .exec()
// //         if (lostPassword) {
          
// //           if (passwordRegExp.test(req.body.password) == false)
// //             return res
// //               .status(400)
// //               .send('Password does not meet complexity requirements!')
          
// //           lostPassword.remove()
          
// //           var result = await resetPassword(
// //             lostPassword.user.username,
// //             req.body.password
// //           )
// //           if (result == true) {
            
// //             return res.status(202).send('Changed Password!')
// //           } else {
            
// //             return res.status(500).send('Error setting new password')
// //           }
// //         }
// //       } else {
// //         return res.status(400).send('Please ensure you fill-in token value!')
// //       }
// //     } catch (e) {
// //       res.status(500).send('Error setting new password')
// //     }
// //   }
// // })

// // router.get('/lost-password', defaultLimiter, async (req, res) => {
// //   if (req.user) {
    
// //   } else {
    
// //   }
  
// //   res.render('pages/lost-password', {
// //     user: req.user,
// //     brand: process.env.BRAND,
// //     title: 'Account Recovery | ' + process.env.BRAND,
// //   })
// // })

// // router.post('/lost-password', defaultLimiter, async (req, res) => {
// //   try {
// //     var email = req.body.email
// //     var user = await Account.findOne({ email: email })
// //     if (!user)
// //       return res
// //         .status(400)
// //         .send('Unable to find user with supplied email address!')
// //     var lostPassword = new LostPassword({ user: user })
// //     await lostPassword.save()
// //     var body = mailer.buildLostPasswordBody(
// //       lostPassword.uuid,
// //       user.username,
// //       process.env.WEB_HOSTNAME
// //     )
// //     mailer.send(
// //       req.body.email,
// //       process.env.MAIL_USER,
// //       'Password Reset for ' + process.env.BRAND,
// //       body.text,
// //       body.html,
// //       function (returnValue) {
        
// //         if (returnValue == true) {
// //           res
// //             .status(202)
// //             .send(
// //               'A password reset email has been sent to: ' + req.body.email + '.'
// //             )
// //         }
        
// //         else {
// //           res.status(500).send('Password reset email failed to send!')
// //         }
// //       }
// //     )
// //   } catch (e) {
// //     res.status(500).send('Error generating lost password token/ email')
// //   }
// // })

// // router.get('/my-account', defaultLimiter, ensureAuthenticated, async (req, res) => {
// //     try {
      
      
// //       var user = await Account.findOne({ username: req.user.username })
// //       res.render('pages/account', {
// //         user: user,
// //         acc: true,
// //         brand: process.env.BRAND,
// //         title: 'My Account | ' + process.env.BRAND,
// //       })
// //     } catch (e) {
// //       res.status(500).send('Failed to render page!')
// //     }
// //   }
// // )

// // router.get('/devices', defaultLimiter, ensureAuthenticated, async (req, res) => {
// //     try {
      
// //       var user = req.user.username
      
// //       var devices = await Devices.find({ username: user }).sort({ friendlyName: 1})
      
// //       var countDevs = await Devices.countDocuments({ username: user })
      
// //       var countUserGrants = await Account.aggregate([
// //         {
// //           $match: {
// //             username: user,
// //           },
// //         },
// //         {
// //           $lookup: {
// //             from: 'grantcodes',
// //             let: { user_id: '$_id' },
// //             pipeline: [
// //               {
// //                 $match: {
// //                   $expr: { $eq: ['$$user_id', '$user'] },
// //                 },
// //               },
// //               { $count: 'count' },
// //             ],
// //             as: 'grantCount',
// //           },
// //         },
// //         {
// //           $addFields: {
// //             countGrants: { $sum: '$grantCount.count' },
// //           },
// //         },
// //       ])
      
// //       var verified = undefined
// //       if (!req.user.isVerified || req.user.isVerified == false) {
// //         verified = false
// //       } else {
// //         verified = true
// //       }
      
// //       res.render('pages/devices', {
// //         user: req.user,
// //         devices: devices,
// //         count: countDevs,
// //         grants: countUserGrants[0].countGrants,
// //         isVerified: verified,
// //         fqdn: process.env.WEB_HOSTNAME,
// //         devs: true,
// //         brand: process.env.BRAND,
// //         title: 'My Devices | ' + process.env.BRAND,
// //       })
// //     } catch (e) {
// //       res.status(500).send('Failed to render page!')
// //     }
// //   }
// // )

// // router.put('/devices', defaultLimiter, ensureAuthenticated, async (req, res) => {
// //     try {
      
// //       var user = req.user.username
// //       var device = req.body
      
// //       device.username = user

      
// //       var checkDevice = await Devices.findOne({
// //         username: user,
// //         friendlyName: device.friendlyName,
// //       })
// //       if (checkDevice) {
// //         return res
// //           .status(500)
// //           .send('Please ensure your devices have unique names!')
// //       }
      
// //       if (
// //         req.user.activeServices.indexOf('Google') > -1 &&
// //         device.displayCategories == 'SMARTLOCK' &&
// //         (!device.attributes.require2FA ||
// //           !device.attributes.pin ||
// //           !device.attributes.type2FA)
// //       ) {
// //         return res
// //           .status(500)
// //           .send('As a Google Home user you must set a PIN on your lock!')
// //       }

      
// //       var dev = new Devices(device)
      
// //       await dev.save()
      
// //       res.status(201).send(dev)
// //       if (enableGoogleHomeSync == true) {
// //         gHomeSync(req.user._id)
// //       } 
// //     } catch (e) {
// //       res.status(500).send('Failed to create device!')
// //     }
// //   }
// // )

// // router.post('/account/:user_id', defaultLimiter, ensureAuthenticated, async (req, res) => {
// //     try {
      
// //       var user = req.body
      
// //       if (req.user.superuser === true || req.user.username == user.username) {
// //         const userCountry = await countries.findByCountryCode(
// //           user.country.toUpperCase()
// //         )
// //         var region = userCountry.data[0].region
// //         var account = await Account.findOne({ _id: req.params.user_id })
// //         if (req.user.superuser === true) {
// //         } else {
// //         }
// //         account.email = user.email
// //         account.country = user.country.toUpperCase()
// //         account.region = region
// //         await account.save()
// //         res.status(201).send(account)
// //       } else {
        
// //         res.status(401).send()
// //       }
// //     } catch (e) {
// //       res.status(500).send('Unable to update user account!')
// //     }
// //   }
// // )

// // router.delete('/account/:user_id', defaultLimiter, ensureAuthenticated, async (req, res) => {
// //     try {
// //       var userId = req.params.user_id
      
// //       var userAccount = await Account.findOne({ _id: userId })
      
// //       if (
// //         userAccount.username == req.user.username ||
// //         req.user.superuser === true
// //       ) {
// //         var username = userAccount.username
        
// //         await Account.deleteOne({ _id: userId })
// //         await oauthModels.GrantCode.deleteMany({ user: userId })
// //         await oauthModels.AccessToken.deleteMany({ user: userId })
// //         await oauthModels.RefreshToken.deleteMany({ user: userId })
// //         await Devices.deleteMany({ username: userAccount.username })
// //         await Topics.deleteOne({ _id: userAccount.topics })
        
// //         res.status(202).send('Account deleted"')
// //         if (req.user.superuser === true) {
// //         } else {
// //         }
// //       } else {
        
// //         res.status(401).send('Unauthorized')
// //       }
// //     } catch (e) {
// //       res.status(500).send()
// //     }
// //   }
// // )

// // router.delete('/tokens/:user_id', defaultLimiter, ensureAuthenticated, async (req, res) => {
// //     try {
// //       var userId = req.params.user_id
      
// //       var userAccount = await Account.findOne({ _id: userId })
      
// //       if (
// //         userAccount.username == req.user.username ||
// //         req.user.superuser === true
// //       ) {       
// //         await oauthModels.GrantCode.deleteMany({ user: userId })
// //         await oauthModels.AccessToken.deleteMany({ user: userId })
// //         await oauthModels.RefreshToken.deleteMany({ user: userId })
        
// //         await alexaAuthModels.AlexaAuthGrantCode.deleteMany({ user: userId })
// //         await alexaAuthModels.AlexaAuthAccessToken.deleteMany({ user: userId })
// //         await alexaAuthModels.AlexaAuthRefreshToken.deleteMany({
// //           user: userId,
// //         })
        
// //         removeUserServices(userAccount.username, 'Amazon')
// //         removeUserServices(userAccount.username, 'Google')
        
// //         res.status(202).json({ message: 'deleted OAuth tokens' })

// //       } else {
        
// //         res.status(401).send()
// //       }
// //     } catch (e) {
      
// //       res.status(500).send()
// //     }
// //   }
// // )

// // router.post('/device/:dev_id', defaultLimiter, ensureAuthenticated, async (req, res) => {
// //     try {
      
// //       var device = req.body
// //       if (req.user.username === device.username) {
        
// //         var data = await Devices.findOne({
// //           _id: device._id,
// //           username: device.username,
// //         })
        
// //         data.friendlyName = device.friendlyName
// //         data.description = device.description
// //         data.capabilities = device.capabilities
// //         data.displayCategories = device.displayCategories
// //         data.reportState = device.reportState
// //         data.attributes = device.attributes
// //         data.state = device.state

        
// //         if (
// //           req.user.activeServices.indexOf('Google') > -1 &&
// //           device.displayCategories == 'SMARTLOCK' &&
// //           (!device.attributes.require2FA ||
// //             !device.attributes.pin ||
// //             !device.attributes.type2FA)
// //         ) {

// //           return res
// //             .status(500)
// //             .send('As a Google Home user you must set a PIN on your lock!')
// //         }

        
// //         await data.save()
        
// //         res.status(201).send(data)

        
// //         if (enableGoogleHomeSync == true) {
// //           gHomeSync(req.user._id)
// //         }
// //       } else {
        
// //         res.status(401).send()
// //       }
// //     } catch (e) {
// //       res.status(500).send()
// //     }
// //   }
// // )

// // router.delete('/device/:dev_id', defaultLimiter, ensureAuthenticated, async (req, res) => {
// //     try {
// //       var user = req.user.username
// //       var id = req.params.dev_id
      
// //       if (req.user.superuser !== true) {
        
// //         await Devices.deleteOne({ _id: id, username: user })
// //         res.status(202).send()
        
// //         if (enableGoogleHomeSync == true) {
// //           gHomeSync(req.user._id)
// //         }
// //       }
      
// //       else if (req.user.superuser === true) {
        
// //         await Devices.deleteOne({ _id: id })
// //         res.status(202).send()
        
        
// //       }
// //     } catch (e) {
      

// //       res.status(500).send()
// //     }
// //   }
// // )

// // router.post('/api/v1/devices', defaultLimiter, passport.authenticate('bearer', { session: false }), async (req, res) => {
// //     var devices = req.body
// //     if (typeof devices == 'object' && Array.isArray(devices)) {
// //       for (var i = 0; i < devices.length; i++) {
// //         var endpointId = devices[i].endpointId
// //         await Devices.updateOne(
// //           { username: req.user, endpointId: endpointId },
// //           devices[i],
// //           { upsert: true }
// //         )
// //       }
// //       res.status(202).send()
// //       if (enableGoogleHomeSync == true) {
// //         gHomeSync(req.user._id)
// //       } 
// //     } else {
// //       res.status(500).send()
// //     }
// //   }
// // )

// // function ensureAuthenticated(req, res, next) {
// //   if (req.isAuthenticated()) {
// //     return next()
// //   } else {
    
// //     res.redirect('/login')
// //   }
// // }

// // const resetPassword = async (username, password) => {
// //   try {
    
// //     var account = await Account.findOne({ username: username })
    
// //     await account.setPassword(password)
    
// //     await account.save()
    
// //     var account = await Account.findByUsername(username, true)
// //     if (
// //       !account.salt ||
// //       account.salt == undefined ||
// //       !account.hash ||
// //       account.hash == undefined
// //     ) {
// //       return false
// //     }
    
// //     var mqttPass = 'PBKDF2$sha256$901$' + account.salt + '$' + account.hash
// //     account.mqttPass = mqttPass
// //     account.password = mqttPass
    
// //     await account.save()
  
// //     return true
// //   } catch (e) {
// //     return false
// //   }
// // }

// module.exports = router