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

# Variables

## Manually-Assigned
- ``: 
- ``: 
- ``: 
- ``: 
## Auto-Generated
- `value`: The market value.
- `trend`: 
- `rate`: 
- `invested`: 
- ``: 
- ``: 
- ``: 