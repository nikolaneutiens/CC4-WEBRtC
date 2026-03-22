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
I'll be using simple-peer to make P2P easier to read and code since it makes multiple blocks of code obsolute.

Starting off I wanted to make the connection possible using a QR-Code. Luckily my teacher @ Devine has an exercise that demonstrates how this works:

Server.js
``` js
const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const os = require('os');
const io = new Server(server);
const port = process.env.PORT || 80;

const clients = {};
io.on('connection', socket => {
  clients[socket.id] = { id: socket.id };
  console.log('Socket connected', socket.id);

  clients[socket.id].x = 0;
  clients[socket.id].y = 0;

  socket.on('update', (targetSocketId, data) => {
    if (!clients[targetSocketId]) {
      return;
    }
    clients[socket.id].x = data.x;
    clients[socket.id].y = data.y;
    io.to(targetSocketId).emit('update', data);
  });

  socket.on('disconnect', () => {
    delete clients[socket.id];
  });

});

app.use(express.static('public'));

server.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`http://${iface.address}`);
      }
    }
  }
  console.log(`App listening on port ${port}!`);
});
```
index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Socket.io Desktop</title>
  <style>
    html {
      box-sizing: border-box;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    html, body {
      height: 100%;
      margin: 0;
    }

    .cursor {
      position: absolute;
      width: 1rem;
      height: 1rem;
      margin-left: -.5rem;
      margin-right: -.5rem;
      background: red;
      border-radius: 50% 50%;
    }
  </style>
</head>
<body>
  <a id="url" href=""></a>
  <div id="qr"></div>
  <script src="/socket.io/socket.io.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js" integrity="sha512-ZDSPMa/JM1D+7kdg2x3BsruQ6T/JpJo3jWDWkCZsP+5yVyp1KfESqLI+7RqB5k24F7p2cV7i2YHh/890y6P6Sw==" crossorigin="anonymous"></script>
  <script>
  {
    const $messages = document.getElementById('messages');
    const $url = document.getElementById('url');
    
    let socket; // will be assigned a value later
    
    const init = () => {
      socket = io.connect('/');
      socket.on('connect', () => {
        console.log(`Connected: ${socket.id}`);
        const url = `${new URL(`/controller.html?id=${socket.id}`, window.location)}`;
        $url.textContent = url;
        $url.setAttribute('href', url);

        const typeNumber = 4;
        const errorCorrectionLevel = 'L';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(url);
        qr.make();
        document.getElementById('qr').innerHTML = qr.createImgTag(4);
      });

      socket.on(`update`, data => {
        let $cursor = document.querySelector(`#cursor`);
        if(!$cursor) {
          $cursor = document.createElement(`div`);
          $cursor.classList.add(`cursor`);
          $cursor.setAttribute(`id`, `cursor`);
          document.body.appendChild($cursor);
        }
        $cursor.style.left = `${data.x * window.innerWidth}px`;
        $cursor.style.top = `${data.y * window.innerHeight}px`;
      });
    };

    init();
  }
  </script>
</body>
</html>
```

And the mobile.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Socket.io Controller</title>
  <style>
    html {
      box-sizing: border-box;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    html, body {
      height: 100%;
      margin: 0;
    }

    .cursor {
      position: absolute;
      width: 1rem;
      height: 1rem;
      margin-left: -.5rem;
      margin-right: -.5rem;
      background: red;
      border-radius: 50% 50%;
    }
  </style>
</head>
<body>
  <script src="/socket.io/socket.io.js"></script>
  <script>
  {
    const $messages = document.getElementById('messages');
    
    let socket; // will be assigned a value later
    
    const init = () => {
      targetSocketId = getUrlParameter('id');
      if (!targetSocketId) {
        alert(`Missing target ID in querystring`);
        return;
      }
      socket = io.connect('/');
      socket.on('connect', () => {
        console.log(`Connected: ${socket.id}`);
      });
      window.addEventListener(`mousemove`, e => handleMouseMove(e));
      window.addEventListener(`touchmove`, e => handleTouchMove(e));
    };

    const getUrlParameter = name => {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(location.search);
      return results === null ? false : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    const handleMouseMove = e => {
      if (socket.connected) {
        socket.emit(`update`, targetSocketId, {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        });
      }
    };

    const handleTouchMove = e => {
      if (socket.connected) {
        socket.emit(`update`, targetSocketId, {
          x: e.touches[0].clientX / window.innerWidth,
          y: e.touches[0].clientY / window.innerHeight
        });
      }
    };

    init();
  }
  </script>
</body>
</html>
```

Now the challenge is to establish a peer 2 peer connection, this code makes the connection work via the server but when the server is down the connection gets lost. This is because I'm still working with socket.io data transfer and not peer data transfer.

---
!! I use ChatGPT to simply make the connection work via EasyPeer instead of socket data transfer to make it work without the server: 

[(Given the code of my index.html and mobile.html) I establish a connection via an express server and using data transfer using socket.io, but i want to only use websockets to initialise the connection via websockets so that when the server goes down the connection still stands. Use EasyPeer to get peer 2 peer data transfer]


```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebRTC</title>
  <style>
    video {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <h1>Sender</h1>
  <video id="myCamera" playsinline autoplay muted></video>
  <label for="peerSelect">Peer: </label><select id="peerSelect"></select>

  <script src="/socket.io/socket.io.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/simple-peer/9.11.1/simplepeer.min.js" integrity="sha512-0f7Ahsuvr+/P2btTY4mZIw9Vl23lS6LY/Y7amdkmUg2dqsUF+cTe4QjWvj/NIBHJoGksOiqndKQuI9yzn2hB0g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script type="module">

    const $myCamera = document.getElementById('myCamera');
    const $peerSelect = document.getElementById('peerSelect');

    let socket;
    let myStream;
    let peer;

    const servers = {
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
      }]
    };

    const init = async () => {
      initSocket();
      $peerSelect.addEventListener('input', callSelectedPeer);
      const constraints = { audio: true, video: { width: 1280, height: 720 } };
      myStream = await navigator.mediaDevices.getUserMedia(constraints);
      $myCamera.srcObject = myStream;
      $myCamera.onloadedmetadata = () => $myCamera.play();
    };

    const initSocket = () => {
      socket = io.connect('/');
      socket.on('connect', () => {
        console.log(socket.id);
      });
      socket.on('clients', updatePeerList);

      socket.on('signal', async (myId, signal, peerId) => {
        console.log(`Received signal from ${peerId}`);
        console.log(signal);
        peer.signal(signal);
      });
    };

    const updatePeerList = (clients) => {
      $peerSelect.innerHTML = '<option value="none">--- Select Peer To Call ---</option>';
      for (const clientId in clients) {
        const isMyOwnId = (clientId === socket.id);
        if (clients.hasOwnProperty(clientId) && !isMyOwnId) {
          const client = clients[clientId];
          const $option = document.createElement('option');
          $option.value = clientId;
          $option.textContent = clientId;
          $peerSelect.appendChild($option);
        }
      }
    };

    const callSelectedPeer = async () => {
      if ($peerSelect.value === 'none') {
        // TODO: disconnect
        return;
      }
      console.log('call selected peer', $peerSelect.value);

      callPeer($peerSelect.value);
    };

    const callPeer = async (peerId) => {
      peer = new SimplePeer({ initiator: true, stream: myStream });
      peer.on('signal', data => {
        socket.emit('signal', peerId, data);
      });
    };

    init();

  </script>
</body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Laptop P2P Cursor</title>
<style>
html, body { height: 100%; margin:0; }
.cursor { position:absolute; width:1rem; height:1rem; background:red; border-radius:50%; margin:-0.5rem; }
</style>
</head>
<body>
<a id="url" href=""></a>
<div id="qr"></div>

<script src="/socket.io/socket.io.js"></script>
<script src="https://unpkg.com/easypeer/dist/easypeer.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>

<script>
const $url = document.getElementById('url');
const socket = io();
let peer;

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  // Generate QR code for phone
  const url = `${new URL(`/mobile.html?id=${socket.id}`, window.location)}`;
  $url.textContent = url;
  $url.href = url;

  const qr = qrcode(4, 'L');
  qr.addData(url);
  qr.make();
  document.getElementById('qr').innerHTML = qr.createImgTag(4);

  // Create EasyPeer initiator
  peer = new EasyPeer({ initiator:true, trickle:false });

  // Send signaling data to phone
  peer.on("signal", data => {
    if (peer.targetSocketId) socket.emit("signal", peer.targetSocketId, data);
  });

  // Receive cursor data from phone
  peer.on("data", data => {
    const msg = JSON.parse(data);
    let $cursor = document.querySelector("#cursor");
    if (!$cursor) {
      $cursor = document.createElement("div");
      $cursor.classList.add("cursor");
      $cursor.id = "cursor";
      document.body.appendChild($cursor);
    }
    $cursor.style.left = `${msg.x * window.innerWidth}px`;
    $cursor.style.top = `${msg.y * window.innerHeight}px`;
  });

  // Receive signaling messages from phone
  socket.on("signal", data => {
    if (!peer.targetSocketId) peer.targetSocketId = data.from;
    peer.signal(data);
  });
});
</script>
</body>
</html>
```

---

Starting up the server works via using the terminal command node server.js. Now I can test the code and quit the server to see the connection still stands.

Error message 

(index):53 Uncaught (in promise) ReferenceError: EasyPeer is not defined
    at Socket.<anonymous> ((index):53:7)
    at Emitter.emit (index.js:136:20)
    at Socket.onconnect (socket.js:612:14)
    at Socket.onpacket (socket.js:499:26)
    at Emitter.emit (index.js:136:20)
    at manager.js:217:18

!!! EasyPeer is not defined

In order to troubleshoot this problem GPT suggests to make a window.onload() command so that it registers the EasyPeer plugin first and then runs the code but it still won't work.

So instead of a moving cursor to test the data transfer I opted to use a simple button a log it in the laptop console.

The big oops is that I am using "EasyPeer" instead of "Simple Peer". So I installed it and imported it.

```bash
npm install simple-peer
```

The window.onload() function seems far stretched so I removed it. The error is now gone but now no data is being transferred. 

---
> [Okay so nothing on the laptop side gets logged]

"Why nothing logs,
peer.targetSocketId is not set correctly before sending signals.
Phone might be connecting before laptop initiates signaling.
peer.connected is false because the signaling handshake didn’t complete."

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laptop P2P Button Logger</title>
</head>
<body>
  <a id="url" href=""></a>
  <div id="qr"></div>

  <script src="/socket.io/socket.io.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/simple-peer@9.11.1/simplepeer.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>

  <script>
    const $url = document.getElementById('url');
    const socket = io();
    let peer;

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);

      // Generate QR code for phone
      const mobileUrl = `${new URL(`/mobile.html?id=${socket.id}`, window.location)}`;
      $url.textContent = mobileUrl;
      $url.href = mobileUrl;

      const qr = qrcode(4, 'L');
      qr.addData(mobileUrl);
      qr.make();
      document.getElementById('qr').innerHTML = qr.createImgTag(4);

      // Create SimplePeer initiator
      peer = new SimplePeer({ initiator: true, trickle: false });

      // Send signaling data to phone
      peer.on('signal', data => {
        if (peer.targetSocketId) {
          socket.emit('signal', peer.targetSocketId, data);
        }
      });

      // Receive messages from phone
      peer.on('data', data => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'buttonClick') {
          console.log('Phone button clicked!', msg);
        }
      });

      // Receive signaling messages from phone
      socket.on('signal', ({ from, signal }) => {
        if (!peer.targetSocketId) peer.targetSocketId = from;
        peer.signal(signal);
      });
    });
  </script>
</body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phone P2P Button</title>
</head>
<body>
  <button id="sendBtn">Click Me</button>

  <script src="/socket.io/socket.io.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/simple-peer@9.11.1/simplepeer.min.js"></script>

  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const laptopId = urlParams.get('id');
    const socket = io();
    let peer;

    socket.on('connect', () => {
      console.log('Phone connected, Socket ID:', socket.id);

      // Create SimplePeer non-initiator
      peer = new SimplePeer({ initiator: false, trickle: false });

      // Send signal to laptop
      peer.on('signal', data => {
        socket.emit('signal', laptopId, data);
      });

      // Receive signal from laptop
      socket.on('signal', data => {
        peer.signal(data);
      });

      // Wait until P2P connection established
      peer.on('connect', () => {
        console.log('P2P connected to laptop');

        // Button click sends message
        document.getElementById('sendBtn').addEventListener('click', () => {
          peer.send(JSON.stringify({ type: 'buttonClick' }));
          console.log('Sent buttonClick to laptop');
        });
      });

      peer.on('error', err => console.error('Peer error:', err));
    });
  </script>
</body>
</html>
```
---

Still the code used here doesn't work. So I give GPT the code of the exercise to compare it to see which differences there are and apply the method used from the exercise.

```js
socket.on('signal', data => {
    if (!peer.targetSocketId) peer.targetSocketId = data.from;
    peer.signal(data);
});
```
to 
```js
// server.js
socket.on('signal', (targetId, signal) => {
  const targetSocket = io.sockets.sockets.get(targetId);
  if (targetSocket) {
    targetSocket.emit('signal', { signal, from: socket.id });
  }
});
```

I apply this to my mobile and index.html 

server.js
```js
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const os = require('os');

const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);

  // Forward signaling messages
  socket.on('signal', (targetId, signal) => {
    const target = io.sockets.sockets.get(targetId);
    if (target) target.emit('signal', { signal, from: socket.id });
  });

  // Phone readiness
  socket.on('phone-ready', laptopId => {
    io.to(laptopId).emit('phone-ready', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(port, () => {
  const interfaces = os.networkInterfaces();
  console.log(`Server running on port ${port}`);
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`http://${iface.address}:${port}`);
      }
    }
  }
});
```

index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Laptop P2P Button Logger</title>
</head>
<body>
<h2>Laptop</h2>
<a id="url" href=""></a>
<div id="qr"></div>

<script src="/socket.io/socket.io.js"></script>
<script src="https://cdn.jsdelivr.net/npm/simple-peer@9.11.1/simplepeer.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>

<script>
const $url = document.getElementById('url');
const socket = io();
let peer;

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);

  // Generate QR code for phone
  const mobileUrl = `${new URL(`/mobile.html?id=${socket.id}`, window.location)}`;
  $url.textContent = mobileUrl;
  $url.href = mobileUrl;

  const qr = qrcode(4, 'L');
  qr.addData(mobileUrl);
  qr.make();
  document.getElementById('qr').innerHTML = qr.createImgTag(4);

  // Wait until a phone connects before creating initiator peer
  socket.on('phone-ready', phoneId => {
    console.log('Phone ready:', phoneId);
    peer = new SimplePeer({ initiator: true, trickle: false });

    // Send signaling data to phone
    peer.on('signal', data => socket.emit('signal', phoneId, data));

    // Receive messages from phone
    peer.on('data', data => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'buttonClick') {
        console.log('Phone button clicked!', msg);
      }
    });

    // Handle signaling from phone
    socket.on('signal', ({ signal, from }) => {
      if (from === phoneId) peer.signal(signal);
    });
  });
});
</script>
</body>
</html>
```

mobile.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Phone P2P Button</title>
</head>
<body>
<h2>Phone</h2>
<button id="sendBtn">Click Me</button>

<script src="/socket.io/socket.io.js"></script>
<script src="https://cdn.jsdelivr.net/npm/simple-peer@9.11.1/simplepeer.min.js"></script>

<script>
const urlParams = new URLSearchParams(window.location.search);
const laptopId = urlParams.get('id');
const socket = io();
let peer;

socket.on('connect', () => {
  console.log('Phone connected, Socket ID:', socket.id);

  // Let laptop know this phone is ready
  socket.emit('phone-ready', laptopId);

  // Create non-initiator peer
  peer = new SimplePeer({ initiator: false, trickle: false });

  peer.on('signal', data => {
    socket.emit('signal', laptopId, data);
  });

  socket.on('signal', ({ signal }) => {
    peer.signal(signal);
  });

  peer.on('connect', () => {
    console.log('P2P connected to laptop');
    document.getElementById('sendBtn').addEventListener('click', () => {
      peer.send(JSON.stringify({ type: 'buttonClick' }));
      console.log('Sent buttonClick to laptop');
    });
  });

  peer.on('error', err => console.error('Peer error:', err));
});
</script>
</body>
</html>
```

Now when I connect my phone to my pc and click the button the event gets logged. WOOHOO!! Even when the server gets cut out, the connection between laptop and phone still stands. Refreshing ofcourse loses the connection. 

### Week 2

So the problem now is that my teacher said I'm doing a step too much in establishing the connection between phone and computer, now trying to fix it but after tweaking with it for a bit the console.log that happens after the button click doesn't work anymore.

Unhandled Promise Rejection: Error: cannot signal after peer is destroyed

After some troubleshooting I found that I was on a WIFI network that blocks p2p connections, making it an invisible enemy while bashing my head against the wall.


Now I'm trying to implement the gyro features, the big issue right now is that gyro functionality only works after clicking a button to grant permissions and a HTTPS connection. The button to grant permissions works but now the issue establishing the HTTPS server since I'm currently using a HTTP connection which will never work.

The HTTPS issue has been fixed. 

### Week 3

Today was honestly one of those days where everything kept getting better in layers: first connection stability, then gameplay systems, then polish, and then bug hunting edge-cases that only happen when real people actually disconnect/reconnect in weird order.

I now have a full playable loop where the phone is the controller and the laptop is the game renderer. The player survives as long as possible by shining a flashlight using gyro movement. Monsters spawn from edges, move inward, grow over time, and get damaged by the light cone. When they reach center, jumpscare + death state triggers, and restart is possible from the phone.

#### What happened and what I improved

- Simplified and stabilized WebRTC signaling flow.
- Kept HTTPS server setup for iOS motion permissions.
- Added disconnect awareness so paired peer gets notified.
- Added in-game mechanics: spawns, scaling pressure, light damage, timer, death state.
- Added visuals: sprite monsters + background image + jumpscare image.
- Added audio/haptics behavior on both laptop and phone.
- Synced battery HUD on phone from flashlight radius on laptop.
- Added `GIVE UP` flow during gameplay (not only after death).
- Fixed a subtle stale-callback bug where jumpscare sound could play after disconnect/new join.

#### Current server signaling + disconnect handling

```js
const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const { Server } = require("socket.io");
const os = require('os');

const server = https.createServer({
  key: fs.readFileSync('./localhost.key'),
  cert: fs.readFileSync('./localhost.crt')
}, app);
const io = new Server(server);
const port = process.env.PORT || 3000;
const socketPeerMap = new Map();

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);

  socket.on('signal', (targetId, signal) => {
    const target = io.sockets.sockets.get(targetId);
    if (target) {
      target.emit('signal', { signal, from: socket.id });
      socketPeerMap.set(socket.id, targetId);
      socketPeerMap.set(targetId, socket.id);
    }
  });

  socket.on('disconnect', () => {
    const peerId = socketPeerMap.get(socket.id);
    if (peerId) {
      io.to(peerId).emit('peer-disconnected', { id: socket.id });
      if (socketPeerMap.get(peerId) === socket.id) {
        socketPeerMap.delete(peerId);
      }
      socketPeerMap.delete(socket.id);
    }
    console.log('Socket disconnected:', socket.id);
  });
});
```

#### Core laptop game state (new session-safe version)

This was a big one. The stale reconnect issue got solved with `currentGameSessionId` so old animation frames/timeouts cannot leak into a new session.

```js
let monsters = [];
let gameRunning = false;
let isDead = false;
let gameStartMs = 0;
let lastFrameMs = 0;
let lastSpawnMs = 0;
let frameId = null;
let flashlightRadius = FLASHLIGHT_MAX_RADIUS;
let lastBatterySentAt = 0;
let lastBatterySentLevel = -1;
let jumpscareTimeoutId = null;
let currentGameSessionId = 0;

const setDeathState = survivedSeconds => {
  if (!gameRunning || !peer || !peer.connected) {
    return;
  }
  if (isDead) {
    return;
  }
  const deathSessionId = currentGameSessionId;
  gameRunning = false;
  isDead = true;

  playJumpscareSound();

  if (jumpscareTimeoutId !== null) {
    clearTimeout(jumpscareTimeoutId);
  }
  jumpscareTimeoutId = setTimeout(() => {
    if (deathSessionId !== currentGameSessionId) {
      return;
    }
    jumpscareEl.style.display = 'none';
    deathScreenEl.style.display = 'flex';
  }, 1200);
};

const gameLoop = (nowMs, sessionId) => {
  if (!gameRunning || sessionId !== currentGameSessionId) {
    return;
  }

  // update timers, monsters, rendering...

  frameId = requestAnimationFrame(nextMs => gameLoop(nextMs, sessionId));
};

const startGame = () => {
  if (gameRunning) {
    return;
  }

  currentGameSessionId += 1;
  const sessionId = currentGameSessionId;
  gameRunning = true;
  gameStartMs = performance.now();
  lastFrameMs = gameStartMs;
  lastSpawnMs = gameStartMs;
  frameId = requestAnimationFrame(nextMs => gameLoop(nextMs, sessionId));
};

const resetToWaiting = () => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  gameRunning = false;
  currentGameSessionId += 1;
};
```

#### Gameplay rendering and visual direction

The game and waiting screen now share the same visual atmosphere with `background.png`, and monsters animate from sprite-sheet frames.

```js
const MONSTER_SPRITE_PATH = '/assets/img/spritesheet/monster__sheet.png';
const BACKGROUND_IMAGE_PATH = '/assets/img/background.png';
const MONSTER_SPRITE_COLUMNS = 8;
const MONSTER_SPRITE_ROWS = 8;
const MONSTER_SPRITE_FRAME_COUNT = 60;
const MONSTER_SPRITE_FPS = 30;

const backgroundImage = new Image();
let backgroundImageReady = false;
backgroundImage.onload = () => {
  backgroundImageReady = true;
};
backgroundImage.src = BACKGROUND_IMAGE_PATH;

const drawGameBackground = () => {
  if (!backgroundImageReady) {
    ctx.fillStyle = '#88929a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const imageAspect = backgroundImage.width / backgroundImage.height;
  const canvasAspect = canvas.width / canvas.height;

  let drawWidth = canvas.width;
  let drawHeight = canvas.height;
  let offsetX = 0;
  let offsetY = 0;

  if (imageAspect > canvasAspect) {
    drawHeight = canvas.height;
    drawWidth = drawHeight * imageAspect;
    offsetX = (canvas.width - drawWidth) / 2;
  } else {
    drawWidth = canvas.width;
    drawHeight = drawWidth / imageAspect;
    offsetY = (canvas.height - drawHeight) / 2;
  }

  ctx.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);
};
```

And on the start screen:

```css
#waiting-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #0b0d12 url('/assets/img/background.png') center center / cover no-repeat;
  z-index: 5;
}
```

#### Mobile controller status (battery, haptics, give up, wake lock)

Phone side now feels way more complete and readable during play.

```js
const startBtn = document.getElementById('startBtn');
const quitBtn = document.getElementById('quitBtn');
const batteryFill = document.getElementById('batteryFill');
const batteryValue = document.getElementById('batteryValue');
let canRestart = false;
let isPlaying = false;
let wakeLockSentinel = null;

const setBatteryLevel = level => {
  const clamped = Math.max(0, Math.min(100, level));
  batteryFill.style.width = `${clamped}%`;
  batteryValue.textContent = `${clamped}%`;
};

const startGyroStreaming = () => {
  if (gyroStarted) {
    return;
  }
  gyroStarted = true;
  isPlaying = true;
  acquireWakeLock();
  quitBtn.style.display = 'block';

  if (peer && peer.connected) {
    peer.send(JSON.stringify({ type: 'startGame' }));
  }

  startBtn.textContent = 'SURVIVING...';
  startBtn.disabled = true;
};

peer.on('data', data => {
  const msg = JSON.parse(data.toString());

  if (msg.type === 'gameOver') {
    canRestart = true;
    isPlaying = false;
    releaseWakeLock();
    startBtn.disabled = false;
    startBtn.textContent = 'RESTART';
    quitBtn.style.display = 'block';
    return;
  }

  if (msg.type === 'battery') {
    setBatteryLevel(msg.level);
  }
});
```

#### Dev day notes (the real story)

The sneakiest issue today was this: after a disconnect, if someone new joined quickly, old callbacks could still finish and accidentally trigger jumpscare state/audio from a dead session. It felt random at first. The fix was not just one guard, but a layered approach:

1. Only allow death handling if game is actually running and peer is connected.
2. Add session tokening (`currentGameSessionId`) to invalidate old animation loops.
3. Guard delayed jumpscare timeout with that same session id.

After that, reconnect behavior became much more predictable.

#### Commits from today

```bash
d253238 2026-03-22 added assets and QOL updates
5bb8a75 2026-03-22 basic gamerules and mechanics
2e5e820 2026-03-22 Merge pull request #2 from nikolaneutiens/feature/gyro
946b26a 2026-03-22 disconnection capability
```

So overall: huge step forward today. I moved from mostly-technical prototype behavior into a cohesive playable experience with cleaner reconnect behavior and much stronger presentation.