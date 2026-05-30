import { UserContext } from "@/context/UserContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const signin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { login, loading } = useContext(UserContext);

  const handlelogin = () => {
    if (!email || !password) {
      ToastAndroid.show("Fill all fields", ToastAndroid.SHORT);
      return;
    }
    login(email, password);
  };

  return (
    <SafeAreaView className="relative top-5">
      <View className="p-5">
        <View className="gap-3 mb-4">
          <Text className="text-xl">Email</Text>
          <TextInput
            className="bg-surface border border-secondary rounded-lg shadow-sm p-4"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View className="gap-3 mb-4">
          <Text className="text-xl">Password</Text>
          <TextInput
            className="bg-surface border border-secondary rounded-lg shadow-sm p-4 pr-12"
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
              color={"#666"}
            />
          </TouchableOpacity>
          {password.length > 0 && password.length < 8 && (
            <Text className="text-red-500 relative bottom-4">
              Password must be at least 8 characters
            </Text>
          )}
        </View>
        <View className="relative bottom-3 left-2">
          <TouchableOpacity onPress={() => router.push("/forgotpassword")}>
            <Text className="text-blue-700">Forgot Your Password?</Text>
          </TouchableOpacity>
        </View>
        <View className="mb-4 gap-3">
          <TouchableOpacity
            className={`${loading ? "bg-gray-400" : "bg-primary"} rounded-[10px] p-4`}
            onPress={handlelogin}
          >
            {loading ? (
              <Text className="text-center text-surface">Loading...</Text>
            ) : (
              <Text className="text-center text-surface">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="flex flex-row mt-6 justify-center">
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-blue-700 text-[15px]">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default signin;
