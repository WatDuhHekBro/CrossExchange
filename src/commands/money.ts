import {Command, NamedCommand, RestCommand, getMemberByName, CHANNEL_TYPE, confirm} from "onion-lasers";
import {pluralise} from "../lib";
import {Storage} from "../structures";
import {User} from "discord.js";

export function getMoneyEmbed(user: User): object {
    const profile = Storage.getUser(user.id);

    return {
        embed: {
            color: 0xffff00,
            author: {
                name: user.username,
                icon_url: user.displayAvatarURL({
                    format: "png",
                    dynamic: true
                })
            },
            fields: [
                {
                    name: "Balance",
                    value: pluralise(profile.money, "credit", "s")
                },
                {
                    name: "uwuing Penalties",
                    value: pluralise(profile.penalties * 350, "credit", "s")
                }
            ]
        }
    };
}

function getSendEmbed(sender: User, receiver: User, amount: number): object {
    return {
        embed: {
            color: 0xffff00,
            author: {
                name: sender.username,
                icon_url: sender.displayAvatarURL({
                    format: "png",
                    dynamic: true
                })
            },
            title: "Transaction",
            description: `${sender} has sent ${pluralise(amount, "credit", "s")} to ${receiver}!`,
            fields: [
                {
                    name: `Sender: ${sender.tag}`,
                    value: pluralise(Storage.getUser(sender.id).money, "credit", "s")
                },
                {
                    name: `Receiver: ${receiver.tag}`,
                    value: pluralise(Storage.getUser(receiver.id).money, "credit", "s")
                }
            ],
            footer: {
                text: receiver.username,
                icon_url: receiver.displayAvatarURL({
                    format: "png",
                    dynamic: true
                })
            }
        }
    };
}

export default new NamedCommand({
    description: "See how much money you have. Also provides other commands related to money.",
    async run({send, author}) {
        send(getMoneyEmbed(author));
    },
    subcommands: {
        get: new NamedCommand({
            description:
                "Pick up your daily credits. The cooldown is per user and every 22 hours to allow for some leeway.",
            async run({send, author}) {
                const user = Storage.getUser(author.id);
                const now = Date.now();

                if (user.lastReceived === -1) {
                    user.money = 100;
                    user.lastReceived = now;
                    Storage.save();
                    send(
                        "Here's 100 credits to get started, the price of a sandwich in Rookie Harbor.",
                        getMoneyEmbed(author)
                    );
                } else if (now - user.lastReceived >= 79200000) {
                    user.money += 25;
                    user.lastReceived = now;
                    Storage.save();
                    send("Here's your daily 25 credits.", getMoneyEmbed(author));
                } else
                    send(
                        `It's too soon to pick up your daily credits. You have about ${(
                            (user.lastReceived + 79200000 - now) /
                            3600000
                        ).toFixed(1)} hours to go.`
                    );
            }
        }),
        send: new NamedCommand({
            description: "Send money to someone.",
            usage: "<user> <amount>",
            run: "Who are you sending this money to?",
            id: "user",
            user: new Command({
                run: "You need to enter an amount you're sending!",
                number: new Command({
                    async run({send, author, args}) {
                        const amount = Math.floor(args[1]);
                        const sender = Storage.getUser(author.id);
                        const target = args[0];
                        const receiver = Storage.getUser(target.id);

                        if (amount <= 0) return send("You must send at least one credit!");
                        else if (sender.money < amount)
                            return send("You don't have enough money to do that!", getMoneyEmbed(author));
                        else if (target.id === author.id) return send("You can't send money to yourself!");
                        else if (target.bot && !IS_DEV_MODE) return send("You can't send money to a bot!");

                        sender.money -= amount;
                        receiver.money += amount;
                        Storage.save();
                        return send(getSendEmbed(author, target, amount));
                    }
                })
            }),
            number: new Command({
                run: "You must use the format `money send <user> <amount>`!"
            }),
            any: new RestCommand({
                channelType: CHANNEL_TYPE.GUILD,
                async run({send, guild, author, args}) {
                    const last = args.pop();

                    if (!/\d+/g.test(last) && args.length === 0)
                        return send("You need to enter an amount you're sending!");

                    const amount = Math.floor(last);
                    const sender = Storage.getUser(author.id);

                    if (amount <= 0) return send("You must send at least one credit!");
                    else if (sender.money < amount)
                        return send("You don't have enough money to do that!", getMoneyEmbed(author));

                    const username = args.join(" ");
                    const member = await getMemberByName(guild!, username);
                    if (typeof member === "string") return send(member);
                    else if (member.user.id === author.id) return send("You can't send money to yourself!");
                    else if (member.user.bot && !IS_DEV_MODE) return send("You can't send money to a bot!");

                    const target = member.user;

                    const confirmed = await confirm(
                        await send(
                            `Are you sure you want to send ${pluralise(amount, "credit", "s")} to this person?`,
                            {
                                embed: {
                                    color: "#ffff00",
                                    author: {
                                        name: target.tag,
                                        icon_url: target.displayAvatarURL({
                                            format: "png",
                                            dynamic: true
                                        })
                                    }
                                }
                            }
                        ),
                        author.id
                    );

                    if (confirmed) {
                        const receiver = Storage.getUser(target.id);
                        sender.money -= amount;
                        receiver.money += amount;
                        Storage.save();
                        send(getSendEmbed(author, target, amount));
                    }

                    return;
                }
            })
        }),
        leaderboard: new NamedCommand({
            description: "See the richest players tracked by this bot (across servers).",
            async run({send, client}) {
                const users = Storage.users;
                const ids = Object.keys(users);
                ids.sort((a, b) => users[b].money - users[a].money);
                const fields = [];

                for (let i = 0, limit = Math.min(10, ids.length); i < limit; i++) {
                    const id = ids[i];
                    const user = await client.users.fetch(id);

                    fields.push({
                        name: `#${i + 1}. ${user.tag}`,
                        value: pluralise(users[id].money, "credit", "s")
                    });
                }

                send({
                    embed: {
                        title: "Top 10 Richest Players",
                        color: "#ffff00",
                        fields: fields
                    }
                });
            }
        }),
        set: new NamedCommand({
            description: "Forcefully sets someone's amount of money.",
            permission: PERMISSIONS.BOT_OWNER,
            usage: "<amount> (<user>)",
            run: "You need to enter in the amount of money to set.",
            number: new Command({
                async run({send, author, args}) {
                    const userObject = author;
                    const user = Storage.getUser(userObject.id);
                    user.money = args[0];
                    Storage.save();
                    send(`This is ${userObject}'s new amount of money.`, getMoneyEmbed(userObject));
                },
                id: "user",
                user: new Command({
                    async run({send, args}) {
                        const userObject = args[1];
                        const user = Storage.getUser(userObject.id);
                        user.money = args[0];
                        Storage.save();
                        send(`This is ${userObject}'s new amount of money.`, getMoneyEmbed(userObject));
                    }
                })
            })
        })
    },
    id: "user",
    user: new Command({
        description: "See how much money someone else has by using their user ID or pinging them.",
        async run({send, args}) {
            send(getMoneyEmbed(args[0]));
        }
    }),
    any: new RestCommand({
        description: "See how much money someone else has by using their username.",
        channelType: CHANNEL_TYPE.GUILD,
        async run({send, guild, combined}) {
            const member = await getMemberByName(guild!, combined);
            if (typeof member !== "string") send(getMoneyEmbed(member.user));
            else send(member);
        }
    })
});
