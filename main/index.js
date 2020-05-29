// Dependencies //
const Discord = require('discord.js');
const fs = require('fs');
const lib = require('./lib.js');

// Generate Files //
lib.mkdir('data');
lib.mkdir('data/assets');
lib.loadStack();
const config = lib.loadJSON('config', true);

// Login //
// Leave a message if the token is still "<ENTER YOUR TOKEN HERE>" and pause the command line.
const client = new Discord.Client();
client.login(config.token);

// Load Commands //
const commands = new Discord.Collection();

for(let file of fs.readdirSync('commands').filter(file => file.endsWith('.js')))
	commands.set(file.substring(0, file.lastIndexOf('.js')), require(`../commands/${file}`));

// Message Events //
client.on('message', message => {
	if(message.author.bot || !message.content.startsWith(config.prefix))
		return;
	
	let args = message.content.substring(config.prefix.length).split(/ +/);
	let action = args[0];
	args = args.slice(1);
	
	if(!commands.has(action))
		return;
	
	try
	{
		if(config.reload)
		{
			delete require.cache[require.resolve(`../commands/${action}.js`)];
			commands.set(action, require(`../commands/${action}.js`));
		}
		
		let cmd = commands.get(action);
		let level = 0;
		let isNumber = false;
		
		// subcommands overrides number as it's more specific
		for(let param of args)
		{
			if(cmd.subcommands && (param in cmd.subcommands))
			{
				cmd = cmd.subcommands[param];
				isNumber = false;
				level++;
			}
			else if(cmd.number && Number(param))
			{
				cmd = cmd.number;
				isNumber = true;
				level++;
			}
		}
		
		if(cmd.message)
			message.channel.send(cmd.message);
		else
		{
			if(isNumber)
			{
				level--;
				args[level] = Number(args[level]);
			}
			
			// run(lib, args, e)
			cmd.run(lib, args.slice(level), {
				author: message.author,
				channel: message.channel,
				client: client,
				Discord: Discord,
				message: message
			});
		}
		
		lib.writeStack();
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