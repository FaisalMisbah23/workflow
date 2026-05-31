import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useState } from "react";
import {
  Alert,
  Clipboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Team = () => {
  const router = useRouter();
  const {
    Org,
    sendInvite,
    teamMembers = [],
    profile,
    isAdmin,
    isLead,
    fetchTeamMembers,
  } = useContext(UserContext) as any;
  const [modalVisible, setModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [loading, setloading] = useState(false);
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [removedMemberIds, setRemovedMemberIds] = useState<string[]>([]);
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>(
    {},
  );
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const orgId = Org?.[0]?.id;
  const visibleTeamMembers = teamMembers
    .filter((member: any) => !removedMemberIds.includes(member.id))
    .map((member: any) => ({
      ...member,
      role: roleOverrides[member.id] || member.role,
    }));

  // Calculate department counts dynamically
  const departmentCounts = visibleTeamMembers.reduce(
    (acc: any, member: any) => {
      const dept = member.role || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    },
    {},
  );

  const departments = Object.entries(departmentCounts).map(([name, count]) => ({
    name,
    count: count as number,
  }));
  const token = Math.random().toString(36).slice(2, 8);

  const Invite_Link = `https://smart-workflow.com/invite/${token}`;

  const handleCopy = () => {
    Clipboard.setString(Invite_Link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch team task counts and refresh roster on focus
  useFocusEffect(
    useCallback(() => {
      if (fetchTeamMembers && profile) {
        fetchTeamMembers(profile);
      }

      if (!orgId) return;

      const fetchTeamData = async () => {
        const [activeRes, completedRes, activityRes] = await Promise.all([
          supabase
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .in("status", ["pending", "in_progress"]),
          supabase
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .eq("status", "completed"),
          supabase
            .from("tasks")
            .select("id, title, status, created_at, assigned_to")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setActiveTaskCount(activeRes.count ?? 0);
        setCompletedTaskCount(completedRes.count ?? 0);
        setRecentActivity(activityRes.data ?? []);
      };

      fetchTeamData();
    }, [orgId, profile, fetchTeamMembers]),
  );

  const handleSendInvite = async () => {
    if (!email) return;
    setloading(true);

    const result = await sendInvite(email, orgId, inviteRole);

    setloading(false);

    if (result.success) {
      Alert.alert("Invite sent", `${email} will receive an invitation.`);
      setEmail("");
      setInviteRole("member");
      setModalVisible(false);
    } else {
      Alert.alert(
        "Error",
        result.error ?? "Unable to send invite. Please try again.",
      );
    }
  };

  const handleChangeRole = async (memberId: string, role: string) => {
    if (!isAdmin) {
      Alert.alert("Permission denied", "Only admins can change member roles.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", memberId)
      .eq("org_id", orgId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setRoleOverrides((prev) => ({ ...prev, [memberId]: role }));
    if (fetchTeamMembers) {
      await fetchTeamMembers();
    }
    Alert.alert("Role updated", "The member role has been updated.");
  };

  const handleRemoveMember = (member: any) => {
    if (!isAdmin) {
      Alert.alert("Permission denied", "Only admins can remove members.");
      return;
    }

    if (member.id === profile?.id) {
      Alert.alert(
        "Action not allowed",
        "You cannot remove yourself from the organization.",
      );
      return;
    }

    Alert.alert(
      "Remove Member",
      `Remove ${member.fullname || member.email} from this organization?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("profiles")
              .update({ org_id: null, role: "member", lead_id: null })
              .eq("id", member.id)
              .eq("org_id", orgId);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            setRemovedMemberIds((prev) => [...prev, member.id]);
            if (fetchTeamMembers) {
              await fetchTeamMembers();
            }
            Alert.alert(
              "Member removed",
              "The member has been removed from the organization.",
            );
          },
        },
      ],
    );
  };

  const roleOptions = isAdmin ? ["admin", "lead", "member"] : ["member"];

  return (
    <SafeAreaView className="flex-1">
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Team</Text>
          {(isAdmin || isLead) && (
            <TouchableOpacity
              className="flex-row gap-2 bg-primary px-4 py-3 rounded-lg"
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="people-outline" size={20} color={"white"} />
              <Text className="text-white font-medium">Add Member</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-gray-600 text-base mb-4">
          {visibleTeamMembers?.length ?? 0} team members
        </Text>
        <View className="flex flex-row gap-2">
          <View className="flex-row justify-between w-[48%] bg-gray-200 p-4 rounded-xl">
            <View className="gap-2">
              <Text className="text-gray-600 text-sm">Active Task</Text>
              <Text className="text-2xl font-bold">{activeTaskCount}</Text>
            </View>
            <View className="mt-2">
              <Ionicons
                name="calendar-clear-outline"
                size={24}
                color="#6B7280"
              />
            </View>
          </View>
          <View className="flex-row justify-between w-[48%] bg-gray-200 p-4 rounded-xl">
            <View className="gap-2">
              <Text className="text-gray-600 text-sm">Completed</Text>
              <Text className="text-2xl font-bold">{completedTaskCount}</Text>
            </View>
            <View className="mt-2">
              <Ionicons name="trending-up" size={24} color="#6B7280" />
            </View>
          </View>
        </View>
        <Text className="mt-6 text-lg font-bold">Departments</Text>
        <View className="flex-row gap-2 flex-wrap mt-3">
          {departments.length > 0 ? (
            departments.map((item, index) => (
              <Text
                key={index}
                className="text-sm bg-primary text-white px-4 py-2 rounded-full capitalize"
              >
                {item.name} ({item.count})
              </Text>
            ))
          ) : (
            <Text className="text-gray-400 text-sm italic">
              No departments created yet (roles dynamically define departments)
            </Text>
          )}
        </View>
        <View className="mt-6">
          <Text className="text-lg font-bold">Team members</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 350 }}
        >
          {visibleTeamMembers && visibleTeamMembers.length > 0 ? (
            visibleTeamMembers.map((item: any) => (
              <View
                key={item.id}
                className="mt-4 border border-gray-200 rounded-xl p-4"
              >
                <View className="flex-row w-full">
                  <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                    <Text className="text-white text-center font-semibold">
                      {item.fullname?.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-semibold">
                      {item.fullname}
                    </Text>
                    <Text className="text-gray-600 text-sm">{item.email}</Text>
                    <Text className="text-gray-500 text-sm capitalize">
                      {item.role}
                    </Text>
                    {isAdmin && item.id !== profile?.id && (
                      <View className="mt-3">
                        <Text className="text-xs text-gray-500 mb-1">
                          Change Role
                        </Text>
                        <View className="border border-gray-300 rounded-lg">
                          <Picker
                            selectedValue={item.role}
                            onValueChange={(value) =>
                              handleChangeRole(item.id, value)
                            }
                          >
                            <Picker.Item label="Admin" value="admin" />
                            <Picker.Item label="Lead" value="lead" />
                            <Picker.Item label="Member" value="member" />
                          </Picker>
                        </View>
                      </View>
                    )}
                  </View>
                  {isAdmin && item.id !== profile?.id && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(item)}
                      className="p-2"
                    >
                      <Ionicons
                        name="person-remove-sharp"
                        size={24}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm shadow-black/5 items-center">
              {isAdmin || isLead ? (
                <View className="items-center w-full">
                  <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                    <Ionicons name="people-outline" size={32} color="#3B82F6" />
                  </View>
                  <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                    Build Your Dream Team
                  </Text>
                  <Text className="text-sm text-gray-500 text-center mb-6 px-4">
                    Add your first member to unlock real-time task delegation,
                    workflow automation, and collaborative analytics!
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="w-full bg-primary py-3.5 rounded-xl items-center mb-3 flex-row justify-center gap-2"
                  >
                    <Ionicons name="add" size={20} color="white" />
                    <Text className="text-white font-semibold text-base">
                      Invite Team Member
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCopy}
                    className="w-full bg-gray-50 py-3.5 rounded-xl items-center border border-gray-200 flex-row justify-center gap-2"
                  >
                    <Ionicons name="copy-outline" size={18} color="#4B5563" />
                    <Text className="text-gray-700 font-semibold text-base">
                      {copied ? "Invite Link Copied! ✓" : "Copy Invite Link"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center w-full">
                  <View className="w-16 h-16 bg-violet-50 rounded-full items-center justify-center mb-4">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={32}
                      color="#7C3AED"
                    />
                  </View>
                  <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                    Focus on Your Workload
                  </Text>
                  <Text className="text-sm text-gray-500 text-center mb-6 px-4">
                    Your team roster is managed by Admins and Leads. Get started
                    by viewing and working on your assigned tasks!
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/task")}
                    className="w-full bg-primary py-3.5 rounded-xl items-center flex-row justify-center gap-2"
                  >
                    <Ionicons
                      name="clipboard-outline"
                      size={18}
                      color="white"
                    />
                    <Text className="text-white font-semibold text-base">
                      Go to My Tasks
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
        <View className="mt-6">
          <Text className="text-lg font-bold">Recent Activity</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <View
                key={activity.id}
                className="mt-3 bg-gray-100 rounded-xl p-3"
              >
                <Text className="font-semibold text-base">
                  {activity.title}
                </Text>
                <Text className="text-gray-600 text-sm capitalize">
                  {activity.status?.replace("_", " ")}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {new Date(activity.created_at).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-600 mt-3">
              No recent activity found.
            </Text>
          )}
        </View>
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-4"
          onPress={() => setModalVisible(false)}
        >
          <Pressable className="bg-white w-full rounded-2xl p-5">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-lg font-bold">Add Team Member</Text>
                <Text className="text-gray-600 text-sm mt-1">
                  Invite someone to join organization
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-semibold mb-2">Invite via link</Text>
            <View className="flex-row gap-2 items-center mb-2">
              <View className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                <Text className="text-sm text-gray-700">{Invite_Link}</Text>
              </View>
              <TouchableOpacity
                className="border border-gray-300 px-4 py-2 rounded-lg"
                onPress={handleCopy}
              >
                <Text className="text-sm font-medium">
                  {copied ? "Copied" : "Copy"}
                </Text>
              </TouchableOpacity>
            </View>
            {copied && (
              <Text className="text-xs text-green-600 mb-3">
                Link Copied to Clipboard
              </Text>
            )}

            {/* Divider */}
            <View className="border-t border-gray-200 my-4" />

            {/* Email Invite */}
            <Text className="text-sm font-semibold mb-2 text-gray-700">
              Or invite via email
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholder="member@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm mb-3"
            />
            <Text className="text-sm font-semibold mb-2 text-gray-700">
              Role
            </Text>
            <View className="border border-gray-300 rounded-lg mb-4">
              <Picker selectedValue={inviteRole} onValueChange={setInviteRole}>
                {roleOptions.map((role) => (
                  <Picker.Item
                    key={role}
                    label={role.charAt(0).toUpperCase() + role.slice(1)}
                    value={role}
                  />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg items-center"
              onPress={handleSendInvite}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-base">
                {loading ? "Sending..." : "Send Invite"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Team;
