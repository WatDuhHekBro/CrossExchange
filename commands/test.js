module.exports = {
	description: "test-desc",
	run(message, args, lib)
	{
		let users = lib.readJSON('users', {});
		let guilds = lib.readJSON('guilds', {});
		
		users[message.author.id] = {};
		guilds[message.channel.guild.id] = {};
		
		lib.writeJSON('users', users);
		lib.writeJSON('guilds', guilds);
	}
};