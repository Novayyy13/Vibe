const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

// Track connected users: socketId -> { id, name, color }
const users = new Map();

const COLORS = [
  '#6c63ff','#0ea5e9','#22c55e','#f59e0b',
  '#e879f9','#f43f5e','#14b8a6','#fb923c'
];

let colorIdx = 0;
function nextColor() {
  return COLORS[colorIdx++ % COLORS.length];
}

function initials(name) {
  const w = name.trim().split(/\s+/);
  return (w[0][0] + (w[1] ? w[1][0] : w[0][1] || '')).toUpperCase();
}

function broadcastUserList() {
  const list = Array.from(users.values()).map(u => ({
    id: u.id,
    name: u.name,
    color: u.color,
    init: u.init
  }));
  io.emit('user_list', list);
}

io.on('connection', (socket) => {

  // User joins with a name
  socket.on('join', (name) => {
    if (!name || typeof name !== 'string') return;
    name = name.trim().slice(0, 32);
    if (!name) return;

    const user = {
      id: socket.id,
      name,
      color: nextColor(),
      init: initials(name)
    };
    users.set(socket.id, user);

    // Send this user their own info
    socket.emit('welcome', user);

    // Tell everyone someone joined
    socket.broadcast.emit('user_joined', user);

    // Send full user list to everyone
    broadcastUserList();

    console.log(`[+] ${name} joined (${socket.id})`);
  });

  // Direct message between two users
  socket.on('message', ({ toId, text }) => {
    const from = users.get(socket.id);
    if (!from || !text || typeof text !== 'string') return;
    text = text.trim().slice(0, 2000);
    if (!text) return;

    const payload = {
      fromId: socket.id,
      fromName: from.name,
      fromColor: from.color,
      fromInit: from.init,
      text,
      time: new Date().toISOString()
    };

    // Send to recipient
    io.to(toId).emit('message', payload);
    // Echo back to sender (so both sides see it)
    socket.emit('message_sent', { ...payload, toId });
  });

  // Typing indicator
  socket.on('typing', ({ toId, typing }) => {
    const from = users.get(socket.id);
    if (!from) return;
    io.to(toId).emit('typing', { fromId: socket.id, fromName: from.name, typing });
  });

  // WebRTC signalling (for video/audio calls)
  socket.on('call_offer', ({ toId, offer, callType }) => {
    const from = users.get(socket.id);
    if (!from) return;
    io.to(toId).emit('call_offer', {
      fromId: socket.id,
      fromName: from.name,
      fromColor: from.color,
      fromInit: from.init,
      offer,
      callType
    });
  });

  socket.on('call_answer', ({ toId, answer }) => {
    io.to(toId).emit('call_answer', { fromId: socket.id, answer });
  });

  socket.on('ice_candidate', ({ toId, candidate }) => {
    io.to(toId).emit('ice_candidate', { fromId: socket.id, candidate });
  });

  socket.on('call_end', ({ toId }) => {
    io.to(toId).emit('call_ended', { fromId: socket.id });
  });

  socket.on('call_decline', ({ toId }) => {
    io.to(toId).emit('call_declined', { fromId: socket.id });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`[-] ${user.name} left`);
      users.delete(socket.id);
      io.emit('user_left', { id: socket.id });
      broadcastUserList();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Vibe server running on port ${PORT}`);
});
