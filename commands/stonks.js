module.exports = {
	description: "Buy, sell, and get info on stonks.",
	usage: "<buy/sell/info> <market/location> <amount/\"yes\">",
	run(message, args, lib)
	{
		let stonks = lib.readJSON('stonks', {
			markets: {},
			locations: {}
		});
		
		if(args[0] === 'buy')
		{
			
		}
	}
};