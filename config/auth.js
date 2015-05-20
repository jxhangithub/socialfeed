// config/auth.js
module.exports = {
  'development': {
    'facebookAuth': {
        'consumerKey': '835086106578849',
        'consumerSecret': 'c032b2d8322f641f93f530186b6fc824',
        'callbackUrl': 'http://socialauthenticator.com:8000/auth/facebook/callback',
        'accessToken': '924b46061df7993ed36c52415648b62e'
    },
    'googleAuth': {
        'clientID': '932897914441-q0kpj5ot4b9pq44jnsitce6ehvvl91bv.apps.googleusercontent.com',
        'clientSecret': 'XjltWmHxPI-IvQgjy2ha5eFg',
        'callbackURL': 'http://socialauthenticator.com:8000/auth/google/callback'
    },
    'twitterAuth': {
        'consumerKey': 'uecbUYDP3OeDahlSs9RjmoTqQ',
        'consumerSecret': 'SmROgEL78c18UBwamv3I369xreNPNO5ltlUQPlSFTGLyn7KN9O',
        'callbackUrl': 'http://socialauthenticator.com:8000/auth/twitter/callback',
        'accessTokenSecret': '3XDoVDZSDQ6o6tEHsvt8JsjkQyGrqawNxEWnmrftA4Jsg'
    }

  }
}
