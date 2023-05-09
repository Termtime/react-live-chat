import {useEffect} from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@/styles/globals.css";
import {store} from "@/redux/toolkit/store";
import {Provider} from "react-redux";

import type {AppProps} from "next/app";
import {ChakraProvider} from "@chakra-ui/react";

export default function App({Component, pageProps}: AppProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      require("jquery/dist/jquery");

      require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

  return (
    <Provider store={store}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}
