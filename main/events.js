const lib = require('./lib.js');
const french = [
	['🥖'],
	['🥐'],
	['🇫🇷'],
	['🇴','🇺','🇮','❗']
];
const leFrench = [
	"french",
	"france",
	"francais",
	"français",
	"paris",
	"hon",
	"baguette",
	"l'",
	"d'",
	"croissant",
	"oui",
	"madame",
	"mademoiselle",
	"monsieur"
];

// Duolingo message intercept
// Actually, most of this will be message.contains() and will have caption text / an image attached, so modularize for that.
module.exports = {
	async intercept(message)
	{
		let msg = message.content.toLowerCase();
		
		if(msg.includes('uwu') || msg.includes('owo'))
		{
			let user = lib.get(lib.loadJSON('storage').users, message.author.id, {});
			lib.get(user, 'money', 0);
			user.money -= 350;
			let amountOfMoney = lib.pluralise(user.money, 'credit', 's');
			
			message.channel.send("Don't uwu, 350 credit penalty.", {embed: {
				author:
				{
					name: message.author.username,
					icon_url: message.author.avatarURL({
						format: 'png',
						dynamic: true
					})
				},
				description: `Balance: ${amountOfMoney}`,
				color: "#ffff00"
			}});
			
			lib.writeJSON('storage');
		}
		else if(msg.includes('oil'))
		{
			message.channel.send("***DID SOMEONE SAY OIL?!***", {
				files:
				[
					{
						attachment: "data/assets/america.png",
						name: "leaCheeseAmerican.png"
					}
				]
			});
		}
		else if(contains(msg, leFrench))
		{
			let list = french[lib.randInt(0, french.length)];
			
			for(let emoji of list)
				await message.react(emoji);
		}
	}
};

function contains(str, arr)
{
	for(let i = 0; i < arr.length; i++)
		if(str.includes(arr[i]))
			return true;
	return false;
}