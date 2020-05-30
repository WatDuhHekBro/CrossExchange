module.exports = {
	description: "Buy, sell, and get info on stonks.",
	message: 'Use subcommands "buy", "sell", and "info"!',
	common:
	{
		buy: function($, m, amount)
		{
			let stonks = $.lib.loadJSON('stonks');
			let user = $.lib.get($.lib.loadJSON('users'), $.author.id, {});
			let market = stonks.markets[m];
			let value = Math.round(market.value);
			
			if($.lib.get(user, 'money', 0) >= (value * amount))
			{
				$.lib.get(user, 'stonks', {});
				let userAmount = $.lib.get(user.stonks, m, 0);
				user.stonks[m] += userAmount + amount;
				user.money -= value * amount;
				market.invested += amount;
				let stockName = $.lib.pluralise(amount, 'stock', 's');
				let stockNameInvested = $.lib.pluralise(market.invested, 'stock', 's');
				$.message.reply(`You invested in and bought ${stockName} from ${market.name}. That market now has ${stockNameInvested} invested in it.`); // You now have x stonks in y.
			}
			else
				$.message.reply("You don't have enough money!");
		},
		// Also keep track of how much value the stock had when the user had it to tell them whether it was a gain or a loss. It'll just tell the user the net effect so don't worry about keeping track of each individual stock.
		sell: function($, m, amount)
		{
			let stonks = $.lib.loadJSON('stonks');
			let user = $.lib.get($.lib.loadJSON('users'), $.author.id, {});
			let market = stonks.markets[m];
			let value = Math.round(market.value);
			$.lib.get(user, 'stonks', {});
			
			if($.lib.get(user.stonks, m, 0) > 0)
			{
				user.stonks[m] -= amount;
				let userMoney = $.lib.get(user, 'money', 0);
				user.money += userMoney + (value * amount);
				market.invested -= amount; // It's the value of the current market value because you're taking out that amount of money you invested, so that much money goes out of the invested amount. No wait... The invested amount should show the amount of stocks rather than being tied to a value at one point in time. And calculations involving the market investments should multiply that by its value.
				let stockName = $.lib.pluralise(amount, 'stock', 's');
				let stockNameInvested = $.lib.pluralise(market.invested, 'stock', 's');
				let creditName = $.lib.pluralise(value * amount, 'credit', 's');
				$.message.reply(`You sold ${stockName} from ${market.name} for ${creditName}! That market now has ${stockNameInvested} invested in it.`);
			}
			else
				$.message.reply(`You don't have any stocks in ${market.name}!`);
		}
	},
	subcommands:
	{
		buy:
		{
			message: "You need to enter in a market as well!",
			any:
			{
				run($)
				{
					$.common.buy($, $.args[0], 1);
				},
				number:
				{
					run($)
					{
						$.common.buy($, $.args[0], $.args[1]);
					}
				}
			}
		},
		sell:
		{
			message: "You need to enter in a market as well!",
			any:
			{
				run($)
				{
					$.common.sell($, $.args[0], 1);
				},
				number:
				{
					run($)
					{
						$.common.sell($, $.args[0], $.args[1]);
					}
				}
			}
		}
	}
};