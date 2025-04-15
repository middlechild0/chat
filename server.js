const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const socketIo = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = socketIo(server);
  const clients = new Map();

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('register', (clientId) => {
      console.log(`Client registered: ${clientId}`);
      socket.clientId = clientId;
      clients.set(clientId, socket);
      // Emit updated client list to all clients
      io.emit('clientList', Array.from(clients.keys()));
    });

    socket.on('sendMessage', (message) => {
      const { to, from, message: msg } = message;
      console.log(`Message from ${from} to ${to}: ${msg}`);

      const recipientSocket = clients.get(to);
      if (recipientSocket) {
        recipientSocket.emit('receiveMessage', {
          from,
          message: msg,
          timestamp: new Date().toISOString()
        });
        // Notify sender message was sent
        socket.emit('messageSent', {
          to,
          message: msg,
          timestamp: new Date().toISOString()
        });
      } else {
        socket.emit('messageError', {
          to,
          error: `User ${to} is offline`,
          timestamp: new Date().toISOString()
        });
        console.log(`User ${to} is offline`);
      }
    });

    socket.on('disconnect', () => {
      for (const [clientId, clientSocket] of clients.entries()) {
        if (clientSocket === socket) {
          clients.delete(clientId);
          console.log(`Client disconnected: ${clientId}`);
          // Emit updated client list to all clients
          io.emit('clientList', Array.from(clients.keys()));
          break;
        }
      }
    });
  });

  // ✅ Now the server.listen is inside and works!
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://192.168.56.1:${PORT}`);
  });
});
