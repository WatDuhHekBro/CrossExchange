const lib = require('./lib.js');

// Separate the calculations/logging and the display. Separate all of these functions from being trapped in one particular command.
module.exports = {
	// Takes a list of markets and calculates the new values for all markets' variables.
	calculate(markets)
	{
		// Maybe change the trend to actually fit the trend, have it be a random deviation separate from influencing itself. -1 to 1. Then have the "rate" be the rate of change, which is what the current trend variable is.
		let totalValue = 0;
		let totalInvested = 0;
		
		for(let market in markets)
		{
			totalValue += markets[market].value;
			totalInvested += markets[market].invested;
		}
		
		for(let market in markets)
		{
			let selected = markets[market];
			
			// Calculate New Parameters //
			// Note: I'm probably going to revise these equations later on. From what it looks like, high volatility doesn't make the trend go down. But that's a task for another day.
			// Actually, let's introduce another variable into the mix. No wait, let's make volatility affect bigger markets. Bigger markets with bigger volatility will have a higher chance of the sign being decreasing.
			let factor = (Math.random() < selected.volatility) ? 5 : 1; // Math.random() < number between 0 and 1 = Has number% chance to be true.
			let gain = lib.randDeviation(selected.trend, selected.variance * factor); // If it's a volatile gain, go up to 5x out of bounds.
			let amplitudeMultiplier = 1 + Math.max(lib.randDeviation(selected.amplitude, selected.deviation), -1 + Math.random()); // Must be at minimum -1 and then some (multiplier > 0), 
			selected.value += gain * amplitudeMultiplier;
			
			// Now just left on its own, the trend will continue spiraling in the direction it's headed. However, it'll be the events that shake up these trends.
			let sign = ((Math.random() < selected.volatility) && (selected.trend > 100)) ? lib.randSign() : 1; // Apply the potential sign only if the trend passes a certain threshold, affecting big markets.
			let variationPotential = lib.randDeviation(selected.variance, selected.variance * selected.volatility); // I multiplied the variance by the volatility here to create a greater deviation potential.
			let trendMultiplier = sign * Math.log10(variationPotential + 10); // The +10 here is to make only negatives multiply by a decimal. Also, I used base 10 rather than base e here in order to reduce how big the multiplier is. The problem with 1/x is that it caps out and is inverse as well, and I think that higher trends should count for more rather than the other way around.
			let trendBuffer = 0.25 * (trendMultiplier - 1); // To stabilize the multiplier further, there'll be a buffer to make the changes more minute. Reduce the range by 25% on each end.
			selected.trend *= trendMultiplier - lib.rand(trendBuffer, trendMultiplier - 1 - trendBuffer); // However, even log base 10 generates multipliers too high. A small trend could easily spiral out into infinity. So I want to control that.
			//console.log(market, selected.trend);
			
			// The amplitude will be based on both the percentage of market influence the selected market has compared to all markets everywhere and a random number. Since both will be decimals anyway, they can't go past 1, which would break the numbers by a lot. My reasoning for this is that the amplitude should show the power/influence of the market compared to every other market. And the other part will just be random since markets' influence vary anyways (and plus, you need to have some number for a multiplier).
			let influence = totalInvested !== 0 ? (selected.invested / totalInvested) : 0;
			selected.amplitude = (0.7 * influence) + (0.3 * Math.max(Math.random(), 0.01));
			
			// The variance is based on how economically active the market is (aka its market value). The reasoning for this is that bigger markets tend to have more at stake. The market varies without following the trend, as the trend moves on its own. There's also the volatility which is added/subtracted to the variance incrementally. There's also just a draw of the luck factor as well. All factors influence the variance. I'd say 50%, 25%, and 25%.
			let power = totalValue !== 0 ? (selected.value / totalValue) : 0;
			selected.variance = (0.5 * lib.randDeviation(selected.variance, power)) + (0.25 * lib.randDeviation(selected.variance, selected.volatility)) + (0.25 * (1 + lib.rand(-1, 1)));
			
			// The deviation is based solely on the volatility of the market, and can range from 0 up to the volatility (basically the risk factor during that iteration for the amplitude).
			selected.deviation = lib.rand(0, selected.volatility);
			
			// The volatility has very incremental changes, but overall, doesn't change too much and is based on its own market alone.
			selected.volatility = lib.randDeviation(selected.volatility, selected.volatility * Math.random() * Math.random() * Math.random()); // Not the same as Math.pow(Math.random(), 3);
			
			// Also, catalog just the market value. That's all users will see anyway. Invested is a property users can see but it won't be logged, and in that regard, is just another factor.
			// "catalog" will act like a stack where the top-most value is at the front and the back-most values are at the back. Include the market value and a string of the date. YYYY-MM-DD HH:MM:SS
			let date = new Date();
			selected.catalog.unshift({
				value: Math.round(selected.value),
				date:
				{
					year: date.getUTCFullYear(),
					month: date.getUTCMonth()+1,
					day: date.getUTCDate(),
					hour: date.getUTCHours(),
					minute: date.getUTCMinutes(),
					second: date.getUTCSeconds()
				}
			});
		}
	},
	// Creates an embed to display a market based on its values and previous values.
	display(market)
	{
		let embed = {
			title: market.name,
			description: market.description,
			color: "#008000",
			fields: []
		};
		
		for(let i = 0, cap = Math.min(10, market.catalog.length); i < cap; i++)
		{
			let log = market.catalog[i];
			let d = log.date;
			let pad = num => num.toString().padStart(2, '0');
			let previous = market.catalog[i+1];
			let change = '';
			
			if(previous)
			{
				let diff = log.value - previous.value;
				let sign = diff >= 0 ? '+' : '';
				change = ', ' + sign + lib.pluralise(diff, 'credit', 's');
			}
			
			embed.fields.push({
				name: `${d.year}-${pad(d.month)}-${pad(d.day)} ${pad(d.hour)}:${pad(d.minute)}:${pad(d.second)}`,
				value: lib.pluralise(log.value, 'credit', 's') + change
			});
		}
		
		return embed;
	}
};