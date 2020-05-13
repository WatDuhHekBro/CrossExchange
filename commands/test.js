module.exports = {
	description: "test-desc",
	run(message, args)
	{
		const lib = require('../lib.js');
		let userdata = lib.readJSON('userdata', {});
		
		userdata[message.author.id] = {guilds: {}};
		userdata[message.author.id].guilds[message.channel.guild.id] = {};
		
		lib.writeJSON('userdata', userdata);
	}
};

/*if(message.content === 'time')
{
	//let date = new Date();
	//message.channel.send(`${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`);
}*/