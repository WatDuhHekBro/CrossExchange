module.exports = {
	description: "Buy, sell, and get info on stonks.",
	usage: "<buy/sell/info> <market> <amount/\"yes\">",
	run(message, args, lib)
	{
		let stonks = lib.readJSON('stonks', {
			markets: {},
			locations: {}
		});
		let users = lib.readJSON('users', {});
		let user = users[message.author.id] || (users[message.author.id] = {}); // lib needs to have a "set default if missing" convenience function. Like lib.get(variable, 0) or lib.var(...).
		
		if(args[0] === 'buy' && args[1] && args[1] in stonks.markets)
		{
			let market = stonks.markets[args[1]];
			let value = Math.round(market.value);
			
			if(user.money >= value)
			{
				user.stonks[args[1]]++;
				user.money -= value;
				market.invested++;
				message.reply(`You invested in and bought 1 stock from ${market.name}. That market now has ${market.invested} stocks invested in it.`); // You now have x stonks in y.
			}
			else
				message.reply("You don't have enough money!");
		}
		// Also keep track of how much value the stock had when the user had it to tell them whether it was a gain or a loss. It'll just tell the user the net effect so don't worry about keeping track of each individual stock.
		else if(args[0] === 'sell' && args[1] && args[1] in stonks.markets)
		{
			let market = stonks.markets[args[1]];
			let value = Math.round(market.value);
			
			if(user.stonks[args[1]] > 0)
			{
				user.stonks[args[1]]--;
				user.money += value;
				market.invested--; // It's the value of the current market value because you're taking out that amount of money you invested, so that much money goes out of the invested amount. No wait... The invested amount should show the amount of stocks rather than being tied to a value at one point in time. And calculations involving the market investments should multiply that by its value.
				message.reply(`You sold 1 stock from ${market.name} for ${value} credits! That market now has ${market.invested} stocks invested in it.`);
			}
			else
				message.reply(`You don't have any stocks in ${market.name}!`);
		}
		else if(args[0] === 'info')
		{
			
		}
		
		lib.writeJSON('stonks', stonks);
		lib.writeJSON('users', users);
	}/*,
	subcommands:
	{
		buy:
		{
			description: "",
			error: "",
			run()
			{
				
			},
			subcommands:
			{
				
			}
		},
		sell:
		{
			run()
			{
				
			},
			subcommands:
			{
				
			}
		},
		info:
		{
			run()
			{
				
			},
			subcommands:
			{
				
			}
		}
	}*/
};