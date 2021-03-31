const Discord = require('discord.js');

//Handles logic if a gulag match times out.
function timeoutGulag(eventServer) {
	console.log("A Gulag match was timed out...");
	gulagMatch = gulags.get(eventServer);
	gulagMatch.playerData.forEach((data, player) => {
		if (data.roll === null) {
			if (data.user.voice) { data.user.voice.kick("Timed out a Gulag match."); }
		}
		else if (data.roll < gulagMatch.highestRoll) {
			if (data.user.voice) { data.user.voice.kick("Lost a Gulag match."); }
		}
		else if (data.user.voice) { data.user.voice.setChannel(data.originChannel); }
	});
	gulags.delete(eventServer);
}

const maxPlayers = 4;

module.exports = {

    name: 'Gulag',
    description: 'Pits two people against each other in the Gulag.',

    async execute(message) {

		//Variable caching
		eventServer = message.guild;
		eventChannel = message.channel;
		eventParticipants = message.mentions.members;

		if (eventServer != null) {
			//Player count check
			if (eventParticipants.size > 1 && eventParticipants.size <= maxPlayers) {
				//Existing gulag check
				if (!gulags.has(eventServer)) { 
					console.log("To the Gulag with you!");

					//Create a collection that will track the player data for this match
					playerData = new Discord.Collection();

					//Build the message that will track the Gulag match.
					gulagMessage = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle('Gulag Match')
						.setDescription('React with the dice to roll.');

					//Find all voice channels named 'Gulag' and move the participants to the first found channel.
					voiceChannels = eventServer.channels.cache.filter(channel => ( (channel.type == 'voice') && (channel.name == 'Gulag') ));
					try {
						eventParticipants.forEach(user => {
							userVoice = user.voice;
							if (userVoice.channel) {
								userVoice.setChannel(voiceChannels.first());
								playerData.set(user.id, {
									"user": user,
									"name": user.displayName,
									"originChannel": userVoice.channel,
									"roll": null
								});
								gulagMessage.addFields({ name: user.displayName, value: 'WAITING FOR ROLL...', inline: true });
							}
							else { throw("The user: " + user.displayName + " must be in a voice channel to be part of a gulag match!"); }
						});
					}
					catch(error) { eventChannel.send(error); }

					//Finalize gulag message
					gulagMessage.setFooter('You have 30 seconds to roll or you forfeit the match.');

					//Create the gulagMatch object and add this match to our collection of tracked matches.
					gulagMatch = {
						"playerData": playerData,
						"rollCount": 0,
						"highestRoll": 0,
						"gulagChannel": voiceChannels.first(),
						"message": await message.channel.send(gulagMessage),
						"timeout": setTimeout(timeoutGulag, 30000, eventServer)
					}		
					gulagMatch.message.react('🎲');

					//Track the new gulag match.
					gulags.set(eventServer, gulagMatch);
				}
				else { eventChannel.send("A gulag match is already in progress."); }
			}
			else { eventChannel.send("The gulag does not support " + eventParticipants.size + " player(s)!\nPlease provide 2 - " + maxPlayers + " players for the gulag."); }
		}
    }
}