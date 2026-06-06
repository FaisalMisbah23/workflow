import { ThemeContext } from "@/context/ThemeContext";
import { UserContext } from "@/context/UserContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useContext, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Settings = () => {
  const { logout } = useContext(UserContext);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    taskUpdates: true,
    deadlineReminders: true,
  });
  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    language: "en",
  });
  const { isDark, toggleTheme } = useContext(ThemeContext) as any;

  const items = [
    { icon: "create-outline" as any, title: "Edit Profile", action: () => {} },
    {
      icon: "notifications-outline" as any,
      title: "Notifications",
      action: () => setActiveModal("notifications"),
    },
    {
      icon: "settings-outline" as any,
      title: "Settings",
      action: () => setActiveModal("settings"),
    },
    {
      icon: "shield-outline" as any,
      title: "Privacy & Security",
      action: () => setActiveModal("privacy"),
    },
    {
      icon: "analytics-outline" as any,
      title: "Analytics",
      action: () => setActiveModal("analytics"),
    },
    { icon: "exit-outline" as any, title: "Sign Out", action: logout },
  ];
  return (
    <View className="mt-3">
      <Text
        style={{ fontSize: 18, fontWeight: "700" }}
        className={`${isDark ? "text-white" : "text-gray-900"}`}
      >
        Settings
      </Text>
      {items.map((item, index) => (
        <TouchableOpacity key={index} className="mt-3" onPress={item.action}>
          <View
            className={`
            w-full
            ${isDark ? "bg-gray-800 border border-white" : "bg-white border border-black"}
            rounded-[15px]
            p-3
            flex-row
            items-center
            justify-between
          `}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name={item.icon}
                size={20}
                color={isDark ? "white" : "black"}
              />
              {item.title === "Sign Out" ? (
                <Text
                  className={`${isDark ? "text-red-500" : "text-red-500"} font-bold text-[30px]`}
                >
                  Sign Out
                </Text>
              ) : (
                <Text
                  className={`${isDark ? "text-white" : "text-gray-900"} font-bold text-xl`}
                >
                  {item.title}
                </Text>
              )}
            </View>

            <View
              className={`${isDark ? "bg-gray-600" : "bg-gray-200"} w-10 h-10 rounded-full items-center justify-center`}
            >
              <Ionicons
                name="chevron-forward"
                size={15}
                color={isDark ? "white" : "black"}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Notifications Modal */}
      <Modal
        visible={activeModal === "notifications"}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-t-3xl p-5 max-h-[80%]`}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Notifications
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "white" : "black"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View className="flex-row justify-between items-center py-3 border-b">
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Email Notifications
                </Text>
                <Switch
                  value={notificationSettings.email}
                  onValueChange={(value) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      email: value,
                    })
                  }
                  thumbColor={isDark ? "#fff" : "#000"}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                />
              </View>
              <View className="flex-row justify-between items-center py-3 border-b">
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Push Notifications
                </Text>
                <Switch
                  value={notificationSettings.push}
                  onValueChange={(value) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      push: value,
                    })
                  }
                  thumbColor={isDark ? "#fff" : "#000"}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                />
              </View>
              <View className="flex-row justify-between items-center py-3 border-b">
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Task Updates
                </Text>
                <Switch
                  value={notificationSettings.taskUpdates}
                  onValueChange={(value) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      taskUpdates: value,
                    })
                  }
                  thumbColor={isDark ? "#fff" : "#000"}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                />
              </View>
              <View className="flex-row justify-between items-center py-3">
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Deadline Reminders
                </Text>
                <Switch
                  value={notificationSettings.deadlineReminders}
                  onValueChange={(value) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      deadlineReminders: value,
                    })
                  }
                  thumbColor={isDark ? "#fff" : "#000"}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={activeModal === "settings"}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)",
          }}
        >
          <View
            className={` w-full rounded-t-3xl p-5 max-h-[80%]`}
            style={{
              backgroundColor: isDark ? "#111827" : "#ffffff",
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}
              >
                Settings
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View
                className={`flex-row justify-between items-center py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Dark Mode
                </Text>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  thumbColor={isDark ? "#fff" : "#000"}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                />
              </View>
              <View
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}
                >
                  Language
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`px-3 py-1 rounded ${appSettings.language === "en" ? "bg-primary" : "bg-gray-200"}`}
                    onPress={() =>
                      setAppSettings({ ...appSettings, language: "en" })
                    }
                  >
                    <Text
                      className={
                        appSettings.language === "en"
                          ? "text-white"
                          : "text-black"
                      }
                    >
                      English
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-3 py-1 rounded ${appSettings.language === "es" ? "bg-primary" : "bg-gray-200"}`}
                    onPress={() =>
                      setAppSettings({ ...appSettings, language: "es" })
                    }
                  >
                    <Text
                      className={
                        appSettings.language === "es"
                          ? "text-white"
                          : "text-black"
                      }
                    >
                      Español
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy & Security Modal */}
      <Modal
        visible={activeModal === "privacy"}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-t-3xl p-5 max-h-[80%]`}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}
              >
                Privacy & Security
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Change Password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Two-Factor Authentication
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Privacy Policy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base ${isDark ? "text-white" : "text-black"}`}
                >
                  Terms of Service
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        visible={activeModal === "analytics"}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-t-3xl p-5 max-h-[80%]`}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}
              >
                Analytics
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  Tasks Completed
                </Text>
                <Text
                  className={`text-2xl font-bold ${isDark ? "text-primary" : "text-blue-500"}`}
                >
                  0
                </Text>
              </View>
              <View
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  Tasks Pending
                </Text>
                <Text
                  className={`text-2xl font-bold ${isDark ? "text-orange-500" : "text-orange-500"}`}
                >
                  0
                </Text>
              </View>
              <View
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  Success Rate
                </Text>
                <Text
                  className={`text-2xl font-bold ${isDark ? "text-green-500" : "text-green-500"}`}
                >
                  0%
                </Text>
              </View>
              <View
                className={`py-3 ${isDark ? "border-b border-gray-300" : "border-b border-gray-900"}`}
              >
                <Text
                  className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  Team Activity
                </Text>
                <Text
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  No recent activity
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Settings;
