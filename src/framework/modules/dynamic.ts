// User-Defined Behavior
import {User, GuildMember, Guild} from "discord.js";

export let PermissionLevels: PermissionLevel[] = [];
export let getPrefix: (guild: Guild|null) => string = () => ".";

export function launch(settings?: LaunchSettings)
{
	if(settings?.getPrefix)
		getPrefix = settings.getPrefix;
}

interface PermissionLevel
{
	name: string;
	check: (user: User, member: GuildMember|null) => boolean;
}

interface LaunchSettings
{
	permissions?: PermissionLevel[];
	getPrefix?: (guild: Guild|null) => string;
}