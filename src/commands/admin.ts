import Command from "../core/command";
import {CommonLibrary, logs} from "../core/lib";
import {Config, Storage, Stonks} from "../core/structures";
import {Permissions} from "discord.js";

function authenticate($: CommonLibrary, customMessage = ""): boolean
{
	const hasAccess = Config.mechanics.includes($.author.id) || ($.member?.hasPermission(Permissions.FLAGS.ADMINISTRATOR) || false);
	
	if(!hasAccess)
	{
		if(customMessage !== "")
			$.channel.send(customMessage);
		else
		{
			$.channel.send(`${$.author.toString()}, you are not a server admin or one of the bot's mechanics. If you have access to the server files, add yourself to it manually in \`data/config.json\`. Your user ID should now be logged in the console.`);
			$.debug($.author.id);
		}
	}
	
	return hasAccess;
}

function getInterceptMessage(activated: boolean)
{
	if(activated)
		return "I am now intercepting messages.";
	else
		return "I will no longer be intercepting messages now.";
}

const interceptBlock = "You can't tell me what to do!";

function getLogBuffer(type: string)
{
	return {files: [{
		attachment: Buffer.alloc(logs[type].length, logs[type]),
		name: `${Date.now()}.${type}.log`
	}]};
}

export default new Command({
	description: "An all-in-one command to do admin stuff. You need to be either an admin of the server or one of the bot's mechanics to use this command.",
	async run($: CommonLibrary): Promise<any>
	{
		const admin = $.member?.hasPermission(Permissions.FLAGS.ADMINISTRATOR) || false;
		const mechanic = Config.mechanics.includes($.author.id);
		let status = "";
		
		if(admin && mechanic)
			status = "a server admin and one of the bot's mechanics";
		else if(admin)
			status = "a server admin";
		else if(mechanic)
			status = "one of the bot's mechanics";
		
		if(authenticate($))
			$.channel.send(`${$.author.toString()}, you are ${status}, meaning you can use this command.`);
	},
	subcommands:
	{
		init: new Command({
			description: "Initializes messages for market values and random events. (MAKE SURE TO DO THIS IN A DEDICATED CHANNEL!)",
			async run($: CommonLibrary): Promise<any>
			{
				if(authenticate($))
				{
					if($.channel.type !== "text")
						return $.channel.send("You need to be in a text channel to use this command!");
					
					const channel = $.channel;
					
					$.prompt(await channel.send(`Are you sure you want to set ${channel.toString()} as the channel dedicated to displaying market values and events for the stonks bot?\n*(This message will automatically be deleted after 10 seconds.)*`), $.author.id, () => {
						Stonks.addGuild(channel);
						Stonks.save();
					});
				}
			}
		}),
		set: new Command({
			description: "Set different per-guild settings for the bot.",
			run: "You have to specify the option you want to set.",
			subcommands:
			{
				prefix: new Command({
					description: "Set a custom prefix for your guild. Removes your custom prefix if none is provided.",
					usage: "(<prefix>)",
					async run($: CommonLibrary): Promise<any>
					{
						if(authenticate($))
						{
							Storage.getGuild($.guild?.id || "N/A").prefix = null;
							Storage.save();
							$.channel.send(`The custom prefix for this guild has been removed. My prefix is now back to \`${Config.prefix}\`.`);
						}
					},
					any: new Command({
						async run($: CommonLibrary): Promise<any>
						{
							if(authenticate($))
							{
								Storage.getGuild($.guild?.id || "N/A").prefix = $.args[0];
								Storage.save();
								$.channel.send(`The custom prefix for this guild is now \`${$.args[0]}\`.`);
							}
						}
					})
				}),
				intercept: new Command({
					description: "Disable the bot from doing stuff when non-command messages are sent. This is stuff like if you say \"oil\" or \"duolingo\" in chat. Toggles the option if none is selected.",
					usage: "(<on/off>)",
					async run($: CommonLibrary): Promise<any>
					{
						if(authenticate($, interceptBlock))
						{
							const guild = Storage.getGuild($.guild?.id || "N/A");
							guild.intercept = !guild.intercept;
							Storage.save();
							$.channel.send(getInterceptMessage(guild.intercept));
						}
					},
					subcommands:
					{
						on: new Command({
							async run($: CommonLibrary): Promise<any>
							{
								if(authenticate($, interceptBlock))
								{
									Storage.getGuild($.guild?.id || "N/A").intercept = true;
									Storage.save();
									$.channel.send(getInterceptMessage(true));
								}
							}
						}),
						off: new Command({
							async run($: CommonLibrary): Promise<any>
							{
								if(authenticate($, interceptBlock))
								{
									Storage.getGuild($.guild?.id || "N/A").intercept = false;
									Storage.save();
									$.channel.send(getInterceptMessage(false));
								}
							}
						})
					}
				})
			}
		}),
		diag: new Command({
			description: "Requests a debug log with the \"info\" verbosity level.",
			async run($: CommonLibrary): Promise<any>
			{
				if(authenticate($))
					$.channel.send(getLogBuffer("info"));
			},
			any: new Command({
				description: `Select a verbosity to listen to. Available levels: \`[${Object.keys(logs)}]\``,
				async run($: CommonLibrary): Promise<any>
				{
					if(authenticate($))
					{
						const type = $.args[0];
						
						if(type in logs)
							$.channel.send(getLogBuffer(type));
						else
							$.channel.send(`Couldn't find a verbosity level named \`${type}\`! The available types are \`[${Object.keys(logs)}]\`.`);
					}
				}
			})
		})
	}
});