const Discord = require('discord.js');
const FileSystem = require('fs');
const { prefix, token } = require('./config.json')

//Variable initialization
const Client = new Discord.Client();
blackholes = new Discord.Collection();
gulags = new Discord.Collection();

//Streaming ready boolean
streamReady = true;

//Command registration
registeredCommands = new Discord.Collection();
commandFiles = FileSystem.readdirSync('./commands').filter(File => File.endsWith('.js'));
commandFiles.forEach(file => {
    command = require(`./commands/${file}`);
    registeredCommands.set(command.name.toLowerCase(), command);
});

//Initialization event & login
Client.once('ready', () => {
    console.log("I'm alive!");
});
Client.login(token)

//Message Event
Client.on('message', message => {
    if ( (message.cleanContent.startsWith(prefix)) && (message.member.hasPermission("ADMINISTRATOR")) ) {
        splitCommand = message.cleanContent.split(" ");
        command = splitCommand[0].toLowerCase().slice(prefix.length);
        if (registeredCommands.has(command)) {
            try { registeredCommands.get(command).execute(message); }
            catch(error) { console.log(error); console.log("There was an error executing a command!"); }
        }
        if ( (splitCommand.length > 1) && (splitCommand[splitCommand.length - 1] == '*') ) { message.delete() }
    }
});

//Voice Change Event
Client.on('voiceStateUpdate', (oldState, newState) => {
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
});

//Reaction Add Event
Client.on('messageReactionAdd', (messageReaction, user) => {

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
			gulagMessage = new Discord.MessageEmbed()
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
});

process.on('SIGINT', () => {
	console.log("This is a test.");
	process.exit(0);
})