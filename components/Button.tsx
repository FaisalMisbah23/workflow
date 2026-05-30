import Ionicons from "@expo/vector-icons/build/Ionicons";
import React from "react";
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  className = "",
  style,
  textStyle,
}) => {
  const getVariantClasses = () => {
    if (disabled || loading) {
      return "bg-gray-200 border border-gray-200";
    }
    switch (variant) {
      case "primary":
        return "bg-primary shadow-sm shadow-primary/25";
      case "secondary":
        return "bg-gray-800 shadow-sm shadow-black/10";
      case "outline":
        return "bg-white border border-primary";
      case "danger":
        return "bg-red-500 shadow-sm shadow-red-500/25";
      default:
        return "bg-primary shadow-sm shadow-primary/25";
    }
  };

  const getTextClasses = () => {
    if (disabled || loading) {
      return "text-gray-400";
    }
    switch (variant) {
      case "outline":
        return "text-primary";
      default:
        return "text-white";
    }
  };

  const getIconColor = () => {
    if (disabled || loading) {
      return "#9CA3AF";
    }
    switch (variant) {
      case "outline":
        return "#3B82F6";
      default:
        return "#FFFFFF";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-4 py-2 text-sm";
      case "md":
        return "px-4 py-3 text-base";
      case "lg":
        return "px-6 py-4 text-lg";
      default:
        return "px-4 py-3 text-base";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.86}
      className={`${getVariantClasses()} ${getSizeClasses()} rounded-2xl items-center justify-center ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#3B82F6" : "#FFFFFF"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <Ionicons name={icon} size={20} color={getIconColor()} />}
          <Text
            className={`${getTextClasses()} font-semibold`}
            style={textStyle}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
