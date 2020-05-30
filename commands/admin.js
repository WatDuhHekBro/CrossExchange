module.exports = {
	run($)
	{
		if($.common.authenticate($))
			$.message.reply("You are an admin.");
	},
	common:
	{
		authenticate($)
		{
			let config = $.lib.loadJSON('config', true);
			let isAdmin = config.admins.includes($.author.id);
			
			if(!isAdmin)
			{
				$.message.reply("You are not an admin. If you have access to the server files, add yourself to it manually in `config.json`. Your user ID should now be logged in the console.");
				console.log($.author.id);
			}
			
			return isAdmin;
		}
	},
	subcommands:
	{
		clear:
		{
			run($)
			{
				if($.common.authenticate($))
				{
					console.clear();
					$.channel.send("Cleared the console.");
				}
			}
		},
		init:
		{
			message: "Initialize `stonks` infoboard in a channel of your choice.",
			subcommands:
			{
				stonks:
				{
					run($)
					{
						if($.common.authenticate($))
						{
							$.channel.bulkDelete(6);
							let stonks = $.lib.loadJSON('stonks');
							stonks.channel = $.channel.id;
							
							for(let tag in stonks.markets)
							{
								let market = stonks.markets[tag];
								
								$.channel.send(`Market values for ${market.name || ""}...`, {
									embed: $.stonks.display(market)
								}).then(message => {
									market.message = message.id;
									// Write the data manually because this is a callback function that'll likely occur after the automatic writing to stack.
									$.lib.writeJSON('stonks', stonks);
								}).catch(console.error);
							}
						}
					}
				}
			}
		},
		reload:
		{
			message: "Reload commands or cache.",
			subcommands:
			{
				cache:
				{
					run($)
					{
						if($.common.authenticate($))
						{
							$.lib.loadStack();
							$.channel.send("Reloaded the cache to match manual edits.");
						}
					}
				},
				commands:
				{
					run($)
					{
						if($.common.authenticate($))
						{
							let storage = $.lib.loadJSON('config');
							storage.reload = !storage.reload;
							$.channel.send(storage.reload ? "Now reloading after every command." : "No longer reloading after every command.");
						}
					}
				}
			}
		}
	}
};