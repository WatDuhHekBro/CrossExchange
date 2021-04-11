import {Command, NamedCommand, CHANNEL_TYPE, getPermissionLevel, getPermissionName} from "onion-lasers";
import {Config, Storage} from "../structures";
import {logs} from "../modules/globals";

function getInterceptMessage(activated: boolean) {
    if (activated) return "I am now intercepting messages.";
    else return "I will no longer be intercepting messages now.";
}

function getLogBuffer(type: string) {
    return {
        files: [
            {
                attachment: Buffer.alloc(logs[type].length, logs[type]),
                name: `${Date.now()}.${type}.log`
            }
        ]
    };
}

export default new NamedCommand({
    description:
        "An all-in-one command to do admin stuff. You need to be either an admin of the server or one of the bot's mechanics to use this command.",
    async run({send, author, member}) {
        const permLevel = getPermissionLevel(author, member);
        send(`${author}, your permission level is \`${getPermissionName(permLevel)}\` (${permLevel}).`);
    },
    subcommands: {
        set: new NamedCommand({
            description: "Set different per-guild settings for the bot.",
            permission: PERMISSIONS.ADMIN,
            channelType: CHANNEL_TYPE.GUILD,
            run: "You have to specify the option you want to set.",
            subcommands: {
                prefix: new NamedCommand({
                    description: "Set a custom prefix for your guild. Removes your custom prefix if none is provided.",
                    usage: "(<prefix>)",
                    async run({send, guild}) {
                        Storage.getGuild(guild!.id).prefix = null;
                        Storage.save();
                        send(
                            `The custom prefix for this guild has been removed. My prefix is now back to \`${Config.prefix}\`.`
                        );
                    },
                    any: new Command({
                        async run({send, guild, args}) {
                            Storage.getGuild(guild!.id).prefix = args[0];
                            Storage.save();
                            send(`The custom prefix for this guild is now \`${args[0]}\`.`);
                        }
                    })
                }),
                intercept: new NamedCommand({
                    description:
                        'Disable the bot from doing stuff when non-command messages are sent. This is stuff like if you say "oil" or "duolingo" in chat. Toggles the option if none is selected.',
                    usage: "(<on/off>)",
                    async run({send, guild}) {
                        const guildStorage = Storage.getGuild(guild!.id);
                        guildStorage.intercept = !guildStorage.intercept;
                        Storage.save();
                        send(getInterceptMessage(guildStorage.intercept));
                    },
                    subcommands: {
                        on: new NamedCommand({
                            async run({send, guild}) {
                                Storage.getGuild(guild!.id).intercept = true;
                                Storage.save();
                                send(getInterceptMessage(true));
                            }
                        }),
                        off: new NamedCommand({
                            async run({send, guild}) {
                                Storage.getGuild(guild!.id).intercept = false;
                                Storage.save();
                                send(getInterceptMessage(false));
                            }
                        })
                    }
                })
            }
        }),
        diag: new NamedCommand({
            description: 'Requests a debug log with the "info" verbosity level.',
            permission: PERMISSIONS.BOT_MECHANIC,
            async run({send}) {
                send(getLogBuffer("info"));
            },
            any: new Command({
                description: `Select a verbosity to listen to. Available levels: \`[${Object.keys(logs).join(", ")}]\``,
                async run({send, args}) {
                    const type = args[0];

                    if (type in logs) send(getLogBuffer(type));
                    else
                        send(
                            `Couldn't find a verbosity level named \`${type}\`! The available types are \`[${Object.keys(
                                logs
                            ).join(", ")}]\`.`
                        );
                }
            })
        })
    }
});
