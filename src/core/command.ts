import {isType, parseVars, CommonLibrary} from "./lib";

interface CommandOptions
{
	description?: string;
	endpoint?: boolean;
	run?: Function|string;
	subcommands?: {[key: string]: Command};
	user?: Command;
	number?: Command;
	any?: Command;
}

export default class Command
{
	public readonly description: string;
	public readonly endpoint: boolean;
	private run: Function|string;
	public subcommands: {[key: string]: Command}|null;
	public user: Command|null;
	public number: Command|null;
	public any: Command|null;
	
	constructor(options?: CommandOptions)
	{
		this.description = options?.description || "No description.";
		this.endpoint = options?.endpoint || false;
		this.run = options?.run || "No action was set on this command!";
		this.subcommands = options?.subcommands || null;
		this.user = options?.user || null;
		this.number = options?.number || null;
		this.any = options?.any || null;
	}
	
	public async execute($: CommonLibrary)
	{
		if(isType(this.run, String))
		{
			$.channel.send(parseVars(this.run as string, {
				author: $.author.toString()
			}, "???"));
		}
		else
		{
			(this.run as Function)($).catch((error: Error) => {
				$.channel.send(`There was an error while trying to execute that command!\`\`\`${error}\`\`\``);
				console.error(error);
			});
		}
	}
	
	/**
	 * Set what happens when the command is called.
	 * - If the command is a function, run it with one argument (the common library).
	 * - If the command is a string, it'll be sent as a message with %variables% replaced.
	 */
	public set(run: Function|string)
	{
		this.run = run;
	}
	
	/** The safe way to attach a named subcommand. */
	public attach(key: string, command: Command)
	{
		if(!this.subcommands)
			this.subcommands = {};
		this.subcommands[key] = command;
	}
	
	/** See if a subcommand exists for the command. */
	/*public has(type: string): boolean
	{
		return this.subcommands && (type in this.subcommands) || false;
	}*/
	
	/** Get the requested subcommand if it exists. */
	/*public get(type: string): Command|null
	{
		return this.subcommands && this.subcommands[type] || null;
	}*/
}

// The template should be built with a reductionist mentality.
// Provide everything the user needs and then let them remove whatever they want.
// That way, they aren't focusing on what's missing, but rather what they need for their command.
export const template =
`import Command from "../core/command";
import {CommonLibrary} from "../core/lib";

export default new Command({
	description: "This is a template/testing command providing common functionality. Remove what you don't need, and rename/delete this file to generate a fresh command file here. This command should be automatically excluded from the help command. The \\"endpoint\\" parameter (boolean) prevents further arguments from being passed. Also, as long as you keep the run function async, it'll return a promise allowing the program to automatically catch any synchronous errors. However, you'll have to do manual error handling if you go the then and catch route.",
	async run($: CommonLibrary)
	{
		
	},
	subcommands:
	{
		layer: new Command({
			description: "This is a named subcommand, meaning that the key name is what determines the keyword to use. With default settings for example, \\"$test layer\\".",
			async run($: CommonLibrary)
			{
				
			}
		})
	},
	user: new Command({
		description: "This is the subcommand for getting users by pinging them or copying their ID. The argument will either be a user object or null if no user is found.",
		async run($: CommonLibrary)
		{
			
		}
	}),
	number: new Command({
		description: "This is a numeric subcommand, meaning that any type of number (excluding Infinity/NaN) will route to this command if present. With default settings for example, \\"$test -5.2\\". The argument with the number is already parsed so you can just use it without converting it.",
		async run($: CommonLibrary)
		{
			
		}
	}),
	any: new Command({
		description: "This is a generic subcommand, meaning that if there isn't a more specific subcommand that's called, it falls to this. With default settings for example, \\"$test reeee\\".",
		async run($: CommonLibrary)
		{
			
		}
	})
});`;