import styled from "styled-components";

const theme = {
    blue: {
        default: "rgb(134, 209, 243)",
        hover: "rgb(0, 210, 245)",
    },
    pink: {
        default: "#e91e63",
        hover: "#ad1457",
    },
};

const Label = styled.label`
  background-color: ${(props) => theme[props.theme].default};
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  outline: 0;
  border: 0;
  text-transform: uppercase;
  margin: 10px 0px;
  cursor: pointer;
  box-shadow: 0px 2px 2px lightgray;
  transition: ease background-color 250ms;
  &:hover {
    background-color: ${(props) => theme[props.theme].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

Label.defaultProps = {
    theme: "blue",
};

export default Label;