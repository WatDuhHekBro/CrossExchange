import {client} from "../index";
import Command, {loadCommands} from "../core/command";
import {hasPermission, getPermissionLevel, getPermissionName} from "../core/permissions";
import {Permissions} from "discord.js";
import {getPrefix} from "../core/structures";
import intercept from "../modules/intercept";
import {handler, parseVars} from "../core/lib";

loadCommands().then(commands => {
	client.on("message", async message => {
		// Message Setup //
		if(message.author.bot)
			return;
		
		const prefix = getPrefix(message.guild);
		
		if(!message.content.startsWith(prefix))
		{
			if(message.client.user && message.mentions.has(message.client.user))
				message.channel.send(`${message.author.toString()}, my prefix on this guild is \`${prefix}\`.`);
			return intercept(message);
		}
		
		const [header, ...args] = message.content.substring(prefix.length).split(/ +/);
		
		if(!commands.has(header))
			return;
		
		if(message.channel.type === "text" && !message.channel.permissionsFor(message.client.user || "")?.has(Permissions.FLAGS.SEND_MESSAGES))
		{
			let status;
			
			if(message.member?.hasPermission(Permissions.FLAGS.ADMINISTRATOR))
				status = "Because you're a server admin, you have the ability to change that channel's permissions to match if that's what you intended.";
			else
				status = "Try using a different channel or contacting a server admin to change permissions of that channel if you think something's wrong.";
			
			return message.author.send(`I don't have permission to send messages in ${message.channel.toString()}. ${status}`);
		}
		
		console.log(`${message.author.username}#${message.author.discriminator} executed the command "${header}" with arguments "${args}".`);
		
		// Subcommand Recursion //
		let command = commands.get(header) as Command; // Whatever command this is cannot be undefined because it was checked earlier.
		const params: any[] = [];
		let isEndpoint = false;
		let permLevel = command.permission || 0;
		
		for(let param of args)
		{
			if(command.endpoint)
			{
				isEndpoint = true;
				break;
			}
			
			const type = command.resolve(param);
			command = command.get(param);
			
			if(command.permission !== -1)
				permLevel = command.permission;
			
			if(type === Command.TYPES.USER)
			{
				const id = param.match(/\d+/g)![0];
				try {params.push(await message.client.users.fetch(id))}
				catch(error) {return message.channel.send(`No user found by the ID \`${id}\`!`)}
			}
			else if(type === Command.TYPES.NUMBER)
				params.push(Number(param));
			else if(type !== Command.TYPES.SUBCOMMAND)
				params.push(param);
		}
		
		if(!message.member)
			return console.warn("This command was likely called from a DM channel meaning the member object is null.");
		
		if(!hasPermission(message.member, permLevel))
		{
			const userPermLevel = getPermissionLevel(message.member);
			return message.channel.send(`You don't have access to this command! Your permission level is \`${getPermissionName(userPermLevel)}\` (${userPermLevel}), but this command requires a permission level of \`${getPermissionName(permLevel)}\` (${permLevel}).`);
		}
		
		if(isEndpoint)
			return message.channel.send("Too many arguments!");
		
		if(typeof command.run === "string")
		{
			message.channel.send(parseVars(command.run, {
				author: message.author.toString(),
				prefix: getPrefix(message.guild)
			}, "???"));
		}
		else
		{
			const menu = {
				args: params,
				author: message.author,
				channel: message.channel,
				client: message.client,
				guild: message.guild,
				member: message.member,
				message: message
			};
			command.run(menu).catch(handler.bind(menu));
		}
	});
});

