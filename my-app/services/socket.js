import io from "socket.io-client";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig.extra.BASE_URL;

let socket;

export const initSocket = () => {
  socket = io(BASE_URL, {
    transports: ["websocket","polling"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.log("🚨 Socket error:", err.message);
  });

  return socket;
};

export const joinUser = (userId) => {
  if (socket) {
    socket.emit("join", userId);
  }
};

export const listenNotification = () => {
  if (!socket) return;

  socket.on("order_cancelled", (data) => {
    console.log("🔥 Nhận noti:", data);

    alert(data.message); // hoặc Toast
  });
};

export const removeNotificationListeners = () => {
  if (!socket) return;

  socket.off("order_cancelled");
};

export const getSocket = () => socket;