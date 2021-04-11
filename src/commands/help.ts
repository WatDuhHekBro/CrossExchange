import {NamedCommand, RestCommand, getCommandList, getCommandInfo, getPermissionName} from "onion-lasers";

export default new NamedCommand({
    description: "Lists all commands. If a command is specified, their arguments are listed as well.",
    usage: "([command, [subcommand/type], ...])",
    aliases: ["h"],
    async run({send}) {
        const commands = await getCommandList();
        let output = `Legend: \`<type>\`, \`[list/of/stuff]\`, \`(optional)\`, \`(<optional type>)\`, \`([optional/list/...])\``;

        for (const [category, commandList] of commands) {
            output += `\n\n===[ ${category} ]===`;

            for (const command of commandList) {
                output += `\n- \`${command.name}\`: ${command.description}`;
            }
        }

        send(output, {split: true});
    },
    any: new RestCommand({
        async run({send, args}) {
            const blob = await getCommandInfo(args);
            if (typeof blob === "string") return send(blob);
            const [result, category] = blob;
            const command = result.command;
            const header = result.args.length > 0 ? `${result.header} ${result.args.join(" ")}` : result.header;
            let append = "";

            if (command.usage === "") {
                const list: string[] = [];

                for (const [tag, subcommand] of result.keyedSubcommandInfo.entries()) {
                    const customUsage = subcommand.usage ? ` ${subcommand.usage}` : "";
                    list.push(`- \`${header} ${tag}${customUsage}\` - ${subcommand.description}`);
                }

                for (const [type, subcommand] of result.subcommandInfo.entries()) {
                    const customUsage = subcommand.usage ? ` ${subcommand.usage}` : "";
                    list.push(`- \`${header} ${type}${customUsage}\` - ${subcommand.description}`);
                }

                append = "Usages:" + (list.length > 0 ? `\n${list.join("\n")}` : " None.");
            } else append = `Usage: \`${header} ${command.usage}\``;

            let aliases = "N/A";

            if (command instanceof NamedCommand) {
                const formattedAliases: string[] = [];
                for (const alias of command.aliases) formattedAliases.push(`\`${alias}\``);
                // Short circuit an empty string, in this case, if there are no aliases.
                aliases = formattedAliases.join(", ") || "None";
            }

            return send(
                `Command: \`${header}\`\nAliases: ${aliases}\nCategory: \`${category}\`\nPermission Required: \`${getPermissionName(
                    result.permission
                )}\` (${result.permission})\nDescription: ${command.description}\n${append}`,
                {split: true}
            );
        }
    })
});
