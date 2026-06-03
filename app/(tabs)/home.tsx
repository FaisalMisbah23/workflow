import DashboardData from "@/components/DashboardData";
import { UserContext } from "@/context/UserContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Bounce } from "react-native-animated-spinkit";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { user, profile } = useContext(UserContext) as any;

  if (!user) {
    return (
      <SafeAreaView>
        <Bounce
          size={45}
          color="blue"
          className="flex items-center justify-center text-center mx-auto"
        />
      </SafeAreaView>
    );
  }
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
  const router = useRouter();

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

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4">
          <View className="mb-4 rounded-3xl bg-slate-900 p-5">
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xs uppercase tracking-widest text-slate-300">
                  {formattedDate}
                </Text>
                <Text className="mt-1 text-2xl font-bold text-white">
                  {greeting}
                </Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <Text className="text-base font-semibold text-white">
                  {initials}
                </Text>
              </View>
            </View>

            <View className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <Text className="text-sm font-medium text-white">
                Here is your workflow overview
              </Text>
              <Text className="mt-1 text-xs text-slate-200">
                Track progress, deadlines, and team activity from one place.
              </Text>
            </View>
          </View>
        </View>

        <DashboardData />

        <View className="mx-5 mt-5 rounded-3xl border border-slate-200 bg-white p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-slate-900">
                Quick Actions
              </Text>
              <Text className="text-sm text-slate-500">
                Jump into your most-used flows
              </Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Ionicons name="flash-outline" size={18} color="#0F172A" />
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            <TouchableOpacity
              className="w-[48%] rounded-2xl bg-blue-600 px-4 py-4"
              onPress={() => router.push("/createtask")}
            >
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="add" size={20} color="white" />
              </View>
              <Text className="text-base font-semibold text-white">
                New Task
              </Text>
              <Text className="mt-1 text-xs text-blue-100">
                Create and assign work
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] rounded-2xl bg-emerald-600 px-4 py-4"
              onPress={() => router.push("/voice")}
            >
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="mic" size={18} color="white" />
              </View>
              <Text className="text-base font-semibold text-white">
                Voice AI
              </Text>
              <Text className="mt-1 text-xs text-emerald-100">
                Create tasks by speaking
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] rounded-2xl bg-violet-600 px-4 py-4"
              onPress={() => router.push("/createtask")}
            >
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="flag-outline" size={18} color="white" />
              </View>
              <Text className="text-base font-semibold text-white">
                High Priority
              </Text>
              <Text className="mt-1 text-xs text-violet-100">
                Capture urgent tasks fast
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] rounded-2xl bg-slate-800 px-4 py-4"
              onPress={() => router.push("/(tabs)/team")}
            >
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="people-outline" size={18} color="white" />
              </View>
              <Text className="text-base font-semibold text-white">Team</Text>
              <Text className="mt-1 text-xs text-slate-300">
                Review members and roles
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
