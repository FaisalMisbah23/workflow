import { NotificationContext } from "@/context/NotificationContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const NotificationBell = () => {
  const { unreadCount = 0 } = useContext(NotificationContext) || {};
  const router = useRouter();

  return (
    <TouchableOpacity
      testID="notification-bell"
      onPress={() => router.push("/notifications")}
      className="relative p-2"
    >
      <Ionicons name="notifications-outline" size={24} color="#333" />
      {unreadCount > 0 && (
        <View testID="unread-badge" className="absolute top-0 right-0 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell;
