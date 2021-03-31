const ytdl = require('ytdl-core');
const fs = require('fs');
const Discord = require('discord.js');

module.exports = {

    name: 'Playsound',
    description: "Plays the provided sound if it's found in the sounds folder.",

    execute(message) {

        console.log("I made this for you. :)");

        eventServer = message.guild;
        if (eventServer != null && streamReady) {
			eventChannel = message.member.voice.channel;
			if (eventChannel != null) {
				streamReady = false;
				eventChannel.join().then(connection => {
					setTimeout(
						function(){
							splitCommand = message.cleanContent.split(" ");
							buffer = ytdl(splitCommand[1], { quality: 'highestaudio', highWaterMark: 65536 });
							buffer.pipe(fs.createWriteStream('./sounds/video.mp4')).on('finish', () => {
								attachment = new Discord.MessageAttachment('./sounds/video.mp4')
								message.channel.send('Whoa! a banger!', attachment)
								const dispatcher = connection.play('./sounds/video.mp4', { volume: 0.5 });
								dispatcher.on('finish', end => {
									eventChannel.leave();
									streamReady = true;
								})
							});
						}, 1000
					)
				}).catch(err => console.log(err))
			}
        }
    }
}