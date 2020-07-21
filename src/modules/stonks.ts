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

export class Market
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
		this.catalog.push([Date.now(), Math.round(this.value)]);
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

export class StonksStructure extends GenericStructure
{
	public markets: {[tag: string]: Market};
	public channel: string|null; // The ID of the channel to post updates to.
	public messages: string[]; // The IDs of the market value messages in order. The last one is the latest event message.
	public stonksScheduler: number;
	public eventScheduler: number;
	
	constructor(data: GenericJSON)
	{
		super("stonks");
		this.markets = {};
		this.channel = select(data.channel, null, String);
		this.messages = select(data.messages, [], String, true);
		this.stonksScheduler = select(data.stonksScheduler, 0, Number);
		this.eventScheduler = select(data.eventScheduler, 0, Number);
		
		// Initialize only the values that aren't part of the default market so descriptions can update if any of them change.
		if(isType(data.markets, Object))
			for(const tag in StandardMarkets)
				this.markets[tag] = data.markets[tag] ? Object.assign(new Market(data.markets[tag]), StandardMarkets[tag]) : StandardMarkets[tag];
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
		$.debug(`Triggered stonks at ${new Date().toUTCString()}.`);
	}
	
	// This will also contain the code that executes an event's instructions because there's no way to keep that contained in the event class itself.
	public triggerEvent()
	{
		$.debug(`Triggered event at ${new Date().toUTCString()}.`);
	}
}

// Standard city equipment shops and standard traders are implicitly integrated with the city they're in.
// For example, Rookie Sandwiches are part of Rookie Harbor's market.
export const StandardMarkets: {[tag: string]: Market} = {
	rookie: new Market({
		title: "Rookie Harbor",
		description: "",
		volatility: 0
	}),
	bergen: new Market({
		title: "Bergen Village",
		description: "",
		volatility: 0
	}),
	bakii: new Market({
		title: "Ba'kii Kum",
		description: "",
		volatility: 0
	}),
	basin: new Market({
		title: "Basin Keep",
		description: "",
		volatility: 0
	}),
	sapphire: new Market({
		title: "Sapphire Ridge",
		description: "",
		volatility: 0
	}),
	rhombus: new Market({
		title: "Rhombus Square",
		description: "",
		volatility: 0
	}),
	teak: new Market({
		title: "Ms. Teak's Steaks",
		description: "",
		volatility: 0
	}),
	icecream: new Market({
		title: "Frosty Arnold's Ice Cream Stand",
		description: "",
		volatility: 0
	}),
	plants: new Market({
		title: "Talatu Lips' Botantical Garden",
		description: "",
		volatility: 0
	}),
	tara: new Market({
		title: "Tara's Sandwich Shop",
		description: "",
		volatility: 0
	}),
	hermit: new Market({
		title: "Hermit's Pub",
		description: "bergen",
		volatility: 0
	}),
	tophat: new Market({
		title: "Bergen Hatmaker",
		description: "",
		volatility: 0
	}),
	mine: new Market({
		title: "The Bergen Mine",
		description: "",
		volatility: 0
	}),
	brewery: new Market({
		title: "The Ba'kii Kum Brewery",
		description: "",
		volatility: 0
	}),
	bazaar: new Market({
		title: "The Baki Bazaar Union",
		description: "",
		volatility: 0
	}),
	pond: new Market({
		title: "The Pond Slums Traders",
		description: "",
		volatility: 0
	}),
	zirvitar: new Market({
		title: "Zir'vitar Power Plant",
		description: "basin",
		volatility: 0
	}),
	booster: new Market({
		title: "Rhombus Booster Shop",
		description: "",
		volatility: 0
	}),
	chest: new Market({
		title: "Rhombus Chest Detector Shop",
		description: "",
		volatility: 0
	}),
	arena: new Market({
		title: "The Rhombus Arena",
		description: "",
		volatility: 0
	})
};

const StandardEvents: Event[] = [
	new Event({
		
	})
];