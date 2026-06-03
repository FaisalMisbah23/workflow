import NotificationBell from "@/components/NotificationBell";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Bounce } from "react-native-animated-spinkit";
import { SafeAreaView } from "react-native-safe-area-context";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  assigned_to_user_id?: string | null;
  deadline: string | null;
  created_at: string;
  parent_task_id: string | null;
  children?: Task[];
}

// const showToast = (message: string) => {
//   if (Platform.OS === "android") {
//     ToastAndroid.show(message, ToastAndroid.SHORT);
//   } else {
//     Alert.alert("", message);
//   }
// };

const Tasks = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editStatus, setEditStatus] = useState("pending");
  const [editDeadline, setEditDeadline] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const buttons = ["All Tasks", "Pending", "In Progress", "Completed"];
  const router = useRouter();
  const { profile, isAdmin, isLead, user, teamMembers = [] } =
    useContext(UserContext);

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

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        console.log("No user logged in");
        return;
      }

      // Build query based on role
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      // If member (not admin/lead), only fetch their assigned tasks
      if (profile?.role === "member") {
        const memberEmail = currentUser.email?.toLowerCase();
        if (memberEmail) {
          query = query.or(
            `assigned_to_user_id.eq.${currentUser.id},assigned_to.eq.${memberEmail},created_by.eq.${currentUser.id}`,
          );
        } else {
          query = query.or(
            `assigned_to_user_id.eq.${currentUser.id},created_by.eq.${currentUser.id}`,
          );
        }
      }

      const { data, error } = await query;

      if (error) {
        console.log("Fetch tasks error:", error);
        return;
      }

      setTasks(data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [profile, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, [fetchTasks]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks]),
  );

  const deleteTask = async (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("tasks")
              .delete()
              .eq("id", taskId);

            if (error) {
              showToast(error.message, "error");
              return;
            }

            showToast("Task deleted", "success");
            setTasks(tasks.filter((t) => t.id !== taskId));
          } catch (err) {
            showToast("Failed to delete task", "error");
          }
        },
      },
    ]);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditDeadline(task.deadline ? task.deadline.split("T")[0] : "");
    setEditModalVisible(true);
  };

  const updateTask = async () => {
    if (!editingTask) return;

    if (!editTitle.trim()) {
      showToast("Please enter task title", "error");
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          priority: editPriority,
          status: editStatus,
          deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
        })
        .eq("id", editingTask.id);

      if (error) {
        showToast(error.message);
        return;
      }

      showToast("Task updated");
      setEditModalVisible(false);
      fetchTasks();
    } catch (err) {
      showToast("Failed to update task");
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by status
    if (activeIndex === 1) {
      filtered = filtered.filter((t) => t.status === "pending");
    } else if (activeIndex === 2) {
      filtered = filtered.filter((t) => t.status === "in_progress");
    } else if (activeIndex === 3) {
      filtered = filtered.filter((t) => t.status === "completed");
    }

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description &&
            t.description.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    return filtered;
  };

  const getAssigneeLabel = (task: Task) => {
    const taskEmail = task.assigned_to?.trim?.() || "";
    const taskAssigneeId = task.assigned_to_user_id || null;

    const matchedAssignee = teamMembers.find((member: any) => {
      const memberEmail = member?.email?.toLowerCase?.() || "";
      return (
        (taskAssigneeId && member?.id === taskAssigneeId) ||
        (taskEmail && memberEmail === taskEmail.toLowerCase())
      );
    });

    const fullname =
      matchedAssignee?.fullname?.trim?.() ||
      (taskAssigneeId === user?.user?.id ? profile?.fullname?.trim?.() : "");

    if (fullname && taskEmail && fullname.toLowerCase() !== taskEmail.toLowerCase()) {
      return `${fullname} (${taskEmail})`;
    }

    return fullname || taskEmail || null;
  };

  const renderPriorityBadge = (priority: string) => {
    let classes = "bg-gray-50 text-gray-700 border-gray-200";
    if (priority === "High") {
      classes = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (priority === "Medium") {
      classes = "bg-amber-50 text-amber-700 border-amber-200";
    } else if (priority === "Low") {
      classes = "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    return (
      <View className={`px-2.5 py-0.5 rounded-full border ${classes}`}>
        <Text className="text-xs font-semibold">{priority}</Text>
      </View>
    );
  };

  const renderStatusBadge = (status: string) => {
    let classes = "bg-gray-50 text-gray-700 border-gray-200";
    let text = "Pending";
    if (status === "pending") {
      classes = "bg-gray-50 text-gray-600 border-gray-200";
      text = "Pending";
    } else if (status === "in_progress") {
      classes = "bg-blue-50 text-blue-700 border-blue-200";
      text = "In Progress";
    } else if (status === "completed") {
      classes = "bg-emerald-50 text-emerald-700 border-emerald-200";
      text = "Completed";
    }
    return (
      <View className={`px-2.5 py-0.5 rounded-full border ${classes} ml-2`}>
        <Text className="text-xs font-semibold">{text}</Text>
      </View>
    );
  };

  const buildTreeStructure = (flatTasks: Task[]): Task[] => {
    const taskMap = new Map<string, Task>();
    const rootTasks: Task[] = [];

    // Create map of all tasks
    flatTasks.forEach((task) => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Build tree structure
    flatTasks.forEach((task) => {
      const taskNode = taskMap.get(task.id);
      if (!taskNode) return;

      if (task.parent_task_id) {
        const parent = taskMap.get(task.parent_task_id);
        if (parent && parent.children) {
          parent.children.push(taskNode);
        }
      } else {
        rootTasks.push(taskNode);
      }
    });

    return rootTasks;
  };

  const toggleNode = (taskId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedNodes(newExpanded);
  };

  const filteredTasks = getFilteredTasks();
  const treeTasks =
    viewMode === "tree" ? buildTreeStructure(filteredTasks) : filteredTasks;

  const TaskTreeNode = ({
    task,
    level = 0,
  }: {
    task: Task;
    level?: number;
  }) => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedNodes.has(task.id);

    return (
      <View key={task.id}>
        <View
          className="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-200"
          style={{ marginLeft: level * 16 }}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 flex-row items-center">
              {hasChildren && (
                <TouchableOpacity
                  onPress={() => toggleNode(task.id)}
                  className="mr-2"
                >
                  <Ionicons
                    name={isExpanded ? "chevron-down" : "chevron-forward"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              )}
              <View className="flex-1">
                <Text className="text-base font-semibold">{task.title}</Text>
                {task.description && (
                  <Text className="text-gray-600 mt-1 text-sm">
                    {task.description}
                  </Text>
                )}
                <View className="flex-row mt-2 items-center">
                  {renderPriorityBadge(task.priority)}
                  {renderStatusBadge(task.status)}
                </View>
                {getAssigneeLabel(task) && (
                  <Text className="text-gray-500 text-xs mt-1">
                    Assigned to: {getAssigneeLabel(task)}
                  </Text>
                )}
                {task.deadline && (
                  <Text className="text-orange-600 text-xs mt-1">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => openEditModal(task)}
                className="p-2"
              >
                <Ionicons name="create-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteTask(task.id)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {isExpanded && hasChildren && (
          <View>
            {task.children?.map((child) => (
              <TaskTreeNode key={child.id} task={child} level={level + 1} />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-5 flex-1">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-semibold">Tasks</Text>
          <View className="flex-row items-center">
            <NotificationBell />
            <TouchableOpacity
              className="flex-row gap-2 bg-gray-100 px-3 py-2 rounded-lg ml-3 items-center"
              onPress={() => setViewMode(viewMode === "list" ? "tree" : "list")}
            >
              <Ionicons
                name={
                  viewMode === "list" ? "list-outline" : "git-network-outline"
                }
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row gap-2 bg-primary px-4 py-2 rounded-lg ml-2 items-center"
              onPress={() => router.push("/createtask")}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium">Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center border border-gray-200 bg-gray-100 px-3 rounded-lg mb-4">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-base bg-transparent border-0 outline-none"
            placeholder="Search tasks..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="p-1"
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {buttons.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <TouchableOpacity
                onPress={() => setActiveIndex(index)}
                key={index}
                className={`rounded-lg px-4 py-2 mr-3 ${
                  isActive
                    ? "bg-primary"
                    : "bg-transparent border border-primary"
                }`}
              >
                <Text
                  className={`text-base ${isActive ? "text-white" : "text-primary"}`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          className="mt-4"
          // refreshControl={
          //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          // }
        >
          {treeTasks.length === 0 ? (
            <View className=" items-center justify-center">
              <Ionicons name="clipboard-outline" size={60} color="#ccc" />
              <Text className="text-gray-400 mt-4 text-lg">No tasks found</Text>
            </View>
          ) : viewMode === "tree" ? (
            treeTasks.map((task) => <TaskTreeNode key={task.id} task={task} />)
          ) : (
            filteredTasks.map((task) => (
              <View
                key={task.id}
                className="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-200"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-base font-semibold">
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text className="text-gray-600 mt-1 text-sm">
                        {task.description}
                      </Text>
                    )}
                    <View className="flex-row mt-2 items-center">
                      {renderPriorityBadge(task.priority)}
                      {renderStatusBadge(task.status)}
                    </View>
                    {getAssigneeLabel(task) && (
                      <Text className="text-gray-500 text-xs mt-1">
                        Assigned to: {getAssigneeLabel(task)}
                      </Text>
                    )}
                    {task.deadline && (
                      <Text className="text-orange-600 text-xs mt-1">
                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row">
                    <TouchableOpacity
                      onPress={() => openEditModal(task)}
                      className="p-2"
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTask(task.id)}
                      className="p-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Edit Task</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Title
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Task title"
            />

            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Description
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Task description"
              multiline
              numberOfLines={3}
            />

            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Priority
            </Text>
            <View className="border border-gray-300 rounded-lg mb-3">
              <Picker
                selectedValue={editPriority}
                onValueChange={(itemValue) => setEditPriority(itemValue)}
              >
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>

            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Status
            </Text>
            <View className="border border-gray-300 rounded-lg mb-3">
              <Picker
                selectedValue={editStatus}
                onValueChange={(itemValue) => setEditStatus(itemValue)}
              >
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="In Progress" value="in_progress" />
                <Picker.Item label="Completed" value="completed" />
              </Picker>
            </View>

            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Deadline
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
              value={editDeadline}
              onChangeText={setEditDeadline}
              placeholder="YYYY-MM-DD"
            />

            <TouchableOpacity
              className="bg-primary p-4 rounded-xl"
              onPress={updateTask}
            >
              <Text className="text-white text-center font-semibold text-base">
                Update Task
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Tasks;
