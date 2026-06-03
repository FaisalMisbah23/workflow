import { supabase } from "@/lib/supabase.js";
import { showToast } from "@/utils/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Bounce } from "react-native-animated-spinkit";
import { SafeAreaView } from "react-native-safe-area-context";

// const showToast = (message: string) => {
//   if (Platform.OS === "android") {
//     ToastAndroid.show(message, ToastAndroid.SHORT);
//   } else {
//     Alert.alert("", message);
//   }
// };

const SignUp = () => {
  const [email, setEmail] = useState("");
  // const [organization, setOrganization] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setloading] = useState(false);
  const router = useRouter();

  const SignUpWithEmail = async () => {
    try {
      setloading(true);
      if (!email || !password) {
        showToast("Fill all fields!", "error");
        setloading(false);
        return;
      }
      if (password.length < 8) {
        showToast("Password must be at least 8 characters", "error");
        setloading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        showToast(error.message, "error");
        console.log(error);
        return;
      }

      showToast("Account created! Please sign in to continue.", "success");
      router.replace("/signin");
    } catch (error: any) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };
  return (
    <SafeAreaView className=" relative dark:bg-gray-900 flex-1 h-full">
      <View className="p-5 mt-auto mb-auto">
        <View className="mb-6 flex justify-center items-center">
          <Text className="text-black dark:text-secondary font-semibold text-5xl">
            Sign Up
          </Text>
        </View>
        <View className="gap-3 mb-4">
          <Text className="text-xl dark:text-white">Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            className="bg-surface border border-secondary dark:bg-transparent dark:border-white dark:text-white rounded-lg shadow-sm p-4 dark:placeholder:text-gray-300"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="gap-3 mb-4 relative">
          <Text className="text-xl dark:text-white">Password</Text>
          <TextInput
            className="bg-surface border border-secondary dark:bg-transparent dark:border-white dark:text-white rounded-lg shadow-sm p-4 pr-12"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-14"
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              color={"#666"}
              size={20}
            />
          </TouchableOpacity>
          {password.length > 0 && password.length < 8 && (
            <Text className="text-red-500 relative bottom-4">
              Password must be at least 8 characters
            </Text>
          )}
        </View>
        <TouchableOpacity
          className={`${loading ? "bg-blue-400 dark:bg-gray-400" : "bg-primary dark:bg-secondary"} p-5 rounded-[15px]`}
          onPress={() => SignUpWithEmail()}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <Bounce size={25} color="white" className="text-center mx-auto" />
          ) : (
            <Text className="text-surface dark:text-white text-center">
              Create Account
            </Text>
          )}
        </TouchableOpacity>
        <View className="flex flex-row mt-6 justify-center">
          <Text className="text-black dark:text-gray-200 underline">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text className="text-blue-700 dark:text-blue-400 text-[15px]">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
