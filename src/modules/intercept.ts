import {Message} from "discord.js";
import $ from "../core/lib";
import {Storage} from "../core/structures";
import {getMoneyEmbed} from "../commands/money";

const duolingo = [
	"Spanish or vanish.",
	"French or the trench.",
	"French or revenge.",
	"German or you're vermin.",
	"Dutch or it's your life you'll clutch.",
	"Thai or die."
];
const duo = [
	"https://i.kym-cdn.com/entries/icons/original/000/029/091/duo.jpg",
	"https://i.ytimg.com/vi/u6PZZn3SiVo/maxresdefault.jpg",
	"https://pbs.twimg.com/profile_images/1124422826188914688/4hhTG737_400x400.jpg",
	"https://i.ytimg.com/vi/M0Ncawy2LJc/hqdefault.jpg",
	"https://cdn141.picsart.com/322696516272211.png?type=webp&to=min&r=1280",
	"https://pbs.twimg.com/media/D2l_pmiXQAQdOCc.jpg:large",
	"https://i.ytimg.com/vi/VKbteJ7C4pA/maxresdefault.jpg",
	"https://i.redd.it/y0jvi57jxqs21.png"
];
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

export default async function intercept(message: Message)
{
	if(!Storage.getGuild(message.guild?.id || "N/A").intercept) return;
	const msg = message.content.toLowerCase();
	
	if(msg.includes("uwu") || msg.includes("owo"))
	{
		const victim = Storage.getUser(message.author.id);
		const collector = Storage.getUser(message.client.user?.id || "N/A");
		victim.money -= 350;
		collector.money += 350;
		victim.penalties++;
		Storage.save();
		message.channel.send("Don't uwu, 350 credit penalty.", getMoneyEmbed(message.author));
	}
	if(msg.includes("duolingo"))
		message.channel.send(`${$(duolingo).random()}\n${$(duo).random()}`);
	if(msg.includes("oil"))
		message.channel.send("***DID SOMEONE SAY OIL?!***\nhttps://cdn.discordapp.com/attachments/382973609968271361/730598140910108673/leaCheeseAmerican.png");
	if(contains(msg, leFrench))
		for(const emoji of $(french).random())
			await message.react(emoji);
}

function contains(str: string, array: string[])
{
	for(let entry of array)
		if(str.includes(entry))
			return true;
	return false;
}