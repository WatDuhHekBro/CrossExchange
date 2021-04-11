import {GuildMember, Permissions} from "discord.js";
import {Config} from "./structures";
import $ from "./lib";

export enum PERMISSIONS {
    NONE,
    MOD,
    ADMIN,
    OWNER,
    BOT_MECHANIC,
    BOT_OWNER
}
export const PermissionNames = ["User", "Moderator", "Administrator", "Server Owner", "Bot Mechanic", "Bot Owner"];

// Here is where you enter in the functions that check for permissions.
const PermissionChecker: ((member: GuildMember) => boolean)[] = [
    // NONE //
    () => true,

    // MOD //
    (member) =>
        member.hasPermission(Permissions.FLAGS.MANAGE_ROLES) ||
        member.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES) ||
        member.hasPermission(Permissions.FLAGS.KICK_MEMBERS) ||
        member.hasPermission(Permissions.FLAGS.BAN_MEMBERS),

    // ADMIN //
    (member) => member.hasPermission(Permissions.FLAGS.ADMINISTRATOR),

    // OWNER //
    (member) => member.guild.ownerID === member.id,

    // BOT_MECHANIC //
    (member) => Config.mechanics.includes(member.id),

    // BOT_OWNER //
    (member) => Config.owner === member.id
];

// After checking the lengths of these three objects, use this as the length for consistency.
const length = Object.keys(PERMISSIONS).length / 2;

export function hasPermission(member: GuildMember, permission: PERMISSIONS): boolean {
    for (let i = length - 1; i >= permission; i--) if (PermissionChecker[i](member)) return true;
    return false;
}

export function getPermissionLevel(member: GuildMember): number {
    for (let i = length - 1; i >= 0; i--) if (PermissionChecker[i](member)) return i;
    return 0;
}

// Length Checking
(() => {
    const lenNames = PermissionNames.length;
    const lenChecker = PermissionChecker.length;

    // By transitive property, lenNames and lenChecker have to be equal to each other as well.
    if (length !== lenNames || length !== lenChecker)
        $.error(
            `Permission object lengths aren't equal! Enum Length (${length}), Names Length (${lenNames}), and Functions Length (${lenChecker}). This WILL cause problems!`
        );
})();
