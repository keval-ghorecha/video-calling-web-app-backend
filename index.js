const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(httpServer, { debug: true, path: "/" });

app.use(cors());

app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  console.log(
    "🚀 ~ file: server.js ~ line 32 ~ peerServer.on ~ connected peer"
  );
});

app.get("/", function (req, res) {
  res.send("hello, http2!");
});

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("join-room", (payload) => {
    socket.join(payload.roomId);
    socket.to(payload.roomId).emit("user-connected", payload.userId);
    console.log("user joined room", payload.roomId, "     ", payload.userId);

    socket.on("disconnect", () => {
      console.log("🚀 ~ file: server.js ~ line 46 ~ io.on ~ disconnect");
      socket
        .to(payload.roomId)
        .emit("user-disconnected", { userId: payload.userId });
    });
  });
});

httpServer.listen(process.env.PORT || 8080);
