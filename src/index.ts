import {Client, MessageMentions} from "discord.js";
import $ from "./core/lib";
import setup from "./setup";
import FileManager from "./core/storage";
import {Config, Storage} from "./core/structures";
import intercept from "./modules/intercept";
import {initializeSchedulers} from "./modules/scheduler";

(async() => {
	// Setup //
	await setup.init();
	const client = new Client();
	const commands = await FileManager.loadCommands();
	client.login(Config.token).catch(setup.again);
	initializeSchedulers();
	
	client.on("message", async message => {
		// Message Setup //
		if(message.author.bot) return;
		const prefix = Storage.getGuild(message.guild?.id || "N/A").prefix || Config.prefix;
		if(!message.content.startsWith(prefix)) return intercept(message);
		const [header, ...args] = message.content.substring(prefix.length).split(/ +/);
		if(!commands.has(header)) return;
		$.log(`${message.author.username}#${message.author.discriminator} executed the command "${header}" with arguments "${args}".`);
		
		// Subcommand Recursion //
		let command = commands.get(header);
		if(!command) return $.warn(`Command "${header}" was called but for some reason it's still undefined!`);
		const params: any[] = [];
		let isEndpoint = false;
		
		for(let param of args)
		{
			if(command.endpoint)
			{
				if(command.subcommands || command.user || command.number || command.any)
					$.warn(`An endpoint cannot have subcommands! Check ${prefix}${header} again.`);
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
		command.execute(Object.assign($, {
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
			$.ready(`Logged in as ${client.user.username}#${client.user.discriminator}.`);
			client.user.setActivity({
				type: "LISTENING",
				name: `${Config.prefix}help`
			});
		}
	});
})()