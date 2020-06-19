module.exports = {
	run($)
	{
		let stats = {};
		let allTextChannelsInCurrentGuild = $.guild.channels.cache.filter(channel => channel.type === "text");
		let channelsSearched = 0;
		
		allTextChannelsInCurrentGuild.each(async channel => {
			// This will count all reactions in text and reactions per channel.
			let selected = channel.lastMessageID;
			let continueLoop = true;
			
			while(continueLoop)
			{
				let messages = await channel.messages.fetch({
					limit: 100,
					before: selected
				});
				
				if(messages.size <= 0)
				{
					continueLoop = false;
					channelsSearched++;
					
					// Display stats on emote usage.
					if(channelsSearched >= allTextChannelsInCurrentGuild.size)
					{
						// Depending on how many emotes you have, you might have to break up the analytics into multiple messages.
						let lines = [];
						let line = "";
						
						for(let emote in stats)
						{
							let emoteObject = $.guild.emojis.resolve(emote);
							
							// Emotes not within the current guild (or deleted ones) will return null. Select only those from the current guild.
							if(emoteObject != null)
							{
								let stat = emoteObject.toString() + " x " + stats[emote] + "\n";
								
								if(line.length + stat.length > 1900)
								{
									lines.push(line);
									line = "";
								}
								
								line += stat;
							}
						}
						
						// You can't send empty messages or there'll be an error.
						if(line.length > 0)
							lines.push(line);
						
						for(let ln of lines)
							await $.channel.send(ln);
					}
				}
				else
				{
					messages.each(msg => {
						let msgEmotes = msg.content.match(/<:.+?:\d+?>/g) || [];
						let reactions = msg.reactions.cache;
						let reactionEmotes = reactions.keyArray();
						
						for(let emote of msgEmotes)
						{
							let emoteID = emote.match(/\d+/g)[0];
							
							if(!(emoteID in stats))
								stats[emoteID] = 0;
							
							stats[emoteID]++;
						}
						
						for(let emoteID of reactionEmotes)
						{
							// Exclude any unicode emote.
							if(reactions.get(emoteID).emoji.id != null)
							{
								if(!(emoteID in stats))
									stats[emoteID] = 0;
								stats[emoteID] += reactions.get(emoteID).count;
							}
						}
						
						selected = msg.id;
					});
				}
			}
		});
	},
	subcommands:
	{
		messages:
		{
			async run($)
			{
				let stats = $.lib.loadJSON("stats", true);
				stats.messages = [];
				let selected = $.message.id;
				let continueLoop = true;
				
				while(continueLoop)
				{
					let messages = await $.channel.messages.fetch({
						limit: 100,
						before: selected
					});
					
					if(messages.size <= 0)
					{
						$.lib.writeJSON("stats");
						$.channel.send(`Collected ${stats.messages.length} messages.`);
						continueLoop = false;
					}
					else
					{
						messages.each(msg => {
							stats.messages.push(msg.content);
							selected = msg.id;
						});
					}
				}
			}
		}
	}
};