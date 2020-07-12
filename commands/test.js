class Command
{
	constructor(options)
	{
		
	}
}

const main = new Command({
	aliases: ["hi"]
});
main.action = "Please use arguments, %author%.";

const sub = new Command({
	action($)
	{
		$.channel.send($.args.toString());
	}
});

main.attach(sub, "sub");
main.number = new Command({
	action: num
});

function num($)
{
	console.log($.args);
}

module.exports = main;

$.lib.readJSON('users'); // Draw from cache if found, search if not found, and {} if doesn't exist.
$.lib.writeJSON('users'); // Manually write JSON via header.