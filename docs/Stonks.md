# Stonks
At its core, the stock market, at least for this bot, is a series of ups and downs that generally follow a wave. With that in mind, it's much easier to explain the reasoning behind the equation if you picture a sine wave.
- The `cycle` (a number between -1 to 1) keeps track of where on that sine wave the current point is.
- The `trend` represents the actual point on that sine wave (`sin(cycle)`). As the `cycle` progresses, the `trend` will oscillate.
- Now from that point, you can go a bit up or a bit down which is how you get variation. After all, market values aren't perfectly linear, as individual changes can often vary quite rapidly. This ends up being the amount the market gains during that iteration. Bigger markets have higher changes, so it's reflected by moving from that point based on the current value.
- Once you moved your point vertically, it's time to multiply that to make significant changes (because the range of `sin(x)` is `[-1, 1]`). The amplitude is based on how big the market is, its amount invested and current value.
- Then, `volatility`, a percentage of how stable the market is, can make changes spiral out of that sine wave.
- All in all, it's really just picking a point on a sine wave and then making changes to it to add more variation.
- `volatility` is the one property that cannot be changed. It's intrinsic to that market and part of what makes it unique.

# Events
- Besides volatility, there isn't a whole lot of variation that makes the game interesting. That's because the main source of randomness comes from random events which affect specific markets per event.
- My goal is to make an `event` variable as well that influences the market, because events will be what brings even more variation to the market. It'll be a multiplier with a default value of 1. Values shouldn't be edited directly because that wouldn't affect the trend.

# Scheduler
The scheduler is what determines when each event should happen. Instead of just doing `setInterval`, I wanted to make a custom scheduler that would bring more variety while still making updates roughly consistent. It's much easier to talk about examples rather than implementation logic here.
- The scheduler for market iterations will be activated every 5 minute time frame. This allows for 288 iterations per day, good because I don't want the market to become stale.
- The scheduler for events will be activated every 1 day time frame. It's not such a bright idea to have an event every hour actually, because not everyone would be able to see it plus that's a lot of events you'd have to do.
- Let's say you want an event to occur during every 15 minute time frame, but not exactly after every 15 minutes. So instead of 12:00, 12:15, 12:30, 12:45, you get [12:00 to 12:14], [12:15 to 12:29], etc. It won't lose the consistency of having it happen every 15 minutes, but it's also more varied. During the first time frame, the event could happen at 12:03, 12:05, 12:08, 12:13, and so on.
- I decided to only have the scheduler be active when the bot is online. This is because although you wouldn't be able to be there for every iteration or event, the possibility is still there to act on for those who are active. However, when the bot is offline, there is nothing anyone can do about it, so it'd actually be unfair for stuff to happen while the bot is offline. Conveniently, that also makes the scheduler much easier to make.
- Whenever you start the bot, it'll set the scheduled timestamp in the next time frame. This is because of a lot of asynchronous empty cache headaches that I'd much rather prefer to avoid entirely. That also works well because it wouldn't make sense for an event to fire off which was supposed to happen a minute ago for example.