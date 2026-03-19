let io;

const initSocket = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // join theo userId
    socket.on("join", (userId) => {
      socket.join(userId.toString());
      console.log("User joined room:", userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket chưa init");
  return io;
};

module.exports = { initSocket, getIO };