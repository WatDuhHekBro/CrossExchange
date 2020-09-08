import initializeGlobals from "./modules/globals";
initializeGlobals();

import * as framework from "./framework/index";
console.debug(framework);

import {client, loadCommands, loadEvents} from "./framework";
import setup from "./modules/setup";
import {Config, Storage} from "./structures";
import {initializeSchedulers} from "./modules/scheduler";
import {generateHandler} from "./modules/storage";
import {existsSync, writeFile, readFileSync} from "fs";
import {Permissions} from "discord.js";

// Begin the command loading here rather than when it's needed like in the message event.
setup.init().then(() => {
	loadCommands();
	loadEvents();
	initializeSchedulers();
	client.login(Config.token).catch(setup.again);
});

framework.launch({
	permissions: [
		{
			// NONE //
			name: "User",
			check: () => true
		},
		{
			// MOD //
			name: "Moderator",
			check: (user, member) => !!member && (
				member.hasPermission(Permissions.FLAGS.MANAGE_ROLES) ||
				member.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES) ||
				member.hasPermission(Permissions.FLAGS.KICK_MEMBERS) ||
				member.hasPermission(Permissions.FLAGS.BAN_MEMBERS)
			)
		},
		{
			// ADMIN //
			name: "Administrator",
			check: (user, member) => !!member && member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)
		},
		{
			// OWNER //
			name: "Server Owner",
			check: (user, member) => !!member && (member.guild.ownerID === user.id)
		},
		{
			// BOT_SUPPORT //
			name: "Bot Support",
			check: user => Config.support.includes(user.id)
		},
		{
			// BOT_ADMIN //
			name: "Bot Admin",
			check: user => Config.admins.includes(user.id)
		},
		{
			// BOT_OWNER //
			name: "Bot Owner",
			check: user => Config.owner === user.id
		}
	],
	getPrefix(guild)
	{
		return (guild && Storage.getGuild(guild.id).prefix) ?? Config.prefix;
	}
});

// The template should be built with a reductionist mentality.
// Provide everything the user needs and then let them remove whatever they want.
// That way, they aren't focusing on what's missing, but rather what they need for their command.
// The template itself also isn't a .ts file in order to make it so it doesn't get caught in the compiled program.
if(IS_DEV_MODE && !existsSync("src/commands/test.ts"))
	writeFile("src/commands/test.ts", readFileSync("src/commands/template", "utf-8"), generateHandler('"test.ts" (testing/template command) successfully generated.'));