import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import React, { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";

const Card = () => {
  const { user, teamMembers } = useContext(UserContext) as any;
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [activeTasks, setActiveTasks] = useState<number>(0);

  useEffect(() => {
    if (!user?.user?.id) return;

    const fetchStats = async () => {
      const [completedRes, activeRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("assigned_to_user_id", user.user.id)
          .eq("status", "completed"),
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("assigned_to_user_id", user.user.id)
          .in("status", ["pending", "in_progress"]),
      ]);

      setCompletedTasks(completedRes.count ?? 0);
      setActiveTasks(activeRes.count ?? 0);
    };

    fetchStats();
  }, [user]);

  const total = completedTasks + activeTasks;
  const successRate = total > 0 ? Math.round((completedTasks / total) * 100) : 0;
  const hasTeamMembers = (teamMembers?.length ?? 0) > 0;

  return (
    <View className="p-3 flex-row gap-5 flex-wrap">
      <View className="flex-row justify-center w-[47%] bg-gray-200 p-4 rounded-xl">
        <View className="gap-2">
          <Text className="text-xl font-bold text-center">{hasTeamMembers ? completedTasks : "—"}</Text>
          <Text className="text-xl text-secondary">Completed Task</Text>
        </View>
      </View>
      <View className="flex-row justify-center w-[46%] bg-gray-200 p-4 rounded-xl">
        <View className="gap-2 ">
          <Text className="text-xl font-bold text-center">{hasTeamMembers ? activeTasks : "—"}</Text>
          <Text className="text-xl text-secondary text-center">
            Active Task
          </Text>
        </View>
      </View>
      <View className="flex-row justify-center w-[46%] bg-gray-200 p-4 rounded-xl">
        <View className="gap-2">
          <Text className="text-xl font-bold text-center">{teamMembers?.length ?? 0}</Text>
          <Text className="text-xl text-secondary">Team Members</Text>
        </View>
      </View>
      <View className="flex-row justify-center w-[46%] bg-gray-200 p-4 rounded-xl">
        <View className="gap-2">
          <Text className="text-xl font-bold text-center">{hasTeamMembers ? `${successRate}%` : "—"}</Text>
          <Text className="text-xl text-secondary">Success Rate</Text>
        </View>
      </View>
    </View>
  );
};

export default Card;
