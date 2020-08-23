import FileManager from "./storage";
import $, {isType, select, GenericJSON, GenericStructure} from "./lib";
import {watch} from "fs";
import {StonksStructure, StandardMarkets} from "../modules/stonks";
import {Guild as DiscordGuild} from "discord.js";

class ConfigStructure extends GenericStructure
{
	public token: string;
	public prefix: string;
	public owner: string;
	public mechanics: string[];
	
	constructor(data: GenericJSON)
	{
		super("config");
		this.token = select(data.token, "<ENTER YOUR TOKEN HERE>", String);
		this.prefix = select(data.prefix, "$", String);
		this.owner = select(data.owner, "", String);
		this.mechanics = select(data.mechanics, [], String, true);
	}
}

class User
{
	public money: number;
	public penalties: number;
	public lastReceived: number;
	public net: number;
	public lost: number;
	public invested: {[market: string]: number};
	
	constructor(data?: GenericJSON)
	{
		this.money = select(data?.money, 0, Number);
		this.penalties = select(data?.penalties, 0, Number);
		this.lastReceived = select(data?.lastReceived, -1, Number);
		this.net = select(data?.net, 0, Number);
		this.lost = select(data?.lost, 0, Number);
		this.invested = {};
		
		if(data?.invested)
			for(const tag in data.invested)
				if(tag in StandardMarkets && isType(data.invested[tag], Number))
					this.invested[tag] = data.invested[tag];
	}
	
	public initMarket(tag: string)
	{
		if(!(tag in this.invested))
			this.invested[tag] = 0;
	}
}

class Guild
{
	public prefix: string|null;
	public intercept: boolean;
	
	constructor(data?: GenericJSON)
	{
		this.prefix = select(data?.prefix, null, String);
		this.intercept = select(data?.intercept, false, Boolean);
	}
}

class StorageStructure extends GenericStructure
{
	public users: {[id: string]: User};
	public guilds: {[id: string]: Guild};
	
	constructor(data: GenericJSON)
	{
		super("storage");
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
			$.warn(`"${id}" is not a valid user ID! It will be erased when the data loads again.`);
		
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
			$.warn(`"${id}" is not a valid guild ID! It will be erased when the data loads again.`);
		
		if(id in this.guilds)
			return this.guilds[id];
		else
		{
			const guild = new Guild();
			this.guilds[id] = guild;
			return guild;
		}
	}
}

// Exports instances. Don't worry, importing it from different files will load the same instance.
export let Config = new ConfigStructure(FileManager.read("config"));
export let Storage = new StorageStructure(FileManager.read("storage"));
export let Stonks = new StonksStructure(FileManager.read("stonks"));

// This part will allow the user to manually edit any JSON files they want while the program is running which'll update the program's cache.
// However, fs.watch is a buggy mess that should be avoided in production. While it helps test out stuff for development, it's not a good idea to have it running outside of development as it causes all sorts of issues.
if(process.argv[2] === "dev")
{
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
}

export function getPrefix(guild: DiscordGuild|null): string
{
	return Storage.getGuild(guild?.id || "N/A").prefix ?? Config.prefix;
}