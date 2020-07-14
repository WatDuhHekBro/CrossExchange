import {existsSync as exists} from "fs";
import inquirer from "inquirer";
import Storage from "./core/storage";
import {Config} from "./core/templates";

// This file is called (or at least should be called) automatically as long as a config file doesn't exist yet.
// And that file won't be written until the data is successfully initialized.
const prompts = [{
	type: "password",
	name: "token",
	message: "What's your bot's token?",
	mask: true
}, {
	type: "input",
	name: "prefix",
	message: "What do you want your bot's prefix to be?",
	default: "$"
}, {
	type: "input",
	name: "admins",
	message: "Enter a list of bot admins (by their IDs) separated by spaces."
}];

export default {
	async init()
	{
		while(!exists("data/config.json"))
		{
			const answers = await inquirer.prompt(prompts);
			Storage.open("data");
			Storage.write("config", {
				token: answers.token,
				prefix: answers.prefix,
				admins: (answers.admins as string).split(" ")
			});
		}
	},
	/** Prompt the user to set their token again. */
	async again()
	{
		console.error("It seems that the token you provided is invalid.");
		const answers = await inquirer.prompt([{
			type: "password",
			name: "token",
			message: "What's your bot's token?",
			mask: true
		}]);
		const config = Storage.read("config") as Config;
		config.token = answers.token;
		Storage.write("config", config);
		process.exit();
	}
};