import $, {Random} from "../core/lib";
import {Stonks} from "../core/structures";
import {Client} from "discord.js";

// Logic for determining what to do with the stored timestamp:
// If the scheduled timestamp is before the current time frame, just set it to a random point in the next time frame.
// If the scheduled timestamp is in the current time frame or the next, set a timeout until it executes and moves the timestamp again.
// Once the timeout is reached, a random point during the next time frame is set as when the event happens.
// As long as the scheduled timestamp wasn't before the current time stamp, the event will be executed.
// Something that makes this a whole lot easier is that if setTimeout is given a negative delay, it'll activate immediately instead of throwing an error. So I can just plug in the difference directly.

/** Execute at some point in time during every 5 minute time frame. */
class StonksScheduler
{
	private client: Client;
	private lower = 0;
	private upper = 0;
	
	constructor(client: Client)
	{
		this.client = client;
		this.activate();
	}
	
	private setBounds()
	{
		const now = new Date();
		const minutes = now.getUTCMinutes();
		now.setUTCMinutes(minutes - (minutes % 5));
		now.setUTCSeconds(0);
		now.setUTCMilliseconds(0);
		this.lower = now.getTime();
		now.setUTCMinutes(now.getUTCMinutes() + 5);
		this.upper = now.getTime();
	}
	
	private activate()
	{
		this.setBounds();
		$.debug(`Scheduling next iteration for... ${new Date(Stonks.stonksScheduler).toUTCString()}`);
		$.debug(`Lower Bound: ${new Date(this.lower).toUTCString()}, Upper Bound: ${new Date(this.upper).toUTCString()}`);
		setTimeout(() => {
			if(Stonks.stonksScheduler >= this.lower)
				Stonks.triggerStonks(this.client);
			Stonks.stonksScheduler = this.upper + Random.int(0, 300000);
			Stonks.save();
			this.activate();
		}, Stonks.stonksScheduler - Date.now());
	}
}

/** Execute at some point in time during every 1 hour time frame. */
class EventScheduler
{
	private client: Client;
	private lower = 0;
	private upper = 0;
	
	constructor(client: Client)
	{
		this.client = client;
		this.activate();
	}
	
	private setBounds()
	{
		const now = new Date();
		now.setUTCMinutes(0);
		now.setUTCSeconds(0);
		now.setUTCMilliseconds(0);
		this.lower = now.getTime();
		now.setUTCHours(now.getUTCHours() + 1);
		this.upper = now.getTime();
	}
	
	private activate()
	{
		this.setBounds();
		$.debug(`Scheduling next event for... ${new Date(Stonks.eventScheduler).toUTCString()}`);
		$.debug(`Lower Bound: ${new Date(this.lower).toUTCString()}, Upper Bound: ${new Date(this.upper).toUTCString()}`);
		setTimeout(() => {
			if(Stonks.eventScheduler >= this.lower)
				Stonks.triggerEvent(this.client);
			Stonks.eventScheduler = this.upper + Random.int(0, 3600000);
			Stonks.save();
			this.activate();
		}, Stonks.eventScheduler - Date.now());
	}
}

export function initializeSchedulers(client: Client)
{
	new StonksScheduler(client);
	new EventScheduler(client);
}