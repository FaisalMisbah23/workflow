import Settings from "@/components/Settings";
import { ThemeContext } from "@/context/ThemeContext";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { Bounce } from "react-native-animated-spinkit";
import { SafeAreaView } from "react-native-safe-area-context";
const Profile = () => {
  const router = useRouter();
  const { user, isLoggedIn, uploadImage, profile, Org, setProfile } =
    useContext(UserContext) as any;
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(profile?.avatar_url || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullname, setEditFullname] = useState(profile?.fullname || "");
  const [editUsername, setEditUsername] = useState(profile?.username || "");
  const [editBio, setEditBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const { isDark } = useContext(ThemeContext) as any;
  if (!profile || !user) {
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
  // Password strength validation
  const validatePasswordStrength = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      Alert.alert("Error", passwordError);
      return;
    }

    setChangingPassword(true);

    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.user?.email,
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert("Error", "Current password is incorrect");
        setChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert("Error", updateError.message);
      } else {
        Alert.alert("Success", "Password updated successfully");
        setShowChangePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          // Navigate to sign-in page
          if (Platform.OS === "web") {
            window.location.href = "/signin";
          } else {
            // For mobile, you would use router.push
            router.push("/signin");
          }
        },
      },
    ]);
  };

  const updateAvatar = async (userId: string, avatarurl: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarurl })
      .eq("id", userId); // assuming `id` is the primary key

    if (error) {
      console.log("Update error:", error);
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (!isLoggedIn || !user) {
      if (Platform.OS === "android") {
        ToastAndroid.show("Please login first", ToastAndroid.SHORT);
      } else {
        Alert.alert("Error", "Please login first");
      }
      return;
    }
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    console.log(result);

    if (!result.canceled) {
      const asset = result.assets[0];

      // Validate image format
      const validFormats = ["jpg", "jpeg", "png", "webp"];
      const fileExtension = asset.uri.split(".").pop()?.toLowerCase();
      if (!fileExtension || !validFormats.includes(fileExtension)) {
        Alert.alert(
          "Error",
          "Invalid image format. Please use JPG, PNG, or WEBP.",
        );
        return;
      }

      // Validate image size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (asset.fileSize && asset.fileSize > maxSize) {
        Alert.alert("Error", "Image size must be less than 5MB.");
        return;
      }

      setImage(asset.uri);

      // upload and update avatar
      const avatarurl = await uploadImage(asset.uri, user.id);
      if (avatarurl) {
        await updateAvatar(user.id, avatarurl);
        if (Platform.OS === "android") {
          ToastAndroid.show("Profile picture updated", ToastAndroid.SHORT);
        } else {
          Alert.alert("Success", "Profile picture updated");
        }
      }
    }
  };

  const saveProfile = async () => {
    if (!editFullname.trim()) {
      Alert.alert("Error", "Full name cannot be empty");
      return;
    }
    if (!editUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }
    // Username validation - alphanumeric and underscores only
    if (!/^[a-zA-Z0-9_]+$/.test(editUsername.trim())) {
      Alert.alert(
        "Error",
        "Username can only contain letters, numbers, and underscores",
      );
      return;
    }
    setSaving(true);

    // Check for username conflict
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", editUsername.trim())
      .neq("id", user?.user?.id)
      .single();

    if (existingUser) {
      Alert.alert("Error", "Username already taken");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        fullname: editFullname.trim(),
        username: editUsername.trim(),
        bio: editBio.trim(),
      })
      .eq("id", user?.user?.id);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setProfile({
        ...profile,
        fullname: editFullname.trim(),
        username: editUsername.trim(),
        bio: editBio.trim(),
      });
      // ToastAndroid is not available on web
      if (Platform.OS === "android") {
        ToastAndroid.show("Profile updated", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Profile updated");
      }
      setIsEditing(false);
    }
    setSaving(false);
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
    >
      <ScrollView className="flex-1">
        <View className="p-5">
          {/* Profile Header Card */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden mb-6  flex items-center`}
          >
            {/* Banner */}
            <View className="bg-gradient-to-r from-primary to-primary/80 h-20" />

            {/* Profile Info */}
            <View className="px-4 relative bottom-14 w-full">
              <View className="flex-row items-end">
                {/* Avatar */}
                <View className="relative">
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md"
                    />
                  ) : (
                    <View className="bg-gradient-to-br from-gray-200 to-gray-300 w-24 h-24 rounded-full border-4 border-white shadow-md items-center justify-center">
                      <Text className="text-primary text-2xl font-bold">
                        {profile?.fullname
                          ? profile.fullname
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join("")
                              .toUpperCase()
                          : user?.user?.email?.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {/* Camera Button */}
                  <TouchableOpacity
                    testID="camera-icon"
                    onPress={pickImage}
                    className="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-md"
                  >
                    <Ionicons name="camera" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                {/* User Info */}
                <View className="ml-4 flex-1 mb-2">
                  {isEditing ? (
                    <View className="gap-2">
                      <TextInput
                        value={editFullname}
                        onChangeText={setEditFullname}
                        placeholder="Full Name"
                        className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-base"
                      />

                      <TextInput
                        value={editUsername}
                        onChangeText={setEditUsername}
                        placeholder="Username"
                        className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-base"
                      />
                      <TextInput
                        value={editBio}
                        onChangeText={setEditBio}
                        placeholder="Bio (optional)"
                        multiline
                        numberOfLines={2}
                        className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-base"
                      />
                      <View className="flex-row gap-2 mt-2">
                        <TouchableOpacity
                          onPress={saveProfile}
                          disabled={saving}
                          className="bg-primary flex-1 py-2.5 rounded-lg"
                        >
                          <Text className="text-white text-center font-medium">
                            {saving ? "Saving..." : "Save"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setIsEditing(false);
                            setEditFullname(profile?.fullname || "");
                            setEditUsername(profile?.username || "");
                            setEditBio(profile?.bio || "");
                          }}
                          className="bg-gray-200 flex-1 py-2.5 rounded-lg"
                        >
                          <Text className="text-gray-700 text-center font-medium">
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text
                        className={`${isDark ? "text-white" : "text-gray-900"} text-lg font-semibold`}
                      >
                        {profile?.fullname}
                      </Text>
                      {profile?.username ? (
                        <Text
                          className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                        >
                          @{profile.username}
                        </Text>
                      ) : null}
                      {profile?.email ? (
                        <Text
                          className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                        >
                          {profile.email}
                        </Text>
                      ) : null}
                      {profile?.bio && (
                        <Text
                          className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm mt-1 line-clamp-2`}
                        >
                          {profile?.bio}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons (View Mode Only) */}
              {!isEditing && (
                <View className="mt-4 flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    className={`${isDark ? "bg-blue-600" : "bg-primary"} flex items-center justify-center w-1/3 rounded-lg`}
                  >
                    <Text className="text-white text-center font-medium text-md">
                      Edit Profile
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowChangePassword(true)}
                    className={`${isDark ? "bg-gray-600" : "bg-gray-200"} flex items-center justify-center w-[120px] rounded-lg`}
                  >
                    <Text
                      className={`${isDark ? "text-gray-300" : "text-gray-700"} text-center font-medium text-md`}
                    >
                      Change Password
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 py-2.5 px-4 rounded-lg"
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Stats Card */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm p-5 mb-6`}
          >
            <Text
              className={`${isDark ? "text-white" : "text-gray-900"} text-lg font-semibold mb-4`}
            >
              Profile Details
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                >
                  Role
                </Text>
                <Text
                  className={`${isDark ? "text-white" : "text-gray-900"} font-medium capitalize`}
                >
                  {profile?.role ?? "Member"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                >
                  Organization
                </Text>
                <Text
                  className={`${isDark ? "text-white" : "text-gray-900"} font-medium`}
                >
                  {Org[0]?.name || "None"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text
                  className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
                >
                  Joined
                </Text>
                <Text
                  className={`${isDark ? "text-white" : "text-gray-900"} font-medium`}
                >
                  {user?.user?.created_at?.slice(0, 10)}
                </Text>
              </View>
            </View>
          </View>

          {/* Achievements removed */}

          {/* Settings */}
          <Settings />
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Change Password
              </Text>
              <TouchableOpacity onPress={() => setShowChangePassword(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry
                  className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base"
                />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  New Password
                </Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry
                  className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base"
                />
                <Text className="text-xs text-gray-500 mt-2">
                  Must be at least 8 characters with uppercase, lowercase, and
                  number
                </Text>
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                  className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base"
                />
              </View>
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changingPassword}
                className="bg-primary py-3.5 rounded-xl mt-4"
              >
                <Text className="text-white text-center font-semibold text-base">
                  {changingPassword ? "Updating..." : "Update Password"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
