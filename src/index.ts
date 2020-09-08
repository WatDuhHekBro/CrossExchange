import initializeGlobals from "./globals";
initializeGlobals();

import * as framework from "./framework/index";
console.debug(framework);

import {client, loadCommands, loadEvents} from "./framework";
import setup from "./setup";
import {Config} from "./core/structures";
import {initializeSchedulers} from "./modules/scheduler";
import {generateHandler} from "./core/storage";
import {existsSync, writeFile, readFileSync} from "fs";

// Begin the command loading here rather than when it's needed like in the message event.
setup.init().then(() => {
	loadCommands();
	loadEvents();
	initializeSchedulers();
	client.login(Config.token).catch(setup.again);
});

// The template should be built with a reductionist mentality.
// Provide everything the user needs and then let them remove whatever they want.
// That way, they aren't focusing on what's missing, but rather what they need for their command.
// The template itself also isn't a .ts file in order to make it so it doesn't get caught in the compiled program.
if(IS_DEV_MODE && !existsSync("src/commands/test.ts"))
	writeFile("src/commands/test.ts", readFileSync("src/commands/template", "utf-8"), generateHandler('"test.ts" (testing/template command) successfully generated.'));