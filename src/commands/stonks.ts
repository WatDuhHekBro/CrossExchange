import Command from "../core/command";
import $, {CommonLibrary, perforate, formatUTCTimestamp} from "../core/lib";
import {Storage, Stonks} from "../core/structures";
import {User} from "discord.js";

/**
 * Acts as the mediator between the stonks command and the data itself.
 * 
 * `Query.buy(market, author.id)` --> How much can I buy from this market?
 * `Query.buy(market, author.id, amount)` --> Attempt to buy this amount of stocks.
 * `Query.buy(market, author.id, Infinity)` --> Buy as many stocks as possible.
 * 
 * `Query.sell(market, author.id)` --> How much can I sell from this market?
 * `Query.sell(market, author.id, amount)` --> Attempt to sell this amount of stocks.
 * `Query.sell(market, author.id, Infinity)` --> Sell as many stocks as possible.
 */
export const Query = {
	confirm: "The current value of this market is quite low. Be warned that if the market value hits 0, you will lose ALL your stocks in that market.\n*(This message will automatically be deleted after 10 seconds.)*",
	buy(tag: string, initiator: string, amount?: number, override = false): string
	{
		const market = Stonks.getMarket(tag);
		const user = Storage.getUser(initiator);
		
		if(!market)
			return this.invalid(tag);
		
		const value = Math.round(market.value);
		const capacity = Math.floor(user.money / value);
		
		if(value <= 0 || capacity <= 0)
			return `You can't buy any stocks from ${market.title}!`;
		else if(amount)
		{
			amount = Math.floor(amount);
			
			if(amount <= 0)
				return `You need to enter in a value of 1 or greater!`;
			
			if(amount === Infinity)
				amount = capacity;
			else if(user.money < value * amount)
				return "You don't have enough money!";
			
			if(value < 25 && !override)
				return this.confirm;
			
			user.initMarket(tag);
			market.invested += amount;
			user.invested[tag] += amount;
			user.money -= value * amount;
			user.net -= value * amount;
			Storage.save();
			Stonks.save();
			
			return `You invested in and bought ${$(amount).pluralise("stock", "s")} from ${market.title}. You have now invested ${user.invested[tag]} out of its ${$(market.invested).pluralise("total stock", "s")}.`;
		}
		else
			return `You can buy up to ${capacity} stocks from ${market.title}.`;
	},
	sell(tag: string, initiator: string, amount?: number): string
	{
		const market = Stonks.getMarket(tag);
		const user = Storage.getUser(initiator);
		
		if(!market)
			return this.invalid(tag);
		
		user.initMarket(tag);
		const stocks = user.invested[tag];
		const value = Math.round(market.value);
		
		if(stocks <= 0)
			return `You don't have any stocks in ${market.title}!`;
		else if(amount)
		{
			amount = Math.floor(amount);
			
			if(amount <= 0)
				return `You need to enter in a value of 1 or greater!`;
			
			if(amount === Infinity)
				amount = stocks;
			else if(amount > stocks)
				return "You don't have that many stocks!";
			
			market.invested -= amount;
			user.invested[tag] -= amount;
			user.money += value * amount;
			user.net += value * amount;
			Storage.save();
			Stonks.save();
			
			return `You sold ${$(amount).pluralise("stock", "s")} from ${market.title} for ${$(value * amount).pluralise("credit", "s")}!`;
		}
		else
			return `You can sell ${$(stocks).pluralise("stock", "s")} for ${$(stocks * value).pluralise("credit", "s")} in ${market.title}.`;
	},
	invalid(tag: string): string
	{
		return `\`${tag}\` is not a valid market! Make sure you use the market's tag instead of its name, such as \`rookie\` instead of \`Rookie Harbor\`. To see a list of valid tags, use \`stonks info\`.`;
	}
};

function getProfileEmbed(user: User): object
{
	const profile = Storage.getUser(user.id);
	const list = Object.keys(profile.invested).sort((a, b) => profile.invested[b] - profile.invested[a]);
	const first = list[0];
	const second = list[1];
	const third = list[2];
	
	return {embed: {
		color: 0x8000FF,
		author:
		{
			name: user.username,
			icon_url: user.displayAvatarURL({
				format: "png",
				dynamic: true
			})
		},
		fields:
		[
			{
				name: "Net Gain/Loss",
				value: $(profile.net).pluraliseSigned("credit", "s")
			},
			{
				name: "Stocks Lost",
				value: $(profile.lost).pluralise("stock", "s")
			},
			{
				name: "1st Most Invested",
				value: `${Stonks.getMarket(first)?.title || first || "N/A"} - ${$(profile.invested[first] || 0).pluralise("stock", "s")}`
			},
			{
				name: "2nd Most Invested",
				value: `${Stonks.getMarket(second)?.title || second || "N/A"} - ${$(profile.invested[second] || 0).pluralise("stock", "s")}`
			},
			{
				name: "3rd Most Invested",
				value: `${Stonks.getMarket(third)?.title || third || "N/A"} - ${$(profile.invested[third] || 0).pluralise("stock", "s")}`
			}
		]
	}};
}

export default new Command({
	description: "Check your profile related to stonks. Also provides other commands related to stonks.",
	async run($: CommonLibrary): Promise<any>
	{
		$.channel.send(getProfileEmbed($.author));
	},
	subcommands:
	{
		buy: new Command({
			description: "Buy or see how much you can buy from a market.",
			usage: "<market> ([<amount>/all])",
			run: "You need to enter in a market as well!",
			any: new Command({
				async run($: CommonLibrary): Promise<any>
				{
					$.channel.send(Query.buy($.args[0], $.author.id));
				},
				number: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						const result = Query.buy($.args[0], $.author.id, $.args[1]);
						
						if(result === Query.confirm)
						{
							$.prompt(await $.channel.send(result), $.author.id, () => {
								$.channel.send(Query.buy($.args[0], $.author.id, $.args[1], true));
							});
						}
						else
							$.channel.send(result);
					}
				}),
				subcommands:
				{
					all: new Command({
						async run($: CommonLibrary): Promise<any>
						{
							const result = Query.buy($.args[0], $.author.id, Infinity);
							
							if(result === Query.confirm)
							{
								$.prompt(await $.channel.send(result), $.author.id, () => {
									$.channel.send(Query.buy($.args[0], $.author.id, Infinity, true));
								});
							}
							else
								$.channel.send(result);
						}
					})
				},
				any: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						$.channel.send(`\`${$.args[1]}\` isn't a valid amount!`);
					}
				})
			})
		}),
		sell: new Command({
			description: "Sell or see how much you can sell from a market.",
			usage: "<market> ([<amount>/all])",
			run: "You need to enter in a market as well!",
			any: new Command({
				async run($: CommonLibrary): Promise<any>
				{
					$.channel.send(Query.sell($.args[0], $.author.id));
				},
				number: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						$.channel.send(Query.sell($.args[0], $.author.id, $.args[1]));
					}
				}),
				subcommands:
				{
					all: new Command({
						async run($: CommonLibrary): Promise<any>
						{
							$.channel.send(Query.sell($.args[0], $.author.id, Infinity));
						}
					})
				},
				any: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						$.channel.send(`\`${$.args[1]}\` isn't a valid amount!`);
					}
				})
			})
		}),
		info: new Command({
			description: "Get info on a market or get a list of all markets.",
			usage: "(<market>)",
			async run($: CommonLibrary): Promise<any>
			{
				let output = "";
				
				for(const tag in Stonks.markets)
				{
					const market = Stonks.markets[tag];
					output += `\`${tag}\` - ${market.title}\n`;
				}
				
				$.channel.send(output, {split: true});
			},
			any: new Command({
				async run($: CommonLibrary): Promise<any>
				{
					const market = Stonks.getMarket($.args[0]);
					
					if(!market)
						return $.channel.send(Query.invalid($.args[0]));
					
					$.channel.send({embed: {
						color: 0x008000,
						title: market.title,
						description: market.description,
						fields:
						[
							{
								name: "Market Value",
								value: `${$(Math.round(market.value)).pluralise("credit", "s")} (${$(market.difference).pluraliseSigned("credit", "s")})`
							}
						]
					}});
				}
			})
		}),
		all: new Command({
			description: "See all the markets you've invested in.",
			async run($: CommonLibrary): Promise<any>
			{
				const user = Storage.getUser($.author.id);
				const list = Object.keys(user.invested).sort((a, b) => user.invested[b] - user.invested[a]);
				let output = "📈 **Your Markets** 📉\n";
				
				for(const tag of list)
					if(user.invested[tag] > 0)
						output += `${Stonks.markets[tag]?.title || tag} (\`${tag}\`): ${$(user.invested[tag]).pluralise("stock", "s")}\n`;
				
				$.channel.send(output, {split: true});
			}
		})
	},
	user: new Command({
		description: "Check someone else's profile related to stonks by using their user ID or pinging them.",
		async run($: CommonLibrary): Promise<any>
		{
			$.channel.send(getProfileEmbed($.args[0]));
		}
	}),
	any: new Command({
		description: "Check someone else's profile related to stonks by using their username.",
		async run($: CommonLibrary): Promise<any>
		{
			if($.guild)
			{
				const username = $.args.join(" ");
				const member = (await $.guild.members.fetch({
					query: username,
					limit: 1
				})).first();
				
				if(member)
					$.channel.send(getProfileEmbed(member.user));
				else
					$.channel.send(`Couldn't find a user by the name of \`${username}\`!`);
			}
		}
	})
});