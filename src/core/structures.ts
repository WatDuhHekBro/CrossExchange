import FileManager from "./storage";
import lib, {isType} from "./lib";
import {watch} from "fs";
import $ from "./lib";
import {Market, Event} from "../modules/stonks";

export interface GenericJSON
{
	[key: string]: any;
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

class ConfigStructure
{
	public token: string;
	public prefix: string;
	public mechanics: string[];
	
	constructor(data: GenericJSON)
	{
		this.token = select(data.token, "<ENTER YOUR TOKEN HERE>", String);
		this.prefix = select(data.prefix, "$", String);
		this.mechanics = select(data.mechanics, [], String, true);
	}
	
	public save()
	{
		FileManager.write("config", this);
	}
}

class User
{
	public money: number;
	public penalties: number;
	public lastReceived: number;
	public net: number;
	public invested: {[market: string]: number};
	
	constructor(data?: GenericJSON)
	{
		this.money = select(data?.money, 0, Number);
		this.penalties = select(data?.penalties, 0, Number);
		this.lastReceived = select(data?.lastReceived, -1, Number);
		this.net = select(data?.net, 0, Number);
		this.invested = {};
		
		if(data?.invested)
			for(const tag in data.invested)
				if(isType(data.invested[tag], Number))
					this.invested[tag] = data.invested[tag];
	}
}

class Guild
{
	public prefix: string|null;
	public intercept: boolean;
	
	constructor(data?: GenericJSON)
	{
		this.prefix = select(data?.prefix, null, String);
		this.intercept = select(data?.intercept, true, Boolean);
	}
}

class StorageStructure
{
	public users: {[id: string]: User};
	public guilds: {[id: string]: Guild};
	
	constructor(data: GenericJSON)
	{
		this.users = {};
		this.guilds = {};
		
		for(let id in data.users)
			if(/\d{17,19}/g.test(id))
				this.users[id] = new User(data.users[id]);
		
		for(let id in data.guilds)
			if(/\d{17,19}/g.test(id))
				this.guilds[id] = new Guild(data.guilds[id]);
	}
	
	/** Gets a user's profile if they exist and generate one if not. */
	public getUser(id: string): User
	{
		if(!/\d{17,19}/g.test(id))
			lib.warn(`"${id}" is not a valid user ID! It will be erased when the data loads again.`);
		
		if(id in this.users)
			return this.users[id];
		else
		{
			const user = new User();
			this.users[id] = user;
			return user;
		}
	}
	
	/** Gets a guild's settings if they exist and generate one if not. */
	public getGuild(id: string): Guild
	{
		if(!/\d{17,19}/g.test(id))
			lib.warn(`"${id}" is not a valid guild ID! It will be erased when the data loads again.`);
		
		if(id in this.guilds)
			return this.guilds[id];
		else
		{
			const guild = new Guild();
			this.guilds[id] = guild;
			return guild;
		}
	}
	
	public save()
	{
		FileManager.write("storage", this);
	}
}

class StonksStructure
{
	public markets: {[tag: string]: Market};
	public events: Event[];
	public channel: string|null; // The ID of the channel to post updates to.
	public messages: string[]; // The IDs of the market value messages in order. The last one is the latest event message.
	public scheduled: number[]; // The list of timestamps used so that restarting the bot does not 
	
	constructor(data: GenericJSON)
	{
		this.markets = {};
		this.events = [];
		this.channel = select(data.channel, null, String);
		this.messages = select(data.messages, [], String, true);
		this.scheduled = [];
	}
	
	getMarket(tag: string): Market|null
	{
		if(tag in this.markets)
			return this.markets[tag];
		else
			return null;
	}
}

// Exports instances. Don't worry, importing it from different files will load the same instance.
export let Config = new ConfigStructure(FileManager.read("config"));
export let Storage = new StorageStructure(FileManager.read("storage"));
export let Stonks = new StonksStructure(FileManager.read("stonks"));

// This part will allow the user to manually edit any JSON files they want while the program is running which'll update the program's cache.
watch("data", (event, filename) => {
	$.debug("File Watcher:", event, filename);
	const header = filename.substring(0, filename.indexOf(".json"));
	
	switch(header)
	{
		case "config": Config = new ConfigStructure(FileManager.read("config")); break;
		case "storage": Storage = new StorageStructure(FileManager.read("storage")); break;
		case "stonks": Stonks = new StonksStructure(FileManager.read("stonks")); break;
	}
});