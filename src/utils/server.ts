import Pusher from "pusher";

export const initializeServerPusher = () => {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  const useTLS = process.env.PUSHER_USE_TLS;

  if (!appId || !key || !secret || !cluster || !useTLS) {
    throw new Error("Pusher environment variables not set");
  }

  const pusher = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: useTLS === "true",
  });

  return pusher;
};
export const generateLinkedColor = (userId: string) => {
  console.log("Generating color for user", userId);
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

  const sum = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % colors.length;

  console.log("Sum", sum);
  console.log("Index", index);
  console.log("Generated color", colors[index]);

  return colors[index];
};
