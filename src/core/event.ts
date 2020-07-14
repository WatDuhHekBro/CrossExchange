import {Client} from "discord.js";

/**
 * @param run - A function to trigger every time an event is called.
 * @param once - A function to trigger the first time an event is called.
 */
export default class Event
{
	// The use of any here is pretty much a band-aid solution for not doing proper type checking.
	// Possibly look into properly using Discord.js' typings in the future.
	private readonly run: any;
	private readonly once: any;
	
	constructor(options: any)
	{
		this.run = options.run || null;
		this.once = options.once || null;
	}
	
	set(client: Client, event: any)
	{
		if(this.run)
			client.on(event, this.run);
		if(this.once)
			client.once(event, this.once);
	}
}