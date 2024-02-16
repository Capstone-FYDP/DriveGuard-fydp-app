import React, { useContext } from "react";
import { ActivityIndicator } from "react-native";
import { MainContext } from "../../context/MainContext";

const LoadingIndicator = (props) => {
  const { isAnimating } = props;
  const context = useContext(MainContext);

  return (
    <ActivityIndicator
      size='large'
      color={props.color ?? context.tertiaryColour}
      animating={isAnimating}
    />
  );
};

export default LoadingIndicator;
