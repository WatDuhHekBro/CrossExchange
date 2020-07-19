# Scheduler
The scheduler is what makes up the core of when the program should do stuff.

I decided to only have the scheduler be active when the bot is online. This is because although you wouldn't be able to be there for every iteration or event, the possibility is still there to act on for those who are active. However, when the bot is offline, there is nothing anyone can do about it, so it'd actually be unfair for stuff to happen while the bot is offline. Conveniently, that also makes the scheduler much easier to make.

# Stonks
...

Risk of buying very low: If a market becomes bankrupt (anytime it hits 0), all stocks are forfeited until the market is out of bankruptcy. It was high reward until I made it high risk by adding this.

# Events
Besides volatility, there isn't a whole lot of variation that makes the game interesting. That's because the main source of randomness comes from random events which affect specific markets per event.
%delta%%%