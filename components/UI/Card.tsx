import React from "react";
import { View, ViewStyle } from "react-native";
import { Colors, BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: number;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = Spacing.lg,
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case "default":
        return Colors.surface;
      case "elevated":
        return Colors.surface;
      case "outlined":
        return Colors.surface;
      default:
        return Colors.surface;
    }
  };

  const getBorder = () => {
    switch (variant) {
      case "outlined":
        return { borderWidth: 1, borderColor: Colors.border };
      default:
        return {};
    }
  };

  const getShadow = () => {
    switch (variant) {
      case "elevated":
        return { shadowColor: Shadows.md, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: BorderRadius.lg,
          padding,
          ...getBorder(),
          ...getShadow(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default Card;
