import { ThemeContext } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import { useContext } from "react";
import { ScrollView, View } from "react-native";
import KanbanColumn from "./KanbanColumn";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  deadline: string | null;
  created_at: string;
  parent_task_id: string | null;
}

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

const KanbanBoard = ({ tasks, onStatusChange }: KanbanBoardProps) => {
  const { isDark } = useContext(ThemeContext);

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) {
        showToast(error.message, "error");
        return;
      }

      showToast(`Task moved to ${newStatus.replace("_", " ")}`, "success");
      onStatusChange?.(taskId, newStatus);
    } catch (err) {
      showToast("Failed to update task status", "error");
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4 }}
      className="flex-1"
    >
      <View className="flex-row gap-3" style={{ minWidth: "100%" }}>
        <View style={{ width: 300, flexShrink: 0 }}>
          <KanbanColumn
            title="To Do"
            tasks={pendingTasks}
            color="amber"
            onEdit={(task) => {
              // For now, tapping a card will show the edit modal in parent
            }}
          />
        </View>
        <View style={{ width: 300, flexShrink: 0 }}>
          <KanbanColumn
            title="In Progress"
            tasks={inProgressTasks}
            color="blue"
            onEdit={(task) => {
              // For now, tapping a card will show the edit modal in parent
            }}
          />
        </View>
        <View style={{ width: 300, flexShrink: 0 }}>
          <KanbanColumn
            title="Done"
            tasks={completedTasks}
            color="green"
            onEdit={(task) => {
              // For now, tapping a card will show the edit modal in parent
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default KanbanBoard;
