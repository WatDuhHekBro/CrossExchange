# The Scheduler
I have several specific goals in mind for the scheduler to be used with this project and is the reason why I'm making my own custom one. The scheduler should...
- ...be able to specify a time interval to place certain events in. It's simple enough, until you decide that you want the times during that interval to be random (which is why `node-cron` doesn't cut it).
- ...catch up and calculate those time intervals for however long the system has been offline (persistence which `node-scheduler` doesn't seem to have).
- ...act both as a real-time scheduler when online and calculate pseudo time when offline. When starting after being offline, it should catch up to where it would've been if it had been online the whole time.

# The Design
The core of this entire system will be the `setTimeout` function. Obviously, this only works when the system is online, so there are a few things I have in mind.
- There'll be two schedulers, one for every update of the market values, and the second one for every event that affects the market.
- For the first scheduler, I want to have each section be 15 minutes. For the second, I want each section to be 1 day.
- For each of those sections, there'll be a random offset. Using the first scheduler as an example, the amount of seconds added to that could range from 0 to 899 (excluding 900 sec or 15 min). The event could occur right when it hits that 15 minute mark or right before the next one.
- When you reach a new section, for example `12:15`, the year, month, day, and hour is logged as is, then there's an interval rather than the minute, which is 1 in this case. Then an offset in seconds from 0 to 899. That offset is logged in wherever it's saved because if the system goes offline, the time won't suddenly change which prevents the event from being triggered 0 or many times. For the second scheduler, it's just year, month, and day, then the offset.

# Some Brainstorming
- The amount of days will be calculated something like `(new Date(2020, 4, 20) - new Date(2020, 4, 15)) / 86400000`. Something similar will follow for the 15 minute intervals.
- If `setTimeout` is given a negative delay, it'll fire immediately, which'll be the case if the current time is after the scheduled time. Something like `new Date(scheduled time) - Date.now()`, which'll provide a positive delay until our current time is greater (aka we passed it).
- There'll actually be multiple `setTimeout`s for one scheduler. Going by the first one for example, there's a scheduler for every 15 minutes to update the recorded time and offset. Then there's a second `setTimeout` which is to set off the event at the offset.
- I'll be working in terms of seconds, I'm not concerned about losing milliseconds. Cutting that off will also save some space for data files which catalog timestamps.
- When initializing data storage, calculate the current section then the offset and check to see if you've already matched that offset.
- When starting the script after being offline, the script should do the following:
	1. Check if any/how many intervals passed since the time and offset.
	2. Count the number of intervals if the difference between the scheduled time and the current time is different.
	3. Set the new time and offset at the current interval (then count another interval if the offset has passed).
- These conditions will be used in `setTimeout` since negative values are immediate. Actually, it'll be if statements until you need `setTimeout`.