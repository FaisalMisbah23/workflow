import { ThemeContext } from "@/context/ThemeContext";
import { UserContext } from "@/context/UserContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
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
  const { logout, settings, updateSettings } = useContext(UserContext);
  const { isDark, toggleDarkMode } = useContext(ThemeContext);
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const bgClass = isDark ? "bg-slate-800" : "bg-white";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const borderClass = isDark ? "border-slate-700" : "border-gray-200";

  const items = [
    {
      icon: "create-outline" as any,
      title: "Edit Profile",
      action: () => router.push("/(tabs)/profile"),
    },
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
      <Text style={{ fontSize: 18, fontWeight: "700" }} className={textClass}>
        Settings
      </Text>
      {items.map((item, index) => (
        <TouchableOpacity key={index} className="mt-3" onPress={item.action}>
          <View
            className={`w-full border ${borderClass} rounded-[15px] p-3 flex-row items-center justify-between ${bgClass}`}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name={item.icon}
                size={20}
                color={isDark ? "#fff" : "#000"}
              />
              {item.title === "Sign Out" ? (
                <Text className="font-bold text-[30px] text-red-500">
                  Sign Out
                </Text>
              ) : (
                <Text className={`font-bold text-xl ${textClass}`}>
                  {item.title}
                </Text>
              )}
            </View>

            <View className="bg-gray-700 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="chevron-forward" size={15} color="white" />
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
          <View className={`${bgClass} rounded-t-3xl p-5 max-h-[80%]`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-xl font-bold ${textClass}`}>
                Notifications
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#666"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View
                className={`flex-row justify-between items-center py-3 border-b ${borderClass}`}
              >
                <Text className={`text-base ${textClass}`}>
                  Email Notifications
                </Text>
                <Switch
                  value={settings.notifications.email}
                  onValueChange={(value) =>
                    updateSettings("notifications", {
                      ...settings.notifications,
                      email: value,
                    })
                  }
                />
              </View>
              <View
                className={`flex-row justify-between items-center py-3 border-b ${borderClass}`}
              >
                <Text className={`text-base ${textClass}`}>
                  Push Notifications
                </Text>
                <Switch
                  value={settings.notifications.push}
                  onValueChange={(value) =>
                    updateSettings("notifications", {
                      ...settings.notifications,
                      push: value,
                    })
                  }
                />
              </View>
              <View
                className={`flex-row justify-between items-center py-3 border-b ${borderClass}`}
              >
                <Text className={`text-base ${textClass}`}>
                  Task Updates
                </Text>
                <Switch
                  value={settings.notifications.taskUpdates}
                  onValueChange={(value) =>
                    updateSettings("notifications", {
                      ...settings.notifications,
                      taskUpdates: value,
                    })
                  }
                />
              </View>
              <View
                className={`flex-row justify-between items-center py-3 ${borderClass}`}
              >
                <Text className={`text-base ${textClass}`}>
                  Deadline Reminders
                </Text>
                <Switch
                  value={settings.notifications.deadlineReminders}
                  onValueChange={(value) =>
                    updateSettings("notifications", {
                      ...settings.notifications,
                      deadlineReminders: value,
                    })
                  }
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
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${bgClass} rounded-t-3xl p-5 max-h-[80%]`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-xl font-bold ${textClass}`}>
                Settings
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#666"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View
                className={`flex-row justify-between items-center py-3 border-b ${borderClass}`}
              >
                <Text className={`text-base ${textClass}`}>Dark Mode</Text>
                <Switch
                  value={isDark}
                  onValueChange={toggleDarkMode}
                />
              </View>
              <View className={`py-3 border-b ${borderClass}`}>
                <Text className={`text-base mb-2 ${textClass}`}>
                  Language
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`px-3 py-1 rounded ${settings.language === "en" ? "bg-primary" : "bg-gray-200"}`}
                    onPress={() => updateSettings("language", "en")}
                  >
                    <Text
                      className={
                        settings.language === "en"
                          ? "text-white"
                          : "text-black"
                      }
                    >
                      English
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-3 py-1 rounded ${settings.language === "es" ? "bg-primary" : "bg-gray-200"}`}
                    onPress={() => updateSettings("language", "es")}
                  >
                    <Text
                      className={
                        settings.language === "es"
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
          <View className={`${bgClass} rounded-t-3xl p-5 max-h-[80%]`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-xl font-bold ${textClass}`}>
                Privacy & Security
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#666"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity className={`py-3 border-b ${borderClass}`}>
                <Text className={`text-base ${textClass}`}>
                  Change Password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className={`py-3 border-b ${borderClass}`}>
                <Text className={`text-base ${textClass}`}>
                  Two-Factor Authentication
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className={`py-3 border-b ${borderClass}`}>
                <Text className={`text-base ${textClass}`}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3">
                <Text className={`text-base ${textClass}`}>
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
          <View className={`${bgClass} rounded-t-3xl p-5 max-h-[80%]`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-xl font-bold ${textClass}`}>
                Analytics
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#666"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View className={`py-3 border-b ${borderClass}`}>
                <Text className={`text-base font-semibold ${textClass}`}>
                  Tasks Completed
                </Text>
                <Text className="text-2xl font-bold text-primary">0</Text>
              </View>
              <View className={`py-3 border-b ${borderClass}`}>
                <Text className={`text-base font-semibold ${textClass}`}>
                  Tasks Pending
                </Text>
                <Text className="text-2xl font-bold text-orange-500">0</Text>
              </View>
              <View className={`py-3 border-b ${borderClass}`}>
                <Text className={`text-base font-semibold ${textClass}`}>
                  Success Rate
                </Text>
                <Text className="text-2xl font-bold text-green-500">0%</Text>
              </View>
              <View className="py-3">
                <Text className={`text-base font-semibold ${textClass}`}>
                  Team Activity
                </Text>
                <Text className="text-sm text-gray-500">
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
