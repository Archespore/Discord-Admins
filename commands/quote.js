const { SlashCommandBuilder } = require('discord.js');
const QuotesHelper = require('../helpers/quotes.js');
const quotes = require('../data/quotes.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Displays a quote')
        .addNumberOption(option =>
            option
                .setName('quote_number')
                .setDescription('The number of the quote to display')
                .setRequired(false)),
    async execute(interaction) {

        console.log("A quote for you!");

        const quoteNumber = interaction.options.getNumber('quote_number');
        index = ((Number.isNaN(parseInt(quoteNumber))) || (quotes.quotes.length < parseInt(quoteNumber) + 1)) ? QuotesHelper.randomInt(quotes.quotes.length) : parseInt(quoteNumber);
        QuotesHelper.quote(interaction.client, index).then(quote => {
            interaction.reply({embeds: [quote]})
        })
    }
}