require('./loggers'); // logger'ı aktif hale getir
const winston = require('winston'); // winston'ı çek
const messageLogger = winston.loggers.get('MessageLogger'); // özel logger'ı al
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'chat-secret-key'; // basit demo için sabit key

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let clients = 0;

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token gerekli'));
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    socket.user = decoded.username; // artık socket.user ile erişilebilir
    next();
  } catch (err) {
    return next(new Error('Geçersiz token'));
  }
});
// Şifresiz giriş endpoint'i
app.post('/login', express.json(), (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Kullanıcı adı gerekli' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

io.on('connection', (socket) => {
  clients++;
  io.emit('clients-total', clients);

  socket.on('disconnect', () => {
    clients--;
    io.emit('clients-total', clients);
  });

  socket.on('message', (data) => {
    try {
      // Log mesajını burada yazıyoruz
      messageLogger.debug({
        user: data.name,
        message: data.message,
        timestamp: new Date().toISOString()
      });

      // Mesajı diğer kullanıcılara ilet
      socket.broadcast.emit('chat-message', data);

    } catch (error) {
      messageLogger.debug({
        user: data.name,
        message: error,
        timestamp: new Date().toISOString()
      });
    }

    // Log mesajını burada yazıyoruz
    // messageLogger.debug({
    //   user: data.name,
    //   message: data.message,
    //   timestamp: new Date().toISOString()
    // });

    // // Mesajı diğer kullanıcılara ilet
    // socket.broadcast.emit('chat-message', data);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server is running on port 3000');
});
