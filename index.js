import express from 'express';
import http from 'http';
const app = express();
const server = http.createServer(app)
import {Server} from 'socket.io';
const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Step 1: Store mapping of userId to socket
  socket.on("register", (userId) => {
  if (!userId || typeof userId !== "string") return;
  userSocketMap[userId] = socket.id;
})

  // Step 2: Receive and forward private messages
  socket.on("private_message", ({ from, to, message }) => {
    const targetSocketId = userSocketMap[to];

    if (targetSocketId) {
      io.to(targetSocketId).emit("private_message", {
        from,
        message,
      });
    } else {
      console.log(`User ${to} is offline or not registered.`);
    }
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running`);
});
