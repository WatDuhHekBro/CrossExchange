let lib = {
	// Random Number, min included, max excluded
	rand(min, max)
	{
		return (Math.random() * (max - min)) + min;
	},
	// Random Integer Inclusive
	randInt(min, max)
	{
		return Math.floor((Math.random() * (max - min + 1)) + min);
	},
	randSign(num = 1)
	{
		return num * (Math.random() < 0.5 ? -1 : 1);
	},
	randDeviation(base, deviation)
	{
		return this.rand(base - deviation, base + deviation);
	}
};

let markets = {
	"shadoon":
	{
		"name": "The Planet of Shadoon",
		"value": 0,
		"invested": 0,
		"trend": 0,
		"variance": 0,
		"volatility": 0,
		"amplitude": 0,
		"deviation": 0
	},
	"tora":
	{
		"name": "The Continent of Tora",
		"value": 0,
		"invested": 0,
		"trend": 0,
		"variance": 0,
		"volatility": 0,
		"amplitude": 0,
		"deviation": 0
	},
	"gaia":
	{
		"name": "Gaia's Garden",
		"parent": "shadoon",
		"value": 0,
		"invested": 0,
		"trend": 0,
		"variance": 0,
		"volatility": 0,
		"amplitude": 0,
		"deviation": 0
	},
	"basin":
	{
		"name": "Basin Keep",
		"parent": "gaia",
		"value": 1000,
		"invested": 0,
		"trend": 25,
		"variance": 5,
		"volatility": 0.15,
		"amplitude": 10,
		"deviation": 5
	},
	"helnovien":
	{
		"name": "The Helnovien Mine",
		"parent": "tora",
		"value": 1000,
		"invested": 0,
		"trend": 35,
		"variance": 10,
		"volatility": 0.4,
		"amplitude": 15,
		"deviation": 10
	}
};

let totalValue = 0;
let totalInvested = 0;

for(let market in markets)
{
	totalValue += markets[market].value;
	totalInvested += markets[market].invested;
}

// before loop

let selected = {
	"value": 1000,
	"invested": 0,
	"trend": 35,
	"variance": 10,
	"volatility": 0.4,
	"amplitude": 0.8,
	"deviation": 0.3
};

let factor = (Math.random() < selected.volatility) ? 5 : 1; // Math.random() < number between 0 and 1 = Has number% chance to be true.
let gain = lib.randDeviation(selected.trend, selected.variance * factor); // If it's a volatile gain, go up to 5x out of bounds.
let amplitudeMultiplier = 1 + Math.max(lib.randDeviation(selected.amplitude, selected.deviation), -1 + Math.random()); // Must be at minimum -1 and then some (multiplier > 0), 
selected.value += gain * amplitudeMultiplier;

let sign = (Math.random() < selected.volatility) ? lib.randSign() : 1;
let variationPotential = lib.randDeviation(selected.variance, selected.variance * selected.volatility); // I multiplied the variance by the volatility here to create a greater deviation potential.
let trendMultiplier = Math.log10(variationPotential + 10); // The +10 here is to make only negatives multiply by a decimal. Also, I used base 10 rather than base e here in order to reduce how big the multiplier is. The problem with 1/x is that it caps out and is inverse as well, and I think that higher trends should count for more rather than the other way around.
let trendBuffer = 0.25 * (trendMultiplier - 1); // To stabilize the multiplier further, there'll be a buffer to make the changes more minute. Reduce the range by 25% on each end.
selected.trend *= trendMultiplier - lib.rand(trendBuffer, trendMultiplier - 1 - trendBuffer); // However, even log base 10 generates multipliers too high. A small trend could easily spiral out into infinity. So I want to control that.

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