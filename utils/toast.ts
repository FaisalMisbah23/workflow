import { Alert } from "react-native";
import Toast from "react-native-toast-message";

export const showToast = (
  message: string,
  type: "success" | "error" | "info" = "success",
) => {
  Toast.show({
    type: type,
    text1: message,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
  });
};

export const showError = (message: string) => {
  Toast.show({
    type: "error",
    text1: message,
    position: "top",
    visibilityTime: 3000,
  });
};

export const showSuccess = (message: string) => {
  Toast.show({
    type: "success",
    text1: message,
    position: "top",
    visibilityTime: 3000,
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
