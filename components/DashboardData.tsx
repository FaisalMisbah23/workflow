import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { Text, View } from "react-native";

interface UpcomingDeadline {
  id: string;
  title: string;
  priority: string | null;
  deadline: string;
}

const DashboardData = () => {
  const { user, teamMembers } = useContext(UserContext) as any;
  const [activeTasks, setActiveTasks] = useState<number>(0);
  const [overdueTasks, setOverdueTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<
    UpcomingDeadline[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.user?.id) return;

      const fetchStats = async () => {
        const now = new Date().toISOString();
        const userId = user.user.id;
        const userEmail = user.user.email?.toLowerCase() || "";

        // Build OR filter: assigned_to_user_id OR assigned_to (email) OR created_by
        const orFilter = `assigned_to_user_id.eq.${userId},assigned_to.eq.${userEmail},created_by.eq.${userId}`;

        const [activeRes, overdueRes, completedRes, upcomingRes] =
          await Promise.all([
            supabase
              .from("tasks")
              .select("id", { count: "exact", head: true })
              .or(orFilter)
              .in("status", ["pending", "in_progress"]),
            supabase
              .from("tasks")
              .select("id", { count: "exact", head: true })
              .or(orFilter)
              .neq("status", "completed")
              .lt("deadline", now),
            supabase
              .from("tasks")
              .select("id", { count: "exact", head: true })
              .or(orFilter)
              .eq("status", "completed"),
            supabase
              .from("tasks")
              .select("id, title, priority, deadline")
              .or(orFilter)
              .neq("status", "completed")
              .not("deadline", "is", null)
              .gte("deadline", now)
              .order("deadline", { ascending: true })
              .limit(5),
          ]);

        console.log("Dashboard fetch - Active tasks:", activeRes);
        console.log("Dashboard fetch - User ID:", userId);
        console.log("Dashboard fetch - User Email:", userEmail);

        setActiveTasks(activeRes.count ?? 0);
        setOverdueTasks(overdueRes.count ?? 0);
        setCompletedTasks(completedRes.count ?? 0);
        setUpcomingDeadlines((upcomingRes.data as UpcomingDeadline[]) ?? []);
      };

      fetchStats();
    }, [user]),
  );

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="px-5 pb-5">
      <View className="flex-row gap-5 flex-wrap">
        <View className="flex-row justify-between w-[48%] rounded-3xl border border-blue-100 bg-blue-50 p-4">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-blue-700">
              Active Task
            </Text>
            <Text className="text-2xl font-bold text-blue-950">
              {activeTasks}
            </Text>
          </View>
          <View className="mt-1 h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#2563EB"
            />
          </View>
        </View>
        <View className="flex-row justify-between w-[46%] rounded-3xl border border-rose-100 bg-rose-50 p-4">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-rose-700">Overdue</Text>
            <Text className="text-2xl font-bold text-rose-950">
              {overdueTasks}
            </Text>
          </View>
          <View className="mt-1 h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="alert-circle-outline" size={24} color="#E11D48" />
          </View>
        </View>
        <View className="flex-row justify-between w-[48%] rounded-3xl border border-violet-100 bg-violet-50 p-4">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-violet-700">
              Team Members
            </Text>
            <Text className="text-2xl font-bold text-violet-950">
              {teamMembers?.length ?? 0}
            </Text>
          </View>
          <View className="mt-1 h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="people-outline" size={24} color="#7C3AED" />
          </View>
        </View>
        <View className="flex-row justify-between w-[46%] rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-emerald-700">
              Completed
            </Text>
            <Text className="text-2xl font-bold text-emerald-950">
              {completedTasks}
            </Text>
          </View>
          <View className="mt-1 h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="trending-up" size={24} color="#059669" />
          </View>
        </View>
      </View>

      <View className="mt-5 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm shadow-black/5">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-lg font-bold text-gray-900">
              Upcoming Deadlines
            </Text>
            <Text className="text-sm text-gray-500">
              The next items needing attention
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
            <Ionicons name="calendar-outline" size={22} color="#374151" />
          </View>
        </View>

        {upcomingDeadlines.length > 0 ? (
          upcomingDeadlines.map((task) => (
            <View
              key={task.id}
              className="flex-row items-center justify-between border-t border-gray-100 py-3"
            >
              <View className="flex-1 pr-3">
                <Text className="font-semibold text-base text-gray-900">
                  {task.title}
                </Text>
                <Text className="text-sm text-gray-500">
                  {task.priority ?? "Medium"} priority
                </Text>
              </View>
              <Text className="text-sm font-medium text-gray-600">
                {formatDeadline(task.deadline)}
              </Text>
            </View>
          ))
        ) : (
          <View className="items-center rounded-2xl bg-gray-50 px-4 py-6">
            <Ionicons name="sparkles-outline" size={22} color="#6B7280" />
            <Text className="mt-2 text-center text-sm text-gray-500">
              No upcoming deadlines.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default DashboardData;
