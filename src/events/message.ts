import Event from "../core/event";
import {Message, Collection} from "discord.js";
import Storage from "../core/storage";
import lib from "../core/lib";

const commands = new Collection();

export default new Event({
	run(message: Message)
	{
		if(message.author.bot)
			return;
		
		// intercept(message) --> uwu penalties, etc.
		
		//if(message.content.startsWith())
		console.log(message.content);
	}
});

(async() => {
	const commandFiles = Storage.open("dist/commands", file => file.endsWith(".js"));

	for(const file of commandFiles)
	{
		const header = file.substring(0, file.indexOf(".js"));
		const command = (await import(`../commands/${header}`)).default;
		commands.set(header, command);
	}
	
	console.log(commands);
})()

/*console.log($(5).pluralise('part', 'ies', 'y'));
$.test();
console.log(Storage.open("dist/commands", file => file.endsWith(".js")));

let a = {
	message: 'nope'
}
Object.assign(a, lib);*/