import Command from "../core/command";
import {CommonLibrary} from "../core/lib";

const types = ["user", "number", "any"];

export default new Command({
	description: "Lists all commands. If a command is specified, their arguments are listed as well.",
	usage: "([command, [subcommand/type], ...])",
	async run($: CommonLibrary)
	{
		const list: string[] = [];
		
		for(const [header, command] of this.special)
			if(header !== "test")
				list.push(`- \`${header}\` - ${command.description}`);
		
		const outList = list.length > 0 ? `\n${list.join('\n')}` : " None";
		$.channel.send(`Legend: \`<type>\`, \`[list/of/subcommands]\`, \`(optional)\`, \`(<optional type>)\`, \`([optional/list/...])\`\nCommands:${outList}`, {split: true});
	},
	any: new Command({
		async run($: CommonLibrary)
		{
			let header = $.args.shift();
			let command = this.special.get(header);
			
			if(!command || header === "test")
				$.channel.send(`No command found by the name \`${header}\`!`);
			else
			{
				let usage = command.usage;
				
				for(const param of $.args)
				{
					header += ` ${param}`;
					
					if(/<\w+>/g.test(param))
					{
						const type = param.match(/\w+/g)[0];
						
						if(types.includes(type))
						{
							command = command[type];
							
							if(command.usage !== "")
								usage = command.usage;
						}
						else
						{
							command = null;
							break;
						}
					}
					else if(command?.subcommands && param in command.subcommands)
					{
						command = command.subcommands[param];
						
						if(command.usage !== "")
							usage = command.usage;
					}
					else
					{
						command = null;
						break;
					}
				}
				
				if(!command)
				{
					$.channel.send(`No command found by the name \`${header}\`!`);
					return;
				}
				
				let append = "";
				
				if(usage === "")
				{
					const list: string[] = [];
					
					for(const subtag in command.subcommands)
					{
						const subcmd = command.subcommands[subtag] as Command;
						list.push(`- \`${header} ${subtag}\` - ${subcmd.description}`);
					}
					
					for(const type of types)
						if(command[type])
							list.push(`- \`${header} <${type}>\` - ${command[type].description}`);
					
					append = "Usages:" + (list.length > 0 ? `\n${list.join('\n')}` : " None.");
				}
				else
					append = `Usage: \`${header} ${usage}\``;
				
				$.channel.send(`Command: \`${header}\`\nDescription: ${command.description}\n${append}`, {split: true});
			}
		}
	})
});