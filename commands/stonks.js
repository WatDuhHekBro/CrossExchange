module.exports = {
	description: "Buy, sell, and get info on stonks.",
	message: "Use subcommands `buy`, `sell`, and `info`!",
	common:
	{
		buy($, m, amount, query = false)
		{
			amount = Math.floor(amount);
			let stonks = $.lib.loadJSON('stonks');
			let user = $.lib.get($.lib.loadJSON('storage').users, $.author.id, {});
			let market = stonks.markets[m];
			let value = Math.round(market.value);
			let money = $.lib.get(user, 'money', 0);
			
			// buy all
			if(amount === -1)
				amount = Math.floor(money / value);
			
			if(money >= (value * amount))
			{
				$.lib.get(user, 'stonks', {});
				let userAmount = $.lib.get(user.stonks, m, 0);
				user.stonks[m] += userAmount + amount;
				user.money -= value * amount;
				market.invested += amount;
				let stockName = $.lib.pluralise(amount, 'stock', 's');
				let stockNameInvested = $.lib.pluralise(market.invested, 'stock', 's');
				$.channel.send(`You invested in and bought ${stockName} from ${market.name}. That market now has ${stockNameInvested} invested in it.`); // You now have x stonks in y.
			}
			else
				$.channel.send("You don't have enough money!");
		},
		// Also keep track of how much value the stock had when the user had it to tell them whether it was a gain or a loss. It'll just tell the user the net effect so don't worry about keeping track of each individual stock.
		sell($, m, amount, query = false)
		{
			amount = Math.floor(amount);
			let stonks = $.lib.loadJSON('stonks');
			let user = $.lib.get($.lib.loadJSON('storage').users, $.author.id, {});
			let market = stonks.markets[m];
			let value = Math.round(market.value);
			$.lib.get(user, 'stonks', {});
			let stocks = $.lib.get(user.stonks, m, 0);
			
			if(amount === -1)
				amount = stocks;
			
			if(stocks > 0)
			{
				user.stonks[m] -= amount;
				let userMoney = $.lib.get(user, 'money', 0);
				user.money += userMoney + (value * amount);
				market.invested -= amount; // It's the value of the current market value because you're taking out that amount of money you invested, so that much money goes out of the invested amount. No wait... The invested amount should show the amount of stocks rather than being tied to a value at one point in time. And calculations involving the market investments should multiply that by its value.
				let stockName = $.lib.pluralise(amount, 'stock', 's');
				let stockNameInvested = $.lib.pluralise(market.invested, 'stock', 's');
				let creditName = $.lib.pluralise(value * amount, 'credit', 's');
				$.channel.send(`You sold ${stockName} from ${market.name} for ${creditName}! That market now has ${stockNameInvested} invested in it.`);
			}
			else
				$.channel.send(`You don't have any stocks in ${market.name}!`);
		},
		isValidMarket($, m)
		{
			let stonks = $.lib.loadJSON('stonks', true);
			let isValid = m in stonks.markets;
			
			if(!isValid)
				$.channel.send(`"${m}" is not a valid market!`);
			
			return isValid;
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
					// Show the number of stocks you can buy
					/*if($.common.isValidMarket($, $.args[0]))
					{
						let stonks = $.lib.loadJSON('stonks', true);
						let market = Math.round(stonks.markets[$.args[0]]);
						let user = $.lib.get($.lib.loadJSON('storage', true).users, $.author.id, {});
						let amount = Math.floor(user.money / market.value);
						
						if(amount === 0 || market.value <= 0)
							$.channel.send(`You can't buy any stocks from ${market.name}!`);
						else
							$.channel.send(`You can buy up to ${amount} stocks from ${market.name}!`);
					}*/
				},
				number:
				{
					run($)
					{
						if($.common.isValidMarket($, $.args[0]))
						{
							if($.args[1] >= 0)
								$.common.buy($, $.args[0], $.args[1]);
							else
								$.channel.send("You need to enter in a value of 0 or greater!");
						}
					}
				},
				any:
				{
					run($)
					{
						if($.common.isValidMarket($, $.args[0]))
						{
							if($.args[1] === 'all' || $.args[1] === 'yes')
								$.common.buy($, $.args[0], -1);
							else
								$.channel.send(`${$.args[1]} is not a valid amount!`);
						}
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
					// Shows the amount of stocks you have to sell.
					/*if($.common.isValidMarket($, $.args[0]))
					{
						let user = $.lib.get($.lib.loadJSON('storage', true).users, $.author.id, {});
						let stonks = $.lib.get($.lib.get(user, 'stonks', {}), $.args[0], 0);
						let market = Math.round($.lib.loadJSON('stonks', true).markets[$.args[0]]);
						$.channel.send(`You have ${$.lib.pluralise(stonks, 'stock', 's')} to sell in ${market.name}.`);
					}*/
				},
				number:
				{
					run($)
					{
						if($.common.isValidMarket($, $.args[0]))
						{
							if($.args[1] >= 0)
								$.common.sell($, $.args[0], $.args[1]);
							else
								$.channel.send("You need to enter in a value of 0 or greater!");
						}
					}
				},
				any:
				{
					run($)
					{
						if($.common.isValidMarket($, $.args[0]))
						{
							if($.args[1] === 'all' || $.args[1] === 'yes')
								$.common.sell($, $.args[0], -1);
							else
								$.channel.send(`${$.args[1]} is not a valid amount!`);
						}
					}
				}
			}
		},
		info:
		{
			message: "You need to enter in a market as well!",
			any:
			{
				run($)
				{
					if($.common.isValidMarket($, $.args[0]))
					{
						let stonks = $.lib.loadJSON('stonks', true);
						let market = stonks.markets[$.args[0]];
						// include an icon, maybe
						$.channel.send({embed: {
							title: "sample title",
							description: "sample desc",
							color: "#8000ff"
						}});
					}
				}
			}
		}
	}
};