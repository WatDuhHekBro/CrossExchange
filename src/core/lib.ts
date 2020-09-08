import FileManager from "./storage";

export interface GenericJSON
{
	[key: string]: any;
}

export abstract class GenericStructure
{
	private __meta__ = "generic";
	
	constructor(tag?: string)
	{
		this.__meta__ = tag || this.__meta__;
	}
	
	public save(asynchronous = true)
	{
		const tag = this.__meta__;
		delete this.__meta__;
		FileManager.write(tag, this, asynchronous);
		this.__meta__ = tag;
	}
}