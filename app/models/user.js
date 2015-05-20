let mongoose = require('mongoose')
let bcrypt = require('bcrypt')
let nodeify = require('nodeify')
require('songbird')
let userSchema = mongoose.Schema({
  // userModel properties here...
  local: {
    email: String,
    password: String,
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
    google: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  twitter: {
    id: String,
    token: String,
    username: String,
    displayName: String
  },
})

// userSchema.methods.generateHash = async function(password) {
//   throw new Error('Not Implemented.')
// }
userSchema.methods.generateHash = async function(password) {
  return await bcrypt.promise.hash(password, 8)
}

// userSchema.methods.validatePassword = async function(password) {
//   throw new Error('Not Implemented.')
// }
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.promise.compare(password, this.local.password)
}

userSchema.methods.linkAccount = function(type, values) {
  // linkAccount('facebook', ...) => linkFacebookAccount(values)
  return this['link'+_.capitalize(type)+'Account'](values)
}

userSchema.methods.linkLocalAccount = function({email, password}) {
  throw new Error('Not Implemented.')
}

userSchema.methods.linkFacebookAccount = function({account, token}) {
  throw new Error('Not Implemented.')
}

userSchema.methods.linkTwitterAccount = function({account, token}) {
  throw new Error('Not Implemented.')
}

userSchema.methods.linkGoogleAccount = function({account, token}) {
  throw new Error('Not Implemented.')
}

userSchema.methods.linkLinkedinAccount = function({account, token}) {
  throw new Error('Not Implemented.')
}

userSchema.methods.unlinkAccount = function(type) {
  throw new Error('Not Implemented.')
}


userSchema.pre('save', function(callback) {
  nodeify(async() => {
    if(!this.isModified("local.password") 
      && !this.isModified("facebook") 
      && !this.isModified("google")) return callback()
    if(this.local.password) this.local.password = await this.generateHash(this.local.password)
  }(), callback)
})

userSchema.path('local.password').validate((pw) => {
  return pw.length >= 4 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw)
})

module.exports = mongoose.model('User', userSchema)




