// Dependencies //
const Discord = require('discord.js');
const lib = require('./lib.js');

// Generate Files //
lib.createDirectory('data');
lib.createDirectory('data/assets');
lib.loadStack();
const config = lib.loadJSON('config', true);

// Login //
// Leave a message if the token is still "<ENTER YOUR TOKEN HERE>" and pause the command line.
const client = new Discord.Client();
client.login(config.token);

// Load Commands //
const commands = new Discord.Collection();
let files = lib.searchDirectory('commands', file => file.endsWith('.js'));

for(let file of files)
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
		let common = cmd.common; // You can add some common functions or properties that you can access from any function, since each individual run command is sandboxed due to how its scope.
		let level = 0;
		let isNumber = false;
		
		// "subcommands" overrides "number" as it's more specific. Then after that, it's "any".
		for(let i = 0; i < args.length; i++)
		{
			let param = args[i];
			
			if(cmd.subcommands && (param in cmd.subcommands))
			{
				cmd = cmd.subcommands[param];
				isNumber = false;
				level++;
			}
			else if(cmd.number && Number(param))
			{
				args[i] = Number(param);
				cmd = cmd.number;
				isNumber = true;
			}
			else if(cmd.any)
			{
				cmd = cmd.any;
				isNumber = false;
			}
		}
		
		if(cmd.message)
			message.channel.send(cmd.message);
		else
		{
			// Just merge everything into "$". No more issues with the order of those parameters! :leaSMUG::emilieSMUG::ctronSMUG:
			cmd.run({
				args: args.slice(level),
				author: message.author,
				channel: message.channel,
				client: client,
				common: common,
				lib: lib,
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