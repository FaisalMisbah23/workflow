import { Alert, Platform } from "react-native";

import Toast from "react-native-toast-message";

export const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info",
) => {
  if (Platform.OS === "android") {
    Toast.show({
      text1: message,
      type,
      position: "top",
      visibilityTime: 2000,
    });
  } else {
    Toast.show({
      text1: message,
      type,
      position: "top",
      visibilityTime: 2000,
    });
  }
};

export const showSuccess = (message: string) => {
  Toast.show({
    text1: message,
    type: "success",
    position: "top",
  });
};

export const showError = (message: string) => {
  Toast.show({
    text1: message,
    type: "error",
    position: "top",
  });
};
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel", onPress: onCancel },
    {
      text: "Confirm",
      style: "destructive",
      onPress: onConfirm,
    },
  ]);
};
