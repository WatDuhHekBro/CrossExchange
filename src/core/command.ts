import {Collection, Client, Message, TextChannel, DMChannel, NewsChannel, Guild, User, GuildMember} from "discord.js";
import {generateHandler} from "./storage";
import {promises as ffs, existsSync, writeFile} from "fs";
import {toTitleCase} from "./lib";

enum TYPES
{
	SUBCOMMAND, // Any specifically-defined keywords / string literals.
	CHANNEL, // <#...>
	ROLE, // <@&...>
	EMOTE, // <::ID> (The previous two values, animated and emote name respectively, do not matter at all for finding the emote.)
	MESSAGE, // Available by using the built-in "Copy Message Link" button. https://discordapp.com/channels/<Guild ID>/<Channel ID>/<Message ID> or https://discord.com/...
	USER, // <@...> and <@!...>
	ID, // Any number with 17-19 digits.
	NUMBER, // Any valid number via the Number() function, except for NaN and Infinity (because those can really mess with the program).
	ANY, // Generic argument case.
	NONE // No subcommands exist.
}

interface CommandMenu
{
	args: any[];
	client: Client;
	message: Message;
	channel: TextChannel|DMChannel|NewsChannel;
	guild: Guild|null;
	author: User;
	member: GuildMember|null;
}

interface CommandOptions
{
	description?: string;
	endpoint?: boolean;
	usage?: string;
	permission?: number;
	aliases?: string[];
	run?: (($: CommandMenu) => Promise<any|void>)|string;
	subcommands?: {[key: string]: Command};
	channel?: Command;
	role?: Command;
	emote?: Command;
	message?: Command;
	user?: Command;
	id?: "channel"|"role"|"emote"|"message"|"user";
	number?: Command;
	any?: Command;
}

export default class Command
{
	public readonly description: string;
	public readonly endpoint: boolean;
	public readonly usage: string;
	public readonly permission: number;
	public readonly aliases: string[]; // This is to keep the array intact for parent Command instances to use. It'll also be used when loading top-level aliases.
	public originalCommandName: string|null; // If the command is an alias, what's the original name?
	public run: (($: CommandMenu) => Promise<any|void>)|string;
	public readonly subcommands: Collection<string, Command>; // This is the final data structure you'll actually use to work with the commands the aliases point to.
	public channel: Command|null;
	public role: Command|null;
	public emote: Command|null;
	public message: Command|null;
	public user: Command|null;
	public id: Command|null;
	public number: Command|null;
	public any: Command|null;
	public static readonly TYPES = TYPES;
	public header: string; // Header for debugging use.
	
	constructor(options?: CommandOptions)
	{
		this.description = options?.description || "No description.";
		this.endpoint = options?.endpoint || false;
		this.usage = options?.usage || "";
		this.permission = options?.permission ?? -1;
		this.aliases = options?.aliases || [];
		this.originalCommandName = null;
		this.run = options?.run || "No action was set on this command!";
		this.subcommands = new Collection(); // Populate this collection after setting subcommands.
		this.channel = options?.channel || null;
		this.role = options?.role || null;
		this.emote = options?.emote || null;
		this.message = options?.message || null;
		this.user = options?.user || null;
		this.number = options?.number || null;
		this.any = options?.any || null;
		this.header = "";
		
		switch(options?.id || "user")
		{
			case "channel": this.id = this.channel; break;
			case "role": this.id = this.role; break;
			case "emote": this.id = this.emote; break;
			case "message": this.id = this.message; break;
			case "user": this.id = this.user; break;
		}
				
		if(options?.subcommands)
		{
			const originalSubcommands = options.subcommands;
			const baseSubcommandNames = Object.keys(originalSubcommands);
			
			// Loop once to set the base subcommands.
			for(const name in originalSubcommands)
				this.subcommands.set(name, originalSubcommands[name]);
			
			// Then loop again to make aliases point to the base subcommands and warn if something's not right.
			// This shouldn't be a problem because JS should store these as references that point to the same object.
			for(const name in originalSubcommands)
			{
				const subcmd = originalSubcommands[name];
				subcmd.originalCommandName = name;
				const aliases = subcmd.aliases;
				
				for(const alias of aliases)
				{
					if(baseSubcommandNames.includes(alias))
						console.warn(`"${alias}" in subcommand "${name}" was attempted to be declared as an alias but it already exists in the base commands! (Look at the next "Loading Command" line to see which command is affected.)`);
					else if(this.subcommands.has(alias))
						console.warn(`Duplicate alias "${alias}" at subcommand "${name}"! (Look at the next "Loading Command" line to see which command is affected.)`);
					else
						this.subcommands.set(alias, subcmd);
				}
			}
		}
		
		// Because command aliases don't actually do anything except for subcommands, let the user know that this won't do anything.
		warnCommandAliases(this.channel, "channel");
		warnCommandAliases(this.role, "role");
		warnCommandAliases(this.emote, "emote");
		warnCommandAliases(this.message, "message");
		warnCommandAliases(this.user, "user");
		warnCommandAliases(this.number, "number");
		warnCommandAliases(this.any, "any");

		// Warn on unused endpoints too.
		if(this.endpoint && (this.subcommands.size > 0 || this.channel || this.role || this.emote || this.message || this.user || this.number || this.any))
			console.warn(`An endpoint cannot have subcommands! Check ${this.header} again.`);
	}
	
	public resolve(param: string): TYPES
	{
		if(this.subcommands.has(param))
			return TYPES.SUBCOMMAND;
		else if(this.channel && /^<#\d{17,19}>$/.test(param))
			return TYPES.CHANNEL;
		else if(this.role && /^<@&\d{17,19}>$/.test(param))
			return TYPES.ROLE;
		else if(this.emote && /^<a?:.*?:\d{17,19}>$/.test(param))
			return TYPES.EMOTE;
		else if(this.message && /\d{17,19}\/\d{17,19}\/\d{17,19}$/.test(param))
			return TYPES.MESSAGE;
		else if(this.user && /^<@!?\d{17,19}>$/.test(param))
			return TYPES.USER;
		// Disallow infinity and allow for 0.
		else if(this.number && !Number.isNaN(Number(param)) && param !== "Infinity" && param !== "-Infinity")
			return TYPES.NUMBER;
		else if(this.any)
			return TYPES.ANY;
		else
			return TYPES.NONE;
	}
	
	// You can also optionally send in a pre-calculated value if you already called Command.resolve so you don't call it again.
	public get(param: string, type?: TYPES): Command
	{
		// This expression only runs once, don't worry.
		switch(type ?? this.resolve(param))
		{
			case TYPES.SUBCOMMAND: return checkResolvedCommand(this.subcommands.get(param));
			case TYPES.CHANNEL: return checkResolvedCommand(this.channel);
			case TYPES.ROLE: return checkResolvedCommand(this.role);
			case TYPES.EMOTE: return checkResolvedCommand(this.emote);
			case TYPES.MESSAGE: return checkResolvedCommand(this.message);
			case TYPES.USER: return checkResolvedCommand(this.user);
			case TYPES.NUMBER: return checkResolvedCommand(this.number);
			case TYPES.ANY: return checkResolvedCommand(this.any);
			default: return this;
		}
	}
}

function warnCommandAliases(command: Command|null, type: string)
{
	if(command && command.aliases.length > 0)
		console.warn(`There are aliases defined for an "${type}"-type subcommand, but those aliases won't be used. (Look at the next "Loading Command" line to see which command is affected.)`);
}

function checkResolvedCommand(command: Command|null|undefined): Command
{
	if(!command)
		throw new Error("FATAL: Command type mismatch while calling Command.get!");
	return command;
}

// Separate into separate file //
let commands: Collection<string, Command>|null = null;
export const categories: Collection<string, string[]> = new Collection();
export const aliases: Collection<string, string> = new Collection(); // Top-level aliases only.

/** Returns the cache of the commands if it exists and searches the directory if not. */
export async function loadCommands(): Promise<Collection<string, Command>>
{
	if(commands)
		return commands;
	
	if(IS_DEV_MODE && !existsSync("src/commands/test.ts"))
		writeFile("src/commands/test.ts", template, generateHandler('"test.ts" (testing/template command) successfully generated.'));
	
	commands = new Collection();
	const dir = await ffs.opendir("dist/commands");
	const listMisc: string[] = [];
	let selected;
	
	// There will only be one level of directory searching (per category).
	while(selected = await dir.read())
	{
		if(selected.isDirectory())
		{
			if(selected.name === "subcommands")
				continue;
			
			const subdir = await ffs.opendir(`dist/commands/${selected.name}`);
			const category = toTitleCase(selected.name);
			const list: string[] = [];
			let cmd;
			
			while(cmd = await subdir.read())
			{
				if(cmd.isDirectory())
				{
					if(cmd.name === "subcommands")
						continue;
					else
						console.warn(`You can't have multiple levels of directories! From: "dist/commands/${cmd.name}"`);
				}
				else
					loadCommand(cmd.name, list, selected.name);
			}
			
			subdir.close();
			categories.set(category, list);
		}
		else
			loadCommand(selected.name, listMisc);
	}
	
	dir.close();
	categories.set("Miscellaneous", listMisc);
	
	return commands;
}

async function loadCommand(filename: string, list: string[], category?: string)
{
	if(!commands)
		return console.error(`Function "loadCommand" was called without first initializing commands!`);
	
	const prefix = category ?? "";
	const header = filename.substring(0, filename.indexOf(".js"));
	const command = (await import(`../commands/${prefix}/${header}`)).default as Command|undefined;
	
	if(!command)
		return console.warn(`Command "${header}" has no default export which is a Command instance!`);
	
	command.originalCommandName = header;
	list.push(header);
	
	if(commands.has(header))
		console.warn(`Command "${header}" already exists! Make sure to make each command uniquely identifiable across categories!`);
	else
		commands.set(header, command);
	
	for(const alias of command.aliases)
	{
		if(commands.has(alias))
			console.warn(`Top-level alias "${alias}" from command "${header}" already exists either as a command or alias!`);
		else
			commands.set(alias, command);
	}
	
	console.log(`Loading Command: ${header} (${category ? toTitleCase(category) : "Miscellaneous"})`);
}

// The template should be built with a reductionist mentality.
// Provide everything the user needs and then let them remove whatever they want.
// That way, they aren't focusing on what's missing, but rather what they need for their command.
const template =
`import Command from "../core/command";
import {CommonLibrary} from "../core/lib";

export default new Command({
	description: "This is a template/testing command providing common functionality. Remove what you don't need, and rename/delete this file to generate a fresh command file here. This command should be automatically excluded from the help command. The \\"usage\\" parameter (string) overrides the default usage for the help command. The \\"endpoint\\" parameter (boolean) prevents further arguments from being passed. Also, as long as you keep the run function async, it'll return a promise allowing the program to automatically catch any synchronous errors. However, you'll have to do manual error handling if you go the then and catch route.",
	endpoint: false,
	usage: "",
	permission: -1,
	aliases: [],
	async run($): Promise<any>
	{
		
	},
	subcommands:
	{
		layer: new Command({
			description: "This is a named subcommand, meaning that the key name is what determines the keyword to use. With default settings for example, \\"$test layer\\".",
			endpoint: false,
			usage: "",
			permission: -1,
			aliases: [],
			async run($): Promise<any>
			{
				
			}
		})
	},
	user: new Command({
		description: "This is the subcommand for getting users by pinging them or copying their ID. With default settings for example, \\"$test 237359961842253835\\". The argument will be a user object and won't run if no user is found by that ID.",
		endpoint: false,
		usage: "",
		permission: -1,
		async run($): Promise<any>
		{
			
		}
	}),
	number: new Command({
		description: "This is a numeric subcommand, meaning that any type of number (excluding Infinity/NaN) will route to this command if present. With default settings for example, \\"$test -5.2\\". The argument with the number is already parsed so you can just use it without converting it.",
		endpoint: false,
		usage: "",
		permission: -1,
		async run($): Promise<any>
		{
			
		}
	}),
	any: new Command({
		description: "This is a generic subcommand, meaning that if there isn't a more specific subcommand that's called, it falls to this. With default settings for example, \\"$test reeee\\".",
		endpoint: false,
		usage: "",
		permission: -1,
		async run($): Promise<any>
		{
			
		}
	})
});`;