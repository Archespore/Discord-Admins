const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const fs = require('fs');
const Discord = require('discord.js');
const Voice = require('@discordjs/voice');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playsound')
        .setDescription('Plays a youtube video')
		.addStringOption(option =>
            option
                .setName('url')
                .setDescription('The youtube video url')
                .setRequired(true)),
    execute(interaction) {

        console.log("I made this for you. :)");

		interaction.reply(":)");
        eventServer = interaction.guild;
        if (eventServer != null && streamReady) {
			eventChannel = interaction.member.voice.channel;
			if (eventChannel != null) {
				streamReady = false;
				const url = interaction.options.getString('url');
				buffer = ytdl(url, { quality: 'highestaudio', highWaterMark: 65536 });
				buffer.pipe(fs.createWriteStream( './sounds/video.mp4')).on('finish', () => {
					//attachment = new Discord.MessageAttachment('./sounds/video.mp4')
					//message.channel.send('Whoa! a banger!', attachment)
					
					/*player.on(Voice.AudioPlayerStatus.Idle, () => {
						eventChannel.leave();
						streamReady = true;
					})*/
					const connection = Voice.joinVoiceChannel({
						channelId: eventChannel.id,
						guildId: interaction.guildId,
						adapterCreator: interaction.guild.voiceAdapterCreator,
					});
					const player = Voice.createAudioPlayer();
					resource = Voice.createAudioResource('./sounds/video.mp4', { inlineVolume: true });
					resource.volume.setVolume(0.5);
					connection.subscribe(player); 
					connection.on(Voice.VoiceConnectionStatus.Ready, () => {console.log("ready"); player.play(resource);})
				});
				/*
				.then(connection => {
					setTimeout(
						function(){
							
						}, 1000
					)
				}).catch(err => console.log(err))*/
			}
        }
    }
}