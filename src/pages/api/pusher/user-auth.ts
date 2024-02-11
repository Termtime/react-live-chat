import {NextApiRequest, NextApiResponse} from "next";
import Pusher from "pusher";
import {initializeServerPusher} from "../../../utils";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Pusher.ChannelAuthResponse>
) {
  console.log("USER AUTH", req.body);
  const socketId = req.body.socket_id;
  const username = req.body.username;
  const publicKey = req.body.publicKey;
  const channel = req.body.channel_name;

  if (!socketId || !username || !publicKey) {
    throw new Error("Missing required parameters");
  }
  const pusher = initializeServerPusher();
  console.log("Initialized server pusher", pusher);

  // Replace this with code to retrieve the actual user id and info
  const user = {
    user_id: socketId,
    user_info: {
      username,
      publicKey,
    },
  };

  const authResponse = pusher.authorizeChannel(socketId, channel, user);
  console.log("Auth response", authResponse);
  res.send(authResponse);
}
