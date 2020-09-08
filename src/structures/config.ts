import {GenericJSON, GenericStructure} from "./util";
import {select} from "../framework";

export class ConfigStructure extends GenericStructure
{
	public token: string;
	public prefix: string;
	public owner: string;
	public admins: string[];
	public support: string[];
	
	constructor(data: GenericJSON)
	{
		super("config");
		this.token = select(data.token, "<ENTER YOUR TOKEN HERE>", String);
		this.prefix = select(data.prefix, "$", String);
		this.owner = select(data.owner, "", String);
		this.admins = select(data.admins, [], String, true);
		this.support = select(data.support, [], String, true);
	}
}