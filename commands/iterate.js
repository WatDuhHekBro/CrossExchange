module.exports = {
	run(message, args, lib, extra)
	{
		let stonks = lib.readJSON('stonks');
		let markets = stonks.markets;
		let embed = new extra.Discord.MessageEmbed()
		.setTitle("Markets")
		.setDescription("The current iteration of markets' values and data (for testing purposes only).")
		.setColor("#00ad2e");
		
		for(let market in markets)
		{
			let selected = markets[market];
			
			console.log(selected);
			// Calculate New Parameters //
			selected.value *= (selected.trend
					+ lib.randSign(lib.rand(
						selected.trend - selected.variance,
						selected.trend + selected.variance
					))
				) * selected.volatility * (1 + Math.max(selected.amplitude + lib.randSign(lib.rand(
						selected.amplitude - selected.deviation,
						selected.amplitude + selected.deviation
					)), -1 + Math.random())
				);
			console.log('value', selected.value);
			selected.trend *= (1 +
					(1 / (selected.variance + 1))
					* ((Math.random() < selected.volatility) ? lib.randSign() : 1)
				) * (selected.amplitude + lib.randSign(lib.rand(
					selected.amplitude - selected.deviation,
					selected.amplitude + selected.deviation
				)));
			console.log('trend', selected.trend);
			selected.amplitude = (0.6 * selected.invested) + (0.4 * 1); // 1 <-- avg of all market values
			console.log('amplitude', selected.amplitude);
			selected.variance *= (selected.invested / (selected.invested + lib.rand(0, selected.volatility))) * (1 + lib.rand(-1, 1));
			console.log('variance', selected.variance);
			selected.deviation *= selected.volatility * (1 + lib.rand(-1, 1));
			console.log('deviation', selected.deviation);
			selected.volatility = Math.random(); // avg of all volatilities in the area
			console.log('volatility', selected.volatility, '\n');
			
			// Display Market Value //
			embed.addFields({
				name: "Market",
				value: selected.name || "",
				inline: true
			},{
				name: "Parent Market",
				value: (selected.parent && markets[selected.parent].name) || "None",
				inline: true
			},{
				name: "Market Value",
				value: Math.round(selected.value),
				inline: true
			});
		}
		
		message.channel.send(embed);
		
		//lib.writeJSON('stonks', stonks);
	}
};