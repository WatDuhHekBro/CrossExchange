# Stonks
<todo>
...

Risk of buying very low: If a market becomes bankrupt (anytime it hits 0), all stocks are forfeited until the market is out of bankruptcy. It was high reward until I made it high risk by adding this.

# Events
<todo>
Besides volatility, there isn't a whole lot of variation that makes the game interesting. That's because the main source of randomness comes from random events which affect specific markets per event.
%delta%%%

# Scheduler
The scheduler is what determines when each event should happen. Instead of just doing `setInterval`, I wanted to make a custom scheduler that would bring more variety while still making updates roughly consistent. It's much easier to talk about examples rather than implementation logic here.
- Let's say you want an event to occur during every 15 minute time frame, but not exactly after every 15 minutes. So instead of 12:00, 12:15, 12:30, 12:45, you get [12:00 to 12:14], [12:15 to 12:29], etc. It won't lose the consistency of having it happen every 15 minutes, but it's also more varied. During the first time frame, the event could happen at 12:03, 12:05, 12:08, 12:13, and so on.
- I decided to only have the scheduler be active when the bot is online. This is because although you wouldn't be able to be there for every iteration or event, the possibility is still there to act on for those who are active. However, when the bot is offline, there is nothing anyone can do about it, so it'd actually be unfair for stuff to happen while the bot is offline. Conveniently, that also makes the scheduler much easier to make.
- The scheduler for market iterations will be activated every 5 minute time frame.
- The scheduler for events will be activated every 1 hour time frame.
- I will store timestamps for when the next event will occur. This is to prevent the same event from occurring more than once. For example, if the scheduled time was 12:07 and the current time is 12:09, I don't want the scheduler to set the scheduled timestamp randomly if it were to restart or go offline, like setting it at 12:10, meaning the event for this time frame would occur twice.
- When loading an existing timestamp, it goes something like this. The stored timestamp is 12:07, right now is 12:09, and the current time frame ranges from 12:00 to 12:15. Since 12:07 is in the current time frame, it'll get activated. When? Well, it's already past that timestamp, so it gets activated immediately. Then the next timestamp is set to the next time frame, 12:19 for example.
- And a final note, stored timestamps that are before the current time will update stuff using the current time because it makes more sense for tracking when something happened.