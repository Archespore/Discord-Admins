module.exports = {

    name: 'Pandemonium',
    description: 'Causes pandemonium.',

    execute(message) {

        console.log("Pandemonium it is!");

        eventServer = message.guild;
        if (eventServer != null) {
            voiceChannels = eventServer.channels.cache.filter(channel => channel.type == 'voice');
            usersConnected = new Array();
            
            voiceChannels.forEach(serverChannel => {
                serverChannel.members.forEach( value => {
                    usersConnected.push(value);
                })
            });

            usersConnected.forEach(user => {
                user.voice.setChannel(voiceChannels.random());
            })
        }
    }
}