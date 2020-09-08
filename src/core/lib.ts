import {Message, Guild, GuildMember, Permissions} from "discord.js";
import FileManager from "./storage";
import {eventListeners} from "../events/messageReactionRemove";
import {client} from "../index";

export function botHasPermission(guild: Guild|null, permission: number): boolean
{
	return !!(client.user && guild?.members.resolve(client.user)?.hasPermission(permission))
}

// Pagination function that allows for customization via a callback.
// Define your own pages outside the function because this only manages the actual turning of pages.
export async function paginate(message: Message, senderID: string, total: number, callback: (page: number) => void, duration = 60000)
{
	let page = 0;
	const turn = (amount: number) => {
		page += amount;
		
		if(page < 0)
			page += total;
		else if(page >= total)
			page -= total;
		
		callback(page);
	}
	const handle = (emote: string, reacterID: string) => {
		if(reacterID === senderID)
		{
			switch(emote)
			{
				case '⬅️': turn(-1); break;
				case '➡️': turn(1); break;
			}
		}
	};
	
	// Listen for reactions and call the handler.
	await message.react('⬅️');
	await message.react('➡️');
	eventListeners.set(message.id, handle);
	await message.awaitReactions((reaction, user) => {
		// The reason this is inside the call is because it's possible to switch a user's permissions halfway and suddenly throw an error.
		// This will dynamically adjust for that, switching modes depending on whether it currently has the "Manage Messages" permission.
		const canDeleteEmotes = botHasPermission(message.guild, Permissions.FLAGS.MANAGE_MESSAGES);
		handle(reaction.emoji.name, user.id);
		
		if(canDeleteEmotes)
			reaction.users.remove(user);
		
		return false;
	}, {time: duration});
	
	// When time's up, remove the bot's own reactions.
	eventListeners.delete(message.id);
	message.reactions.cache.get('⬅️')?.users.remove(message.author);
	message.reactions.cache.get('➡️')?.users.remove(message.author);
};

// Waits for the sender to either confirm an action or let it pass (and delete the message).
export async function prompt(message: Message, senderID: string, onConfirm: () => void, duration = 10000)
{
	let isDeleted = false;
	
	message.react('✅');
	await message.awaitReactions((reaction, user) => {
		if(user.id === senderID)
		{
			if(reaction.emoji.name === '✅')
				onConfirm();
			isDeleted = true;
			message.delete();
		}
		
		// CollectorFilter requires a boolean to be returned.
		// My guess is that the return value of awaitReactions can be altered by making a boolean filter.
		// However, because that's not my concern with this command, I don't have to worry about it.
		// May as well just set it to false because I'm not concerned with collecting any reactions.
		return false;
	}, {time: duration});
	
	if(!isDeleted)
		message.delete();
};

export async function getMemberByUsername(guild: Guild, username: string)
{
	return (await guild.members.fetch({
		query: username,
		limit: 1
	})).first();
};

/** Convenience function to handle false cases automatically. */
export async function callMemberByUsername(message: Message, username: string, onSuccess: (member: GuildMember) => void)
{
	const guild = message.guild;
	const send = message.channel.send;
	
	if(guild)
	{
		const member = await getMemberByUsername(guild, username);
		
		if(member)
			onSuccess(member);
		else
			send(`Couldn't find a user by the name of \`${username}\`!`);
	}
	else
		send("You must execute this command in a server!");
};

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
export function parseVars(line: string, definitions: {[key: string]: string}, invalid: string|null = ""): string
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
					else if(invalid === null)
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

export function isType(value: any, type: Function|null|undefined): boolean
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
	private __meta__ = "generic";
	
	constructor(tag?: string)
	{
		this.__meta__ = tag || this.__meta__;
	}
	
	public save(asynchronous = true)
	{
		const tag = this.__meta__;
		delete this.__meta__;
		FileManager.write(tag, this, asynchronous);
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

/**
 * Pluralises a word and chooses a suffix attached to the root provided.
 * - pluralise("credit", "s") = credit/credits
 * - pluralise("part", "ies", "y") = party/parties
 * - pluralise("sheep") = sheep
 */
export function pluralise(amount: number, word: string, plural = "", singular = "", excludeNumber = false): string
{
	let result = excludeNumber ? "" : `${amount} `;

	if(amount === 1)
		result += word + singular;
	else
		result += word + plural;

	return result;
}

/**
 * Pluralises a word for changes.
 * - (-1).pluraliseSigned() = '-1 credits'
 * - (0).pluraliseSigned() = '+0 credits'
 * - (1).pluraliseSigned() = '+1 credit'
 */
export function pluraliseSigned(amount: number, word: string, plural = "", singular = "", excludeNumber = false): string
{
	const sign = amount >= 0 ? '+' : '';
	return `${sign}${pluralise(amount, word, plural, singular, excludeNumber)}`;
}

export function replaceAll(text: string, before: string, after: string): string
{
	while(text.indexOf(before) !== -1)
		text = text.replace(before, after);
	return text;
}
	
export function toTitleCase(text: string): string
{
	return text.replace(/([^\W_]+[^\s-]*) */g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/** Returns a random element from this array. */
export function random<T>(list: T[]): T
{
	return list[Math.floor(Math.random() * list.length)];
}

/**
* Splits up this array into a specified length.
* `$([1,2,3,4,5,6,7,8,9,10]).split(3)` = `[[1,2,3],[4,5,6],[7,8,9],[10]]`
*/
export function split<T>(list: T[], lengthOfEachSection: number): T[][]
{
	const amountOfSections = Math.ceil(list.length / lengthOfEachSection);
	const sections: T[][] = new Array(amountOfSections);

	for (let index = 0; index < amountOfSections; index++)
		sections[index] = list.slice(index * lengthOfEachSection, (index + 1) * lengthOfEachSection);

	return sections;
}