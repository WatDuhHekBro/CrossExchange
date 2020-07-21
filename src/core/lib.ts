import {GenericWrapper, NumberWrapper, ArrayWrapper} from "./wrappers";
import {Client, Message, TextChannel, DMChannel, NewsChannel, Guild, User, GuildMember, MessageReaction, PartialUser} from "discord.js";
import chalk from "chalk";
import FileManager from "./storage";

/** A type that describes what the library module does. */
export interface CommonLibrary
{
	// Wrapper Object //
	/** Wraps the value you enter with an object that provides extra functionality and provides common utility functions. */
	(value: number): NumberWrapper;
	<T>(value: T[]): ArrayWrapper<T>;
	<T>(value: T): GenericWrapper<T>;
	
	// Common Library Functions //
	/** <Promise>.catch($.handler.bind($)) or <Promise>.catch(error => $.handler(error)) */
	handler: (error: Error) => void;
	log: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	error: (...args: any[]) => void;
	debug: (...args: any[]) => void;
	ready: (...args: any[]) => void;
	paginate: (message: Message, senderID: string, total: number, callback: (page: number) => void) => void;
	
	// Dynamic Properties //
	args: any[];
	client: Client;
	message: Message;
	channel: TextChannel|DMChannel|NewsChannel;
	guild: Guild|null;
	author: User;
	member: GuildMember|null;
}

export default function $(value: number): NumberWrapper;
export default function $<T>(value: T[]): ArrayWrapper<T>;
export default function $<T>(value: T): GenericWrapper<T>;
export default function $(value: any)
{
	if(isType(value, Number))
		return new NumberWrapper(value);
	else if(isType(value, Array))
		return new ArrayWrapper(value);
	else
		return new GenericWrapper(value);
}

// If you use promises, use this function to display the error in chat.
// Case #1: await $.channel.send(""); --> Automatically caught by Command.execute().
// Case #2: $.channel.send("").catch($.handler.bind($)); --> Manually caught by the user.
$.handler = function(this: CommonLibrary, error: Error)
{
	if(this)
		this.channel.send(`There was an error while trying to execute that command!\`\`\`${error.stack || error}\`\`\``);
	else
		$.warn("No context was attached to $.handler! Make sure to use .catch($.handler.bind($)) or .catch(error => $.handler(error)) instead!");
	
	$.error(error);
};

// Logs with different levels of verbosity.
export const logs: {[type: string]: string} = {
	error: "",
	warn: "",
	info: "",
	verbose: ""
};

// The custom console. In order of verbosity, error, warn, log, and debug. Ready is a variation of log.
// General Purpose Logger
$.log = (...args: any[]) => {
	console.log(chalk.white.bgGray(formatTimestamp()), chalk.black.bgWhite("INFO"), ...args);
	const text = `[${formatUTCTimestamp()}] [INFO] ${args.join(" ")}\n`;
	logs.info += text;
	logs.verbose += text;
};
// "It'll still work, but you should really check up on this."
$.warn = (...args: any[]) => {
	console.warn(chalk.white.bgGray(formatTimestamp()), chalk.black.bgYellow("WARN"), ...args);
	const text = `[${formatUTCTimestamp()}] [WARN] ${args.join(" ")}\n`;
	logs.warn += text;
	logs.info += text;
	logs.verbose += text;
};
// Used for anything which prevents the program from actually running.
$.error = (...args: any[]) => {
	console.error(chalk.white.bgGray(formatTimestamp()), chalk.white.bgRed("ERROR"), ...args);
	const text = `[${formatUTCTimestamp()}] [ERROR] ${args.join(" ")}\n`;
	logs.error += text;
	logs.warn += text;
	logs.info += text;
	logs.verbose += text;
};
// Be as verbose as possible. If anything might help when debugging an error, then include it. This only shows in your console if you run this with "dev", but you can still get it from "logs.verbose".
$.debug = (...args: any[]) => {
	if(process.argv[2] === "dev")
		console.debug(chalk.white.bgGray(formatTimestamp()), chalk.white.bgBlue("DEBUG"), ...args);
	const text = `[${formatUTCTimestamp()}] [DEBUG] ${args.join(" ")}\n`;
	logs.verbose += text;
};
// Used once at the start of the program when the bot loads.
$.ready = (...args: any[]) => {
	console.log(chalk.white.bgGray(formatTimestamp()), chalk.black.bgGreen("READY"), ...args);
	const text = `[${formatUTCTimestamp()}] [READY] ${args.join(" ")}\n`;
	logs.info += text;
	logs.verbose += text;
};

function formatTimestamp()
{
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, '0');
	const day = now.getDate().toString().padStart(2, '0');
	const hour = now.getHours().toString().padStart(2, '0');
	const minute = now.getMinutes().toString().padStart(2, '0');
	const second = now.getSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function formatUTCTimestamp()
{
	const now = new Date();
	const year = now.getUTCFullYear();
	const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
	const day = now.getUTCDate().toString().padStart(2, '0');
	const hour = now.getUTCHours().toString().padStart(2, '0');
	const minute = now.getUTCMinutes().toString().padStart(2, '0');
	const second = now.getUTCSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// A list of message ID and callback pairs. You get the emote name and ID of the user reacting.
const eventListeners: Map<string, (emote: string, id: string) => void> = new Map();

// Pagination function that allows for customization via a callback.
// Define your own pages outside the function because this only manages the actual turning of pages.
$.paginate = async(message: Message, senderID: string, total: number, callback: (page: number) => void) => {
	let page = 0;
	
	const backwards = () => {
		page--;
		
		if(page < 0)
			page += total;
		
		callback(page);
	}
	const forwards = () => {
		page++;
		
		if(page >= total)
			page -= total;
		
		callback(page);
	}
	eventListeners.set(message.id, (emote, id) => {
		if(id === senderID)
		{
			if(emote === '⬅️')
				backwards();
			else if(emote === '➡️')
				forwards();
		}
	});
	
	await message.react('⬅️');
	await message.react('➡️');
	await message.awaitReactions((reaction, user) => {
		if(user.id === senderID)
		{
			if(reaction.emoji.name === '⬅️')
				backwards();
			else if(reaction.emoji.name === '➡️')
				forwards();
		}

		return false;
	}, {time: 60000});
	
	eventListeners.delete(message.id);
	message.delete();
};

// Attached to the client, there can be one event listener attached to a message ID which is executed if present.
export function unreact(reaction: MessageReaction, user: User|PartialUser)
{
	const callback = eventListeners.get(reaction.message.id);
	callback && callback(reaction.emoji.name, user.id);
}

/**
 * Splits a command by spaces while accounting for quotes which capture string arguments.
 * - `\"` = `"`
 * - `\\` = `\`
 */
export function parseArgs(line: string): string[]
{
	let result = [];
	let selection = "";
	let inString = false;
	let isEscaped = false;
	
	for(let c of line)
	{
		if(isEscaped)
		{
			if(['"', '\\'].includes(c))
				selection += c;
			else
				selection += '\\' + c;
			
			isEscaped = false;
		}
		else if(c === '\\')
			isEscaped = true;
		else if(c === '"')
			inString = !inString;
		else if(c === ' ' && !inString)
		{
			result.push(selection);
			selection = "";
		}
		else
			selection += c;
	}
	
	if(selection.length > 0)
		result.push(selection)
	
	return result;
}

/**
 * Allows you to store a template string with variable markers and parse it later.
 * - Use `%name%` for variables
 * - `%%` = `%`
 * - If the invalid token is null/undefined, nothing is changed.
 */
export function parseVars(line: string, definitions: {[key: string]: string}, invalid: string|null|undefined = ""): string
{
	let result = "";
	let inVariable = false;
	let token = "";
	
	for(const c of line)
	{
		if(c === '%')
		{
			if(inVariable)
			{
				if(token === "")
					result += '%';
				else
				{
					if(token in definitions)
						result += definitions[token];
					else if(invalid === undefined || invalid === null)
						result += `%${token}%`;
					else
						result += invalid;
					
					token = "";
				}
			}
			
			inVariable = !inVariable;
		}
		else if(inVariable)
			token += c;
		else
			result += c;
	}
	
	return result;
}

export function isType(value: any, type: Function): boolean
{
	if(value === undefined && type === undefined)
		return true;
	else if(value === null && type === null)
		return true;
	else
		return value !== undefined && value !== null && value.constructor === type;
}

/**
 * Checks a value to see if it matches the fallback's type, otherwise returns the fallback.
 * For the purposes of the templates system, this function will only check array types, objects should be checked under their own type (as you'd do anyway with something like a User object).
 * If at any point the value doesn't match the data structure provided, the fallback is returned.
 * Warning: Type checking is based on the fallback's type. Be sure that the "type" parameter is accurate to this!
 */
export function select<T>(value: any, fallback: T, type: Function, isArray = false): T
{
	if(isArray && isType(value, Array))
	{
		for(let item of value)
			if(!isType(item, type))
				return fallback;
		return value;
	}
	else
	{
		if(isType(value, type))
			return value;
		else
			return fallback;
	}
}

export interface GenericJSON
{
	[key: string]: any;
}

export abstract class GenericStructure
{
	protected __meta__ = "generic";
	
	constructor(tag?: string)
	{
		this.__meta__ = tag || this.__meta__;
	}
	
	public save()
	{
		const tag = this.__meta__;
		delete this.__meta__;
		FileManager.write(tag, this);
		this.__meta__ = tag;
	}
}

// A 50% chance would be "Math.random() < 0.5" because Math.random() can be [0, 1), so to make two equal ranges, you'd need [0, 0.5)U[0.5, 1).
// Similar logic would follow for any other percentage. Math.random() < 1 is always true (100% chance) and Math.random() < 0 is always false (0% chance).
export const Random = {
	num: (min: number, max: number) => (Math.random() * (max - min)) + min,
	int: (min: number, max: number) => Math.floor(Random.num(min, max)),
	chance: (decimal: number) => Math.random() < decimal,
	sign: (number = 1) => number * (Random.chance(0.5) ? -1 : 1),
	deviation: (base: number, deviation: number) => Random.num(base - deviation, base + deviation)
};