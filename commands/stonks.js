module.exports = {
	description: "Buy, sell, and get info on stonks.",
	run($)
	{
		let stonks = $.lib.loadJSON('stonks', true);
		let user = $.lib.loadJSON('storage', true).users.access($.author.id, {});
		let fields = [];
		
		for(let market in user.stonks)
		{
			fields.push({
				name: stonks.markets[market].name,
				value: user.stonks[market].pluralise('stock', 's')
			});
		}
		
		$.channel.send({embed: {
			author:
			{
				name: $.author.username,
				icon_url: $.author.avatarURL({
					format: 'png',
					dynamic: true
				})
			},
			color: "#8000ff",
			fields: fields
		}});
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
					if(isValidMarket($, $.args[0]))
					{
						let stonks = $.lib.loadJSON('stonks', true);
						let market = stonks.markets[$.args[0]];
						let user = $.lib.loadJSON('storage', true).users.access($.author.id, {});
						let amount = Math.floor(user.money / Math.round(market.value));
						
						if(amount === 0 || market.value <= 0)
							$.channel.send(`You can't buy any stocks from ${market.name}!`);
						else
							$.channel.send(`You can buy up to ${amount} stocks from ${market.name}!`);
					}
				},
				number:
				{
					run($)
					{
						if(isValidMarket($, $.args[0]))
						{
							if($.args[1] >= 0)
								buy($, $.args[0], $.args[1]);
							else
								$.channel.send("You need to enter in a value of 0 or greater!");
						}
					}
				},
				any:
				{
					run($)
					{
						if(isValidMarket($, $.args[0]))
						{
							if($.args[1] === 'all' || $.args[1] === 'yes')
								buy($, $.args[0], -1);
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
					if(isValidMarket($, $.args[0]))
					{
						let user = $.lib.access($.lib.loadJSON('storage', true).users, $.author.id, {});
						let stonks = user.access('stonks', {}).access($.args[0], 0);
						let market = $.lib.loadJSON('stonks', true).markets[$.args[0]];
						$.channel.send(`You have ${stonks.pluralise('stock', 's')} to sell in ${market.name}.`);
					}
				},
				number:
				{
					run($)
					{
						if(isValidMarket($, $.args[0]))
						{
							if($.args[1] >= 0)
								sell($, $.args[0], $.args[1]);
							else
								$.channel.send("You need to enter in a value of 0 or greater!");
						}
					}
				},
				any:
				{
					run($)
					{
						if(isValidMarket($, $.args[0]))
						{
							if($.args[1] === 'all' || $.args[1] === 'yes')
								sell($, $.args[0], -1);
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
					if(isValidMarket($, $.args[0]))
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

function buy($, m, amount, query = false)
{
	amount = Math.floor(amount);
	let stonks = $.lib.loadJSON('stonks');
	let user = $.lib.loadJSON('storage').users.access($.author.id, {});
	let market = stonks.markets[m];
	let value = Math.round(market.value);
	let money = user.access('money', 0);
	
	// buy all
	if(amount === -1)
		amount = Math.floor(money / value);
	
	if(money < (value * amount))
	{
		$.channel.send("You don't have enough money!");
		return;
	}
	
	$.lib.access(user, 'stonks', {});
	let userAmount = user.stonks.access(m, 0);
	user.stonks[m] += amount;
	user.money -= value * amount;
	market.invested += amount;
	let stockName = amount.pluralise('stock', 's');
	let stockNameInvested = market.invested.pluralise('stock', 's');
	$.channel.send(`You invested in and bought ${stockName} from ${market.name}. That market now has ${stockNameInvested} invested in it.`); // You now have x stonks in y.
}

// Also keep track of how much value the stock had when the user had it to tell them whether it was a gain or a loss. It'll just tell the user the net effect so don't worry about keeping track of each individual stock.
function sell($, m, amount, query = false)
{
	amount = Math.floor(amount);
	let stonks = $.lib.loadJSON('stonks');
	let user = $.lib.loadJSON('storage').users.access($.author.id, {});
	let market = stonks.markets[m];
	let value = Math.round(market.value);
	let stocks = user.access('stonks', {}).access(m, 0);
	
	if(amount === -1)
		amount = stocks;
	
	if(stocks <= 0)
	{
		$.channel.send(`You don't have any stocks in ${market.name}!`);
		return;
	}
	
	user.stonks[m] -= amount;
	let userMoney = user.access('money', 0);
	user.money += userMoney + (value * amount);
	market.invested -= amount; // It's the value of the current market value because you're taking out that amount of money you invested, so that much money goes out of the invested amount. No wait... The invested amount should show the amount of stocks rather than being tied to a value at one point in time. And calculations involving the market investments should multiply that by its value.
	let stockName = amount.pluralise('stock', 's');
	let stockNameInvested = market.invested.pluralise('stock', 's');
	let creditName = (value * amount).pluralise('credit', 's');
	$.channel.send(`You sold ${stockName} from ${market.name} for ${creditName}! That market now has ${stockNameInvested} invested in it.`);
}

function isValidMarket($, m)
{
	let stonks = $.lib.loadJSON('stonks', true);
	let isValid = m in stonks.markets;
	
	if(!isValid)
		$.channel.send(`"${m}" is not a valid market!`);
	
	return isValid;
}