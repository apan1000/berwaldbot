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
const firebaseStorage = require('botkit-storage-firebase')({databaseURL: 'https://berwaldboten.firebaseio.com/'});
const os = require('os');
const url = require('url');
const dns = require('dns');

const commandLineArgs = require('command-line-args');
const localtunnel = require('localtunnel');

const request = require('request');
const express = require('express');

const schedule = require('node-schedule');
const information = require('./info');

const dayNames = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const timeouts = [];
const images_url = 'http://www.csc.kth.se/~fberglun/exjobb/images/';

const typing_message = {
	sender_action: 'typing_on'
};

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
	receive_via_postback: true,
	storage: firebaseStorage
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

controller.middleware.receive.use(function(bot, message, next) {
	clearSavedTimeouts();
    next();
});

controller.middleware.capture.use(function(bot, message, convo, next) {

    // user's raw response is in message.text

    // instead of capturing the raw response, let's use the hidden payload
    if (message.payload) {
		console.log('Payload: ',message.payload);
        message.text = message.payload;
    }

    // always call next!
    next();

});

// Send information message about the concert after specified date and time
const infoDate = new Date(2017, 3, 5, 10);
let j = schedule.scheduleJob(infoDate, function(){
	console.log('Time to send information! Woohoo!.');
	// 'Hej!\nJag har hört att du ska gå på konserten Solistprisvinnaren. Vad kul!'

	// TODO: Skicka info om konsert
	const users = controller.storage.users.all(function(err, users) {
		if(err) {
			bot.reply(message, 'Hörde att du ska gå på konserten Solistprisvinnaren😊 Fråga mig gärna om den :)');
			return console.error('error getting users', err);
		}

		users.forEach((user) => {
			//TODO: start conversation
			bot.startConversation();
		});
	});
});

controller.api.thread_settings.greeting('Hej {{user_first_name}}, välkommen till Berwaldboten.');
controller.api.thread_settings.get_started('Get Started Payload');
controller.api.thread_settings.menu([
	{
		"type": "postback",
		"title": "Hej",
		"payload": "Hej"
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

controller.hears(['^(Get Started Payload)'], 'message_received', function(bot, message) {
	let user = {
		id: message.user,
		first_message: message
	};

	user.first_message.referral = ''; // Was undefined

	getFacebookUserInfo(user).then(data => {
		user.first_name = data.first_name;
		user.last_name = data.last_name;

		controller.storage.users.save(user, (err, id) => {
			if (err) {
				console.error('Error saving user:',err);
			}

			console.log('> INSERT INTO users, DONE');
		});
	}).catch(e => {
		console.error(e);
	});

	bot.reply(message, {
		text: 'Hej och välkommen till Berwaldhallens chatbot! Du kan välja ett av alternativen här under eller skriva \'hjälp\' för mer information.',
		quick_replies: [
			{
				"content_type": "text",
				"title": "Kommande konserter",
				"payload": "konserter",
			},
			{
				"content_type": "text",
				"title": "Ge mig artistinfo",
				"payload": "artistinfo",
			},
			{
				"content_type": "text",
				"title": "Om Berwaldhallen",
				"payload": "berwaldhallen"
			},
		]
	});
});

controller.hears(['(hjälp|meny)'], 'message_received', function(bot, message) {
	bot.reply(message, {
		text: 'ℹ️ Du kan välja ett av alternativen här under eller skriva t.ex. "artist Sebastian Stevensson", "hej" eller "om berwaldhallen".',
		quick_replies: [
			{
				"content_type": "text",
				"title": "Kommande konserter",
				"payload": "konsertinfo"
			},
			{
				"content_type": "text",
				"title": "Ge mig artistinfo",
				"payload": "artistinfo"
			},
			{
				"content_type": "text",
				"title": "Om Berwaldhallen",
				"payload": "berwaldhallen"
			},
		]
	});
});

controller.hears(['^(http|www\.)'], 'message_received', function(bot, message) {
	bot.reply(message, 'Fin webbadress :) Skulle säkert gått in och kollat om jag var en människa😞');
});

controller.hears(['^(hej|hallå|tja|yo|hey|tjen)'], 'message_received', function(bot, message) {
	controller.storage.users.get(message.user, function(err, user) {
		if (user && user.nickname) {
			bot.reply(message, 'Hej, ' + user.nickname + '!😊');
		} else {
			user = {
				id: message.user
			};

			getUser(user.id).then(result => {
				user = result;
				bot.reply(message, user.hasOwnProperty('nickname') ? 'Hej, ' + user.nickname + '!😊' : 'Hallå där😎');
			}).catch(err => {
				console.error('No user information:',err);
			});
		}
	});
});

controller.hears(['^(((berätta )?om )?(berwald(hallen)?))'], 'message_received', function(bot, message) {
	const bwh = information.berwaldhallen;

	console.log('Sending short text...');
	bot.reply(message, bwh.shortDesc);

	// Typing
	timeouts.push(setTimeout(() => {
		bot.reply(message, typing_message);

		// Long description 0
		timeouts.push(setTimeout(() => {
			console.log('Sending long text...');
			bot.reply(message, bwh.longDesc[0]);

			// Typing
			timeouts.push(setTimeout(() => {
				bot.reply(message, typing_message);

				// Long description 1
				timeouts.push(setTimeout(() => {
					console.log('Sending long text...');
					bot.reply(message, bwh.longDesc[1]);

					// Typing
					timeouts.push(setTimeout(() => {
						bot.reply(message, typing_message);

						// Template
						timeouts.push(setTimeout(() => {
							console.log('Sending template...');
							bot.reply(message, {
								attachment: {
									type: 'template',
									payload: {
										template_type: 'generic',
										elements: [
											{
												title: 'Berwaldhallens historia',
												image_url: 'https://static-cdn.sr.se/sida/images/3991/2624678_450_295.jpg',
												subtitle: 'Läs om Berwaldhallens historia',
												default_action: {
													type: 'web_url',
													url: bwh.history_url,
													webview_height_ratio: 'tall'
												},
												buttons: [
													{
														title: 'Historia',
														type: 'web_url',
														url: bwh.history_url,
														webview_height_ratio: 'tall'
													}
												]
											}
										]
									}
								}
							}, (err, response) => {
								if(err)
									console.error(err);
							});
						}, 1000)); // Template
					}, 500)); // Start typing
				}, 7000)); // Long description 1
			}, 5000)); // Start typing
		}, 6000)); // Long description 0
	}, 2500)); // Start typing
});

// controller.hears(['^(visa)( alla)? användare', '^användare'], 'message_received', function(bot, message) {
// 	const users = controller.storage.users.all(function(err, users) {
// 		if(err) {
// 			bot.reply(message, 'Tyvärr kunde jag inte visa alla användare. Låt oss prata om något annat😊');
// 			return console.error('error getting users', err);
// 		}

// 		let userNames = 'Alla användare:';
// 		users.forEach((user) => {
// 			userNames += ' ' + user.first_name;
// 		});

// 		bot.reply(message, userNames);
// 	});
// });

controller.hears(['spotify'], 'message_received', function(bot, message) {
	// bot.reply(message, typing_message);

	// setTimeout(() => {
	// 	console.log('Sending template...');
	// 	bot.reply(message, {
	// 		attachment: {
	// 			type: 'template',
	// 			payload: {
	// 				template_type: 'generic',
	// 				elements: [
	// 					{
	// 						title: 'Berwaldhallens Spotifylista',
	// 						image_url: 'http://ttimg.nu/100/event/lek.jpg',
	// 						subtitle: 'Lyssna på kommande konserter',
	// 						default_action: {
	// 							type: 'web_url',
	// 							url: 'http://open.spotify.com/user/berwaldhallen/playlist/0jNERhOXHnAJEEdvn7ARXO',
	// 							webview_height_ratio: 'tall'
	// 						},
	// 						buttons: [
	// 							{
	// 								title: 'Lyssna',
	// 								type: 'web_url',
	// 								url: 'http://open.spotify.com/user/berwaldhallen/playlist/0jNERhOXHnAJEEdvn7ARXO',
	// 								webview_height_ratio: 'tall'
	// 							}
	// 						]
	// 					}
	// 				]
	// 			}
	// 		}
	// 	}, (err, response) => {
	// 		if(err)
	// 			console.error(err);
	// 	});
	// });
	bot.reply(message, 'Berwaldhallens Spotifylista: http://open.spotify.com/user/berwaldhallen/playlist/0jNERhOXHnAJEEdvn7ARXO');
});

controller.hears(['(.*)konsert(er(na)?)?'], 'message_received', function(bot, message) {
	bot.startConversation(message, askConcert);
});

controller.hears(['solistprisvinnaren'], 'message_received', function(bot, message) {
	bot.startConversation(message, function(err, convo) {
		if (!err) {
			askConcertInfo(message, convo);

			convo.on('end', function(convo) {
				if (convo.status !== 'completed') {
					// this happens if the conversation ended prematurely for some reason
					bot.reply(convo.source_message, 'Okej! Vi pratar om något annat :)');
				}
				setTimeout(function() {
					sendDefaultQuickReplies(convo.source_message, false);
				}, 300);
			});
		}
	});
});

controller.hears(['artistinfo$', 'artist$', 'medverkande$'], 'message_received', function(bot, message) {
	let error = false;
	let artistText = 'artist';
	if(message.match[message.match.length-1] == 'medverkande')
		artistText = 'medverkande';
	
	let participantNames = [];
	let participants = {};
	for(let p of information.concert.participants) {
		if(p.name.length > 20) {
			participantNames.push(p.name.substr(0, 17)+'...');
			p.payload = p.name;
			participants[p.name.substr(0, 17)+'...'] = p;
		} else {
			participantNames.push(p.name);
			p.payload = p.name;
			participants[p.name] = p;
		}
	}

	let quickReplies = [];
	for(let n of participantNames) {
		quickReplies.push({
			content_type: 'text',
			title: n,
			image_url: participants[n].image,
			payload: participants[n].payload
		});
	}

	quickReplies.push(
		{
			content_type: 'text',
			title: '🚫 Avsluta',
			payload: 'stopp'
		}
	);
	
	bot.startConversation(message, function(err, convo) {
		if (!err) {
			convo.ask({
				text: 'Vilken '+artistText+' vill du veta mer om?🤔',
				quick_replies: quickReplies
			}, [
				{
					pattern: new RegExp(participantNames.join('|'), 'i'),
					callback: function(response, convo) {
						sendParticipantInfo(participants[response.text], convo);
						convo.next();
					}
				},
				{
					pattern: /(stopp|nej|avsluta|ingen)/i,
					callback: function(response, convo) {
						// stop the conversation. this will cause it to end with status == 'stopped'
						convo.stop();
					}
				},
				{
					default: true,
					callback: function(response, convo) {
						bot.startTyping(message, () => {
							getArtistInfo(response.text).then(artist => {
								console.log('Artist info is in, let\'s send it!');
								sendArtistInfo(message, artist);
								bot.stopTyping(message, () => {
									convo.next();
								});
							}).catch(err => {
								bot.stopTyping(message, () => {
									console.error(err);
									error = true;
									convo.stop();
								});
							});
						});
					}
				}
			]);

			convo.on('end', function(convo) {
				if (convo.status !== 'completed') {
					if(error)
						bot.reply(message, 'Kunde inte sammanställa informationen🙈 Försök gärna igen!');
				}
				setTimeout(function() {
					sendDefaultQuickReplies(message, false);
				}, 300);
			});
		}
	});
});

controller.hears(['artistinfo (.*)', '((artist|grupp)(en)?) (.*)'], 'message_received', function(bot, message) {
	let artistName = message.match[0];
	if( artistName.match(new RegExp('orkester', 'i')) ) {
		artistName == 'Sveriges Radios Symfoniorkester'
	}

	console.info('\n\nartistName:\n',artistName,'\n');

	let participantNames = [];
	let participants = {};
	for(let p of information.concert.participants) {
		participantNames.push(p.name);
		participants[p.name] = p;
	}

	if( artistName.match(new RegExp(participantNames.join('|'))) ) {
		bot.startConversation(message, function(err, convo) {
			if (!err) {
				sendParticipantInfo(participants[artistName], convo);
				convo.next();

				convo.on('end', function(convo) {
					setTimeout(function() {
						sendDefaultQuickReplies(message, false);
					}, 300);
				});
			}
		});
	} else {
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
	}
});


controller.hears(['kalla mig (.*)', 'jag heter (.*)'], 'message_received', function(bot, message) {
	var name = message.match[1];
	controller.storage.users.get(message.user, function(err, user) {
		if(!user) {
			user = {
				id: message.user,
			};
		}

		// Insert into database
		setNickname(user, name).then(newUser => {
			bot.reply(message, 'Okej, jag ska kalla dig ' + newUser.nickname + ' från och med nu.');
		}).catch(error => {
			console.error(error);
			bot.reply(message, 'Oops, jag tror jag glömde, försök igen!');
		});
	});
});

controller.hears(['vad heter jag', 'vem är jag'], 'message_received', function(bot, message) {
	controller.storage.users.get(message.user, function(err, user) {
		if (user && user.nickname) {
			bot.reply(message, 'Du heter ' + user.nickname + '😉');
		} else {
			if(!user) {
				user = {
					id: message.user,
					first_message: message
				};

				user.first_message.referral = '';

				getFacebookUserInfo(user).then(data => {
					user.first_name = data.first_name;
					user.last_name = data.last_name;

					controller.storage.users.save(user, (err, id) => {
						if (err) {
							console.error('Error saving user:',err);
						}

						console.log('> INSERT INTO users, DONE');
					});
				}).catch(e => {
					console.error(e);
				});
			}

			bot.startConversation(message, function(err, convo) {
				if (!err) {
					bot.reply(message, 'Du heter ' + user.first_name + ' :)');
					convo.say('Jag vet inte vad du vill bli kallad än!');
					convo.ask('Vad kan jag kalla dig?🤔', function(response, convo) {
						convo.ask('Ska jag kalla dig `' + response.text + '`?😃', [
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
							bot.reply(message, 'Okej! Uppdaterar min databas...💻');
							bot.reply(message, typing_message);

							controller.storage.users.get(message.user, function(err, user) {
								if(!user) {
									user = {
										id: message.user,
									};
								}

								setNickname(user, convo.extractResponse('nickname')).then(newUser => {
									setTimeout(() => {
										bot.reply(message, 'Sådär. Jag kommer kalla dig ' + newUser.nickname + ' från och med nu.👍'+
											'\nSkriv "Kalla mig \'namn\'" för att byta smeknamn i framtiden :)');
									}, 750);
								}).catch(error => {
									console.error(error);
								});
							});

						} else {
							// this happens if the conversation ended prematurely for some reason
							bot.reply(message, 'Okej! Strunt samma.😌\nSkriv "Kalla mig \'namn\'" för att byta smeknamn i framtiden :)');
						}
					});
				}
			});
		}
	});
});

controller.on('message_received', function(bot, message) {
	console.log('Default message_received:\n',message,'\n');
	
	if(message.sticker_id) {
		if(message.sticker_id === 369239263222822)
			bot.reply(message, '👍');
		else if(message.sticker_id === 369239343222814)
			bot.reply(message, '👍👍');
		else if(message.sticker_id === 369239383222810)
			bot.reply(message, '😄👍👍👍');
		else
			bot.reply(message, "😃😛");
	} else {
		bot.reply(message, 'ℹ️ Testa: \'Kommande konserter\', \'artistinfo\' eller \'Kalla mig Kalle\'');
		setTimeout(function() {
			sendDefaultQuickReplies(message, false);
		}, 300);
	}
	
	return false;
});

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

function sendDefaultQuickReplies(message, hasImage) {
	if(hasImage) {
		bot.reply(message, {
			attachment: {
				type: 'image',
				payload: {
					url: images_url+'botwald-wide.png',
					is_reusable: true
				}
			},
			quick_replies: [
				{
					content_type: 'text',
					title: 'Kommande konserter',
					payload: 'konserter',
				},
				{
					content_type: 'text',
					title: 'Om Berwaldhallen',
					payload: 'Berwaldhallen',
				},
				{
					content_type: 'text',
					title: 'Ge mig artistinfo',
					payload: 'artistinfo',
				}
			]
		});
	} else {
		bot.reply(message, {
			text: ':)',
			quick_replies: [
				{
					content_type: 'text',
					title: 'Kommande konserter',
					payload: 'konserter',
				},
				{
					content_type: 'text',
					title: 'Om Berwaldhallen',
					payload: 'Berwaldhallen',
				},
				{
					content_type: 'text',
					title: 'Ge mig artistinfo',
					payload: 'artistinfo',
				}
			]
		});
	}
	
}

function sendArtistInfo(message, artist) {
	bot.reply(message, {
		attachment: {
			type: 'template',
			payload: {
				template_type: 'list',
				top_element_style: 'large',
				elements: [
					{
						title: artist.name.toUpperCase(),
						image_url: artist.images.length>1 ? artist.images[1].url : images_url+'note.png'
					},
					{
						title: 'Lyssna på Spotify',
						image_url: images_url+'spotify.png',
						subtitle: artist.name,
						default_action: {
							type: 'web_url',
							url: artist.external_urls.spotify,
							webview_height_ratio: 'compact',
						},
						buttons: [
							{
								title: 'Lyssna',
								type: 'web_url',
								url: artist.external_urls.spotify,
								webview_height_ratio: 'compact',
							}
						]
					},
					{
						title: 'Läs mer på Wikipedia',
						image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png',
						subtitle: artist.name,
						default_action: {
							type: 'web_url',
							url: 'https://sv.wikipedia.org/wiki/'+artist.name.split(' ').join('_'),
							webview_height_ratio: 'full',
						},
						buttons: [
							{
								title: 'Läs mer på Wikipedia',
								type: 'web_url',
								url: 'https://sv.wikipedia.org/wiki/'+artist.name.split(' ').join('_'),
								webview_height_ratio: 'full',
							}
						]
					}
				]
			}
		}
	}, (err, response) => {
		if(err)
			console.error(err);
	});
}

function clearSavedTimeouts() {
	timeouts.forEach(clearTimeout);
}

/******************
* USER
*******************/
function setNickname(user, nickname) {
	user.nickname = nickname;

	return new Promise((resolve, reject) => {
		controller.storage.users.save(user, function(err, id) {
			if(err) {
				reject(err);
			}

			resolve(user);
		});
	});
}

function getFacebookUserInfo(user) {
	return new Promise((resolve, reject) => {
		request.get('https://graph.facebook.com/v2.8/'+
		user.id+'?fields=first_name,last_name,profile_pic,locale,gender&access_token='+process.env.page_token,
		(error, resp, body) => {
			if (error) {
				console.error('Could not get user facebook information.');
				reject(error);
			} else {
				try {
					var data = JSON.parse(body);
					console.log('User data:',data);
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
		controller.storage.users.get(userId, function(err, user) {
			if(err) {
				reject(err);
			}

			resolve(user);
		});
	});
}

/******************
* CONCERT
*******************/
function askConcert(response, convo) {
	let concert = information.concert;
	let quickReplies = [
		{
			content_type: 'text',
			title: concert.name,
			payload: concert.name
		},
		{
			content_type: 'text',
			title: '🚫Ingen',
			payload: 'stopp'
		}
	];

	convo.ask({
		text: 'Här är dina kommande konserter. (Jag vet bara om Solistprisvinnaren under testperioden😉)\n'+
				'Vilken vill du veta mer om?🤔', 
		quick_replies: quickReplies
	}, [
		{
			pattern: new RegExp(concert.name, 'i'),
			callback: function(response, convo) {
				convo.say('Javisst :)');
				askConcertInfo(response, convo);
				convo.next();
			}
		},
		{
			pattern: /(stopp|nej|avsluta|ingen)/i,
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

	convo.on('end', function(convo) {
		if (convo.status !== 'completed') {
			// this happens if the conversation ended prematurely for some reason
			bot.reply(convo.source_message, 'Okej! Vi pratar om något annat :)');
		}
		setTimeout(function() {
			sendDefaultQuickReplies(convo.source_message, false);
		}, 300);
	});
}

function askConcertInfo(response, convo) {
	let quickReplies = [
		{
			content_type: 'text',
			title: 'ℹ️ Generell info',
			payload: 'info'
		},
		{
			content_type: 'text',
			title: 'Medverkande',
			payload: 'medverkande'
		},
		{
			content_type: 'text',
			title: 'Program',
			payload: 'program'
		}
	];

	quickReplies.push({
		content_type: 'text',
		title: '🚫 Avsluta',
		payload: 'stopp'
	});

	convo.ask({
		text: 'Vad vill du veta om konserten?',
		quick_replies: quickReplies
	}, [
		{
			pattern: /(om|info(rmation)?|mer)/i,
			callback: function(response, convo) {
				sendConcertInfo(convo);
				convo.next();
			}
		},
		{
			pattern: /(medverkande|artister)/i,
			callback: function(response, convo) {
				convo.say('Okej!');
				askParticipants(convo);
				convo.next();
			}
		},
		{
			pattern: /(stycken|låtar|verk|program)/i,
			callback: function(response, convo) {
				askProgram(convo);
				convo.next();
			}
		},
		{
			pattern: /(stopp|nej|avsluta|inget)/i,
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
}

function askParticipants(convo) {
	let participantNames = [];
	let participants = {};
	for(let p of information.concert.participants) {
		if(p.name.length > 20) {
			participantNames.push(p.name.substr(0, 17)+'...');
			p.payload = p.name;
			participants[p.name.substr(0, 17)+'...'] = p;
		} else {
			participantNames.push(p.name);
			p.payload = p.name;
			participants[p.name] = p;
		}
	}

	let quickReplies = [];
	for(let n of participantNames) {
		quickReplies.push({
			content_type: 'text',
			title: n,
			image_url: participants[n].image,
			payload: participants[n].payload
		});
	}

	quickReplies.push(
		{
			content_type: 'text',
			title: '🔙 Bakåt',
			payload: 'bak'
		},
		{
			content_type: 'text',
			title: '🚫 Avsluta',
			payload: 'stopp'
		}
	);

	convo.ask({
		text: 'Här är de medverkande, tryck på den du vill veta mer om. :)',
		quick_replies: quickReplies
	}, [
		{
			pattern: new RegExp(participantNames.join('|'), 'i'),
			callback: function(response, convo) {
				sendParticipantInfo(participants[response.text], convo);
				askParticipants(convo);
				convo.next();
			}
		},
		{
			pattern: /(bak(åt)?|tillbaka)/i,
			callback: function(response, convo) {
				askConcertInfo(response, convo);
				convo.next();
			}
		},
		{
			pattern: /(stopp|nej|avsluta|ingen)/i,
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
}

function askProgram(convo) {
	let pieceNames = [];
	let pieces = {};
	for(let p of information.concert.pieces) {
		pieceNames.push(p.name);
		pieces[p.name] = p;
	}

	let quickReplies = [];
	for(let n of pieceNames) {
		quickReplies.push({
			content_type: 'text',
			title: n,
			image_url: pieces[n].image,
			payload: n
		});
	}

	quickReplies.push(
		{
			content_type: 'text',
			title: '🔙 Bakåt',
			payload: 'bak'
		},
		{
			content_type: 'text',
			title: '🚫 Avsluta',
			payload: 'stopp'
		}
	);

	convo.ask({
		text: 'Här är programmet, tryck på det du vill veta mer om. :)',
		quick_replies: quickReplies
	}, [
		{
			pattern: new RegExp(pieceNames.join('|'), 'i'),
			callback: function(response, convo) {
				askPiece(pieces[response.text], convo);
				convo.next();
			}
		},
		{
			pattern: /(bak(åt)?|tillbaka)/i,
			callback: function(response, convo) {
				askConcertInfo(response, convo);
				convo.next();
			}
		},
		{
			pattern: /(stopp|nej|avsluta|ingen)/i,
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
}

function askPiece(piece, convo) {
	let quickReplies = [
		{
			content_type: 'text',
			title: 'ℹ️ Infotext',
			payload: 'info'
		}
	];

	if(piece.composer) {
		quickReplies.push(
			{
				content_type: 'text',
				title: 'Kompositör',
				image_url: piece.composer.image,
				payload: 'kompositör'
			}
		);
	}

	quickReplies.push(
		{
			content_type: 'text',
			title: '🔙 Bakåt',
			payload: 'bak'
		},
		{
			content_type: 'text',
			title: '🚫 Avsluta',
			payload: 'stopp'
		}
	);

	// Send image and name of piece before asking
	convo.say({
		attachment: {
			type: 'template',
			payload: {
				template_type: 'generic',
				elements: [
					{
						title: piece.name,
						image_url: piece.image,
						//subtitle: piece.composer.name
					}
				]
			}
		}
	});

	convo.ask({
		text: 'Vad vill du veta om '+piece.name+'?',
		quick_replies: quickReplies
	}, [
		{
			pattern: /(kompositör|artist)/i,
			callback: function(response, convo) {
				if(piece.composer)
					sendComposerInfo(piece.composer, convo);
				else
					askPiece(piece, convo);
				convo.next();
			}
		},
		{
			pattern: /(info(rmation)?|om)/i,
			callback: function(response, convo) {
				sendPieceInfo(piece, convo);
				askProgram(convo);
				convo.next();
			}
		},
		{
			pattern: /(bak(åt)?|tillbaka)/i,
			callback: function(response, convo) {
				askProgram(convo);
				convo.next();
			}
		},
		{
			pattern: /(stopp|nej|avsluta|ingen)/i,
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
}

function sendConcertInfo(convo) {
	const c = information.concert;

	let msg = {
		attachment: {
			type: 'template',
			payload: {
				template_type: 'list',
				top_element_style: 'large',
				elements: [
					{
						title: c.name,
						image_url: c.image,
						subtitle: c.participants[1].name
					}
				]
			}
		}
	};

	for(let o of c.occasions) {
		msg.attachment.payload.elements.push({
			title: 'Tillfälle: '+o.date,
			image_url: o.image,
			subtitle: 'Tid: '+o.time,
			default_action: {
				type: 'web_url',
				url: o.url,
				webview_height_ratio: 'tall',
			}
		});
	}

	convo.say('🏆Solistprisvinnaren🏆\n\n'+information.concert.about, (err, response) => {
		if(err) {
			console.error(err);
		}
	});

	convo.say(typing_message);
	timeouts.push(setTimeout(() => {
		convo.say(msg, (err, response) => {
			if(err)
				console.error(err);
		});

		askConcertInfo('', convo);
	}, 300));
}

function sendParticipantInfo(participant, convo) {
	convo.say({
		attachment: {
			type: 'template',
			payload: {
				template_type: 'generic',
				elements: [
					{
						title: participant.name,
						image_url: participant.image,
						subtitle: 'Gå till '+participant.name+'s hemsida.',
						default_action: {
							type: 'web_url',
							url: participant.website_url,
							webview_height_ratio: 'tall'
						},
						buttons: [
							{
								title: 'Hemsida',
								type: 'web_url',
								url: participant.website_url,
								webview_height_ratio: 'tall'
							}
						]
					}
				]
			}
		}
	}, (err, response) => {
		if(err) {
			console.error(err);
		}
	});

	for(let a of participant.about) {
		convo.say(a, (err, response) => {
			if(err) {
				console.error(err);
			}
		});
	}
}

function sendComposerInfo(composer, convo) {
	// TODO: Send composer info
}

function sendPieceInfo(piece, convo) {
	convo.say({
		attachment: {
			type: 'template',
			payload: {
				template_type: 'generic',
				elements: [
					{
						title: piece.name,
						image_url: piece.image,
						subtitle: piece.composer.name
					}
				]
			}
		}
	}, (err, response) => {
		if(err) {
			console.error(err);
		}
	});

	for(let a of piece.info) {
		convo.say(a, (err, response) => {
			if(err) {
				console.error(err);
			}
		});
	}
}