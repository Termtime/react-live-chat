import {NextApiRequest, NextApiResponse} from "next";
import Pusher from "pusher";
import {initializeServerPusher} from "../../../utils";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Pusher.UserAuthResponse>
) {
  console.log("USER AUTH", req.body);
  const socketId = req.body.socket_id;
  const username = req.body.username;
  const publicKey = req.body.publicKey;

  if (!socketId || !username || !publicKey) {
    throw new Error("Missing required parameters");
  }
  const pusher = initializeServerPusher();
  console.log("Initialized server pusher", pusher);

  // Replace this with code to retrieve the actual user id and info
  const user = {
    id: socketId,
    user_info: {
      username,
      publicKey,
    },
  };
  const authResponse = pusher.authenticateUser(socketId, user);
  console.log("Auth response", authResponse);
  res.send(authResponse);
}
