import {Client, Collection} from "discord.js";
import {existsSync, writeFileSync, fstat, write} from "fs";
import Storage from "./core/storage";
import lib from "./core/lib";
import setup from "./setup";
import {Config} from "./core/templates";
import Command, {template} from "./core/command";

(async() => {
	// Setup //
	await setup.init();
	const config = Storage.read("config") as Config;
	const client = new Client();
	client.login(config.token).catch(setup.again);
	
	// Load Commands //
	const commands = new Collection();
	
	if(!existsSync("src/commands/test.ts"))
		writeFileSync("src/commands/test.ts", template);
	
	for(const file of Storage.open("dist/commands", file => file.endsWith(".js")))
	{
		const header = file.substring(0, file.indexOf(".js"));
		const command = (await import(`./commands/${header}`)).default;
		commands.set(header, command);
	}
	
	client.on("message", message => {
		// Checks //
		if(message.author.bot)
			return;
		
		// uwu-ing penalties, etc.
		
		if(!message.content.startsWith(config.prefix))
			return;
		
		const [header, ...args] = message.content.substring(config.prefix.length).split(/ +/);
		
		if(!commands.has(header))
			return;
		
		// Subcommand Recursion //
		let command = commands.get(header) as Command;
		const params: any[] = [];
		
		for(let param of args)
		{
			if(command.subcommands && (param in command.subcommands))
				command = command.subcommands[param];
			else if(command.number && Number(param))
			{
				command = command.number;
				params.push(Number(param));
			}
			else if(command.any)
			{
				command = command.any;
				params.push(param);
			}
			else
				params.push(param);
		}
		
		// Execute with dynamic library attached. //
		command.execute(Object.assign({
			args: params,
			author: message.author,
			channel: message.channel,
			client: client,
			guild: message.guild,
			member: message.member,
			message: message
		}, lib));
	});
	
	client.once("ready", () => {
		console.log("Ready!");
	});
})()