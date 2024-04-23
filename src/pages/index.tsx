import React, {useCallback, useEffect} from "react";
import {useRouter} from "next/router";
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
  padding: 10dvh;
  min-height: 45dvh;
  margin: 0;
  background-image: url("/resources/img/nature-background.jpg");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  flex-direction: column;
  justify-content: center;
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
  min-height: 55dvh;
`;

const HomePage = () => {
  const router = useRouter();
  const {data, status} = useSession();

  console.log({data});
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
      <Flex css={homePageHeaderStyles} gap={3}>
        <Heading as="h1" size="xl" textAlign="center" css={textStyles}>
          Welcome to Live-chat{data?.user?.name && `,${data?.user?.name}`}!
        </Heading>
        <Heading as="h3" size="md" textAlign="center" css={textStyles}>
          Join the conversation! Chat rooms are buzzing with new people to meet.
        </Heading>
        <Button
          mt={5}
          sx={{alignSelf: "center"}}
          colorScheme="blue"
          onClick={onClick}
          type="button"
          disabled={status === "loading"}
        >
          <Text>
            {status === "authenticated"
              ? "Start chatting now"
              : "Log in to get started!"}
          </Text>
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
            <CardBody gap={4} display="flex" flexDirection="column">
              <Heading as="h3" size="lg">
                Live connections, real conversations
              </Heading>
              <hr />
              <Text>
                Chat over a secure, space about common topics or interests.
                Start chatting immediately!
              </Text>
            </CardBody>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardBody gap={4} display="flex" flexDirection="column">
              <Heading as="h3" size="lg">
                End-to-end encryption
              </Heading>
              <hr />
              <Text>
                With Next.js, Pusher, and end-to-end encryption we have created
                a simple web app that brings people together.
              </Text>
            </CardBody>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardBody gap={4} display="flex" flexDirection="column">
              <Heading as="h3" size="lg">
                Chat from Anywhere
              </Heading>
              <hr />
              <Text>Connect on the go: Web & mobile friendly.</Text>
            </CardBody>
          </Card>
        </Box>
      </SimpleGrid>
    </Flex>
  );
};

export default HomePage;
