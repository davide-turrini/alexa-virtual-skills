// const express = require('express')
// const bodyParser = require('body-parser')
// const Account = require('../__models/__account')
// const oauthModels = require('../__models/__oauth')
// const Devices = require('../__models/__devices')
// const Topics = require('../__models/__topics')
// const defaultLimiter = require('../loaders/limiter').defaultLimiter

// const crypto = require('crypto')

// const mqtt_user = process.env.MQTT_USER

// const router = express.Router()
// router.use(bodyParser.urlencoded({ extended: true }))
// router.use(bodyParser.json())

// router.get( '/services', defaultLimiter, ensureAuthenticated, async (req, res) => {
//     try {
//       if (req.user.superuser === true) {
        
//         let apps = await oauthModels.Application.find({})
//         res.render('pages/services', {
//           user: req.user,
//           services: apps,
//           brand: process.env.BRAND,
//           title: 'OAuth Services | ' + process.env.BRAND,
//         })
//       } else {
//         res.redirect(403, '/')
//       }
//     } catch (e) {
//       res.status(500).send('Error rendering page!')
//     }
//   }
// )

// router.get('/users', defaultLimiter, ensureAuthenticated, async (req, res) => {
//   try {
//     if (req.user.superuser === true) {
      
//       const count = await Account.countDocuments()
      
//       const limit = 100
//       const page = req.query.page || 1
//       const offset = parseInt((page -1) * limit)
//       const pages = Math.ceil(count / limit)
//       const current = Math.ceil(page)
//       let usersAndDevs = await Account.aggregate([
//         {
//           $sort: { created: 1 },
//         },
//         {
//           $skip: offset,
//         },
//         { $limit: limit },
//         {
//           $lookup: {
//             from: 'devices',
//             let: { username: '$username' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $eq: ['$$username', '$username'] },
//                 },
//               },
//               { $count: 'count' },
//             ],
//             as: 'deviceCount',
//           },
//         },
//         {
//           $addFields: {
//             countDevices: { $sum: '$deviceCount.count' },
//           },
//         },
//       ])
//       res.render('pages/users', {
//         user: req.user,
//         users: usersAndDevs,
//         usercount: count,
//         brand: process.env.BRAND,
//         title: 'User Admin | ' + process.env.BRAND,
//         current,
//         pages,
//       })
//     } else {
//       res.redirect(403, '/')
//     }
//   } catch (e) {
//     res.status(500).send('Error rendering page!')
//   }
// })

// router.post('/toggle-topics/:username', defaultLimiter, ensureAuthenticated, async (req, res) => {
//     try {
      
//       if (req.user.superuser === true) {
//         if (!req.params.username)
//           return res.status(400).send('Username not supplied!')
        
//         let aclUser = await Topics.findOne({
//           topics: [
//             'command/' + req.params.username + '/#',
//             'state/' + req.params.username + '/#',
//             'response/' + req.params.username + '/#',
//             'message/' + req.params.username + '/#',
//           ],
//         })
//         if (!aclUser) {
          
//           aclUser = new Topics({
//             topics: [
//               'command/' + req.params.username + '/#',
//               'state/' + req.params.username + '/#',
//               'response/' + req.params.username + '/#',
//               'message/' + req.params.username + '/#',
//             ],
//           })
          
//           await aclUser.save()
//         }
        
//         let account = await Account.findByUsername(req.params.username, true)
        
//         await Account.updateOne(
//           { username: account.username },
//           { $set: { topics: aclUser._id } }
//         )
//       }
      
//       else {
//         res.redirect(403, '/')
//       }
//     } catch (e) {
//       return res.status(500).send('Error!')
//     }
//   }
// )

// router.post('/user/:id/:state', defaultLimiter, ensureAuthenticated, async (req, res) => {
//     try {
//       if (req.user.superuser === true && req.params.id && req.params.state) {
        
//         let state = req.params.state === 'true'
//         let result = await toggleUser(req.params.id, state)
//         if (result == true) {
//           return res.status(200).send('Updated Account State!')
//         } else {
//           return res.status(400).send('Error updating account state!')
//         }
//       } else if (req.user.superuser !== true) {
//         return res.redirect(403, '/')
//       } else if (!req.params.id && !req.params.state) {
//         return res.status(400).send('Please supply user _id and account state')
//       }
//     } catch (e) {
//       return res.status(400).send('Error updating account state!')
//     }
//   }
// )

// router.get('/user-devices', defaultLimiter, ensureAuthenticated, async (req, res) => {
//     try {
//       if (req.user.superuser === true) {
        
//         const limit = 100
//         const page = req.query.page || 1
//         const offset = parseInt((page -1) * limit)
//         const devices = await Devices.find().skip(offset).limit(limit)
//         const count = await Devices.countDocuments()
//         const pages = Math.ceil(count / limit)
//         const current = Math.ceil(page)
//         res.render('pages/user-devices', {
//           user: req.user,
//           devices: devices,
//           devicecount: count,
//           brand: process.env.BRAND,
//           title: 'Device Admin | ' + process.env.BRAND,
//           current,
//           pages,
//         })
//       } else {
//         res.redirect(403, '/')
//       }
//     } catch (e) {
//       res.status(500).send('Error rendering page!')
//     }
//   }
// )

// router.put('/services', defaultLimiter, ensureAuthenticated, async (req, res) => {
//     try {
//       if (req.user.superuser == true) {
//         let application = oauthModels.Application(req.body)
//         await application.save()
//         res.status(201).send(application)
//       } else {
        
//         res.redirect(403, '/')
//       }
//     } catch (e) {
//       res.status(500).send('Unable to save service!')
//     }
//   }
// )

// router.post('/service/:id', defaultLimiter, ensureAuthenticated, async (req, res) => {
//     try {
//       let service = req.body
//       if (req.user.superuser === true) {
//         var data = await oauthModels.Application.findOne({
//           _id: req.params.id,
//         })
//         data.title = service.title
//         data.oauth_secret = service.oauth_secret
//         data.domains = service.domains
//         data.save()
//         res.status(201).send(data)
//       } else {
//         res.redirect(403, '/')
//       }
//     } catch (e) {
//       res.status(500).send('Unable to modify service!')
//     }
//   }
// )

// router.delete('/service/:id', defaultLimiter, ensureAuthenticated, async (req, res) => {
//     try {
//       if (req.user.superuser == true) {
//         await oauthModels.Application.remove({ _id: req.params.id })
//         res.status(200).send()
//       } else {
//         res.redirect(403, '/')
//       }
//     } catch (e) {
//       res.status(500).send('Unable to delete service!')
//     }
//   }
// )

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next()
//   } else {
//     res.redirect('/login')
//   }
// }

// const toggleUser = async (id, enabled) => {
//   try {
//     let user = await Account.findOne({ _id: id })
//     let account = await Account.findByUsername(user.username, true)
//     if (enabled == true && account.username != mqtt_user) {
//       account.active = true
//       account.mqttPass = 'PBKDF2$sha256$901$' + account.salt + '$' + account.hash
//     } else if (enabled == false && account.username != mqtt_user) {
//       account.active = false
//       account.mqttPass = crypto.randomBytes(16).toString('hex')
//     } else {
//       return false
//     }
    
//     await account.save()
//     return true
//   } catch (e) {
//     return false
//   }
// }

// module.exports = router