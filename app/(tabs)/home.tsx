import DashboardData from "@/components/DashboardData";
import { UserContext } from "@/context/UserContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { user, profile } = useContext(UserContext) as any;
  const router = useRouter();

  const getInitials = () => {
    if (profile?.fullname) {
      const parts = profile.fullname.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return profile.fullname.slice(0, 2).toUpperCase();
    }
    return user?.user?.email?.slice(0, 2).toUpperCase() || "";
  };
  const initials = getInitials();
  const hour = new Date().getHours();

  let greeting = "";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Welcome to Workflow";
  }
  return (
    <SafeAreaView>
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-4xl font-semibold ">{greeting}</Text>
          <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
            <Text className="text-white text-center font-semibold">
              {initials}
            </Text>
          </View>
        </View>
        <Text className="text-gray-600 text-base mb-4">
          Here's your workflow overview
        </Text>
      </View>
      <View>
        <DashboardData />
      </View>
      <View className="flex-row justify-between items-center bg-primary p-5 mx-4 rounded-xl mb-4">
        <View className="flex-1">
          <Text className="font-bold text-lg text-white">Quick Actions</Text>
          <Text className="text-gray-200 text-sm">Get things done faster</Text>
        </View>
        <View className="ml-4">
          <TouchableOpacity
            className="flex-row items-center gap-2 bg-white/20 px-4 py-2 rounded-lg"
            onPress={() => router.push("/createtask")}
          >
            <Ionicons name="add" size={20} color={"white"} />
            <Text className="text-white font-medium">New Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;
