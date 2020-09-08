import {GenericJSON, GenericStructure} from "./util";
import {isType, select} from "../framework";
import {StandardMarkets} from "./stonks";

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

export class StorageStructure extends GenericStructure
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
			console.warn(`"${id}" is not a valid user ID! It will be erased when the data loads again.`);
		
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
			console.warn(`"${id}" is not a valid guild ID! It will be erased when the data loads again.`);
		
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