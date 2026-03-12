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

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);

  // Forward signaling messages
  socket.on('signal', (targetId, signal) => {
    const target = io.sockets.sockets.get(targetId);
    if (target) target.emit('signal', { signal, from: socket.id });
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
        console.log(`https://${iface.address}:${port}`);
      }
    }
  }
});