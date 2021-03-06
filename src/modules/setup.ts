import {existsSync as exists} from "fs";
import inquirer from "inquirer";
import Storage from "./storage";
import {Config} from "../structures";

// A generic process handler is set to catch unhandled rejections other than the ones from Lavalink and Discord.
process.on("unhandledRejection", (reason: any) => {
    const isDiscordError = reason?.name === "DiscordAPIError";

    if (!isDiscordError) {
        console.error(reason.stack);
    }
});

// This file is called (or at least should be called) automatically as long as a config file doesn't exist yet.
// And that file won't be written until the data is successfully initialized.
const prompts = [
    {
        type: "password",
        name: "token",
        message: "What's your bot's token?",
        mask: true
    },
    {
        type: "input",
        name: "prefix",
        message: "What do you want your bot's prefix to be?",
        default: "$"
    },
    {
        type: "input",
        name: "owner",
        message: "Enter the owner's user ID here."
    },
    {
        type: "input",
        name: "mechanics",
        message: "Enter a list of the bot's mechanics (by their IDs) separated by spaces."
    }
];

export default {
    async init() {
        while (!exists("data/config.json")) {
            const answers = await inquirer.prompt(prompts);
            Storage.open("data");
            Config.token = answers.token as string;
            Config.prefix = answers.prefix as string;
            Config.owner = answers.owner as string;
            const mechanics = answers.mechanics as string;
            Config.mechanics = mechanics !== "" ? mechanics.split(" ") : [];
            Config.save(false);
        }
    },
    /** Prompt the user to set their token again. */
    async again() {
        console.error("It seems that the token you provided is invalid.");

        // Deactivate the console //
        const oldConsole = console;
        console = {
            ...oldConsole,
            log() {},
            warn() {},
            error() {},
            debug() {},
            ready() {}
        };

        const answers = await inquirer.prompt(prompts.slice(0, 1));
        Config.token = answers.token as string;
        Config.save(false);
        process.exit();
    }
};
