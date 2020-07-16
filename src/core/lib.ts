import {GenericWrapper, NumberWrapper, ArrayWrapper} from "./wrappers";
import {Client, Message, TextChannel, DMChannel, NewsChannel, Guild, User, GuildMember} from "discord.js";
import chalk from "chalk";

/** A type that describes what the library module does. */
export interface CommonLibrary
{
	// Wrapper Object //
	/** Wraps the value you enter with an object that provides extra functionality and provides common utility functions. */
	(value: number): NumberWrapper;
	<T>(value: T[]): ArrayWrapper<T>;
	<T>(value: T): GenericWrapper<T>;
	
	// Common Library Functions //
	/** <Promise>.catch($.handler.bind($)) */
	handler: (error: Error) => void;
	log: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	error: (...args: any[]) => void;
	debug: (...args: any[]) => void;
	ready: (...args: any[]) => void;
	
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
		this.channel.send(`There was an error while trying to execute that command!\`\`\`${error}\`\`\``);
	else
		$.warn("No context was attached to $.handler! Make sure to use $.handler.bind($) instead!");
	
	$.error(error);
};

// The custom console. In order of verbosity, error, warn, log, and debug. Ready is a variation of log.
$.log = function(...args: any[]) {console.log(chalk.black.bgWhite("INFO"), ...args)};
$.warn = function(...args: any[]) {console.warn(chalk.black.bgYellow("WARN"), ...args)};
$.error = function(...args: any[]) {console.error(chalk.white.bgRed("ERROR"), ...args)};
$.debug = function(...args: any[]) {console.debug(chalk.white.bgBlue("DEBUG"), ...args)};
$.ready = function(...args: any[]) {console.log(chalk.black.bgGreen("READY"), ...args)};

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