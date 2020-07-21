import Command from "../core/command";
import $, {CommonLibrary, perforate, formatUTCTimestamp} from "../core/lib";
import {Storage, Stonks} from "../core/structures";
import {User} from "discord.js";

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
			icon_url: user.avatarURL({
				format: "png",
				dynamic: true
			}) || user.defaultAvatarURL
		},
		fields:
		[
			{
				name: "Net Gain/Loss",
				value: $(profile.net).pluraliseSigned("credit", "s")
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

function verifyMarket($: CommonLibrary, tag: string): boolean
{
	const isValidMarket = !!Stonks.getMarket(tag);
	
	if(!isValidMarket)
		$.channel.send(`\`${tag}\` is not a valid market! Make sure you use the market's tag instead of its name, such as \`rookie\` instead of \`Rookie Harbor\`. To see a list of valid tags, use \`stonks info\`.`);
	
	return isValidMarket;
}

function getConvertedCatalog(catalog: [number, number][]): object[]
{
	const fields: object[] = new Array(catalog.length);
	
	for(let i = 0; i < catalog.length; i++)
	{
		const entry = catalog[i];
		const previousEntry = catalog[i+1];
		const currentValue = entry[0];
		const timestamp = entry[1];
		const delta = previousEntry ? `, ${$(currentValue - previousEntry[0]).pluraliseSigned("credit", "s")}` : "";
		
		fields[i] = {
			name: formatUTCTimestamp(new Date(timestamp)),
			value: `${$(currentValue).pluralise("credit", "s")}${delta}`
		};
	}
	
	return fields;
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
					if(verifyMarket($, $.args[0]))
					{
						$.debug($.args[0]);
					}
				},
				number: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						if(verifyMarket($, $.args[0]))
						{
							$.debug($.args[0]);
						}
					}
				}),
				subcommands:
				{
					all: new Command({
						async run($: CommonLibrary): Promise<any>
						{
							if(verifyMarket($, $.args[0]))
							{
								$.debug($.args[0]);
							}
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
					if(verifyMarket($, $.args[0]))
					{
						
					}
				},
				number: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						if(verifyMarket($, $.args[0]))
						{
							
						}
					}
				}),
				subcommands:
				{
					all: new Command({
						async run($: CommonLibrary): Promise<any>
						{
							if(verifyMarket($, $.args[0]))
							{
								
							}
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
			description: "Get info on a market along with its catalog of market values or get a list of all markets.",
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
					if(verifyMarket($, $.args[0]))
					{
						const market = Stonks.getMarket($.args[0]);
						
						if(!market)
							return $.error(`${$.args[0]} unexpectedly returned a null market!`);
						
						const catalogs = perforate(getConvertedCatalog(market.catalog), 10);
						const embed = {embed: {
							color: 0x008000,
							title: market.title,
							description: market.description,
							fields: catalogs[0]
						}} as any;
						const total = catalogs.length;
						const hasMultiplePages = total > 1;
						const getPageHeader = (page: number) => `Page ${page+1} of ${total}`;
						
						if(hasMultiplePages)
						{
							const msg = await $.channel.send(getPageHeader(0), embed);
							$.paginate(msg, $.author.id, total, page => {
								embed.embed.fields = catalogs[page];
								msg.edit(getPageHeader(page), embed);
							}, 300000);
						}
						else
							$.channel.send(embed);
					}
				}
			})
		}),
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