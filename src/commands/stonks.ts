import Command from "../core/command";
import {CommonLibrary} from "../core/lib";
import {Storage, Stonks} from "../core/structures";
import {User} from "discord.js";

function getStonksEmbed(user: User): object
{
	return {embed: {
		color: 0x8000FF
	}};
}

export default new Command({
	description: "Check your profile related to stonks. Also provides other commands related to stonks.",
	async run($: CommonLibrary): Promise<any>
	{
		
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
			
		}
	}),
	any: new Command({
		description: "Check someone else's profile related to stonks by using their username.",
		async run($: CommonLibrary): Promise<any>
		{
			
		}
	})
});