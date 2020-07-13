export default class Event
{
	public readonly once: boolean;
	public readonly run: Function;
	
	constructor(run: Function, once = false)
	{
		this.run = run;
		this.once = once;
	}
}