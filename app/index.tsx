import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-url-polyfill/auto";
export default function Index() {
  const router = useRouter();

  return (
    <>
      <SafeAreaView className="flex-1 items-center justify-center">
        <View className="flex-column gap-3 items-center mb-[80px]">
          <Ionicons
            name="checkmark-circle-outline"
            size={60}
            className="bg-[#b3b3b6] p-3 w-[20%] rounded-xl opacity-50"
          />
          <Text className="text-[35px] font-bold">Workflow</Text>
          <Text className="text-secondary">
            Smart Tracking for Organizations
          </Text>
        </View>
        <View className="relative bottom-10 flex-column gap-3">
          <View className="flex-row gap-5">
            <Ionicons name="checkmark-circle-outline" size={20} />
            <Text>Track tasks and projects in real-time</Text>
          </View>
        </View>
        <View className="p-3 gap-4">
          <TouchableOpacity
            className="bg-primary p-4 rounded-xl w-[200px]"
            onPress={() => router.push("/signup")}
          >
            <Text className="text-surface text-center">
              Get Started <Ionicons name="arrow-forward" size={15} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border  p-4 rounded-xl w-[200px] "
            onPress={() => router.push("/signin")}
          >
            <Text className="text-center">
              Sign In <Ionicons name="arrow-forward" size={15} />
            </Text>
          </TouchableOpacity>
        </View>
        <View className="relative items-center justify-center">
          <Text className="text-center text-secondary top-[115px]">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}
