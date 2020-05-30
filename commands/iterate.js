module.exports = {
	run($)
	{
		let stonks = $.lib.loadJSON('stonks');
		let markets = stonks.markets;
		$.stonks.calculate(markets);
		
		for(let tag in markets)
		{
			let market = markets[tag];
			$.guild.channels.cache.get(stonks.channel).messages.fetch(market.message).then(message => message.edit({
				embed: $.stonks.display(market)
			})).catch(console.error);
		}
	}
};