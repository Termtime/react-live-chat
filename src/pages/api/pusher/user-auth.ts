import {NextApiRequest, NextApiResponse} from "next";
import Pusher from "pusher";
import {initializeServerPusher} from "../../../utils";
import {authOptions} from "../auth/[...nextauth]";
import {getServerSession} from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Pusher.ChannelAuthResponse>
) {
  console.log("USER AUTH", req.body);

  const session = await getServerSession(req, res, authOptions);

  console.log("Session", session);
  if (session && session.user) {
    console.log("Session user", session.user);
    const socketId = req.body.socket_id;
    const userId = session.sub;
    const username = session.user.name;
    const publicKey = req.body.publicKey;
    const channel = req.body.channel_name;

    if (!userId || !username || !publicKey || !socketId) {
      throw new Error("Missing required parameters");
    }
    const pusher = initializeServerPusher();
    console.log("Initialized server pusher", pusher);

    // Replace this with code to retrieve the actual user id and info
    const user = {
      user_id: userId,
      user_info: {
        username,
        publicKey,
      },
    };

    const authResponse = pusher.authorizeChannel(socketId, channel, user);
    console.log("Auth response", authResponse);
    res.send(authResponse);
  } else {
    res.status(401).send("Unauthorized");
  }
}
