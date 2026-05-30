import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AcceptInvite = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      const { data, error } = await supabase
        .from("invites")
        .select("id, org_id, role, token, email")
        .eq("token", token)
        .single();

      if (error || !data) {
        setError("Invalid or expired invite link.");
      } else {
        setInvite(data);
      }
      setLoading(false);
    };

    if (token) fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!fullname || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (invite?.email && email.trim().toLowerCase() !== invite.email.toLowerCase()) {
      Alert.alert("Error", "This invitation is for a different email address.");
      return;
    }
    setSubmitting(true);

    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    // If user already exists, switch to sign-in flow
    if (signUpError && (signUpError.message.includes("already registered") || signUpError.status === 422)) {
      setUserExists(true);
      setSubmitting(false);
      return;
    }

    if (signUpError) {
      Alert.alert("Error", signUpError.message);
      setSubmitting(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      Alert.alert("Error", "Could not create account. Try again.");
      setSubmitting(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      fullname,
      role: invite.role,
      org_id: invite.org_id,
    });

    if (profileError) {
      Alert.alert("Error", profileError.message);
      setSubmitting(false);
      return;
    }

    await supabase.from("invites").delete().eq("token", token);

    setSubmitting(false);
    Alert.alert(
      "Success",
      "Account created! Please sign in.",
      [{ text: "OK", onPress: () => router.replace("/signin") }]
    );
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (invite?.email && email.trim().toLowerCase() !== invite.email.toLowerCase()) {
      Alert.alert("Error", "This invitation is for a different email address.");
      return;
    }
    setSubmitting(true);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      Alert.alert("Error", signInError.message);
      setSubmitting(false);
      return;
    }

    const userId = signInData.user?.id;
    if (!userId) {
      Alert.alert("Error", "Could not sign in. Try again.");
      setSubmitting(false);
      return;
    }

    // Update existing user's profile with org and role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        org_id: invite.org_id,
        role: invite.role,
      })
      .eq("id", userId);

    if (profileError) {
      Alert.alert("Error", profileError.message);
      setSubmitting(false);
      return;
    }

    await supabase.from("invites").delete().eq("token", token);

    setSubmitting(false);
    Alert.alert(
      "Success",
      "You've joined the organization!",
      [{ text: "OK", onPress: () => router.replace("/(tabs)/home") }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          className="mt-6 bg-primary px-6 py-3 rounded-lg"
          onPress={() => router.replace("/signin")}
        >
          <Text className="text-white">Go to Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 p-5">
      <Text className="text-2xl font-bold mt-6">Accept Invitation</Text>
      <Text className="text-secondary mt-2 mb-8">
        You've been invited as a{" "}
        <Text className="capitalize font-semibold">{invite?.role}</Text>.{" "}
        {userExists ? "Sign in to join." : "Create your account to join."}
      </Text>

      <View className="gap-4">
        {!userExists && (
          <View className="gap-2">
            <Text className="text-base">Full Name</Text>
            <TextInput
              value={fullname}
              onChangeText={setFullname}
              placeholder="Enter your full name"
              className="border border-secondary rounded-lg p-4 bg-surface"
            />
          </View>
        )}
        <View className="gap-2">
          <Text className="text-base">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-secondary rounded-lg p-4 bg-surface"
          />
        </View>
        <View className="gap-2">
          <Text className="text-base">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={userExists ? "Enter your password" : "Create a password"}
            secureTextEntry
            className="border border-secondary rounded-lg p-4 bg-surface"
          />
        </View>

        <TouchableOpacity
          className="bg-primary p-4 rounded-lg items-center mt-4"
          onPress={userExists ? handleSignIn : handleAccept}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">
              {userExists ? "Sign In & Join" : "Create Account & Join"}
            </Text>
          )}
        </TouchableOpacity>

        {!userExists && (
          <TouchableOpacity
            className="items-center mt-2"
            onPress={() => router.replace("/signin")}
          >
            <Text className="text-secondary">Already have an account? Sign in</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AcceptInvite;
