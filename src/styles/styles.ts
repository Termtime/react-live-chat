import {css} from "@emotion/react";

export const ghostButtonStyles = css`
  background-color: transparent;
  border-radius: 50%;
  padding: 0.5rem;
  color: white;

  :hover {
    background-color: #374248;
  }

  :active {
    background-color: #506068;
  }
`;
