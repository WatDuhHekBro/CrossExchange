import FileManager from "./storage";
import lib, {isType} from "./lib";
import {watch} from "fs";

interface GenericJSON
{
	[key: string]: any;
}

/**
 * Checks a value to see if it matches the fallback's type, otherwise returns the fallback.
 * For the purposes of the templates system, this function will only check array types, objects should be checked under their own type (as you'd do anyway with something like a User object).
 * If at any point the value doesn't match the data structure provided, the fallback is returned.
 * Warning: Type checking is based on the fallback's type. Be sure that the "type" parameter is accurate to this!
 */
function select<T>(value: any, fallback: T, type: Function, isArray = false): T
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
	
	constructor(data?: GenericJSON)
	{
		this.token = select(data?.token, "<ENTER YOUR TOKEN HERE>", String);
		this.prefix = select(data?.prefix, "$", String);
		this.mechanics = select(data?.mechanics, [], String, true);
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
	
	constructor(data?: GenericJSON)
	{
		this.money = select(data?.money, 0, Number);
		this.penalties = select(data?.penalties, 0, Number);
		this.lastReceived = select(data?.lastReceived, -1, Number);
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

// Exports instances. Don't worry, importing it from different files will load the same instance.
export let Config = new ConfigStructure(FileManager.read("config"));
export let Storage = new StorageStructure(FileManager.read("storage"));

// This part will allow the user to manually edit any JSON files they want while the program is running which'll update the program's cache.
watch("data", (event, filename) => {
	const header = filename.substring(0, filename.indexOf(".json"));
	
	switch(header)
	{
		case "config": Config = new ConfigStructure(FileManager.read("config")); break;
		case "storage": Storage = new StorageStructure(FileManager.read("storage")); break;
	}
});