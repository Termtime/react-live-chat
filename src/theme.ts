import {extendTheme} from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Jost', 'Inter', sans-serif`,
    body: `'Roboto', 'Inter', sans-serif`,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    bold: 600,
  },
});

export default theme;
