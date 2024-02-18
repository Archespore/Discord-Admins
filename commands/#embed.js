const { MessageEmbed } = require('discord.js');

module.exports = {

    name: 'Embed',
    description: 'Creates an embeded message',

    execute(message) {

        console.log("Whoa, an embeded message?!");

        eventChannel = message.channel;
        if (eventChannel != null) {

            embedMessage = new MessageEmbed()
            splitCommand = message.cleanContent.substring(this.name.length + 1).trim()
            console.log(splitCommand);
            embedArgs = splitCommand.split(";");

            embedArgs.forEach(argument => {
                splitArg = argument.split("→");
                key = splitArg[0].toUpperCase();
                value = splitArg[1];

                switch(key) {
                    case 'COLOR':
                        embedMessage.setColor(value)
                        break;
                    case 'TITLE':
                        embedMessage.setTitle(value)
                        break;
                    case 'URL':
                        embedMessage.setURL(value)
                        break;
                    case 'AUTHOR':
                        embedMessage.setAuthor(message.author.username, message.author.avatarURL())
                        break;
                    case 'DESCRIPTION':
                        embedMessage.setDescription(value)
                        break;
                    case 'THUMBNAIL':
                        embedMessage.setThumbnail(value)
                        break;
                    case 'FIELD':
                        splitVal = value.split("|");
                        if (splitVal[0].toUpperCase() == '~EMPTY') { embedMessage.addField('\u200B','\u200B', splitVal[1].toUpperCase() == 'TRUE') }
                        else { embedMessage.addField(splitVal[0], splitVal[1].replaceAll('\\n', '\n'), splitVal[2].toUpperCase() == 'TRUE') }
                        console.log(splitVal[1]);
                        break;
                    case 'IMAGE':
                        embedMessage.setImage(value)
                        break;
                    case 'TIMESTAMP':
                        embedMessage.setTimestamp()
                        break;
                    case 'FOOTER':
                        embedMessage.setFooter(value)
                        break;
                }
            });

            eventChannel.send({embeds: [embedMessage]})
        }
    }
}