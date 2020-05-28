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
	
	/*message.channel.send(new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Some title')
		.setURL('https://discord.js.org/')
		.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
		.setDescription('Some description here')
		.setThumbnail('https://i.imgur.com/wSTFkRM.png')
		.addFields(
			{name: 'Regular field title', value: 'Some value here'},
			{name: '\u200B', value: '\u200B'},
			{name: 'Inline field title', value: 'Some value here', inline: true},
			{name: 'Inline field title', value: 'Some value here', inline: true}
		)
		.addField('Inline field title', 'Some value here', true)
		.setImage('https://i.imgur.com/wSTFkRM.png')
		.setTimestamp()
		.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png')
	);*/
	
	if(!commands.has(action))
		return;
	
	try
	{
		if(lib.readJSON('config').reload)
		{
			delete require.cache[require.resolve(`./commands/${action}.js`)];
			commands.set(action, require(`./commands/${action}.js`));
		}
		
		commands.get(action).run(message, args.slice(1), require('./lib.js'), {
			client: client,
			Discord: Discord
		});
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