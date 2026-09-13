import "@/assets/styles/global.css";
import NotificationProvider from "@/context/NotificationContext";
import ThemeProvider, { ThemeContext } from "@/context/ThemeContext";
import UserProvider, { UserContext } from "@/context/UserContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Stack, useRouter } from "expo-router";
import { useContext } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

function RootLayoutContent() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { isDark } = useContext(ThemeContext);

  return (
    <>
      <NotificationProvider userId={user?.user?.id}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="signup"
            options={{
              title: "Create Account",
              headerTitleStyle: { fontWeight: 600 },
              headerStyle: {
                backgroundColor: isDark ? "#1F2937" : "#fff",
              },
              headerTintColor: isDark ? "#fff" : "#000",
              headerLeft: () => (
                <View>
                  <Ionicons
                    name="arrow-back"
                    size={26}
                    color={isDark ? "#fff" : "#000"}
                    onPress={() => router.back()}
                  />
                </View>
              ),
            }}
          />
          <Stack.Screen
            name="signin"
            options={{
              title: "Sign In",
              headerTitleStyle: { fontWeight: 600 },
              headerStyle: {
                backgroundColor: isDark ? "#1F2937" : "#fff",
              },
              headerTintColor: isDark ? "#fff" : "#000",
              headerShadowVisible: false,
              headerLeft: () => (
                <View>
                  <Ionicons
                    name="arrow-back"
                    size={26}
                    color={isDark ? "#fff" : "#000"}
                    onPress={() => router.back()}
                  />
                </View>
              ),
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="createtask"
            options={{
              title: "Create New Task",
              headerStyle: { backgroundColor: isDark ? "#1F2937" : "#fff" },
              headerTintColor: isDark ? "#fff" : "#000",
            }}
          />
          <Stack.Screen
            name="createorganization"
            options={{
              title: "Create Your Organization",
              headerStyle: { backgroundColor: isDark ? "#1F2937" : "#fff" },
              headerTintColor: isDark ? "#fff" : "#000",
            }}
          />
          <Stack.Screen
            name="info"
            options={{
              title: "Profile",
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: isDark ? "#1F2937" : "#fff" },
              headerTintColor: isDark ? "#fff" : "#000",
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              title: "Notifications",
              headerStyle: { backgroundColor: isDark ? "#1F2937" : "#fff" },
              headerTintColor: isDark ? "#fff" : "#000",
            }}
          />
          <Stack.Screen
            name="invite/[token]"
            options={{ title: "Accept Invitation", headerShown: false }}
          />
          <Stack.Screen
            name="forgotpassword"
            options={{
              title: "Forgot Password",
              headerTitleStyle: { fontWeight: 600 },
              headerStyle: { backgroundColor: isDark ? "#1F2937" : "#fff" },
              headerTintColor: isDark ? "#fff" : "#000",
              headerLeft: () => (
                <View>
                  <Ionicons
                    name="arrow-back"
                    size={26}
                    color={isDark ? "#fff" : "#000"}
                    onPress={() => router.back()}
                  />
                </View>
              ),
            }}
          />
          <Stack.Screen
            name="resetpassword"
            options={{
              title: "Reset Password",
              headerTitleStyle: { fontWeight: 600 },
              headerStyle: { backgroundColor: isDark ? "#1F2937" : "#fff" },
              headerTintColor: isDark ? "#fff" : "#000",
              headerLeft: () => (
                <View>
                  <Ionicons
                    name="arrow-back"
                    size={26}
                    color={isDark ? "#fff" : "#000"}
                    onPress={() => router.back()}
                  />
                </View>
              ),
            }}
          />
        </Stack>
      </NotificationProvider>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </UserProvider>
  );
}
