
/*
# RUN THE BOT:
  Follow the instructions here to set up your Facebook app and page:
    -> https://developers.facebook.com/docs/messenger-platform/implementation

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:
  Botkit has many features for building cool and useful bots!
  Read all about it here:
    -> http://howdy.ai/botkit
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

if (!process.env.page_token) {
	console.log('Error: Specify page_token in environment');
	process.exit(1);
}

if (!process.env.verify_token) {
	console.log('Error: Specify verify_token in environment');
	process.exit(1);
}

if (!process.env.app_secret) {
	console.log('Error: Specify app_secret in environment');
	process.exit(1);
}

const Botkit = require('./node_modules/botkit/lib/Botkit.js');
const os = require('os');
const url = require('url');
const commandLineArgs = require('command-line-args');
const localtunnel = require('localtunnel');
const pg = require('pg');
const request = require('request');
const express = require('express');

// Postgres setting
pg.defaults.ssl = true;

let pgPool;

if(process.env.DATABASE_URL) {
	const poolParams = url.parse(process.env.DATABASE_URL || 'postgres://localhost:5432/chatbot');
	const poolAuth = poolParams.auth.split(':');

	const poolConfig = {
		user: poolAuth[0],
		password: poolAuth[1],
		host: poolParams.hostname,
		port: poolParams.port,
		database: poolParams.pathname.split('/')[1],
		ssl: true
	};

	pgPool = new pg.Pool(poolConfig);
} else {
	pgPool = new pg.Pool();
}

pgPool.on('error', function(err, client) {
	console.error('idle client error', err.message, err.stack)
});

const ops = commandLineArgs([
	{
		name: 'lt', alias: 'l', args: 1, description: 'Use localtunnel.me to make your bot available on the web.',
		type: Boolean, defaultValue: false
	},
	{
		name: 'ltsubdomain', alias: 's', args: 1,
		description: 'Custom subdomain for the localtunnel.me URL. This option can only be used together with --lt.',
		type: String, defaultValue: null
	},
]);

if (ops.lt === false && ops.ltsubdomain !== null) {
	console.log("error: --ltsubdomain can only be used together with --lt.");
	process.exit();
}

const controller = Botkit.facebookbot({
	debug: false,
	log: true,
	access_token: process.env.page_token,
	verify_token: process.env.verify_token,
	app_secret: process.env.app_secret,
	validate_requests: true, // Refuse any requests that don't come from FB on your receive webhook, must provide FB_APP_SECRET in environment variables
	receive_via_postback: true
});

const bot = controller.spawn({
});

bot.utterances = {
	yes: /^(ja|jupp|mhm|jadå|okej|okay|sure|ok|j|y|yeah|yah|yes|yea|yup|yep|ya)/i,
	no: /^(nej|nepp|näpp|nähä|nä|nehe|no|nah|nope|n|nevermind|never mind)/i,
	quit: /^(sluta|stopp|quit|cancel|end|stop)/i
};

controller.setupWebserver(process.env.PORT || 3000, function(err, webserver) {
	controller.createWebhookEndpoints(webserver, bot, function() {
		webserver.get('/', function(request, response) {
			response.send('Hello! I am bot.');
		});

		webserver.use(express.static('public'));

		console.log('ONLINE!');

		if (ops.lt) {
			var tunnel = localtunnel(process.env.PORT || 3000, { subdomain: ops.ltsubdomain }, function(err, tunnel) {
				if (err) {
					console.log(err);
					process.exit();
				}
				console.log("Your bot is available on the web at the following URL: " + tunnel.url + '/facebook/receive');
			});

			tunnel.on('close', function() {
				console.log("Your bot is no longer available on the web at the localtunnnel.me URL.");
				process.exit();
			});
		}
	});
});

controller.api.thread_settings.greeting('Hej {{user_first_name}}, välkommen till Berwaldboten.');
controller.api.thread_settings.get_started('Get Started Payload');
controller.api.thread_settings.menu([
	{
		"type": "postback",
		"title": "Hej",
		"payload": "Hej Hej"
	},
	{
		"type": "postback",
		"title": "Hjälp",
		"payload": "Hjälp"
	},
	{
		"type": "web_url",
		"title": "Hemsida",
		"url": "https://sverigesradio.se/berwaldhallen"
	},
]);

// controller.on('facebook_postback', function(bot, message) {
// 	// console.log(bot, message);
// 	if(message.payload === 'Get Started Payload') {
		
// 	}
// });

controller.hears(['^(Get Started)'], 'message_received', function(bot, message) {
	bot.reply(message, {
		text: 'Hej och välkommen till Berwaldhallens chatbot! Du kan välja ett av alternativen här under eller skriva \'hjälp\' för mer information.',
		quick_replies: [
			{
				"content_type": "text",
				"title": "Vem är du?",
				"payload": "Vem är du?",
			},
			{
				"content_type": "text",
				"title": "Ge mig artistinfo",
				"payload": "artistinfo",
			}
		]
	});
});

controller.hears(['^(Hjälp)'], 'message_received', function(bot, message) {
	bot.reply(message, {
		text: 'Du kan välja ett av alternativen här under eller skriva t.ex. "artist Tommy Sjöberg", "hej" eller "berwaldhallen".',
		quick_replies: [
			{
				"content_type": "text",
				"title": "Vem är du?",
				"payload": "Vem är du?",
			},
			{
				"content_type": "text",
				"title": "Ge mig artistinfo",
				"payload": "artistinfo",
			},
			{
				"content_type": "text",
				"title": "Om Berwaldhallen",
				"payload": "berwaldhallen",
			}
		]
	});
});

controller.hears(['quick'], 'message_received', function(bot, message) {

	bot.reply(message, {
		text: 'Hey! This message has some quick replies attached.',
		quick_replies: [
			{
				"content_type": "text",
				"title": "Yes",
				"payload": "yes",
			},
			{
				"content_type": "text",
				"title": "No",
				"payload": "no",
			}
		]
	});

});

controller.hears(['^hej', '^hallå', '^tja'], 'message_received', function(bot, message) {
	controller.storage.users.get(message.user, function(err, user) {
		if (user && user.nickname) {
			bot.reply(message, 'Hej, ' + user.nickname + '!😊');
		} else {
			user = {
				id: message.user
			};

			getUser(user.id).then(result => {
				user = result;
			}).catch(err => {
				console.error('No user information:',err);
			}).then(() => {
				bot.reply(message, user.hasOwnProperty('nickname') ? 'Hej, ' + user.nickname + '!😊' : 'Hallå där.');
			});
		}
	});
});

controller.hears(['^((om )?(berwald(hallen)?))'], 'message_received', function(bot, message) {
	let aboutText = 'Konserthuset Berwaldhallen, med Sveriges Radios Symfoniorkester och Radiokören, är en del av Sveriges Radio och en av landets viktigaste kulturinstitutioner med räckvidd långt utanför landets gränser. \nBerwaldhallen är hemmascen för de två ensemblerna Sveriges Radios Symfoniorkester och Radiokören, som båda tillhör de yppersta i Europa inom sina respektive fält. Genom turnéer och framträdanden världen över, har de även blivit viktiga ambassadörer för svensk musik och kultur utomlands.';

	console.log('Sending about text...');
	bot.reply(message, aboutText);

	console.log('Start typing...')
	bot.startTyping(message, () => {
		setTimeout(() => {
			console.log('Sending template...');
			bot.reply(message, 'template');
		}, 2400)
		// bot.reply(message, {
		// 	attachment: {
		// 		'type': 'template',
		// 		'payload': {
		// 			'template_type': 'generic',
		// 			'elements': [
		// 				{
		// 					'title': 'Läs mer här',
		// 					'default_action': {
		// 						'type': 'web_url',
		// 						'url': 'https://sverigesradio.se/sida/artikel.aspx?programid=3991&artikel=5848176',
		// 						'webview_height_ratio': 'tall',
		// 						'fallback_url': 'https://sverigesradio.se/berwaldhallen'
		// 					},
		// 					'buttons': [
		// 						{
		// 							'type': 'web_url',
		// 							'url': 'https://sverigesradio.se/sida/artikel.aspx?programid=3991&artikel=5848176',
		// 							'title': 'Läs mer'
		// 						}
		// 					]
		// 				}
		// 			]
		// 		}
		// 	}
		// });
	});
});

controller.hears(['^(visa)( alla)? användare', '^användare'], 'message_received', function(bot, message) {
	pgPool.query('SELECT first_name FROM users;', (err, res) => {
		if (err) {
			bot.reply(message, 'Tyvärr kunde jag inte visa alla användare. Låt oss prata om något annat😊');
			return console.error('error running query', err);
		}

		let userNames = 'Alla användare:';
		res.rows.forEach((row) => {
			userNames += ' ' + row.first_name;
		})

		bot.reply(message, userNames);
	});
});

controller.hears(['silent push'], 'message_received', function(bot, message) {
	reply_message = {
		text: "This message will have a push notification on a mobile phone, but no sound notification",
		notification_type: "SILENT_PUSH"
	}
	bot.reply(message, reply_message)
})

controller.hears(['no push'], 'message_received', function(bot, message) {
	reply_message = {
		text: "This message will not have any push notification on a mobile phone",
		notification_type: "NO_PUSH"
	}
	bot.reply(message, reply_message)
})

controller.hears(['artistinfo$', 'artist$'], 'message_received', function(bot, message) {

	bot.startConversation(message, function(err, convo) {
		if (!err) {
			convo.ask({
				text: 'Vilken artist vill du veta mer om?🤔', 
				quick_replies: [{
					content_type: 'text',
					title: 'Tommy Körberg',
					payload: 'Tommy Körberg'
				}, {
					content_type: 'text',
					title: 'Christian Gerhaher',
					payload: 'Christian Gerhaher'
				}, {
					content_type: 'text',
					title: 'Nujabes',
					payload: 'Nujabes'
				}]
			}, function(response, convo) {
				bot.startTyping(message, () => {
					getArtistInfo(response.text).then(artist => {
						console.log('Artist info is in, let\'s send it!');
						sendArtistInfo(message, artist);
						bot.stopTyping(message, () => {
							convo.next();
						});
					}).catch(error => {
						bot.stopTyping(message, () => {
							console.error(error);
							convo.stop();
						});
					});
				});

			});

			convo.on('end', function(convo) {
				if (convo.status !== 'completed') {
					// this happens if the conversation ended prematurely for some reason
					bot.reply(message, 'Jag gjorde något fel🙈 Försök gärna igen!');
				}
			});
		}
	});
});

controller.hears(['^artistinfo (.*)', '^artist (.*)'], 'message_received', function(bot, message) {
	let artistName = message.match[1];

	bot.startTyping(message, () => {
		getArtistInfo(artistName).then(artist => {
			console.log('Artist info is in, let\'s send it!');
			bot.stopTyping(message, () => {
				sendArtistInfo(message, artist);
			});
		}).catch(error => {
			bot.stopTyping(message, () => {
				console.error(error);
				bot.reply(message, 'Kunde inte hitta artistinfo. :(');
			});
		});
	});
});


controller.hears(['kalla mig (.*)', 'jag heter (.*)'], 'message_received', function(bot, message) {
	var name = message.match[1];
	controller.storage.users.get(message.user, function(err, user) {
		if (!user) {
			user = {
				id: message.user,
			};
		}

		// Insert into database
		setNickname(user, name).then(newUser => {
			user = newUser;
		}).catch(error => {
			console.error(error);
		});

		controller.storage.users.save(user, function(err, id) {
			bot.reply(message, 'Okej, jag ska kalla dig ' + user.nickname + ' från och med nu.');
		});
	});
});

controller.hears(['vad heter jag', 'vem är jag'], 'message_received', function(bot, message) {
	controller.storage.users.get(message.user, function(err, user) {
		if (user && user.nickname) {
			bot.reply(message, 'Du heter ' + user.nickname + '😉');
		} else {
			user = {
				id: message.user
			};

			getUser(user.id).then(result => {
				user = result;
			}).catch(err => {
				console.error('No user information:',err);
			});

			if(!user.hasOwnProperty('nickname')) {
				bot.startConversation(message, function(err, convo) {
					if (!err) {
						convo.say('Jag vet inte vad du vill bli kallad än!');
						convo.ask('Vad kan jag kalla dig?🤔', function(response, convo) {
							convo.ask('Ska jag kalla dig `' + response.text + '`❓', [
								{
									pattern: bot.utterances.yes,
									callback: function(response, convo) {
										// since no further messages are queued after this,
										// the conversation will end naturally with status == 'completed'
										convo.next();
									}
								},
								{
									pattern: bot.utterances.no,
									callback: function(response, convo) {
										// stop the conversation. this will cause it to end with status == 'stopped'
										convo.stop();
									}
								},
								{
									default: true,
									callback: function(response, convo) {
										convo.repeat();
										convo.next();
									}
								}
							]);

							convo.next();

						}, { 'key': 'nickname' }); // store the results in a field called nickname

						convo.on('end', function(convo) {
							if (convo.status === 'completed') {
								bot.reply(message, 'Okej! Uppdaterar min databas...🤖');

								controller.storage.users.get(message.user, function(err, user) {
									if (!user) {
										user = {
											id: message.user,
										};
									}

									setNickname(user, convo.extractResponse('nickname')).then(newUser => {
										user = newUser;
									}).catch(error => {
										console.error(error);
									});

									controller.storage.users.save(user, function(err, id) {
										bot.reply(message, 'Sådär. Jag kommer kalla dig ' + user.nickname + ' från och med nu.👍');
									});
								});

							} else {
								// this happens if the conversation ended prematurely for some reason
								bot.reply(message, 'Okej! Strunt samma.😌');
							}
						});
					}
				});
			} else { // User gotten from database
				bot.reply(message, 'Du heter ' + user.nickname + '😉')
			}
			
		}
	});
});

controller.hears(['shutdown'], 'message_received', function(bot, message) {

	bot.startConversation(message, function(err, convo) {

		convo.ask('Är du säker på att du vill att jag ska stängas av?😨', [
			{
				pattern: bot.utterances.yes,
				callback: function(response, convo) {
					convo.say('Hej då😢');
					convo.next();
					setTimeout(function() {
						process.exit();
					}, 3000);
				}
			},
			{
				pattern: bot.utterances.no,
				default: true,
				callback: function(response, convo) {
					convo.say('*Phew!*😓');
					convo.next();
				}
			}
		]);
	});
});


controller.hears(['vem är du', 'identifiera dig', 'status', 'vad heter du'], 'message_received', 
	function(bot, message) {

		var hostname = os.hostname();
		var uptime = formatUptime(process.uptime());

		bot.reply(message,
			'🤖Jag är en bot🤖 Jag har varit igång i ' + uptime + ' på ' + hostname + '.');
});

controller.on('message_received', function(bot, message) {
	bot.reply(message, 'Testa: \'Vad heter jag?\', \'artistinfo\' eller \'Kalla mig Kalle\'');
	return false;
});


function formatUptime(uptime) {
	var unit = 'sekunder';
	if (uptime/60 > 119) {
		uptime = uptime / 60;
		unit = 'timmar';
	}
	if (uptime/60 > 60) {
		uptime = uptime / 60;
		unit = 'timme';
	}
	else if(uptime > 119) {
		uptime = uptime / 60;
		unit = 'minuter';
	}
	else if (uptime > 60) {
		uptime = uptime / 60;
		unit = 'minut';
	}

	uptime = uptime + ' ' + unit;
	return uptime;
}

function getArtistInfo(name) {
	return new Promise((resolve, reject) => {
		var options = {
			// url: 'http://api.musicgraph.com/api/v2/artist/suggest?api_key='+
			// 	process.env.music_graph_key+'&prefix='+encodeURIComponent(name)+'&limit=1',
			url: 'https://api.spotify.com/v1/search?q='+encodeURIComponent(name)+'&type=artist',
			headers: {
				'User-Agent': 'request'
			},
			host: 'api.spotify.com'
		}
		request.get(options, (error, resp, body) => {
			if (error || resp.statusCode !== 200) {
				console.error('Could not get artist information.', error);
				console.error(resp.statusCode, resp.body);
				reject(error);
			} else {
				try {
					var data = JSON.parse(body);
					console.log('Search result:', data);

					if (data.artists.items.length === 0) {
						console.log('No results in artist search. :(');
						reject('No artist found.');
					} else {
						let artist = data.artists.items[0];
						console.log('Artist data:', artist);

						resolve(artist);
					}
				} catch(e) {
					console.error('Invalid JSON in body.');
					reject(e);
				}
				
					// request.get('https://api.spotify.com/v1/artists/' + artist.spotify_id,
					// 	(error, resp, body) => {
					// 	if (error) {
					// 		console.log('Could not get Spotify data.');
					// 		reject(error);
					// 	} else {
					// 		try {
					// 			data = JSON.parse(body);
					// 			artist.spotify = data;
					// 			resolve(artist);
					// 		} catch(e) {
					// 			console.log('Invalid JSON in body.');
					// 			reject(e);
					// 		}
					// 	}
					// });
			}
		});
	});
}

function sendArtistInfo(message, artist) {
	bot.reply(message, {
		attachment: {
			'type': 'template',
			'payload': {
				'template_type': 'list',
				'top_element_style': 'large',
				'elements': [
					{
						'title': artist.name.toUpperCase(),
						'image_url': artist.images.length>1 ? artist.images[1].url : 'https://chatbot-test-1337.herokuapp.com/images/note.png',
						'subtitle': 'Missa inte detta möte mellan '+artist.name.split(' ')[0]+' och Sveriges Radios Symfoniorkester.',
						'default_action': {
							'type': 'web_url',
							'url': 'https://sverigesradio.se/berwaldhallen',
							'messenger_extensions': true,
							'webview_height_ratio': 'tall',
							'fallback_url': 'https://sverigesradio.se/berwaldhallen'
						},
						'buttons': [
							{
								'title': 'Info & Bokning',
								'type': 'web_url',
								'url': 'https://sverigesradio.se/berwaldhallen',
								'messenger_extensions': true,
								'webview_height_ratio': 'tall',
								'fallback_url': 'https://sverigesradio.se/berwaldhallen'
							}
						]
					},
					{
						'title': 'Lyssna på Spotify',
						'image_url': 'https://chatbot-test-1337.herokuapp.com/images/spotify.png',
						'subtitle': artist.name,
						'default_action': {
							'type': 'web_url',
							'url': artist.external_urls.spotify,
							'webview_height_ratio': 'compact',
						},
						'buttons': [
							{
								'title': 'Lyssna',
								'type': 'web_url',
								'url': artist.external_urls.spotify,
								'webview_height_ratio': 'compact',
							}
						]
					},
					{
						'title': 'Läs mer på Wikipedia',
						'image_url': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png',
						'subtitle': artist.name,
						'default_action': {
							'type': 'web_url',
							'url': 'https://sv.wikipedia.org/wiki/'+artist.name.split(' ').join('_'),
							'webview_height_ratio': 'full',
						},
						'buttons': [
							{
								'title': 'Läs mer på Wikipedia',
								'type': 'web_url',
								'url': 'https://sv.wikipedia.org/wiki/'+artist.name.split(' ').join('_'),
								'webview_height_ratio': 'full',
							}
						]
					}
				]
				// ,
				// 'buttons': [
				// 	{
				// 		'type':'web_url',
				// 		'url':'https://sv.wikipedia.org/wiki/'+artist.name.split(' ').join('_'),
				// 		'title':'Läs mer',
				// 		'webview_height_ratio': 'full'
				// 	}
				// ]
			}
		}
	}, (err, response) => {
		if(err)
			console.error(err);
	});
}

function setNickname(user, nickname) {
	user.nickname = nickname;

	return new Promise((resolve, reject) => {
		pgPool.connect((err, client, done) => {
			if (err) reject(done(err));

			client.query('SELECT first_name, last_name FROM users WHERE id=($1);', [user.id], (err, res) => {
				if (err) {
					reject(err);
				}

				console.log("> SELECT :", res);

				if (res.rows.length === 1) { // User found in database
					user.first_name = res.rows[0].first_name;
					user.last_name = res.rows[0].last_name;

					client.query(
						'UPDATE users SET nickname=($1) WHERE id=($2);',
						[user.nickname, user.id],
						(err, res) => {
							done();
							if (err) {
								reject(err);
							}
							console.log("UPDATE users");
							resolve(user);
					});
				} else { // User not in database
					getFacebookUserInfo(user).then(data => {
						client.query(
						'INSERT INTO users (nickname, first_name, last_name, id) VALUES (($1), ($2), ($3) ($4));',
						[user.nickname, data.first_name, data.last_name, user.id],
						(err, res) => {
							done();
							if (err) {
								reject(err);
							}

							console.log("INSERT INTO users");
							user.first_name = data.first_name;
							user.last_name = data.last_name;

							resolve(user);
						});
					}).catch(e => {
						reject(e);
					});
				}
			});
		});
	});
}

function getFacebookUserInfo(user) {
	return new Promise((resolve, reject) => {
		request.get('https://graph.facebook.com/v2.8/'+
		user.id+'?fields=first_name,last_name,profile_pic,locale,gender&access_token='+
		process.env.page_token, (error, resp, body) => {
			if (error) {
				console.error('Could not get user information.');
				reject(error);
			} else {
				try {
					var data = JSON.parse(body);
					console.log(data);
					resolve(data);
				} catch(e) {
					reject(e);
				}
			}
		});
	});
}

function getUser(userId) {
	return new Promise((resolve, reject) => {
		pgPool.connect((err, client, done) => {
			if (err) reject(done(err));

			client.query('SELECT * FROM users WHERE id=($1);', [userId], (err, res) => {
				if (err) {
					console.error('Query problems');
					reject(err);
				}

				if (res.rows.length === 1) { // User found in database
					let user = res.rows[0];
					
					controller.storage.users.save(user, function(err, id) {
						if(err) {
							console.error('Save problems');
							reject(err);
						}
					});
					resolve(user);
				} else { // User not in database
					reject(new Error('no user found'));
				}
			});
		});
	});
}