import {Client, Collection, MessageMentions} from "discord.js";
import {existsSync, writeFileSync} from "fs";
import FileManager from "./core/storage";
import lib from "./core/lib";
import setup from "./setup";
import {Config, Storage} from "./core/structures";
import Command, {template} from "./core/command";
import intercept from "./modules/intercept";

(async() => {
	// Setup //
	await setup.init();
	const client = new Client();
	client.login(Config.token).catch(setup.again);
	
	// Load Commands //
	const commands = new Collection();
	
	if(!existsSync("src/commands/test.ts"))
		writeFileSync("src/commands/test.ts", template);
	
	for(const file of FileManager.open("dist/commands", file => file.endsWith(".js")))
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
		if(message.author.bot) return;
		const prefix = Storage.getGuild(message.guild?.id || "N/A").prefix || Config.prefix;
		if(!message.content.startsWith(prefix)) return intercept(message);
		const [header, ...args] = message.content.substring(prefix.length).split(/ +/);
		if(!commands.has(header)) return;
		
		// Subcommand Recursion //
		let command = commands.get(header) as Command;
		const params: any[] = [];
		let isEndpoint = false;
		
		for(let param of args)
		{
			if(command.endpoint)
			{
				if(command.subcommands || command.user || command.number || command.any)
					lib.warn(`An endpoint cannot have subcommands! Check ${prefix}${header} again.`);
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
				catch(error) {return message.channel.send(`No user found by the ID \`${id}\`!`)}
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
			return message.channel.send("Too many arguments!");
		
		// Execute with dynamic library attached. //
		command.execute(Object.assign(lib, {
			args: params,
			author: message.author,
			channel: message.channel,
			client: client,
			guild: message.guild,
			member: message.member,
			message: message
		}));
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