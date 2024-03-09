import "@/styles/globals.css";
import {store} from "@/redux/toolkit/store";
import {Provider} from "react-redux";
import type {AppProps} from "next/app";
import {ChakraProvider} from "@chakra-ui/react";
import {SessionProvider} from "next-auth/react";
import theme from "../theme";

export default function App({
  Component,
  pageProps: {session, ...pageProps},
}: AppProps) {
  return (
    <Provider store={store}>
      <SessionProvider session={session}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </SessionProvider>
    </Provider>
  );
}
