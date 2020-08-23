import $, {Random, isType, select, GenericJSON, GenericStructure} from "../core/lib";
import {Stonks, Storage} from "../core/structures";
import {Client, Guild, TextChannel} from "discord.js";
import {readFileSync as read} from "fs";

// Stonks Board Embeds //
function getStonksEmbedArray(markets: {[tag: string]: Market}, latestTimestamp: number): object[]
{
	const sections: object[] = [];
	// For the stonks board, the maximum allowed fields for embeds is 25, but 24 looks much nicer when it's inline.
	const tags = $(Object.keys(markets)).split(24);
	
	for(const list of tags)
	{
		const fields: {name: string, value: string, inline: boolean}[] = [];
		
		for(const tag of list)
		{
			const market = markets[tag];
			fields.push({
				name: market.title || "N/A",
				value: `${$(Math.round(market.value)).pluralise("credit", "s")} (${$(market.difference).pluraliseSigned("credit", "s")})`,
				inline: true
			});
		}
		
		sections.push({embed: {
			color: 0x008000,
			fields: fields,
			footer: {text: "Last Updated"},
			timestamp: latestTimestamp
		}});
	}
	
	return sections;
}

function getEventEmbed(headline: string, description: string, changes: {[market: string]: number}, latestTimestamp: number): object
{
	const effects: object[] = [];
	
	for(const tag in changes)
	{
		const delta = changes[tag];
		const decimal = (delta * 100).toFixed(2);
		
		effects.push({
			name: `${Stonks.getMarket(tag)?.title || tag || "N/A"} Stocks`,
			value: delta !== 1 ? `Now headed towards being around ${decimal}% as valuable as before.` : "No changes took place.",
			inline: true
		});
	}
	
	return {embed: {
		color: 0xFF0000,
		title: headline,
		description: description,
		fields: effects,
		footer: {text: "Last Updated"},
		timestamp: latestTimestamp
	}};
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
	public difference: number;
	
	constructor(data?: GenericJSON)
	{
		this.title = select(data?.title, "N/A", String);
		this.description = select(data?.description, "N/A", String);
		this.value = select(data?.value, 0, Number);
		this.cycle = select(data?.cycle, Random.num(-1, 1), Number);
		this.invested = select(data?.invested, 0, Number);
		this.volatility = Math.min(Math.max(select(data?.volatility, 0, Number), 0), 1);
		this.event = select(data?.event, 1, Number);
		this.difference = select(data?.difference, 0, Number);
	}
	
	/** Do the calculations on a market for one round. */
	iterate()
	{
		const previous = Math.round(this.value);
		this.value = Math.max(this.value, 0.001);
		this.cycle += Random.deviation(0.01, 0.005);
		if(this.cycle > 1) this.cycle -= 2;
		const point = Math.sin(this.cycle * Math.PI);
		const gain = Random.deviation(point, Math.log(this.value));
		const amplitude = Math.max(Random.deviation(Math.log(this.invested + this.value), this.volatility), 1);
		const sign = Random.chance(this.volatility) ? Random.sign(3) : 1;
		this.value += sign * amplitude * gain * this.event;
		this.value = Math.max(this.value, 0.001);
		this.difference = Math.round(this.value) - previous;
	}
}

class Event
{
	public headline: string;
	public description: string;
	public effects: {[market: string]: [number, number]};
	
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
					if(isType(market[0], Number) && isType(market[1], Number))
						this.effects = data.effects;
					else
						$.warn(`Tag "${tag}" of the selected effect is invalid!`, data.effects);
				}
			}
		}
	}
}

class GuildUpdater
{
	public channel: string; // The ID of the channel to post updates to.
	public messages: string[]; // The IDs of the market value messages in order.
	public event: string; // The ID of the last message which displays the latest event.
	
	constructor(data?: GenericJSON)
	{
		this.channel = select(data?.channel, "", String);
		this.messages = select(data?.messages, [], String, true);
		this.event = select(data?.event, "", String);
	}
}

export class StonksStructure extends GenericStructure
{
	public markets: {[tag: string]: Market};
	public guilds: {[id: string]: GuildUpdater};
	public lastUpdatedStonks: number;
	public lastUpdatedEvent: number;
	
	constructor(data: GenericJSON)
	{
		super("stonks");
		this.markets = {};
		this.guilds = {};
		this.lastUpdatedStonks = select(data.lastUpdatedStonks, Date.now(), Number);
		this.lastUpdatedEvent = select(data.lastUpdatedEvent, Date.now(), Number);
		// You need to initialize the list of markets regardless, so initialize it even if "markets" doesn't exist on "data".
		const list: GenericJSON = select(data.markets, {}, Object);
		
		for(const tag in StandardMarkets)
			this.markets[tag] = new Market(list[tag] ? Object.assign(list[tag], StandardMarkets[tag]) : StandardMarkets[tag]);
		
		if(isType(data.guilds, Object))
			for(const id in data.guilds)
				this.guilds[id] = new GuildUpdater(data.guilds[id]);
	}
	
	public getMarket(tag: string): Market|null
	{
		if(tag in this.markets)
			return this.markets[tag];
		else
			return null;
	}
	
	public async triggerStonks(client: Client): Promise<any>
	{
		$.debug(`Triggered stonks at ${new Date().toUTCString()}.`);
		
		for(const tag in this.markets)
		{
			const market = this.markets[tag];
			market.iterate();

			// Handle what happens if the value is 0.
			const value = Math.round(market.value);
			
			if(value <= 0)
			{
				$.debug(`Market crash at "${tag}".`);
				
				for(const id in Storage.users)
				{
					const user = Storage.users[id];
					
					if(tag in user.invested)
					{
						user.lost += user.invested[tag];
						user.invested[tag] = 0;
					}
				}
				
				market.invested = 0;
			}
		}
		
		this.lastUpdatedStonks = Date.now();
		this.save();
		Storage.save();
		const embeds = getStonksEmbedArray(this.markets, this.lastUpdatedStonks);
		const total = embeds.length;
		
		for(const guildID in this.guilds)
		{
			const guild = client.guilds.cache.get(guildID);
			
			if(!guild)
				return $.warn(`Guild "${guildID}" not found! Ignoring this guild.`);
			
			const container = this.guilds[guildID];
			const channel = guild.channels.cache.get(container.channel);
			const stored = container.messages;
			
			if(!channel)
				return $.warn(`Channel "${container.channel}" of guild "${guild.id}" is not a valid channel ID! Ignoring this guild.`);
			if(channel.type !== "text")
				return $.warn(`Channel "${channel.id}" of guild "${guild.id}" is not a text channel! Ignoring this guild.`);
			if(stored.length !== total)
				$.warn(`The length of the generated embed (${total}) isn't the same as the total amount of messages provided (${stored.length}). Using the amount of messages provided, meaning some data points might be cut off.`);
			
			const textChannel = channel as TextChannel;
			
			if(stored.length === 1)
			{
				const messageID = stored[0];
				
				textChannel.messages.fetch(messageID).then(message => {
					message.edit("Market Values", embeds[0]);
				}).catch(() => {
					$.error(`"${messageID}" isn't a valid message ID in channel "${container.channel}", guild "${guild.id}"!`);
				});
			}
			else if(stored.length > 1)
			{
				for(let i = 0; i < stored.length; i++)
				{
					const messageID = stored[i];
					
					textChannel.messages.fetch(messageID).then(message => {
						message.edit(`Market Values (Page ${i+1} of ${stored.length})`, embeds[i]);
					}).catch(() => {
						$.error(`"${messageID}" isn't a valid message ID in channel "${container.channel}", guild "${guild.id}"!`);
					});
				}
			}
		}
	}
	
	// This will also contain the code that executes an event's instructions because there's no way to keep that contained in the event class itself.
	public async triggerEvent(client: Client): Promise<any>
	{
		$.debug(`Triggered event at ${new Date().toUTCString()}.`);
		const event = $(StandardEvents).random();
		const changes: {[market: string]: number} = {};
		
		// Gather a list of changes and apply them to the market.
		for(const tag in event.effects)
		{
			const effect = event.effects[tag];
			const market = this.markets[tag];
			const target = Random.num(effect[0], effect[1]);
			const oldValue = market.event;
			market.event *= target;
			const newValue = market.event;
			// delta or % increase = new / old <-- (1.5 / 0.5 = 3x or 300% more valuable)
			const change = newValue / oldValue;
			changes[tag] = change;
		}
		
		// Display those changes in an embed.
		this.lastUpdatedEvent = Date.now();
		this.save();
		const embed = getEventEmbed(event.headline, event.description, changes, this.lastUpdatedEvent);
		
		for(const guildID in this.guilds)
		{
			if(!client.guilds.cache.has(guildID))
				return delete this.guilds[guildID];
			
			const guild = client.guilds.cache.get(guildID) as Guild;
			const container = this.guilds[guildID];
			const channel = guild.channels.cache.get(container.channel);
			
			if(!channel)
				return $.warn(`Channel "${container.channel}" of guild "${guild.id}" is not a valid channel ID! Ignoring this guild.`);
			if(channel.type !== "text")
				return $.warn(`Channel "${channel.id}" of guild "${guild.id}" is not a text channel! Ignoring this guild.`);
			
			const textChannel = channel as TextChannel;
			const messageID = container.event;
			
			textChannel.messages.fetch(messageID).then(message => {
				message.edit("Latest Event", embed);
			}).catch(() => {
				$.error(`"${messageID}" isn't a valid message ID in channel "${container.channel}", guild "${guild.id}"!`);
			});
		}
	}
	
	/** Initialize a guild to receive updates on market values and events. */
	public async addGuild(channel: TextChannel)
	{
		const embeds = getStonksEmbedArray(this.markets, this.lastUpdatedStonks);
		const total = embeds.length;
		const messages: string[] = [];
		
		if(total === 1)
			messages.push((await channel.send("Market Values", embeds[0])).id);
		else if(total > 1)
		{
			for(let i = 0; i < total; i++)
			{
				const embed = embeds[i];
				messages.push((await channel.send(`Market Values (Page ${i+1} of ${total})`, embed)).id);
			}
		}
		
		const event = (await channel.send("Latest Event", getEventEmbed("There is currently no active headline.", "Events will appear here as time goes on.", {}, this.lastUpdatedEvent))).id;
		this.guilds[channel.guild.id] = new GuildUpdater({
			channel: channel.id,
			messages: messages,
			event: event
		});
		this.save();
	}
}

// Standard city equipment shops and standard traders are implicitly integrated with the city they're in.
// For example, Rookie Sandwiches are part of Rookie Harbor's market.
// Do not use Market objects for this. This will be used to override values to update existing storage data, but if you instantiate a Market object, it'll overwrite all values.
export const StandardMarkets: GenericJSON = JSON.parse(read("standard/markets.json", "utf-8"));
const StandardEvents: Event[] = loadEvents(JSON.parse(read("standard/events.json", "utf-8")));

function loadEvents(data: GenericJSON[]): Event[]
{
	const list: Event[] = [];
	
	for(const entry of data)
		list.push(new Event(entry));
	
	return list;
}