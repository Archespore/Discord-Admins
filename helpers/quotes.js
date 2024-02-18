const { EmbedBuilder } = require('@discordjs/builders');
const quotes = require('../data/quotes.json');

module.exports = {
    
    randomInt(max) {
        return Math.floor(Math.random() * max)
    },

    quote(client, index) {
        return new Promise(function(resolve, reject) {
            client.guilds.fetch(quotes.server).then(guild => {
                guild.channels.fetch(quotes.channel).then(channel => {
                    channel.messages.fetch(quotes.quotes[index]).then(message => {
                        quotedMessage = new EmbedBuilder();
                        if (message.content.startsWith(`https://`)) { quotedMessage.setImage(message.content) }
                        else { quotedMessage.setDescription(message.content) }
                        quotedMessage
                            .setColor([25, 168, 71])
                            .setTimestamp(message.createdTimestamp)
                            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                            .setFooter({ text: 'Quote #: ' + index });
                        resolve(quotedMessage)
                        return;
                    })
                })
            })
            return;
        })
    }
}