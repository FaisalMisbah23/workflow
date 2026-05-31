import { NotificationContext } from "@/context/NotificationContext";
import { UserContext } from "@/context/UserContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useMemo, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Bounce } from "react-native-animated-spinkit";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useContext(NotificationContext);
  const [filterType, setFilterType] = useState<"all" | "unread">("all");
  const [filterCategory, setFilterCategory] = useState<
    "all" | "task_assigned" | "deadline_reminder" | "team_invite" | "comment"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(UserContext);

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

  useFocusEffect(
    useCallback(() => {
      if (fetchNotifications) {
        fetchNotifications();
      }
    }, [fetchNotifications]),
  );

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification: Notification) => {
      const matchesSearch =
        notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === "all" || (filterType === "unread" && !notification.read);

      const matchesCategory =
        filterCategory === "all" || notification.type === filterCategory;

      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [notifications, searchQuery, filterType, filterCategory]);

  // Group notifications by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    filteredNotifications.forEach((notification: Notification) => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        groups.Today.push(notification);
      } else if (date.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(notification);
      } else {
        groups.Earlier.push(notification);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "clipboard-outline";
      case "deadline_reminder":
        return "time-outline";
      case "team_invite":
        return "people-outline";
      case "comment":
        return "chatbubble-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "#3B82F6";
      case "deadline_reminder":
        return "#EF4444";
      case "team_invite":
        return "#10B981";
      case "comment":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      {/* Header */}
      <View className="border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="bg-blue-500 px-4 py-2 rounded-full"
            >
              <Text className="text-white text-sm font-medium">
                Mark all as read
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base bg-transparent border-0 outline-none"
            placeholder="Search notifications..."
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

        {/* Filter Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setFilterType("all")}
            className={`flex-1 py-2 rounded-lg ${filterType === "all" ? "bg-blue-500" : "bg-gray-200"}`}
          >
            <Text
              className={`text-center font-medium ${filterType === "all" ? "text-white" : "text-gray-700"}`}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterType("unread")}
            className={`flex-1 py-2 rounded-lg ${filterType === "unread" ? "bg-blue-500" : "bg-gray-200"}`}
          >
            <Text
              className={`text-center font-medium ${filterType === "unread" ? "text-white" : "text-gray-700"}`}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#D1D5DB"
            />
            <Text className="text-gray-500 mt-4 text-lg">No notifications</Text>
            <Text className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? "Try a different search term"
                : "You're all caught up!"}
            </Text>
          </View>
        ) : (
          <View className="p-4">
            {filteredNotifications.map((notification: Notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() =>
                  !notification.read && markAsRead(notification.id)
                }
                className={`p-4 rounded-xl mb-3 ${notification.read ? "bg-gray-50" : "bg-blue-50 border-l-4 border-blue-500"}`}
              >
                <View className="flex-row items-start">
                  {/* Icon */}
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor:
                        getNotificationColor(notification.type) + "20",
                    }}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={20}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <Text
                        className={`font-semibold text-base ${notification.read ? "text-gray-700" : "text-gray-900"}`}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2" />
                      )}
                    </View>
                    <Text className="text-gray-600 text-sm mt-1">
                      {notification.message}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-2">
                      {notification.created_at &&
                        formatTimeAgo(notification.created_at)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;
