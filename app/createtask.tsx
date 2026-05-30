import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    const { ToastAndroid } = require("react-native");
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

const defaultGetAssignableUsers = () => [];
const defaultCanAssignTask = () => true;
const defaultTeamMembers: any[] = [];

const isPermissionError = (error: any) => {
  const message = error?.message?.toLowerCase?.() || "";
  return (
    error?.code === "42501" ||
    message.includes("permission") ||
    message.includes("row-level security")
  );
};

const CreateTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignTo, setAssignTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [date, setDate] = useState<Date | null>(null);
  const [show, setShow] = useState(false);
  const router = useRouter();
  const {
    user,
    profile,
    isAdmin,
    isLead,
    teamMembers = defaultTeamMembers,
    getAssignableUsers = defaultGetAssignableUsers,
    canAssignTask = defaultCanAssignTask,
  } = useContext(UserContext);

  useEffect(() => {
    if (profile) {
      const users = getAssignableUsers();
      setAssignableUsers(users);
    }
  }, [profile, teamMembers]);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      showToast("Please enter task title");
      return;
    }

    if (deadline) {
      const selectedDeadline = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(selectedDeadline.getTime())) {
        showToast("Please enter a valid deadline");
        return;
      }

      if (selectedDeadline < today) {
        showToast("Deadline cannot be in the past");
        return;
      }
    }

    try {
      setLoading(true);

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        showToast("User not authenticated");
        return;
      }

      // Validate assignment hierarchy
      if (assignTo && !canAssignTask(assignTo)) {
        showToast("You cannot assign tasks to this user (hierarchy violation)");
        setLoading(false);
        return;
      }

      const selectedAssignee = assignableUsers.find(
        (item: any) => item.id === assignTo || item.email === assignTo,
      ) as any;

      const normalizedAssignTo = assignTo?.trim?.() || "";
      const selectedAssigneeId =
        selectedAssignee?.id ||
        (normalizedAssignTo && !normalizedAssignTo.includes("@")
          ? normalizedAssignTo
          : null);
      const selectedAssigneeEmail =
        selectedAssignee?.email ||
        (normalizedAssignTo && normalizedAssignTo.includes("@")
          ? normalizedAssignTo.toLowerCase()
          : null);

      if (assignTo && !selectedAssignee) {
        showToast("Selected user is no longer available in this organization");
        return;
      }

      if (
        selectedAssignee?.org_id &&
        profile?.org_id &&
        selectedAssignee.org_id !== profile.org_id
      ) {
        showToast("Selected user is no longer part of this organization");
        return;
      }

      const duplicateQuery = supabase
        .from("tasks")
        .select("id")
        .eq("title", title.trim())
        .neq("status", "completed")
        .limit(1);

      if (profile?.org_id) {
        duplicateQuery.eq("org_id", profile.org_id);
      } else {
        duplicateQuery.eq("created_by", currentUser.id);
      }

      const { data: duplicateTasks, error: duplicateError } =
        await duplicateQuery;

      if (duplicateError) {
        if (isPermissionError(duplicateError)) {
          showToast("You do not have permission to check duplicate tasks");
        } else {
          showToast(duplicateError.message);
        }
        return;
      }

      if (duplicateTasks && duplicateTasks.length > 0) {
        showToast("A task with this title already exists");
        return;
      }

      const { data: createdTask, error } = await supabase
        .from("tasks")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          assigned_to: selectedAssigneeEmail,
          assigned_to_user_id: selectedAssigneeId,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          status: "pending",
          created_by: currentUser.id,
          org_id: profile?.org_id || null,
        })
        .select("id, title")
        .single();

      if (error) {
        if (isPermissionError(error)) {
          showToast("You do not have permission to create this task");
        } else {
          showToast(error.message);
        }
        console.log("Task creation error:", error);
        return;
      }

      // Dispatch email/push channels via edge function.
      // In-app notifications are generated by DB triggers.
      const notificationUserId = selectedAssigneeId || null;
      if (notificationUserId) {
        const notificationPayload = {
          userId: notificationUserId,
          title: "New Task Assigned",
          message: `You have been assigned to task: ${createdTask.title}`,
          type: "task_assigned",
          taskId: createdTask.id,
        };

        const { error: notifyError } = await supabase.functions.invoke(
          "send-notification",
          {
            body: notificationPayload,
          },
        );

        if (notifyError) {
          console.log("Notification dispatch error:", notifyError);
        }
      }

      showToast("Task created successfully");
      router.back();
    } catch (err) {
      console.log(err);
      showToast("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
      setDeadline(selectedDate);
    }
  };

  const formattedDate = date ? date.toDateString() : "Select date";
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-5">
        <View>
          <Text className="text-xl text-secondary font-bold">
            Add a new task to your workflow
          </Text>
        </View>

        <View className="mt-3">
          <Text className="text-lg text-secondary">Task Title</Text>
          <TextInput
            className="bg-slate-200 border border-black rounded-lg p-5 py-3"
            placeholder="Enter task title"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mt-3">
          <Text className="text-lg text-secondary">Description</Text>
          <TextInput
            multiline={true}
            numberOfLines={4}
            className="bg-slate-200 border border-black rounded-lg p-5 py-3"
            placeholder="Describe the task"
            style={{ textAlignVertical: "top" }}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="mt-3">
          <Text className="text-lg text-secondary">Priority</Text>
          <View className="border border-gray-300 rounded-lg bg-slate-200">
            <Picker
              selectedValue={priority}
              onValueChange={(itemValue) => setPriority(itemValue)}
            >
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
          </View>
        </View>

        <View className="mt-3">
          <Text className="text-lg text-secondary">
            Assign To {profile?.role === "member" && "(Self only)"}
          </Text>
          <View className="border border-gray-300 rounded-lg bg-slate-200">
            <Picker
              selectedValue={assignTo}
              onValueChange={(itemValue) => setAssignTo(itemValue)}
              enabled={profile?.role !== "member" || assignableUsers.length > 1}
            >
              <Picker.Item label="Select team member" value="" />
              {assignableUsers &&
                assignableUsers.map((item: any, index: number) => (
                  <Picker.Item
                    key={index}
                    label={item.fullname || item.email || "Unknown"}
                    value={item.email || item.id}
                  />
                ))}
            </Picker>
          </View>
        </View>

        <View className="mt-3">
          <Text className="text-lg text-secondary">Deadline (Optional)</Text>
          <TouchableOpacity
            onPress={() => setShow(true)}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: date ? "#000" : "#999" }}>
              {formattedDate}
            </Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={date || new Date() || deadline}
              mode="date"
              display="spinner"
              onChange={onChange}
              design="material"
            />
          )}
        </View>

        <View className="mt-3">
          <TouchableOpacity
            className={`p-4 rounded-xl ${loading ? "bg-gray-400" : "bg-primary"}`}
            onPress={handleCreateTask}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg">
              {loading ? "Creating..." : "Create Task"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateTask;
