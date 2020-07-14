import {isType, parseVars, CommonLibrary} from "./lib";

interface CommandOptions
{
	description?: string;
	action?: Function|string;
	subcommands?: {[key: string]: Command};
	number?: Command;
	any?: Command;
}

export default class Command
{
	public readonly description: string;
	private action: Function|string;
	public subcommands: {[key: string]: Command}|null;
	public number: Command|null;
	public any: Command|null;
	
	constructor(options?: CommandOptions)
	{
		this.description = options?.description || "No description.";
		this.action = options?.action || "No action was set on this command!";
		this.subcommands = options?.subcommands || null;
		this.number = options?.number || null;
		this.any = options?.any || null;
	}
	
	public async execute($: CommonLibrary)
	{
		if(isType(this.action, String))
		{
			$.channel.send(parseVars(this.action as string, {
				author: $.author.toString()
			}, "???"));
		}
		else
		{
			try
			{
				(this.action as Function)($);
			}
			catch(error)
			{
				console.error('ohno', error);
				$.channel.send(`There was an error while trying to execute that command!\`\`\`${error}\`\`\``);
			}
		}
	}
	
	public setAction(action: Function|string)
	{
		this.action = action;
	}
	
	public setSubcommand(key: string, command: Command)
	{
		if(!this.subcommands)
			this.subcommands = {};
		this.subcommands[key] = command;
	}
	
	public setNumber(command: Command)
	{
		this.number = command;
	}
	
	public setAny(command: Command)
	{
		this.any = command;
	}
}

// The template should be built with a reductionist mentality.
// Provide everything the user needs and then let them remove whatever they want.
// That way, they aren't focusing on what's missing, but rather what they need for their command.
export const template =
`import Command from "../core/command";
import {CommonLibrary} from "../core/lib";

export default new Command({
	description: "This is a template/testing command providing all possible functionality. Remove what you don't need, and rename/delete this file to generate a fresh command file here. This command should be automatically excluded from the help command.",
	action($: CommonLibrary)
	{
		
	},
	subcommands:
	{
		layer: new Command({
			description: "This is a named subcommand, meaning that the key name is what determines the keyword to use. With default settings for example, \\"$test layer\\".",
			action($: CommonLibrary)
			{
				
			}
		})
	},
	number: new Command({
		description: "This is a numeric subcommand, meaning that any type of number (excluding Infinity/NaN) will route to this command if present. With default settings for example, \\"$test -5.2\\". The argument with the number is already parsed so you can just use it without converting it.",
		action($: CommonLibrary)
		{
			
		}
	}),
	any: new Command({
		description: "This is a generic subcommand, meaning that if there isn't a more specific subcommand that's called, it falls to this. With default settings for example, \\"$test reeee\\".",
		action($: CommonLibrary)
		{
			
		}
	})
});`;