import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

const signup = () => {
  const [email, setEmail] = useState("");
  // const [organization, setOrganization] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setloading] = useState(false);
  const router = useRouter();

  const signUpWithEmail = async () => {
    try {
      setloading(true);
      if (!email || !password) {
        showToast("Fill all fields!");
        setloading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        showToast(error.message);
        console.log(error);
        return;
      }
      showToast("Account created! Please sign in to continue.");
      router.replace("/signin");
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };
  return (
    <SafeAreaView>
      <View className="p-5">
        {/* <View className="gap-3 mb-4">
          <Text className="text-xl">Full Name</Text>
          <TextInput
            value={fullname}
            onChangeText={(text) => setFullName(text)}
            className="bg-surface border border-secondary rounded-lg shadow-sm p-4"
            placeholder="John Doe"
          />
        </View> */}
        <View className="gap-3 mb-4">
          <Text className="text-xl">Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            className="bg-surface border border-secondary rounded-lg shadow-sm p-4"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {/* <View className="gap-3 mb-4">
          <Text className="text-xl">Organization</Text>
          <TextInput
            value={organization}
            onChangeText={(text) => setOrganization(text)}
            className="bg-surface border border-secondary rounded-lg shadow-sm p-4"
            placeholder="Your Company"
          />
        </View> */}
        <View className="gap-3 mb-4">
          <Text className="text-xl">Password</Text>
          <TextInput
            className="bg-surface border border-secondary rounded-lg shadow-sm p-4 pr-12"
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
          className={`${loading ? "bg-gray-400" : "bg-primary"} p-5 rounded-[15px]`}
          onPress={() => signUpWithEmail()}
          disabled={loading}
        >
          {loading ? (
            <Text className="text-white text-center">Loading...</Text>
          ) : (
            <Text className="text-white text-center">Create Account</Text>
          )}
        </TouchableOpacity>
        <View className="flex flex-row mt-6 justify-center">
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text className="text-blue-700 text-[15px]">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default signup;
