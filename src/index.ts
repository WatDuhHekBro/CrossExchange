import "./modules/globals";
import {Client, Permissions} from "discord.js";

// This is here in order to make it much less of a headache to access the client from other files.
// This of course won't actually do anything until the setup process is complete and it logs in.
export const client = new Client();

import {launch} from "onion-lasers";
import path from "path";
import setup from "./modules/setup";
import {Config, getPrefix} from "./structures";
import {toTitleCase} from "./lib";

// Begin the command loading here rather than when it's needed like in the message event.
setup.init().then(() => {
    client.login(Config.token).catch(setup.again);
});

launch(client, path.join(__dirname, "commands"), {
    categoryTransformer: toTitleCase,
    getPrefix,
    permissionLevels: [
        {
            // NONE //
            name: "User",
            check: () => true
        },
        {
            // MOD //
            name: "Moderator",
            check: (_, member) =>
                !!member &&
                (member.hasPermission(Permissions.FLAGS.MANAGE_ROLES) ||
                    member.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES) ||
                    member.hasPermission(Permissions.FLAGS.KICK_MEMBERS) ||
                    member.hasPermission(Permissions.FLAGS.BAN_MEMBERS))
        },
        {
            // ADMIN //
            name: "Administrator",
            check: (_, member) => !!member && member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)
        },
        {
            // OWNER //
            name: "Server Owner",
            check: (_, member) => !!member && member.guild.ownerID === member.id
        },
        {
            // BOT_MECHANIC //
            name: "Bot Mechanic",
            check: (user) => Config.mechanics.includes(user.id)
        },
        {
            // BOT_OWNER //
            name: "Bot Owner",
            check: (user) => Config.owner === user.id
        }
    ]
});

// Execute Modules //
import "./modules/intercept";
import "./modules/ready";
import "./modules/scheduler";
