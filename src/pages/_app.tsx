import "@/styles/globals.css";
import {store} from "@/redux/toolkit/store";
import {Provider} from "react-redux";
import type {AppProps} from "next/app";
import {ChakraProvider} from "@chakra-ui/react";
import theme from "../theme";

export default function App({Component, pageProps}: AppProps) {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}
