import {client, Random} from "onion-lasers";
import {Stonks} from "../structures";

/** Execute at some point in time during every 5 minute time frame. */
class StonksScheduler
{
	private lower = 0;
	private upper = 0;
	private scheduled = 0;
	
	constructor()
	{
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
		this.scheduled = this.upper + Random.int(0, 300000);
		console.debug(`Scheduling next iteration for... ${new Date(this.scheduled).toUTCString()}`);
		console.debug(`Lower Bound: ${new Date(this.lower).toUTCString()}, Upper Bound: ${new Date(this.upper).toUTCString()}`);
		
		setTimeout(() => {
			Stonks.triggerStonks(client);
			this.activate();
		}, this.scheduled - Date.now());
	}
}

/** Execute at some point in time during every 1 day time frame. */
class EventScheduler
{
	private lower = 0;
	private upper = 0;
	private scheduled = 0;
	
	constructor()
	{
		this.activate();
	}
	
	private setBounds()
	{
		const now = new Date();
		now.setUTCHours(0);
		now.setUTCMinutes(0);
		now.setUTCSeconds(0);
		now.setUTCMilliseconds(0);
		this.lower = now.getTime();
		now.setUTCDate(now.getUTCDate() + 1);
		this.upper = now.getTime();
	}
	
	private activate()
	{
		this.setBounds();
		this.scheduled = this.upper + Random.int(0, 86400000);
		console.debug(`Scheduling next event for... ${new Date(this.scheduled).toUTCString()}`);
		console.debug(`Lower Bound: ${new Date(this.lower).toUTCString()}, Upper Bound: ${new Date(this.upper).toUTCString()}`);
		
		setTimeout(() => {
			Stonks.triggerEvent(client);
			this.activate();
		}, this.scheduled - Date.now());
	}
}

export function initializeSchedulers()
{
	new StonksScheduler();
	new EventScheduler();
}