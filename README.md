## Concept
Playing with the Light is a roguelike game where you use your phone as a flashlight and is the main surviving tool to explore and venture further into the depths of a demonic basement.

This concept is an original concept based on the roguelike genre and other horror games like "Don't Scream". 

![concept__image1](images/server__concept.png)

Find keys and collect items that will help you find your way further down whilst avoiding monsters by shining them scared of your flashlight. If you wait too long the monsters WILL kill you. Your flashlight has a battery which goes down when you use it. If it's empty, there's no telling what will happen.

![concept__image1](images/server__concept-2.png)
![concept__image1](images/server__concept-3.png)

Be aware that your movements make noise, so don't move around too quickly as the monsters will hear you better. This is indicated in the bottom-right corner by the Shake O' Meter that makes your phone vibrate if you move too fast.

![concept__image1](images/mobile__concept.png)

The mobile screen is a simple overlay of buttons that interacts on the main screen, you can collect items if your flashlight is shining towards an item. You can hold one item at a time so be mindful when to use them. You must and will turn off your flashlight to preserve battery.
There is also a reset gyro button if you feel your hand has to do inhumane movements in order to shine the light in the correct spot.

## Planning
### Week 1

- Look for a concept
- Set up a server with express
- Connect phone via websockets
- Set up a connection between sender and receiver via QR-code
- Implement basic gyro movement

### Week 2

- Implement phone buttons and interactions, sending basic data to the server
- Check for a way to update the battery indicator via spritesheet
- Make a calculation function for the "Shake O' Meter"
- Find a way of implementing a hitbox in the flashlight so that items can only be picked up by the user if the targeted item is within that hitbox

### Week 3
/


## Development Diary

### Week 1

```bash
npm init -y
npm install express
npm install socket.io
```

Installed dependencies for setting up the server and 

