// Function to call to react to messages when there's certain content (like "French").
// Duolingo message intercept
// Actually, most of this will be message.contains() and will have caption text / an image attached, so modularize for that.

// Code dump from my previous Discord bot that'll be implemented one day...
/*
const french = [
	['🥖'],
	['🥐'],
	['🇫🇷'],
	['🇴','🇺','🇮','❗']
];

client.on('message', async message => {
	if(message.author.bot)
		return;
	
	if(message.mentions.everyone || message.mentions.roles.first() || message.mentions.users.first())
		message.react('577257552254074900');
	
	if(message.content === "test")
		message.channel.send(client.emojis.get('708530510682390539')+'test');
	
	if(message.content.includes('!react'))
	{
		let emote = client.emojis.find(emoji => emoji.name === message.content.substring(7));
		console.log(emote);
		//message.channel.messages.fetch({around: message.channel.lastMessageID, limit: 1}).then(message => {console.log(message.content)}).catch(console.error);
		//message.delete();
		//message.lastMessage.react('708530510682390539');
	}
	
	if(message.content.toLowerCase().includes('oil'))
	{
		message.channel.send("***DID SOMEONE SAY OIL?!***", {
			files:
			[
				{
					attachment: 'leaCheeseAmerican.png',
					name: 'leaCheeseAmerican.png'
				}
			]
		});
	}
	
	if(contains(message.content.toLowerCase(), ['french', 'france', 'francais', 'français', 'paris', 'hon', 'baguette', "l'", "d'", 'croissant']))
	{
		try
		{
			let rng = Math.floor(Math.random() * french.length);
			let ch = french[rng];
			
			for(let emoji of ch)
				await message.react(emoji);
		}
		catch(error) {console.error('One of the emojis failed to react.');}
	}
	
	if(contains(message.content.toLowerCase(), ['reeee', 'pepe']))
		message.react('577220259275210762');
	
	// You should know about the Hagais Massacre that happened on April 15, 1447. Open your history books people!
	if(contains(message.content.toLowerCase(), ['hagais', 'massacre']) && contains(message.content.toLowerCase(), ['1447', 'april', '15']))
	{
		message.delete();
		message.channel.send(`NOTHING happened on April 15, 1447! ${message.author.toString()}, do NOT spread false rumors **or else you WILL be banned!**`);
	}
	
	if(message.content.includes('!write '))
	{
		fs.writeFile('stonks.txt', message.content.substring(7), (error) => {
			if(error)
				message.channel.send('nope');
			else
				message.channel.send(message.content.substring(7));
		});
	}
});

function contains(str, arr)
{
	for(let i = 0; i < arr.length; i++)
		if(str.includes(arr[i]))
			return true;
	return false;
}
*/