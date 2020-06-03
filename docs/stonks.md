# The Stock Market
At its core, the stock market, at least for this bot, is a series of ups and downs. Obviously, it quickly becomes complicated as you zoom into the details, but still, the stock market is an oscillating series of values, that's all it is. So as you can probably already guess, these market values should roughly model a sine wave.

# The Goals
- Each declared variable for a market should be a variable that makes sense being there, meaning that it's something you can figure out by knowing what the market is and the context of it. Any other variable should just be part of some calculations or should not appear in the initialization if it'll be stored.
- Any other variables should just add to the detail of the core sine wave rather than modifying its entire trajectory.

# Brainstorming
- If I want to slow down or speed up the progress of the curve, change how much is added to the `cycle` variable.
- I will first multiply the sine wave by pi horizontally so each cycle matches a nice -1 to 1 range, and I think it's easier to work with that than pi. A negative cycle means that you're in a downward trend, while a positive cycle means that you're in an upward trend.
- Actually, it'll be just initial variables that have a pre-assigned value, then it goes from there.
- One of the biggest things is that starting values are NOT static. Markets change over time, and even though a market is going to start one particular way, it can and will change eventually according to the players' decisions.
- Let's start out with the sine wave. At any given point, the market value could be a certain amount above or below that, depending on how volatile the market is, but the trend will ultimately follow the values of the sine wave.

# Variables
- `value`: The market value. It cannot go below 0, as 0 means bankrupt. It'll continue being 0 until the trend brings it back up again.
- `invested`: The amount of stocks invested into a market. The more stocks are invested, the more influence that market has, which leads to bigger impacts in either direction.
- `trend`: The progress of the sine wave. It isn't the value itself, but rather, the x value that's plugged into the sine function. -1 to 1. Has a volatility% chance to be doubled.
- `rate`: The amount of credits per iteration. This is affected by the trend. This will be multiplied by the value of the trend, ranging from 0 to 2. Its buffer zone is inverse to its volatility.
- `volatility`: How stable the market is. This means that on any given iteration, the trend could shift forward by its amplitude, basically a big risk factor. It continuously changes by a random amount in either direction, very minute changes though, but also, bigger markets tend to have higher volatilities. 0 to 1.
- `amplitude`: Basically how big each change is. Markets with more investors and/or more market value tend to have bigger impacts when something happens to them.