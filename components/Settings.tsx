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
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Settings</Text>
      {items.map((item, index) => (
        <TouchableOpacity key={index} className="mt-3" onPress={item.action}>
          <View className="w-full border rounded-[15px] p-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name={item.icon} size={20} />
              {item.title === "Sign Out" ? (
                <Text className="font-bold text-[30px] text-red-500">
                  Sign Out
                </Text>
              ) : (
                <Text className="font-bold text-xl">{item.title}</Text>
              )}
            </View>

            <View className="bg-gray-700 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="chevron-forward" size={15} color="blacl" />
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
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Notifications</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View className="flex-row justify-between items-center py-3 border-b">
                <Text className="text-base">Email Notifications</Text>
                <Switch
                  value={notificationSettings.email}
                  onValueChange={(value) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      email: value,
                    })
                  }
                />
              </View>
              <View className="flex-row justify-between items-center py-3 border-b">
                <Text className="text-base">Push Notifications</Text>
                <Switch
                  value={notificationSettings.push}
                  onValueChange={(value) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      push: value,
                    })
                  }
                />
              </View>
              <View className="flex-row justify-between items-center py-3 border-b">
                <Text className="text-base">Task Updates</Text>
                <Switch
                  value={notificationSettings.taskUpdates}
                  onValueChange={(value) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      taskUpdates: value,
                    })
                  }
                />
              </View>
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-base">Deadline Reminders</Text>
                <Switch
                  value={notificationSettings.deadlineReminders}
                  onValueChange={(value) =>
                    setNotificationSettings({
                      ...notificationSettings,
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
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Settings</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View className="flex-row justify-between items-center py-3 border-b">
                <Text className="text-base">Dark Mode</Text>
                <Switch
                  value={appSettings.darkMode}
                  onValueChange={(value) =>
                    setAppSettings({ ...appSettings, darkMode: value })
                  }
                />
              </View>
              <View className="py-3 border-b">
                <Text className="text-base mb-2">Language</Text>
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
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Privacy & Security</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity className="py-3 border-b">
                <Text className="text-base">Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3 border-b">
                <Text className="text-base">Two-Factor Authentication</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3 border-b">
                <Text className="text-base">Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3">
                <Text className="text-base">Terms of Service</Text>
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
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Analytics</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View className="py-3 border-b">
                <Text className="text-base font-semibold">Tasks Completed</Text>
                <Text className="text-2xl font-bold text-primary">0</Text>
              </View>
              <View className="py-3 border-b">
                <Text className="text-base font-semibold">Tasks Pending</Text>
                <Text className="text-2xl font-bold text-orange-500">0</Text>
              </View>
              <View className="py-3 border-b">
                <Text className="text-base font-semibold">Success Rate</Text>
                <Text className="text-2xl font-bold text-green-500">0%</Text>
              </View>
              <View className="py-3">
                <Text className="text-base font-semibold">Team Activity</Text>
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
