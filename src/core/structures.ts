import Storage from "./storage";
import {isType} from "./lib";

/*
Got an idea: The templates should resolve to actual objects, because picture this.

Storage.read(*) (in templates)
(As it resolves into that object, which is still ultimately JSON btw, it'll add and remove excessive properties of each object and array.)

import {Data} from Storage
user = Data.addUser(options?) --> User
user.credits += 500;
Data.save()

Because the data will be consistent, you can put it into classes.
Also, unused keys will automatically not be parsed.
*/

interface GenericJSON
{
	[key: string]: any;
}

class ConfigStructure
{
	public token: string;
	public prefix: string;
	public admins: string[];
	
	constructor(data: GenericJSON)
	{
		this.token = select(data.token, "<ENTER YOUR TOKEN HERE>", String);
		this.prefix = select(data.prefix, "$", String);
		this.admins = select(data.admins, [], String, true);
	}
	
	public save()
	{
		Storage.write("config", this);
	}
}

/**
 * Checks a value to see if it matches the fallback's type, otherwise returns the fallback.
 * For the purposes of the templates system, this function will only check array types, objects should be checked under their own type (as you'd do anyway with something like a User object).
 * If at any point the value doesn't match the data structure provided, the fallback is returned.
 * Warning: Type checking is based on the fallback's type. Be sure that the "type" parameter is accurate to this!
 */
function select<T>(value: any, fallback: T, type: Function, isArray = false): T
{
	if(isArray && isType(value, Array))
	{
		for(let item of value)
			if(!isType(item, type))
				return fallback;
		return value;
	}
	else
	{
		if(isType(value, type))
			return value;
		else
			return fallback;
	}
}

// Exports instances. Don't worry, importing it from different files will load the same instance.
export const Config = new ConfigStructure(Storage.read("config"));