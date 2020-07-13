export default class Command
{
	constructor(args: object)
	{
		
	}
}

export function selectCommand(args: string[]): Command
{
	return new Command({});
}