import { ThemeContext } from "@/context/ThemeContext";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Tabs, useFocusEffect, useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";

const _layout = () => {
  const { isLoggedIn, loading, user, profile, setProfile, setOrg } = useContext(
    UserContext,
  ) as any;
  const { isDark } = useContext(ThemeContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/signin");
    }
  }, [isLoggedIn, router]);

  useFocusEffect(
    React.useCallback(() => {
      const verifyOrganizationAccess = async () => {
        if (!isLoggedIn || !user?.user?.id) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("id, fullname, email, role, lead_id, org_id")
          .eq("id", user.user.id)
          .single();

        if (error || !data) return;

        setProfile?.(data);

        if (!data.org_id && profile?.org_id) {
          setOrg?.(null);
          router.replace("/createorganization");
        }
      };

      verifyOrganizationAccess();
    }, [isLoggedIn, user?.user?.id, profile?.org_id]),
  );

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#fff" : "#000",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#cdcde0",
        tabBarStyle: {
          height: 65,
          paddingTop: 5,
          borderRadius: 15,
          backgroundColor: isDark ? "#1e293b" : "#fff",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="task"
        options={{
          title: "Task",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "checkmark" : "checkmark-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: "Team",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
