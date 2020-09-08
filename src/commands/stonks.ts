import {Command, prompt, callMemberByUsername, pluralise, pluraliseSigned} from "onion-lasers";
import {Storage, Stonks} from "../structures";
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
			
			return `You invested in and bought ${pluralise(amount, "stock", "s")} from ${market.title}. You have now invested ${user.invested[tag]} out of its ${pluralise(market.invested, "total stock", "s")}.`;
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
			
			return `You sold ${pluralise(amount, "stock", "s")} from ${market.title} for ${pluralise(value * amount, "credit", "s")}!`;
		}
		else
			return `You can sell ${pluralise(stocks, "stock", "s")} for ${pluralise(stocks * value, "credit", "s")} in ${market.title}.`;
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
				value: pluraliseSigned(profile.net, "credit", "s")
			},
			{
				name: "Stocks Lost",
				value: pluralise(profile.lost, "stock", "s")
			},
			{
				name: "1st Most Invested",
				value: `${Stonks.getMarket(first)?.title || first || "N/A"} - ${pluralise(profile.invested[first] || 0, "stock", "s")}`
			},
			{
				name: "2nd Most Invested",
				value: `${Stonks.getMarket(second)?.title || second || "N/A"} - ${pluralise(profile.invested[second] || 0, "stock", "s")}`
			},
			{
				name: "3rd Most Invested",
				value: `${Stonks.getMarket(third)?.title || third || "N/A"} - ${pluralise(profile.invested[third] || 0, "stock", "s")}`
			}
		]
	}};
}

export default new Command({
	description: "Check your profile related to stonks. Also provides other commands related to stonks.",
	async run($): Promise<any>
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
				async run($): Promise<any>
				{
					$.channel.send(Query.buy($.args[0], $.author.id));
				},
				number: new Command({
					async run($): Promise<any>
					{
						const result = Query.buy($.args[0], $.author.id, $.args[1]);
						
						if(result === Query.confirm)
						{
							prompt(await $.channel.send(result), $.author.id, () => {
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
						async run($): Promise<any>
						{
							const result = Query.buy($.args[0], $.author.id, Infinity);
							
							if(result === Query.confirm)
							{
								prompt(await $.channel.send(result), $.author.id, () => {
									$.channel.send(Query.buy($.args[0], $.author.id, Infinity, true));
								});
							}
							else
								$.channel.send(result);
						}
					})
				},
				any: new Command({
					async run($): Promise<any>
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
				async run($): Promise<any>
				{
					$.channel.send(Query.sell($.args[0], $.author.id));
				},
				number: new Command({
					async run($): Promise<any>
					{
						$.channel.send(Query.sell($.args[0], $.author.id, $.args[1]));
					}
				}),
				subcommands:
				{
					all: new Command({
						async run($): Promise<any>
						{
							$.channel.send(Query.sell($.args[0], $.author.id, Infinity));
						}
					})
				},
				any: new Command({
					async run($): Promise<any>
					{
						$.channel.send(`\`${$.args[1]}\` isn't a valid amount!`);
					}
				})
			})
		}),
		info: new Command({
			description: "Get info on a market or get a list of all markets.",
			usage: "(<market>)",
			async run($): Promise<any>
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
				async run($): Promise<any>
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
								value: `${pluralise(Math.round(market.value), "credit", "s")} (${pluraliseSigned(market.difference, "credit", "s")})`
							}
						]
					}});
				}
			})
		}),
		all: new Command({
			description: "See all the markets you've invested in.",
			async run($): Promise<any>
			{
				const user = Storage.getUser($.author.id);
				const list = Object.keys(user.invested).sort((a, b) => user.invested[b] - user.invested[a]);
				let output = "📈 **Your Markets** 📉\n";
				
				for(const tag of list)
					if(user.invested[tag] > 0)
						output += `${Stonks.markets[tag]?.title || tag} (\`${tag}\`): ${pluralise(user.invested[tag], "stock", "s")}\n`;
				
				$.channel.send(output, {split: true});
			}
		}),
		init: new Command({
			description: "Initializes messages for market values and random events. (MAKE SURE TO DO THIS IN A DEDICATED CHANNEL!)",
			permission: PERMISSIONS.ADMIN,
			async run($): Promise<any>
			{
				if($.channel.type !== "text")
					return $.channel.send("You need to be in a text channel to use this command!");
				
				const channel = $.channel;
				
				prompt(await channel.send(`Are you sure you want to set ${channel.toString()} as the channel dedicated to displaying market values and events for the stonks bot?\n*(This message will automatically be deleted after 10 seconds.)*`), $.author.id, () => {
					Stonks.addGuild(channel);
					Stonks.save();
				});
			}
		})
	},
	user: new Command({
		description: "Check someone else's profile related to stonks by using their user ID or pinging them.",
		async run($): Promise<any>
		{
			$.channel.send(getProfileEmbed($.args[0]));
		}
	}),
	any: new Command({
		description: "Check someone else's profile related to stonks by using their username.",
		async run($): Promise<any>
		{
			callMemberByUsername($.message, $.args.join(" "), member => {
				$.channel.send(getProfileEmbed(member.user));
			});
		}
	})
});