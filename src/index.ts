import {Client} from "discord.js";
// This is here in order to make it much less of a headache to access the client from other files.
// This of course won't actually do anything until the setup process is complete and it logs in.
export const client = new Client();

import initializeGlobals from "./globals";
initializeGlobals();

import setup from "./setup";
import {Config} from "./core/structures";
import {loadCommands} from "./core/command";
import {loadEvents} from "./core/event";
import {initializeSchedulers} from "./modules/scheduler";

// Begin the command loading here rather than when it's needed like in the message event.
setup.init().then(() => {
	loadCommands();
	loadEvents();
	initializeSchedulers();
	client.login(Config.token).catch(setup.again);
});