import Command from "../core/command";
import $, {CommonLibrary} from "../core/lib";
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
					
				},
				number: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						
					}
				}),
				subcommands:
				{
					all: new Command({
						async run($: CommonLibrary): Promise<any>
						{
							
						}
					})
				},
				any: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						// x isn't a valid amount
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
					
				},
				number: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						
					}
				}),
				subcommands:
				{
					all: new Command({
						async run($: CommonLibrary): Promise<any>
						{
							
						}
					})
				},
				any: new Command({
					async run($: CommonLibrary): Promise<any>
					{
						// x isn't a valid amount
					}
				})
			})
		}),
		info: new Command({
			description: "Get info on a market along with its catalog of market values or get a list of all markets.",
			usage: "(<market>)",
			async run($: CommonLibrary): Promise<any>
			{
				
			},
			any: new Command({
				async run($: CommonLibrary): Promise<any>
				{
					
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