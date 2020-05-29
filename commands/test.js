module.exports = {
	description: "test-desc",
	//message: "Top level command intercept.",
	run(lib, args, e)
	{
		/*let users = lib.readJSON('users', {});
		let guilds = lib.readJSON('guilds', {});
		
		users[message.author.id] = {};
		guilds[message.channel.guild.id] = {};
		
		lib.writeJSON('users', users);
		lib.writeJSON('guilds', guilds);*/
		
		let test = lib.loadJSON('test');
		lib.get(test, 'reeee', {});
		test.reeee.nope = 2;
		
		//console.log(args);
		//e.channel.send('Top level command, sent by ' + e.author.username + '!');
	},
	subcommands:
	{
		alpha:
		{
			run(lib, args, e)
			{
				console.log(args);
				e.channel.send('Subcommand "alpha"');
			},
			subcommands:
			{
				radiation:
				{
					run(lib, args, e)
					{
						console.log(args);
						e.channel.send('Sub-subcommand "radiation"');
					}
				}
			}
		},
		beta:
		{
			run(lib, args, e)
			{
				console.log(args);
				e.channel.send('Subcommand "beta"');
			},
			number:
			{
				run(lib, args, e)
				{
					console.log(args);
					e.channel.send('Second level number command.');
				}
			}
		}
	},
	number:
	{
		run(lib, args, e)
		{
			console.log(args);
			e.channel.send('Top level number command.');
		}
	}
};