import {User, GuildMember, Permissions} from "discord.js";
//import {Config} from "../core/structures";

interface PermissionLevel
{
	name: string;
	check: (user: User, member: GuildMember|null) => boolean;
}

const PermissionLevels: PermissionLevel[] = [
	{
		// NONE //
		name: "User",
		check: () => true
	},
	{
		// MOD //
		name: "Moderator",
		check: (user, member) => !!member && (
			member.hasPermission(Permissions.FLAGS.MANAGE_ROLES) ||
			member.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES) ||
			member.hasPermission(Permissions.FLAGS.KICK_MEMBERS) ||
			member.hasPermission(Permissions.FLAGS.BAN_MEMBERS)
		)
	},
	{
		// ADMIN //
		name: "Administrator",
		check: (user, member) => !!member && member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)
	},
	{
		// OWNER //
		name: "Server Owner",
		check: (user, member) => !!member && (member.guild.ownerID === user.id)
	},
	{
		// BOT_SUPPORT //
		name: "Bot Support",
		check: user => false //Config.support.includes(user.id)
	},
	{
		// BOT_ADMIN //
		name: "Bot Admin",
		check: user => false //Config.admins.includes(user.id)
	},
	{
		// BOT_OWNER //
		name: "Bot Owner",
		check: user => false //Config.owner === user.id
	}
];

// After checking the lengths of these three objects, use this as the length for consistency.
const length = PermissionLevels.length;

export function hasPermission(member: GuildMember, permission: number): boolean
{
	// If the requested permission is higher than any defined permission, no one will have that permission.
	if(permission > length)
		return false;
	// If the requested permission is lower than any defined permission, everyone can use it.
	// The one gotcha is that -1 is reserved for permission inheritance when instantiating a new Command instance.
	// So you'll want to reserve 0 for the lowest permission level which will function as expected.
	else if(permission < 0)
		return true;
	
	for(let i = length-1; i >= permission; i--)
		if(PermissionLevels[i].check(member.user, member))
			return true;
	return false;
}

export function getPermissionLevel(member: GuildMember): number
{
	for(let i = length-1; i >= 0; i--)
		if(PermissionLevels[i].check(member.user, member))
			return i;
	return 0;
}

export function getPermissionName(level: number)
{
	if(level > length || length < 0)
		return "N/A";
	else
		return PermissionLevels[level].name;
}