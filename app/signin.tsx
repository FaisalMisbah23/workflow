import { UserContext } from "@/context/UserContext";
import { showToast } from "@/utils/toast";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Bounce } from "react-native-animated-spinkit";
import { SafeAreaView } from "react-native-safe-area-context";

const signin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { login, loading } = useContext(UserContext);
  const colorScheme = useColorScheme();

  const handlelogin = () => {
    if (!email || !password) {
      showToast("Fill all fields", "error");
      return;
    }
    login(email, password);
  };

  return (
    <SafeAreaView className=" relative dark:bg-gray-900 flex-1 h-full">
      <View className="p-5 mt-auto mb-auto">
        <View className="mb-6 flex justify-center items-center">
          <Text className="text-black dark:text-secondary font-semibold text-5xl">
            Sign In
          </Text>
        </View>
        <View className="gap-3 mb-4">
          <Text className="text-xl dark:text-white">Email</Text>
          <TextInput
            className="bg-surface border border-secondary dark:bg-transparent dark:border-white dark:text-white rounded-lg shadow-sm p-4 dark:placeholder:text-gray-300"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View className="gap-3 mb-4">
          <Text className="text-xl dark:text-white">Password</Text>
          <TextInput
            className="bg-surface border border-secondary dark:bg-transparent dark:border-white dark:text-white rounded-lg shadow-sm p-4 pr-12"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-14"
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#666"}
            />
          </TouchableOpacity>
          {password.length > 0 && password.length < 8 && (
            <Text className="text-red-500 relative bottom-4 dark:text-red-500">
              Password must be at least 8 characters
            </Text>
          )}
        </View>
        <View className="relative bottom-3 left-2">
          <TouchableOpacity onPress={() => router.push("/forgotpassword")}>
            <Text className="text-blue-700 dark:text-blue-500">
              Forgot Your Password?
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mb-4 gap-3">
          <TouchableOpacity
            className={`${loading ? "bg-blue-400 dark:bg-gray-400" : "bg-primary dark:bg-secondary"} rounded-[10px] p-4 `}
            onPress={handlelogin}
          >
            {loading ? (
              <Bounce size={25} color="white" className="text-center mx-auto" />
            ) : (
              <Text className="text-center text-surface dark:text-white">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="flex flex-row mt-6 justify-center">
          <Text className="text-black dark:text-gray-200 underline">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-blue-700 text-[15px] dark:text-blue-500">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default signin;
