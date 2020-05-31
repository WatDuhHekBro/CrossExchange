// Dependencies //
const Discord = require('discord.js');
const lib = require('./lib.js');
const stonks = require('./stonks.js');

// Generate Files //
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
				guild: message.guild,
				lib: lib,
				message: message,
				stonks: stonks
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

// Scheduler Initialization //
// Shoddy programming, needs to be reviewed later.
(() => {
	let stonks = lib.loadJSON('stonks', true);
	let marketScheduled = stonks.schedulers.market;
	let currentTime = new Date(2020, 4, 31, 4, 8, 21);
	let schTime = marketScheduled.time;
	let schOffset = marketScheduled.offset;
	let intervals = 0;
	
	// Initialize the scheduled time if there is none yet.
	if(Object.keys(marketScheduled).length === 0)
	{
		marketScheduled.time = Math.floor(getIntervalStartMarket(currentTime).getTime() / 1000);
		marketScheduled.offset = lib.randInt(0, 900);
	}
	
	// Check if you're past the offset.
	if(currentTime >= new Date((schTime + schOffset) * 1000))
		intervals++;
	
	// Set the scheduled to the next interval and count from there.
	let scheduled = new Date((schTime + 900) * 1000);
	intervals += Math.max(Math.floor((currentTime - scheduled) / 900000), 0); // 900 seconds per interval * 1000 ms per sec
	
	// After that, base everything off the current time. Set the new time and offset.
	marketScheduled.time = Math.floor(getIntervalStartMarket(currentTime) / 1000);
	marketScheduled.offset = lib.randInt(0, 900);
	schTime = marketScheduled.time;
	schOffset = marketScheduled.offset;
	
	// Then, check if the generated offset is behind the current time and increment intervals if so.
	scheduled = new Date((schTime + schOffset) * 1000);
	
	if(currentTime - scheduled >= 0)
		intervals++;
	
	lib.writeJSON('stonks', stonks);
	
	// Start the iteration loop.
	/*setTimeout(() => {
		
	}, currentTime - scheduled);*/
	
	function getIntervalStartMarket(time)
	{
		time = new Date(time.getTime()); // Shoddy cloning :/
		let minutes = time.getUTCMinutes();
		time.setUTCMinutes(minutes - (minutes % 15));
		time.setUTCSeconds(0);
		time.setUTCMilliseconds(0);
		return time;
	}
	
	/*function getIntervalStartEvent(time)
	{
		time = new Date(time.getTime()); // Shoddy cloning :/
		time.setUTCHours(0);
		time.setUTCMinutes(0);
		time.setUTCSeconds(0);
		time.setUTCMilliseconds(0);
		return time;
	}*/
})();

// Ready State //
client.once('ready', () => {
	console.log('Ready!');
});