import React, {useCallback, useEffect} from "react";
import {useRouter} from "next/router";
import {useAppDispatch} from "../redux/toolkit/store";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {signIn, signOut, useSession} from "next-auth/react";

const homePageHeaderStyles = css`
  box-shadow: inset 0 0 100vw 5px rgba(0, 0, 0, 1);
  padding: 10vh;
  min-height: 45vh;
  margin: 0;
  background-image: url("/resources/img/nature-background.jpg");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  flex-direction: column;
`;

const textStyles = css`
  color: white;
  text-align: center;
`;

const homePageBottomStyles = css`
  background: #c94b4b;
  background: -webkit-linear-gradient(to top, #4b134f, #c94b4b);
  background: linear-gradient(to top, #4b134f, #c94b4b);
  color: white;
  padding: 2vw;
  min-height: 55vh;
`;

const HomePage = () => {
  const router = useRouter();
  const {data, status} = useSession();

  console.log({data});
  //TODO: implement the login functionality and move joinroom to the chat page
  //TODO: implement private routes that must have a user logged in to access
  const onClick: React.MouseEventHandler = useCallback(
    (e) => {
      if (status === "authenticated" && data?.user?.name) {
        router.push("/chat");
      }

      if (status === "unauthenticated") {
        signIn(
          "auth0",
          {callbackUrl: `${window.location.origin}/chat`},
          {
            connection: "google-oauth2",
          }
        ).catch((error) => {
          console.error("Error signing in", error);
        });
      }
    },
    [status, data?.user?.name, router]
  );

  useEffect(() => {
    if (status === "authenticated" && data?.user?.name) {
      router.push("/chat");
    }
  }, [status, data?.user?.name, router]);

  return (
    <Flex direction="column">
      <Flex css={homePageHeaderStyles}>
        <Heading as="h1" size="xl" textAlign="center" css={textStyles}>
          Welcome to Live-chat {`,${data?.user?.name}`}!
        </Heading>
        <Heading as="h3" size="lg" textAlign="center" css={textStyles}>
          Join chat rooms, and talk to your friends!
        </Heading>
        <Button
          mt={5}
          width="50%"
          sx={{alignSelf: "center"}}
          colorScheme="blue"
          onClick={onClick}
          type="button"
          disabled={status === "loading"}
        >
          {status === "authenticated" ? "Start chatting" : "Login"}
        </Button>
        {status === "authenticated" && (
          <Button
            mt={5}
            width="50%"
            sx={{alignSelf: "center"}}
            colorScheme="red"
            onClick={() => signOut()}
            type="button"
          >
            Log out
          </Button>
        )}
      </Flex>
      <SimpleGrid css={homePageBottomStyles} spacing={5} minChildWidth="300px">
        <Box>
          <Card>
            <CardBody>
              <Heading as="h3" size="lg" marginBottom={3}>
                Totally Anonimous
              </Heading>
              <hr />
              <Text>
                Chat over a secure, anonimous space about common topics or
                interests. Meet new people and share about life!
              </Text>
            </CardBody>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardBody>
              <Heading as="h3" size="lg" marginBottom={3}>
                End-to-end encryption
              </Heading>
              <hr />
              <Text>
                Using NextJS and Socket.io together with end-to-end encryption
                for messages we can connect people through a simple web
                application.
              </Text>
            </CardBody>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardBody>
              <Heading as="h3" size="lg" marginBottom={3}>
                Why?
              </Heading>
              <hr />
              <Text>
                Because there is always a need to explore new and fun ways to
                use and apply technology in our life.
              </Text>
            </CardBody>
          </Card>
        </Box>
      </SimpleGrid>
    </Flex>
  );
};

export default HomePage;
