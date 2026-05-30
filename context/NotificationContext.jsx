import { supabase } from "@/lib/supabase";
import NetInfo from "@react-native-community/netinfo";
import * as Device from "expo-device";
import { useFocusEffect, useRouter } from "expo-router";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

// Conditional import for expo-notifications to support Expo Go
let Notifications = null;
try {
  Notifications = require("expo-notifications");
  if (Notifications.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (error) {
  console.log("expo-notifications not available (Expo Go doesn't support push notifications)");
}

const showToast = (message) => {
  if (Platform.OS === "android") {
    const { ToastAndroid } = require("react-native");
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

export const NotificationContext = createContext();

const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [subscriptionError, setSubscriptionError] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pushToken, setPushToken] = useState(null);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch notifications error:", error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.filter((n) => !n.read).length || 0);
    setSubscriptionError(false);
  };

  // Check for duplicate notification
  const isDuplicateNotification = async (userId, type, taskId) => {
    if (!userId) return false;

    const { data, error } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("task_id", taskId)
      .eq("read", false)
      .limit(1);

    if (error) {
      console.log("Duplicate check error:", error);
      return false;
    }

    return data && data.length > 0;
  };

  // Create notification with duplicate prevention
  const createNotification = async (notificationData) => {
    const { user_id, type, task_id } = notificationData;

    if (task_id) {
      const duplicate = await isDuplicateNotification(user_id, type, task_id);
      if (duplicate) {
        console.log("Duplicate notification prevented:", type, task_id);
        return { success: false, error: "Duplicate notification" };
      }
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.log("Create notification error:", error);
      return { success: false, error };
    }

    // Send push notification if user is offline
    if (!isOnline) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("push_token")
          .eq("id", user_id)
          .single();

        if (profile?.push_token) {
          await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: profile.push_token,
              sound: "default",
              title: notificationData.title,
              body: notificationData.message,
              data: { task_id, type },
            }),
          });
        }
      } catch (pushError) {
        console.log("Push notification error:", pushError);
      }
    }

    return { success: true, data };
  };

  // Subscribe to new notifications
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast for new notification
          showToast(newNotification.title);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIPTION_ERROR" || status === "TIMED_OUT") {
          console.log("Notification subscription error:", status);
          setSubscriptionError(true);
        } else if (status === "SUBSCRIBED") {
          setSubscriptionError(false);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // Refetch notifications on app focus (realtime fallback)
  useFocusEffect(
    useCallback(() => {
      if (userId && subscriptionError) {
        fetchNotifications();
      }
    }, [userId, subscriptionError])
  );

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);

      if (state.isConnected && userId) {
        fetchNotifications();
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Register for push notifications (mobile only)
  useEffect(() => {
    const registerForPushNotifications = async () => {
      // Skip if Notifications not available (Expo Go)
      if (!Notifications) {
        console.log("Push notifications not available in Expo Go");
        return;
      }

      // Skip on web - push notifications require VAPID key setup
      if (Platform.OS === 'web') {
        console.log("Push notifications not supported on web");
        return;
      }

      if (!Device.isDevice) {
        console.log("Push notifications are not supported on simulator/emulator");
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification");
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "your-project-id",
      });

      setPushToken(token.data);

      if (userId) {
        try {
          await supabase
            .from("profiles")
            .update({ push_token: token.data })
            .eq("id", userId);
        } catch (error) {
          console.log("Failed to save push token (column may not exist yet):", error);
        }
      }
    };

    registerForPushNotifications();
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.log("Mark as read error:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.log("Mark all as read error:", error);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOnline,
        subscriptionError,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        createNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
