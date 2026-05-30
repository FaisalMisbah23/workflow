import { NotificationContext } from "@/context/NotificationContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  task_id?: string;
  read: boolean;
  created_at: string;
}

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const router = useRouter();

  const getIconName = (type: string): React.ComponentProps<typeof Ionicons>['name'] => {
    switch (type) {
      case "task_assigned":
        return "clipboard-outline";
      case "task_completed":
        return "checkmark-circle-outline";
      case "deadline_missed":
        return "alert-circle-outline";
      default:
        return "notifications-outline";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "#3b82f6";
      case "task_completed":
        return "#22c55e";
      case "deadline_missed":
        return "#ef4444";
      default:
        return "#666";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Notifications</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text className="text-primary text-sm">Mark all read</Text>
          </TouchableOpacity>
        </View>: Notification
      </View>

      <ScrollView className="flex-1">
        {notifications.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
            <Text className="text-gray-400 mt-4 text-lg">No notifications</Text>
          </View>
        ) : (
          notifications.map((notification: Notification) => (
            <TouchableOpacity
              key={notification.id}
              className={`p-4 border-b border-gray-100 ${
                notification.read ? "bg-white" : "bg-blue-50"
              }`}
              onPress={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
                if (notification.task_id) {
                  router.push("/task");
                }
              }}
            >
              <View className="flex-row items-start">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: getIconColor(notification.type) + "20" }}
                >
                  <Ionicons
                    name={getIconName(notification.type)}
                    size={20}
                    color={getIconColor(notification.type)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-base">
                    {notification.title}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    {notification.message}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </Text>
                </View>
                {!notification.read && (
                  <View className="w-2 h-2 rounded-full bg-primary mt-2" />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;
