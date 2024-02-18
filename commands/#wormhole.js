module.exports = {

    name: 'Wormhole',
    description: "Causes a wormhole in the user's current channel.",

    execute(message) {

        console.log("The wormhole spares no one!");

        eventServer = message.guild;
        if (eventServer != null) {
            if (blackholes.has(eventServer)) { blackholes.delete(eventServer); }
            else {
                eventChannel = message.member.voice.channel;
                if (eventChannel != null) {
                    blackholes.set(eventServer, eventChannel);

                    voiceChannels = eventServer.channels.cache.filter(channel => channel.type == 'voice');
                    usersConnected = new Array();
                    
                    voiceChannels.forEach(serverChannel => {
                        serverChannel.members.forEach( value => {
                            usersConnected.push(value);
                        })
                    });
        
                    usersConnected.forEach(user => {
                        user.voice.setChannel(eventChannel);
                    })
                }
            }
        }
    }
}