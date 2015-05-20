let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../models/user')
let util = require('util')
let FacebookStrategy = require('passport-facebook').Strategy
let GoogleStrategy = require( 'passport-google-oauth2' ).Strategy
let TwitterStrategy = require('passport-twitter').Strategy
let auth = require('../../config/auth')
// let conf = auth.config
require('songbird')


// function useExternalPassportStrategy(OauthStrategy, config, accountType) {
//     config.passReqToCallback = true
//     passport.use(new OauthStrategy(config, nodeifyit(authCB, {spread: true})))

//     async function authCB(req, token, _ignored_, account) {
//         // Your generic 3rd-party passport strategy implementation here
//     }
// }
function useExternalPassportStrategy(OauthStrategy, config, accountType) {
  config.passReqToCallback = true
  passport.use(new OauthStrategy(config, nodeifyit(authCB, {spread: true})))

  async function authCB(req, token, _ignored_, account) {
      // 1. Load user from store
      console.log('token: ' + util.inspect(token))
      // console.log('req: ' + util.inspect(req))
      console.log('account: ' + util.inspect(account))
      console.log('accountType: ' + util.inspect(accountType))
      // console.log('In authCB: ' + id)
      if (accountType === 'facebook'){
        let userFB = await User.promise.findOne({'facebook.id' : account.id})
        // 2. If req.user exists, we're authorizing (connecting an account)
        if (req.user){
          console.log('req.user: ' + util.inspect(req.user))
          console.log('userFB: ' + util.inspect(userFB))
        // 2a. Ensure it's not associated with another account
        // 2b. Link account
          if (!req.user.facebook.id && !userFB){
            console.log('in save')
            let user = await User.promise.findById(req.user._id)
            // user.local.email = req.user.local.email
            // user.local.password = req.user.local.password
            user.facebook.id = account.id
            user.facebook.token = token
            console.log('email: ' + util.inspect(account.emails))
            user.facebook.email = account.emails[0].value
            user.facebook.name = account.displayName
            return await user.save()
          }
        }
        // 3. If req.user does not exist, we're authenticating (logging in)
        else {
        // 3a. If user exists, we're logging in via the 3rd party account
          if (userFB){
            console.log('userFB: ' + util.inspect(userFB))
            return userFB
          }
        // 3b. Otherwise create a user associated with the 3rd party account
          else{
            console.log('in save with 3rd party')
            console.log('account: ' + util.inspect(account))
            let user = new User()
            // user.local.email = account.emails[0].value
            // user.local.password = 'salt'+token
            user.facebook.id = account.id
            user.facebook.token = token
            user.facebook.email = account.emails[0].value
            user.facebook.name = account.displayName
            return await user.save()
          }
        }
      } else if (accountType === 'google'){
                let userGG = await User.promise.findOne({'google.id' : account.id})
        // 2. If req.user exists, we're authorizing (connecting an account)
        if (req.user){
          console.log('req.user: ' + util.inspect(req.user))
          console.log('userGG: ' + util.inspect(userGG))
        // 2a. Ensure it's not associated with another account
        // 2b. Link account
          if (!req.user.google.id && !userGG){
            console.log('in save')
            let user = await User.promise.findById(req.user._id)
            // user.local.email = req.user.local.email
            // user.local.password = req.user.local.password
            user.google.id = account.id
            user.google.token = token
            console.log('email: ' + util.inspect(account.emails))
            user.google.email = account.emails[0].value
            user.google.name = account.displayName
            return await user.save()
          }
        }
        // 3. If req.user does not exist, we're authenticating (logging in)
        else {
        // 3a. If user exists, we're logging in via the 3rd party account
          if (userGG){
            console.log('userGG: ' + util.inspect(userGG))
            return userGG
          }
        // 3b. Otherwise create a user associated with the 3rd party account
          else{
            console.log('in save with 3rd party')
            console.log('account: ' + util.inspect(account))
            let user = new User()
            // user.local.email = account.emails[0].value
            // user.local.password = 'salt'+token
            user.google.id = account.id
            user.google.token = token
            user.google.email = account.emails[0].value
            user.google.name = account.displayName
            return await user.save()
          }
        }
      } else if (accountType === 'twitter'){
        let userTW = await User.promise.findOne({'twitter.id' : account.id})
        // 2. If req.user exists, we're authorizing (connecting an account)
        if (req.user){
          console.log('req.user: ' + util.inspect(req.user))
          console.log('userTW: ' + util.inspect(userTW))
        // 2a. Ensure it's not associated with another account
        // 2b. Link account
          if (!req.user.twitter.id && !userTW){
            console.log('in save')
            let user = await User.promise.findById(req.user._id)
            // user.local.email = req.user.local.email
            // user.local.password = req.user.local.password
            user.twitter.id = account.id
            user.twitter.token = token
            user.twitter.username = account.username
            user.twitter.displayName = account.displayName
            return await user.save()
          }
        }
        // 3. If req.user does not exist, we're authenticating (logging in)
        else {
        // 3a. If user exists, we're logging in via the 3rd party account
          if (userTW){
            console.log('userTW: ' + util.inspect(userTW))
            return userTW
          }
        // 3b. Otherwise create a user associated with the 3rd party account
          else{
            console.log('in save with 3rd party')
            console.log('account: ' + util.inspect(account))
            let user = new User()
            // user.local.email = account.emails[0].value
            // user.local.password = 'salt'+token
            user.twitter.id = account.id
            user.twitter.token = token
            user.twitter.username = account.username
            user.twitter.displayName = account.displayName
            return await user.save()
          }
        }
      }

  }
}

function configure(config) {
  // Required for session support / persistent login sessions
  passport.serializeUser(nodeifyit(async (user) => user._id))
  passport.deserializeUser(nodeifyit(async (id) => {
    return await User.promise.findById(id)
  }))


  // useExternalPassportStrategy(LinkedInStrategy, {...}, 'linkedin')
  // useExternalPassportStrategy(LinkedInStrategy, {...}, 'facebook')
  // let conf = auth.config
  // console.log(config)
  useExternalPassportStrategy(FacebookStrategy, {
    clientID: config.facebookAuth.consumerKey,
    clientSecret: config.facebookAuth.consumerSecret,
    callbackURL: config.facebookAuth.callbackUrl
  }, 'facebook')
  // useExternalPassportStrategy(LinkedInStrategy, {...}, 'google')
  useExternalPassportStrategy(GoogleStrategy, {
    clientID:     config.googleAuth.clientID,
    clientSecret: config.googleAuth.clientSecret,
    callbackURL: config.googleAuth.callbackURL
  }, 'google')
  useExternalPassportStrategy(TwitterStrategy, {
    consumerKey:     config.twitterAuth.consumerKey,
    consumerSecret: config.twitterAuth.consumerSecret,
    callbackURL: config.twitterAuth.callbackURL
  }, 'twitter')
  // useExternalPassportStrategy(LinkedInStrategy, {...}, 'twitter')
  // passport.use('local-login', new LocalStrategy({...}, (req, email, password, callback) => {...}))
  // passport.use('local-signup', new LocalStrategy({...}, (req, email, password, callback) => {...}))
  passport.use('local-login', new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    failureFlash: true
  }, nodeifyit(async (username, password) => {
  let user
  if (username.indexOf('@') >= 0){
    let email = username.toLowerCase()
    user = await User.promise.findOne({'local.email': email})
    console.log('email')
  } else {
    return [false, {message: 'Invalid Email'}]
  }

  if (!user || username !== user.local.email) {
    // console.log("!user: " + (!user))
    // console.log("username !== user.username: " + (username !== user.username))
    // console.log('User: ' + user.username)
    return [false, {message: 'Invalid username'}]
  }

  if (!await user.validatePassword(password)) {
    return [false, {message: 'Invalid password'}]
  }
  return user
  }, {spread: true})))



  passport.use('local-signup', new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    failureFlash: true,
    passReqToCallback: true
  }, nodeifyit(async (req, email, password) => {
      email = (email || '').toLowerCase()
      // Is the email taken?
      if (await User.promise.findOne({'local.email': email})) {
        return [false, {message: 'That email is already taken.'}]
      }

      // let {username, title, description} = req.body
      let regexp = new RegExp(email, 'i')
      let query = {'local.email': {$regex: regexp}}
      if (await User.promise.findOne(query)) {
        return [false, {message: 'That username is already taken.'}]
      }
      // create the user
      let user = new User()
      user.local.email = email
      user.local.password = password
      try {
        return await user.save()
      } catch(e) {
        console.log(util.inspect(e))
        return [false, {message: e.message}]
      }
      return await user.save()
  }, {spread: true})))

  return passport
}

module.exports = {passport, configure}



