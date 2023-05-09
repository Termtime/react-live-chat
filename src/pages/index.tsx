import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import styles from "../styles/HomePage.module.css";
import {joinRoom} from "../redux/toolkit/features/chatSlice";
import {useAppDispatch} from "../redux/toolkit/store";
import {SocketConnection} from "../io/connection";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {css} from "@emotion/react";

const con = SocketConnection.getInstance();

const HomePage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const dispatch = useAppDispatch();

  const onClick: React.MouseEventHandler = (e) => {
    dispatch(joinRoom({roomId, username}));
    router.push("/chat");
  };

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

  useEffect(() => {
    fetch("/api/");
  }, []);

  return (
    <Flex direction="column">
      <Flex css={homePageHeaderStyles}>
        <Heading as="h1" size="xl" textAlign="center" css={textStyles}>
          Welcome to Live-chat!
        </Heading>
        <Heading as="h3" size="lg" textAlign="center" css={textStyles}>
          Join chat rooms, and talk to your friends!
        </Heading>
        <Flex direction="column" alignItems="center" alignSelf="center">
          <FormControl isRequired>
            <InputGroup>
              <InputLeftAddon>Username:</InputLeftAddon>
              <Input
                type="text"
                backgroundColor="white"
                value={username}
                onInput={(e) =>
                  setUsername((e.target as HTMLInputElement).value)
                }
                placeholder="Termtime"
                required
              />
            </InputGroup>
          </FormControl>
          <br />
          <FormControl isRequired>
            <InputGroup>
              <InputLeftAddon>Room name:</InputLeftAddon>
              <Input
                type="text"
                backgroundColor="white"
                placeholder="Termtime's room"
                value={roomId}
                onInput={(e) => setRoomId((e.target as HTMLInputElement).value)}
                required
              />
            </InputGroup>
          </FormControl>
          <br />
          <Button
            width="100%"
            type="submit"
            colorScheme="blue"
            onClick={onClick}
          >
            Join
          </Button>
        </Flex>
      </Flex>
      <SimpleGrid css={homePageBottomStyles} spacing={5} minChildWidth="300px">
        <Box>
          <Card>
            <CardBody>
              <Heading as="h3" size="lg">
                Totally Anonimous
              </Heading>
              <hr />
              <Text>
                Offer a free space to chat and talk with friends or random
                people about common topics or interests.
              </Text>
            </CardBody>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardBody>
              <Heading as="h3" size="lg">
                End-to-end encryption
              </Heading>
              <hr />
              <Text>
                Using Express and Socket.io with rooms we can connect people
                through a simple WebApp.
              </Text>
            </CardBody>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardBody>
              <Heading as="h3" size="lg">
                IDK
              </Heading>
              <hr />
              <Text>
                Because there is always a need to explore new and fun ways to
                use and apply technology in daily life.
              </Text>
            </CardBody>
          </Card>
        </Box>
      </SimpleGrid>
    </Flex>
  );
};

export default HomePage;
