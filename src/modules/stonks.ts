import $, {Random, isType, select, GenericJSON, GenericStructure, perforate} from "../core/lib";
import {Stonks} from "../core/structures";

// Stonks Board Embeds //
export function getStonksEmbedArray(markets: {[tag: string]: Market}): object[]
{
	const sections: object[] = [];
	// For the stonks board, the maximum allowed fields for embeds is 25, but 24 looks much nicer when it's inline.
	const tags = perforate(Object.keys(markets), 24);
	
	for(const list of tags)
	{
		const fields: {name: string, value: string, inline: boolean}[] = [];
		
		for(const tag of list)
		{
			const market = markets[tag];
			const current = market.catalog[0];
			const previous = market.catalog[1];
			let display = "N/A";
			
			if(current)
			{
				display = $(current[0]).pluralise("credit", "s");
				
				if(previous)
				{
					const change = current[0] - previous[0];
					display += ` (${$(change).pluraliseSigned("credit", "s")})`;
				}
			}
			
			fields.push({
				name: market.title || "N/A",
				value: display,
				inline: true
			});
		}
		
		sections.push({embed: {
			color: 0x008000,
			fields: fields,
			footer: {text: "Last Updated"},
			timestamp: Date.now()
		}});
	}
	
	return sections;
}

export function getEventEmbed(headline: string, description: string, changes: {[market: string]: number}): object
{
	const effects: object[] = [];
	
	for(const tag in changes)
	{
		const delta = changes[tag];
		const decimal = (delta * 100).toFixed(2);
		
		effects.push({
			name: `${Stonks.getMarket(tag)?.title || tag || "N/A"} Stocks`,
			value: delta !== 1 ? `Now ${decimal}% as valuable as before.` : "No changes took place.",
			inline: true
		});
	}
	
	return {embed: {
		color: 0xFF0000,
		title: headline,
		description: description,
		fields: effects
	}};
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
		this.title = select(data?.title, "N/A", String);
		this.description = select(data?.description, "N/A", String);
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
		this.catalog.unshift([Math.round(this.value), Date.now()]);
	}
}

export class Event
{
	public headline: string;
	public description: string;
	public effects: {[market: string]: ["ADD"|"MUL"|"SET", number, number]};
	
	constructor(data?: GenericJSON)
	{
		this.headline = select(data?.headline, "N/A", String);
		this.description = select(data?.description, "N/A", String);
		this.effects = {};
		
		if(data && isType(data.effects, Object))
		{
			for(const tag in data.effects)
			{
				const market = data.effects[tag];
				
				if(isType(market, Array))
				{
					const isValidOperation = ["ADD", "MUL", "SET"].includes(market[0]);
					const isValidRange = isType(market[1], Number) && isType(market[2], Number);
					
					if(isValidOperation && isValidRange)
						this.effects = data.effects;
					else
						$.warn(`Tag "${tag}" of the selected effect is invalid!`, data.effects);
				}
			}
		}
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
				this.markets[tag] = new Market(data.markets[tag] ? Object.assign(data.markets[tag], StandardMarkets[tag]) : StandardMarkets[tag]);
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
		// delta or % increase = new / old <-- (1.5 / 0.5 = 3x or 300% more valuable)
	}
}

// Standard city equipment shops and standard traders are implicitly integrated with the city they're in.
// For example, Rookie Sandwiches are part of Rookie Harbor's market.
// Do not use Market objects for this. This will be used to override values to update existing storage data, but if you instantiate a Market object, it'll overwrite all values.
export const StandardMarkets: {[tag: string]: object} = {
	rookie:
	{
		title: "Rookie Harbor",
		description: "",
		volatility: 0
	},
	bergen:
	{
		title: "Bergen Village",
		description: "",
		volatility: 0
	},
	bakii:
	{
		title: "Ba'kii Kum",
		description: "",
		volatility: 0
	},
	basin:
	{
		title: "Basin Keep",
		description: "",
		volatility: 0
	},
	sapphire:
	{
		title: "Sapphire Ridge",
		description: "",
		volatility: 0
	},
	rhombus:
	{
		title: "Rhombus Square",
		description: "",
		volatility: 0
	},
	teak:
	{
		title: "Ms. Teak's Steaks",
		description: "",
		volatility: 0
	},
	icecream:
	{
		title: "Frosty Arnold's Ice Cream Stand",
		description: "",
		volatility: 0
	},
	plants:
	{
		title: "Talatu Lips' Botantical Garden",
		description: "",
		volatility: 0
	},
	tara:
	{
		title: "Tara's Sandwich Shop",
		description: "",
		volatility: 0
	},
	hermit:
	{
		title: "Hermit's Pub",
		description: "bergen",
		volatility: 0
	},
	tophat:
	{
		title: "Bergen Hatmaker",
		description: "",
		volatility: 0
	},
	mine:
	{
		title: "The Bergen Mine",
		description: "",
		volatility: 0
	},
	brewery:
	{
		title: "The Ba'kii Kum Brewery",
		description: "",
		volatility: 0
	},
	bazaar:
	{
		title: "The Baki Bazaar Union",
		description: "",
		volatility: 0
	},
	pond:
	{
		title: "The Pond Slums Traders",
		description: "",
		volatility: 0
	},
	zirvitar:
	{
		title: "Zir'vitar Power Plant",
		description: "basin",
		volatility: 0
	},
	booster:
	{
		title: "Rhombus Booster Shop",
		description: "",
		volatility: 0
	},
	chest:
	{
		title: "Rhombus Chest Detector Shop",
		description: "",
		volatility: 0
	},
	arena:
	{
		title: "The Rhombus Arena",
		description: "",
		volatility: 0
	}
};

const StandardEvents: Event[] = [
	new Event({
		
	})
];