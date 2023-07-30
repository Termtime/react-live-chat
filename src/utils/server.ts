import Pusher from "pusher-js";

export const getPusherInstance = () => {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  const useTLS = process.env.PUSHER_USE_TLS;

  if (!appId || !key || !secret || !cluster || !useTLS) {
    return;
  }

  const pusher = new Pusher(appId, {
    cluster,
  });

  return pusher;
};

export const generateLinkedColor = (username: string) => {
  const colors = [
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
    "#795548",
    "#9E9E9E",
    "#607D8B",
  ];

  const sum = username
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % colors.length;

  return colors[index];
};
