let isLoggedIn = require('./middlewares/isLoggedIn')
let then = require('express-then')
let _ = require('lodash')
let posts = require('../data/posts')
let Twitter = require('twitter')
let util = require('util')
let FB = require('fb')

let networks ={
	twitter: {
	    network: {
	      icon: 'twitter',
	      name: 'Twitter',
	      class: 'btn-info'
	    }
	},
	facebook: {
		network: {
	      icon: 'facebook',
	      name: 'Facebook',
	      class: 'btn-primary'
    }
	}
}



module.exports = (app) => {
    let passport = app.passport
    let twitterConfig = app.config.auth.twitterAuth
    let facebookConfig = app.config.auth.facebookAuth

    app.get('/', (req, res) => res.render('index.ejs'))

    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user: req.user,
            message: req.flash('error')
        })
    })

    app.get('/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    app.get('/login', (req, res) => {
        res.render('login.ejs', {message: req.flash('error')})
    })

    app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}))

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {message: req.flash('error') })
    })

    app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash: true
	}))


	// Scope specifies the desired data fields from the user account
	let scopeFB = ['email', 'user_posts', 'read_stream', 'user_likes', 'publish_actions']
	let scopeTW = 'email'

	// Authentication route & Callback URL
	app.get('/auth/facebook', passport.authenticate('facebook', {scope:  scopeFB}))
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/profile',
		failureRedirect: '/profile',
		failureFlash: true
	}))

	// Authorization route & Callback URL
	app.get('/connect/facebook', passport.authorize('facebook', {scope:  scopeFB}))
	app.get('/connect/facebook/callback', passport.authorize('facebook', {
		successRedirect: '/profile',
		failureRedirect: '/profile',
		failureFlash: true
	}))

	let scope = ['email', 'profile']
	// Authentication route & Callback URL
	app.get('/auth/google', passport.authenticate('google', {scope}))
	app.get('/auth/google/callback', passport.authenticate('google', {
		successRedirect: '/profile',
		failureRedirect: '/profile',
		failureFlash: true
	}))

	// Authorization route & Callback URL
	app.get('/connect/google', passport.authorize('google', {scope}))
	app.get('/connect/google/callback', passport.authorize('google', {
		successRedirect: '/profile',
		failureRedirect: '/profile',
		failureFlash: true
	}))
		// Authentication route & Callback URL
	app.get('/auth/twitter', passport.authenticate('twitter', {scope}))
	app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect: '/profile',
		failureRedirect: '/profile',
		failureFlash: true
	}))

	// Authorization route & Callback URL
	app.get('/connect/twitter', passport.authorize('twitter', {scope}))
	app.get('/connect/twitter/callback', passport.authorize('twitter', {
		successRedirect: '/profile',
		failureRedirect: '/profile',
		failureFlash: true
	}))
	app.get('/timeline', isLoggedIn, then (async (req, res) => {
		FB.setAccessToken(req.user.facebook.token)
		// let {body} = await new Promise(resolve => FB.api('/me/home', resolve))
		let {data} = await new Promise((resolve, reject) => FB.api('me/home', resolve))
		
		// console.log('Facebook.body: ' + util.inspect(data))
		let fbMessages = data.map(fbMessage => {
			// console.log('fbMessage.likes: ' + util.inspect(fbMessage.likes))
			let liked = false
			if (fbMessage.likes){
				fbMessage.likes.data.forEach( like => {
					if (like.id === req.user.facebook.id) liked = true
				})
			}
			return {
				id: fbMessage.id,
				image: fbMessage.picture,
				text: fbMessage.message,
				name: 'Title: ' + fbMessage.name,
				username: 'From: ' + fbMessage.from.name,
				liked: liked,
				network: networks.facebook.network,
				createdAt: fbMessage.created_time,
				type: 'facebook'
			}
		})




		let twitterClient = new Twitter({
			consumer_key: twitterConfig.consumerKey,
			consumer_secret: twitterConfig.consumerSecret,
			access_token_key: req.user.twitter.token,
			access_token_secret: twitterConfig.accessTokenSecret,
		})
		// console.log('twitterClient: ' + util.inspect(twitterClient))
		// console.log('req.user: ' + util.inspect(req.user))
		let [tweets] = await twitterClient.promise.get('statuses/home_timeline')
		// console.log('tweets: ' + util.inspect(tweets))
		tweets = tweets.map(tweet => {
			return {
				id: tweet.id_str,
				image: tweet.user.profile_image_url,
				text: tweet.text,
				name: tweet.user.name,
				username: '@' + tweet.user.screen_name,
				liked: tweet.favorited,
				network: networks.twitter.network,
				createdAt: tweet.created_at,
				type: 'twitter'
			}
		})
		res.render('timeline.ejs', {
			// posts: tweets
			posts: fbMessages.concat(tweets)
		})

	}))
	app.get('/compose', isLoggedIn, (req, res) => {
		res.render('compose.ejs', {
			message: req.flash('error')
		})
	})
	app.post('/twitter/compose', isLoggedIn, then(async (req, res) => {
		let twitterClient = new Twitter({
			consumer_key: twitterConfig.consumerKey,
			consumer_secret: twitterConfig.consumerSecret,
			access_token_key: req.user.twitter.token,
			access_token_secret: twitterConfig.accessTokenSecret,
		})
		// console.log('req.body: ' + util.inspect(req.body))
		let status = req.body.reply
		if (status.length > 140) {
			return req.flash('error', 'Status is over 140 characters!')
		}
		if (!status) {
			req.flash('error', 'Status can not be empty!')
		}
		await twitterClient.promise.post('statuses/update', {status})
		res.redirect('/timeline')
	}))
	app.post('/facebook/compose', isLoggedIn, then(async (req, res) => {
		FB.setAccessToken(req.user.facebook.token)
		console.log('req.body: ' + util.inspect(req.body))
		console.log('req.user.facebook.token: ' + util.inspect(req.user.facebook.token))
		let status = req.body.reply
		if (status.length > 140) {
			return req.flash('error', 'Status is over 140 characters!')
		}
		if (!status) {
			req.flash('error', 'Status can not be empty!')
		}
		try{
			let response = await new Promise((resolve, reject) => 
				FB.api('me/feed', 'post', {message: status}, resolve))
			console.log(util.inspect(response))
		} catch (e){
			console.log(util.inspect(e))
		}
		// await twitterClient.promise.post('statuses/update', {status})
		res.redirect('/timeline')
	}))
	app.post('/twitter/like/:id', isLoggedIn, then(async (req, res) => {
		let twitterClient = new Twitter({
			consumer_key: twitterConfig.consumerKey,
			consumer_secret: twitterConfig.consumerSecret,
			access_token_key: req.user.twitter.token,
			access_token_secret: twitterConfig.accessTokenSecret,
		})
		let id = req.params.id
		console.log('req: ' + util.inspect(req))
		await twitterClient.promise.post('favorites/create', {id})
		res.end()
	}))
	app.post('/twitter/unlike/:id', isLoggedIn, then(async (req, res) => {
		let twitterClient = new Twitter({
			consumer_key: twitterConfig.consumerKey,
			consumer_secret: twitterConfig.consumerSecret,
			access_token_key: req.user.twitter.token,
			access_token_secret: twitterConfig.accessTokenSecret,
		})
		let id = req.params.id
		await twitterClient.promise.post('favorites/destroy', {id})
		res.end()
	}))
	app.post('/facebook/like/:id', isLoggedIn, then(async (req, res) => {
		FB.setAccessToken(req.user.facebook.token)
		let response = await new Promise((resolve, reject) => 
				FB.api(req.params.id + '/likes', 'post', resolve))
		// console.log('response.data: ' + util.inspect(response.data))
		
		res.end()
	}))
	app.post('/facebook/unlike/:id', isLoggedIn, then(async (req, res) => {
		FB.setAccessToken(req.user.facebook.token)
		let response = await new Promise((resolve, reject) => 
				FB.api(req.params.id + '/likes', 'delete', resolve))
		// console.log('response.data: ' + util.inspect(response.data))
		
		res.end()
	}))
	app.get('/twitter/share/:id', isLoggedIn, then(async (req, res) => {
		let twitterClient = new Twitter({
			consumer_key: twitterConfig.consumerKey,
			consumer_secret: twitterConfig.consumerSecret,
			access_token_key: req.user.twitter.token,
			access_token_secret: twitterConfig.accessTokenSecret,
		})
		let id = req.params.id
		let [tweet] = await twitterClient.promise.get('statuses/show', {id})
		console.log('tweet.user: ' + util.inspect(tweet))
		
		let post = {
				id: tweet.id_str,
				image: tweet.user.profile_image_url,
				text: tweet.text,
				name: tweet.user.name,
				username: '@' + tweet.user.screen_name,
				liked: tweet.favorited,
				network: networks.twitter,
				createdAt: tweet.created_at,
				type: 'twitter'
			}
		res.render('share.ejs', {
			post: post,
			message: req.flash('error')
		})
	}))
	app.post('/twitter/share/:id', isLoggedIn, then(async (req, res) => {
		let twitterClient = new Twitter({
			consumer_key: twitterConfig.consumerKey,
			consumer_secret: twitterConfig.consumerSecret,
			access_token_key: req.user.twitter.token,
			access_token_secret: twitterConfig.accessTokenSecret
		})
		let id = req.params.id
		console.log('req: ' + util.inspect(req.body))
		
		await twitterClient.promise.post('statuses/retweet/'+id)
			
		res.redirect('/timeline')
	}))
	app.get('/facebook/share/:id', isLoggedIn, then(async (req, res) => {
		let id = req.params.id
		FB.setAccessToken(req.user.facebook.token)
		// let {body} = await new Promise(resolve => FB.api('/me/home', resolve))
		let fbMessage = await new Promise((resolve, reject) => FB.api(id, resolve))
		
		// console.log('Facebook.fbMessage: ' + util.inspect(fbMessage))
		let liked = false
		if (fbMessage.likes){
			fbMessage.likes.data.forEach( like => {
				if (like.id === req.user.facebook.id) liked = true
			})
		}
		
		fbMessage = {
				id: fbMessage.id,
				image: fbMessage.picture,
				text: fbMessage.message,
				name: 'Title: ' + fbMessage.name,
				username: 'From: ' + fbMessage.from.name,
				liked: liked,
				network: networks.facebook.network,
				createdAt: fbMessage.created_time,
				type: 'facebook'
		}
		
		res.render('share.ejs', {
			post: fbMessage,
			message: req.flash('error')
		})
	}))
	app.post('/facebook/share/:id', isLoggedIn, then(async (req, res) => {

		let id = req.params.id
		// console.log('req: ' + util.inspect(req.body))
		let id_fragments = id.split('_')
        let link = "https://www.facebook.com/" + id_fragments[0] +'/posts/' +  id_fragments[1]


		let fbMessage = await new Promise((resolve, reject) => FB.api('me/links', 'post', {link: link}, resolve))
			
		res.redirect('/timeline')
	}))
	app.get('/twitter/reply/:id', isLoggedIn, then(async (req, res) => {
		let twitterClient = new Twitter({
			consumer_key: twitterConfig.consumerKey,
			consumer_secret: twitterConfig.consumerSecret,
			access_token_key: req.user.twitter.token,
			access_token_secret: twitterConfig.accessTokenSecret,
		})
		let id = req.params.id
		let [tweet] = await twitterClient.promise.get('statuses/show', {id})
		console.log('tweet.user: ' + util.inspect(tweet))
		
		let post = {
				id: tweet.id_str,
				image: tweet.user.profile_image_url,
				text: tweet.text,
				name: tweet.user.name,
				username: '@' + tweet.user.screen_name,
				liked: tweet.favorited,
				network: networks.twitter.network,
				createdAt: tweet.created_at,
				type: 'twitter'
			}
		res.render('reply.ejs', {
			post: post,
			message: req.flash('error')
		})
	}))
	app.post('/twitter/reply/:id', isLoggedIn, then(async (req, res) => {
		try {
		let twitterClient = new Twitter({
			consumer_key: twitterConfig.consumerKey,
			consumer_secret: twitterConfig.consumerSecret,
			access_token_key: req.user.twitter.token,
			access_token_secret: twitterConfig.accessTokenSecret
		})
		let id = req.params.id
		console.log('req: ' + util.inspect(req.body))
		let status = req.body.reply
		if (status.length > 140) {
			return req.flash('error', 'Status is over 140 characters!')
		}
		if (!status) {
			req.flash('error', 'Status can not be empty!')
		}
		
		await twitterClient.promise.post('statuses/update', {
			status: status,
			in_reply_to_status_id: id
		})
			
		} catch (e){
			console.log(e)
		}
		res.redirect('/timeline')
	}))
	app.get('/facebook/reply/:id', isLoggedIn, then(async (req, res) => {
		let id = req.params.id
		FB.setAccessToken(req.user.facebook.token)
		// let {body} = await new Promise(resolve => FB.api('/me/home', resolve))
		let fbMessage = await new Promise((resolve, reject) => FB.api(id, resolve))
		
		// console.log('Facebook.fbMessage: ' + util.inspect(fbMessage))
		let liked = false
		if (fbMessage.likes){
			fbMessage.likes.data.forEach( like => {
				if (like.id === req.user.facebook.id) liked = true
			})
		}
		
		fbMessage = {
				id: fbMessage.id,
				image: fbMessage.picture,
				text: fbMessage.message,
				name: 'Title: ' + fbMessage.name,
				username: 'From: ' + fbMessage.from.name,
				liked: liked,
				network: networks.facebook.network,
				createdAt: fbMessage.created_time,
				type: 'facebook'
		}
		
		res.render('reply.ejs', {
			post: fbMessage,
			message: req.flash('error')
		})
	}))
	app.post('/facebook/reply/:id', isLoggedIn, then(async (req, res) => {
		let id = req.params.id
		FB.setAccessToken(req.user.facebook.token)
		console.log('req: ' + util.inspect(req.body))
		let status = req.body.reply
		if (status.length > 140) {
			return req.flash('error', 'Status is over 140 characters!')
		}
		if (!status) {
			req.flash('error', 'Status can not be empty!')
		}
		let response = await new Promise((resolve, reject) => 
			FB.api( id + '/comments', 'post', {message: status}, resolve))
		console.log('Comment response: ' + util.inspect(response))
		res.redirect('/timeline')
	}))


}
