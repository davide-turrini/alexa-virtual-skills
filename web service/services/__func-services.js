// // var Account = require('../__models/__account')
// // var Acls = require('../__models/__acls')
// // var Topics = require('../__models/__topics')

// // const updateUserServices = async (username, applicationName) => {
// //   try {
// //     await Account.updateOne(
// //       { username: username },
// //       { $addToSet: { activeServices: applicationName } }
// //     )
// //   } catch (e) {
// //   }
// // }

// // const removeUserServices = async (username, applicationName) => {
// //   try {
// //     await Account.updateOne(
// //       { username: username },
// //       { $pull: { activeServices: applicationName } }
// //     )
// //   } catch (e) {
// //   }
// // }

// const createACL = async (pattern) => {
//   try {
//     var acl = await Acls.findOne({ topic: pattern.toString() })
//     if (!acl) {
//       var topic = new Acls({ topic: pattern.toString(), acc: 3 })
//       await topic.save()
//       return topic
//     } else {
//       return acl
//     }
//   } catch (e) {
//     return undefined
//   }
// }

// const setupServiceAccount = async (username, password) => {
//   try {
    
//     var account = await Account.findOne({ username: username })
    
//     if (!account) {
//       account = await Account.register(
//         new Account({
//           username: username,
//           email: '',
//           password: '',
//           mqttPass: '',
//           superuser: true,
//           active: true,
//           isVerified: true,
//         }),
//         password
//       )
      
//       var topics = new Topics({
//         topics: [
//           'command/' + account.username + '/#',
//           'state/' + account.username + '/#',
//           'response/' + account.username + '/#',
//           'message/' + account.username + '/#',
//         ],
//       })
      
//       await topics.save()
      
//       if (
//         !account.hash ||
//         !account.salt ||
//         account.hash == undefined ||
//         account.salt == undefined
//       )
//         account = await Account.findByUsername(username, true)
      
//       var mqttPass = 'PBKDF2$sha256$901$' + account.salt + '$' + account.hash
      
//       await Account.updateOne(
//         { username: account.username },
//         { $set: { password: mqttPass, mqttPass: mqttPass, topics: topics._id } }
//       )
//       return true
//     }
    
//     else if (account && (!account.active || !account.isVerified)) {
      
//       await Account.updateOne(
//         { username: account.username },
//         { $set: { isVerified: true, active: true } }
//       )
//       return true
//     }
    
//     else {
//       return true
//     }
//   } catch (e) {
//     return false
//   }
// }

// // module.exports = {
// //   updateUserServices,
// //   removeUserServices,
// //   createACL,
// //   setupServiceAccount,
// // }
