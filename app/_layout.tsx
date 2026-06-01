import NotificationProvider from "@/context/NotificationContext";
import UserProvider, { UserContext } from "@/context/UserContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Stack, useRouter } from "expo-router";
import { useContext } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import "../global.css";

function RootLayoutContent() {
  const router = useRouter();
  const { user } = useContext(UserContext) as any;

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
              headerLeft: () => (
                <View>
                  <Ionicons
                    name="arrow-back"
                    size={26}
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
              headerLeft: () => (
                <View>
                  <Ionicons
                    name="arrow-back"
                    size={26}
                    onPress={() => router.back()}
                  />
                </View>
              ),
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="createtask"
            options={{ title: "Create New Task" }}
          />
          <Stack.Screen
            name="createorganization"
            options={{ title: "Create Your Organization" }}
          />
          <Stack.Screen
            name="info"
            options={{ title: "Profile", headerTitleAlign: "center" }}
          />
          <Stack.Screen
            name="notifications"
            options={{ title: "Notifications" }}
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
              headerLeft: () => (
                <View>
                  <Ionicons
                    name="arrow-back"
                    size={26}
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
              headerLeft: () => (
                <View>
                  <Ionicons
                    name="arrow-back"
                    size={26}
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
      <RootLayoutContent />
    </UserProvider>
  );
}
