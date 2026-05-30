import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const showToast = (message) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      showToast("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        showToast(error.message);
        return;
      }

      showToast("Password reset email sent!");
      router.replace("/signin");
    } catch (err) {
      showToast("Error sending reset email");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <View className="mb-4 gap-3">
          <TouchableOpacity
            className={`${loading ? "bg-gray-400" : "bg-primary"} rounded-[10px] p-4`}
            onPress={handleResetPassword}
          >
            {loading ? (
              <Text className="text-center text-surface">Loading...</Text>
            ) : (
              <Text className="text-center text-surface">Send Reset Email</Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="flex flex-row mt-6 justify-center">
          <TouchableOpacity onPress={() => router.replace("/signin")}>
            <Text className="text-blue-700 text-[15px]">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;
