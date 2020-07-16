import {Client, Collection, MessageMentions} from "discord.js";
import {existsSync, writeFileSync} from "fs";
import Storage from "./core/storage";
import lib from "./core/lib";
import setup from "./setup";
import {Config} from "./core/structures";
import Command, {template} from "./core/command";

(async() => {
	// Setup //
	await setup.init();
	const client = new Client();
	client.login(Config.token).catch(setup.again);
	
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
	
	// Special case for the help command.
	if(commands.has("help"))
	{
		const help = commands.get("help") as Command;
		help.special = commands;
		help.any!.special = commands;
	}
	
	client.on("message", async message => {
		// Message Setup //
		if(message.author.bot)
			return;
		
		// uwu-ing penalties, etc.
		
		if(!message.content.startsWith(Config.prefix))
		{
			if(message.mentions.members?.has(client.user?.id || ""))
				message.channel.send(`My prefix is \`${Config.prefix}\`.`);
			else
				return;
		}
		
		const [header, ...args] = message.content.substring(Config.prefix.length).split(/ +/);
		
		if(!commands.has(header))
			return;
		
		// Subcommand Recursion //
		let command = commands.get(header) as Command;
		const params: any[] = [];
		let isEndpoint = false;
		
		for(let param of args)
		{
			if(command.endpoint)
			{
				if(command.subcommands || command.user || command.number || command.any)
					lib.warn(`An endpoint cannot have subcommands! Check ${Config.prefix}${header} again.`);
				isEndpoint = true;
				break;
			}
			
			if(command.subcommands && (param in command.subcommands))
				command = command.subcommands[param];
			else if(command.user && (/\d{17,19}/.test(param) || MessageMentions.USERS_PATTERN.test(param)))
			{
				const id = param.match(/\d+/g)![0];
				command = command.user;
				try {params.push(await client.users.fetch(id))}
				catch(error) {params.push(null)}
			}
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
		
		if(isEndpoint)
		{
			message.channel.send("`Too many arguments!`");
			return;
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
	
	client.once("ready", async() => {
		if(client.user)
		{
			lib.ready(`Logged in as ${client.user.username}#${client.user.discriminator}.`);
			client.user.setActivity({
				type: "LISTENING",
				name: `${Config.prefix}help`
			});
		}
	});
})()