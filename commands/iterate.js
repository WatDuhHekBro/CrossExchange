module.exports = {
	run($)
	{
		setInterval(() => {
			let stonks = $.lib.loadJSON('stonks', true);
			let markets = stonks.markets;
			$.stonks.calculate(markets);
			
			for(let tag in markets)
			{
				let market = markets[tag];
				$.guild.channels.cache.get(stonks.channel).messages.fetch(market.message).then(message => message.edit({
					embed: $.stonks.display(market)
				})).catch(console.error);
			}
			
			// You then have to write it manually because you're not accessing it from the command anymore.
			$.lib.writeJSON('stonks', stonks);
		}, 5000);
		$.channel.send("Every 5 seconds, the market will update.");
	}
};