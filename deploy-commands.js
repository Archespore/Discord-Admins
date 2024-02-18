const { clientId, guildId, token } = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const commands = [];

const rest = new REST({ version: '9'}).setToken(token);

//Command registration
commandFiles = fs.readdirSync('./commands').filter(File => (File.endsWith('.js') && !File.startsWith('#')));
commandFiles.forEach(file => {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
});

guildId.forEach(id => {
    rest.put(Routes.applicationGuildCommands(clientId, id), { body: commands })
        .then(() => {
            console.log(`Successfully registered application commands for the guild ${id}.`)
            rest.get(Routes.applicationGuildCommands(clientId, id))
                .then(data => {
                    fs.writeFile(`./data/data_dump/commands_${id}.json`, JSON.stringify(data), (error) => {
                        if (error) throw error;
                    })
                })
                .catch(console.error);
        })
        .catch(console.error);
});