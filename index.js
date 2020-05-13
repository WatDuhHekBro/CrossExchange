// Dependencies //
const Discord = require('discord.js');
const fs = require('fs');
const lib = require('./lib.js');

// Generate Files //
lib.mkdir('data');
lib.mkdir('data/assets');
const config = lib.readJSON('config', {
	token: "<ENTER YOUR TOKEN HERE>",
	prefix: "$"
});

// Login //
const client = new Discord.Client();
client.login(config.token);

// Load Commands //
const commands = new Discord.Collection();

for(const file of fs.readdirSync('./commands').filter(file => file.endsWith('.js')))
	commands.set(file.substring(0, file.lastIndexOf('.js')), require(`./commands/${file}`));

// Message Events //
client.on('message', message => {
	if(message.author.bot || !message.content.startsWith(config.prefix))
		return;
	
	const args = message.content.substring(config.prefix.length).split(/ +/);
	const action = args[0];
	
	if(!commands.has(action))
		return;
	
	try
	{
		commands.get(action).run(message, args.slice[1]);
	}
	catch(error)
	{
		console.error(error);
		message.channel.send('There was an error while trying to execute that command!');
	}
});

// Ready State //
client.once('ready', () => {
	console.log('Ready!');
});