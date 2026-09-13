import { ThemeContext } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  deadline: string | null;
}

interface KanbanCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

const KanbanCard = ({ task, onEdit }: KanbanCardProps) => {
  const { isDark } = useContext(ThemeContext);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-rose-100 text-rose-700";
      case "Medium":
        return "bg-amber-100 text-amber-700";
      case "Low":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInitials = (email: string | null) => {
    if (!email) return "?";
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity
      className={`p-3 rounded-xl mb-2 border ${isDark ? "bg-slate-700 border-slate-600" : "bg-white border-gray-200"}`}
      onPress={() => onEdit?.(task)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text
          className={`text-sm font-semibold flex-1 mr-2 ${isDark ? "text-white" : "text-gray-900"}`}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
          <Text className="text-xs font-medium">{task.priority}</Text>
        </View>
      </View>

      {task.description && (
        <Text
          className={`text-xs mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
          numberOfLines={2}
        >
          {task.description}
        </Text>
      )}

      <View className="flex-row justify-between items-center">
        {task.deadline && (
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={12} color={isDark ? "#94a3b8" : "#6B7280"} />
            <Text className={`text-xs ml-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              {new Date(task.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        )}

        {task.assigned_to && (
          <View className="h-6 w-6 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-xs font-medium">
              {getInitials(task.assigned_to)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default KanbanCard;
