import React, {useCallback, useEffect} from "react";
import {useRouter} from "next/router";
import {
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  LinkBox,
  Text,
} from "@chakra-ui/react";
import {css} from "@emotion/react";
import {signIn, useSession} from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {useDispatch} from "react-redux";

const homePageStyles = css`
  flex-direction: row;
  width: 100%;
  height: 100dvh;
`;

const HomePage = () => {
  const router = useRouter();
  const {data, status} = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat");
    }
  }, [status, router]);

  const onClick: React.MouseEventHandler = useCallback(
    (e) => {
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

  return (
    <Flex css={homePageStyles}>
      <Flex
        css={css`
          width: 60%;
          background-color: #2a3942;
          justify-content: flex-end;
          flex-direction: column;
          align-items: center;
          color: #cae6d3;
        `}
      >
        <Image
          alt="React live-chat logo"
          src="/resources/img/logo.png"
          width={500}
          height={500}
          style={{marginTop: "auto", marginBottom: "auto"}}
        />
        <Flex
          css={css`
            justify: flex-end;
            margin-bottom: 1rem;
          `}
        >
          <Link target="_blank" href="https://github.com/Termtime">
            <Text fontStyle="italic" fontSize="md">
              Made by Termtime
            </Text>
          </Link>
        </Flex>
      </Flex>
      <Flex
        css={css`
          flex-direction: column;
          width: 40%;
          background-color: #cae6d3;
          padding: 4rem;
          justify-content: center;
        `}
      >
        <Flex
          css={css`
            flex-direction: column;
            gap: 12px;
          `}
        >
          <Heading as="h1" size="xl" textAlign="start">
            SIGN IN
          </Heading>

          <Text size="sm">Start your first secure chat in seconds.</Text>

          <Button
            mt={5}
            sx={{alignSelf: "center"}}
            // bgColor="#005c4b"
            colorScheme="green"
            onClick={onClick}
            type="button"
            disabled={status === "loading"}
            width="100%"
          >
            <Text>Log in</Text>
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default HomePage;
