import {Random} from "../core/lib";
import {select, GenericJSON} from "../core/structures";

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

export class Market
{
	public title: string;
	public description: string;
	public value: number;
	public cycle: number;
	public invested: number;
	public volatility: number;
	public event: number;
	public catalog: number[][];
	
	constructor(data?: GenericJSON)
	{
		this.title = select(data?.title, "", String);
		this.description = select(data?.description, "", String);
		this.value = select(data?.value, 0, Number);
		this.cycle = select(data?.cycle, Random.num(-1, 1), Number);
		this.invested = select(data?.invested, 0, Number);
		this.volatility = Math.min(Math.max(select(data?.volatility, 0, Number), 0), 1);
		this.event = select(data?.event, 1, Number);
		this.catalog = select(data?.catalog, [], Object, true); // ohno
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

export class Event
{
	public headline: string;
	public description: string;
	public effects: any[];
	
	constructor(data?: GenericJSON)
	{
		this.headline = select(data?.headline, "", String);
		this.description = select(data?.description, "", String);
		this.effects = [];
	}
	
	/**  */
	execute()
	{
		
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