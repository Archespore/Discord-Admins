const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('based')
        .setDescription('This is a test...'),
    async execute(interaction) {
        await interaction.reply('Based...');
    }
}