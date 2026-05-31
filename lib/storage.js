import { Platform } from "react-native";

let storage;

if (Platform.OS === "web") {
  storage = {
    getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
    setItem: (key, value) =>
      Promise.resolve(window.localStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
  };
} else {
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;

  storage = AsyncStorage;
}

export default storage;
