import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-url-polyfill/auto";

export default function Index() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView className="flex-1 items-center justify-center dark:bg-gray-900">
      <View className="flex-column gap-3 items-center mb-[80px]">
        <Ionicons
          name="checkmark-circle-outline"
          size={60}
          className="bg-[#b3b3b6] dark:bg-white p-3 w-[20%] rounded-xl opacity-50"
          color={colorScheme === "dark" ? "#fff" : "#000"}
        />
        <Text className="text-[35px] font-bold dark:text-white">Workflow</Text>
        <Text className="text-secondary dark:text-white">
          Smart Tracking for Organizations
        </Text>
      </View>
      <View className="relative bottom-10 flex-column gap-3">
        <View className="flex-row gap-3 items-center">
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
          <Text className="dark:text-white">
            Track tasks and projects in real-time
          </Text>
        </View>
      </View>
      <View className="p-3 gap-4">
        <TouchableOpacity
          className="bg-primary dark:bg-secondary p-4 rounded-xl w-[200px]"
          onPress={() => router.push("/signup")}
        >
          <Text className="text-surface text-center">
            Get Started <Ionicons name="arrow-forward" size={15} />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-primary dark:border-secondary p-4 rounded-xl w-[200px] "
          onPress={() => router.push("/signin")}
        >
          <Text className="text-center dark:text-white">
            Sign In <Ionicons name="arrow-forward" size={15} />
          </Text>
        </TouchableOpacity>
      </View>
      <View className="relative items-center justify-center w-[70%]">
        <Text className="text-center text-secondary dark:text-tertiary top-[150px]">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}
