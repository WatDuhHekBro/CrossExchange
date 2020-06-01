module.exports = {
	description: "A command to toggle system settings and manually test features.",
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
			},
			subcommands:
			{
				catalog:
				{
					run($)
					{
						if($.common.authenticate($))
						{
							let stonks = $.lib.loadJSON('stonks');
							
							for(let tag in stonks.markets)
							{
								let market = stonks.markets[tag];
								market.catalog = [];
							}
							
							$.channel.send("Cleared the market catalog.");
						}
					}
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
		},
		test:
		{
			// generic test function
			run($)
			{
				if($.common.authenticate($))
				{
					
				}
			},
			subcommands:
			{
				iterate:
				{
					run($)
					{
						if($.common.authenticate($))
						{
							setInterval(() => {
								let stonks = $.lib.loadJSON('stonks', true);
								let markets = stonks.markets;
								$.stonks.calculate(markets);
								
								for(let tag in markets)
								{
									let market = markets[tag];
									$.guild.channels.cache.get(stonks.channel).messages.fetch(market.message).then(message => message.edit({
										embed: $.stonks.display(market)
									})).catch(console.error);
								}
								
								// You then have to write it manually because you're not accessing it from the command anymore.
								$.lib.writeJSON('stonks', stonks);
							}, 5000);
							$.channel.send("Every 5 seconds, the market will update.");
						}
					}
				},
				event:
				{
					run($)
					{
						if($.common.authenticate($))
						{
							
						}
					}
				}
			}
		}
	}
};