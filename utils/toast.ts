import { Alert, Platform, ToastAndroid } from "react-native";

export const showToast = (
  message: string,
  duration: "SHORT" | "LONG" = "SHORT",
) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(
      message,
      duration === "SHORT" ? ToastAndroid.SHORT : ToastAndroid.LONG,
    );
  } else {
    Alert.alert("", message);
  }
};

export const showError = (message: string) => {
  Alert.alert("Error", message);
};

export const showSuccess = (message: string) => {
  Alert.alert("Success", message);
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
