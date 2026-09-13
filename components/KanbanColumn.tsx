import { ThemeContext } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useContext } from "react";
import { ScrollView, Text, View } from "react-native";
import KanbanCard from "./KanbanCard";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  deadline: string | null;
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  color: string;
  onEdit?: (task: Task) => void;
}

const KanbanColumn = ({ title, tasks, color, onEdit }: KanbanColumnProps) => {
  const { isDark } = useContext(ThemeContext);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "amber":
        return {
          header: "bg-amber-500",
          text: "text-amber-600",
          bg: isDark ? "bg-amber-900/20" : "bg-amber-50",
        };
      case "blue":
        return {
          header: "bg-blue-500",
          text: "text-blue-600",
          bg: isDark ? "bg-blue-900/20" : "bg-blue-50",
        };
      case "green":
        return {
          header: "bg-emerald-500",
          text: "text-emerald-600",
          bg: isDark ? "bg-emerald-900/20" : "bg-emerald-50",
        };
      default:
        return {
          header: "bg-gray-500",
          text: "text-gray-600",
          bg: isDark ? "bg-gray-900/20" : "bg-gray-50",
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <View className={`flex-1 ${isDark ? "bg-slate-800" : "bg-slate-50"} rounded-xl`}>
      {/* Column Header */}
      <View className={`flex-row items-center justify-between p-3 rounded-t-xl ${colorClasses.header}`}>
        <Text className="text-white font-semibold text-sm">{title}</Text>
        <View className="h-6 w-6 rounded-full bg-white/20 items-center justify-center">
          <Text className="text-white text-xs font-bold">{tasks.length}</Text>
        </View>
      </View>

      {/* Task List */}
      <ScrollView
        className="p-2 flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        {tasks.length === 0 ? (
          <View className={`items-center justify-center py-8 ${colorClasses.bg} rounded-lg`}>
            <Ionicons name="document-text-outline" size={24} color={isDark ? "#64748b" : "#9CA3AF"} />
            <Text className={`text-xs mt-2 ${isDark ? "text-slate-500" : "text-gray-400"}`}>
              No tasks
            </Text>
          </View>
        ) : (
          tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onEdit={onEdit} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default KanbanColumn;
