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