import $, {Random, isType, select, GenericJSON, GenericStructure} from "../core/lib";

// Stonks Board Embeds //
// split by 24 fields each because it's divisible by 3, good for symmetry
export function getStonksEmbedArray(): object[]
{
	return [];
}

export function getEventEmbed(): object
{
	return {};
}

class Market
{
	public title: string;
	public description: string;
	public value: number;
	public cycle: number;
	public invested: number;
	public volatility: number;
	public event: number;
	public catalog: [number, number][];
	
	constructor(data?: GenericJSON)
	{
		this.title = select(data?.title, "", String);
		this.description = select(data?.description, "", String);
		this.value = select(data?.value, 0, Number);
		this.cycle = select(data?.cycle, Random.num(-1, 1), Number);
		this.invested = select(data?.invested, 0, Number);
		this.volatility = Math.min(Math.max(select(data?.volatility, 0, Number), 0), 1);
		this.event = select(data?.event, 1, Number);
		this.catalog = [];
		
		if(data?.catalog && isType(data.catalog, Array))
			for(const entry of data.catalog)
				if(entry.length === 2 && isType(entry[0], Number) && isType(entry[1], Number))
					this.catalog.push(entry);
	}
	
	/** Do the calculations on a market for one round. */
	iterate()
	{
		this.value = Math.max(this.value, 0.001);
		this.cycle += Random.deviation(0.01, 0.005);
		if(this.cycle > 1) this.cycle -= 2;
		const point = Math.sin(this.cycle * Math.PI);
		const gain = Random.deviation(point, Math.log(this.value));
		const amplitude = Math.max(Random.deviation(Math.log(this.invested + this.value), this.volatility), 1);
		const sign = Random.chance(this.volatility) ? Random.sign(3) : 1;
		this.value += sign * amplitude * gain * this.event;
		this.value = Math.max(this.value, 0.001);
	}
}

class Event
{
	public headline: string;
	public description: string;
	public effects: {[market: string]: ["ADD"|"MUL"|"SET", number, number]};
	
	constructor(data?: GenericJSON)
	{
		this.headline = select(data?.headline, "", String);
		this.description = select(data?.description, "", String);
		this.effects = {};
	}
}

// if data, foreach plug then del from DefaultMarkets, whatever's left from DefaultMarkets plug into markets.
/*const DefaultMarkets = {
	rookie:
	{
		"title": "",
		"description": ""
	},
};

const DefaultEvents = {
	
};*/

export class StonksStructure extends GenericStructure
{
	public markets: {[tag: string]: Market};
	public events: Event[];
	public channel: string|null; // The ID of the channel to post updates to.
	public messages: string[]; // The IDs of the market value messages in order. The last one is the latest event message.
	public stonksScheduler: number;
	public eventScheduler: number;
	
	constructor(data: GenericJSON)
	{
		super("stonks");
		this.markets = {};
		this.events = [];
		this.channel = select(data.channel, null, String);
		this.messages = select(data.messages, [], String, true);
		this.stonksScheduler = select(data.stonksScheduler, 0, Number);
		this.eventScheduler = select(data.eventScheduler, 0, Number);
	}
	
	public getMarket(tag: string): Market|null
	{
		if(tag in this.markets)
			return this.markets[tag];
		else
			return null;
	}
	
	public triggerStonks()
	{
		$.debug(`Triggered stonks at ${new Date().toString()}.`);
	}
	
	public triggerEvent()
	{
		$.debug(`Triggered event at ${new Date().toString()}.`);
	}
}