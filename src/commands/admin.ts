import {Command, getPermissionName, getPermissionLevel} from "onion-lasers";
import {Config, Storage} from "../structures";
import {logs} from "../modules/globals";

function getInterceptMessage(activated: boolean)
{
	if(activated)
		return "I am now intercepting messages.";
	else
		return "I will no longer be intercepting messages now.";
}

function getLogBuffer(type: string)
{
	return {files: [{
		attachment: Buffer.alloc(logs[type].length, logs[type]),
		name: `${Date.now()}.${type}.log`
	}]};
}

export default new Command({
	description: "An all-in-one command to do admin stuff. You need to be either an admin of the server or one of the bot's mechanics to use this command.",
	async run($): Promise<any>
	{
		if(!$.member)
			return $.channel.send("Couldn't find a member object for you! Did you make sure you used this in a server?");
		const permLevel = getPermissionLevel($.member);
		$.channel.send(`${$.author.toString()}, your permission level is \`${getPermissionName(permLevel)}\` (${permLevel}).`);
	},
	subcommands:
	{
		set: new Command({
			description: "Set different per-guild settings for the bot.",
			permission: PERMISSIONS.ADMIN,
			run: "You have to specify the option you want to set.",
			subcommands:
			{
				prefix: new Command({
					description: "Set a custom prefix for your guild. Removes your custom prefix if none is provided.",
					usage: "(<prefix>)",
					async run($): Promise<any>
					{
						Storage.getGuild($.guild?.id || "N/A").prefix = null;
						Storage.save();
						$.channel.send(`The custom prefix for this guild has been removed. My prefix is now back to \`${Config.prefix}\`.`);
					},
					any: new Command({
						async run($): Promise<any>
						{
							Storage.getGuild($.guild?.id || "N/A").prefix = $.args[0];
							Storage.save();
							$.channel.send(`The custom prefix for this guild is now \`${$.args[0]}\`.`);
						}
					})
				}),
				intercept: new Command({
					description: "Disable the bot from doing stuff when non-command messages are sent. This is stuff like if you say \"oil\" or \"duolingo\" in chat. Toggles the option if none is selected.",
					usage: "(<on/off>)",
					async run($): Promise<any>
					{
						const guild = Storage.getGuild($.guild?.id || "N/A");
						guild.intercept = !guild.intercept;
						Storage.save();
						$.channel.send(getInterceptMessage(guild.intercept));
					},
					subcommands:
					{
						on: new Command({
							async run($): Promise<any>
							{
								Storage.getGuild($.guild?.id || "N/A").intercept = true;
								Storage.save();
								$.channel.send(getInterceptMessage(true));
							}
						}),
						off: new Command({
							async run($): Promise<any>
							{
								Storage.getGuild($.guild?.id || "N/A").intercept = false;
								Storage.save();
								$.channel.send(getInterceptMessage(false));
							}
						})
					}
				})
			}
		}),
		diag: new Command({
			description: "Requests a debug log with the \"info\" verbosity level.",
			permission: PERMISSIONS.BOT_SUPPORT,
			async run($): Promise<any>
			{
				$.channel.send(getLogBuffer("info"));
			},
			any: new Command({
				description: `Select a verbosity to listen to. Available levels: \`[${Object.keys(logs).join(", ")}]\``,
				async run($): Promise<any>
				{
					const type = $.args[0];
					
					if(type in logs)
						$.channel.send(getLogBuffer(type));
					else
						$.channel.send(`Couldn't find a verbosity level named \`${type}\`! The available types are \`[${Object.keys(logs)}]\`.`);
				}
			})
		})
	}
});