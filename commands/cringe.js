const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('cringe')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        await interaction.reply(interaction.targetUser.toString().concat(' Cringe...'));
    }
}