import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import React, { createContext, useEffect, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import * as Linking from "expo-linking";
export const UserContext = createContext();

const showToast = (message) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [Org, setOrg] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLead, setIsLead] = useState(false);

  const router = useRouter();

  // Handle deep links (recovery tokens, invitations, etc.)
  useEffect(() => {
    const handleDeepLink = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl == null) {
          return;
        }

        // Parse URL to check for recovery token
        const url = new URL(initialUrl);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const type = hashParams.get('type');
        const accessToken = hashParams.get('access_token');

        if (type === 'recovery' && accessToken) {
          console.log('Recovery token detected in URL, forcing Supabase to process...');
          // Force Supabase to check and create session from the recovery token
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session:', error);
            return;
          }
          console.log('Session after recovery token processing:', data?.session?.user?.id);
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    if (Platform.OS === 'web') {
      handleDeepLink();
    }
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session);
          setIsLoggedIn(true);
          
          // Handle password recovery flow
          if (event === 'PASSWORD_RECOVERY') {
            console.log('PASSWORD_RECOVERY event detected, navigating to reset password page');
            router.replace('/resetpassword');
          }
        } else {
          setUser(null);
          setIsLoggedIn(false);
          setProfile(null);
          setOrg(null);
        }
        setInitialized(true);
        setLoading(false);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, [router]);
  const fetchTeamMembers = async (profileData = profile) => {
    if (!profileData || !user) return;
    // Only fetch team members if user is a lead or admin
    if (!profileData?.role || profileData.role === 'member') {
      setTeamMembers([]);
      return;
    }
    
    let query = supabase
      .from("profiles")
      .select("id, fullname, email, role, lead_id, org_id")
      .eq("org_id", profileData.org_id);
    
    // If lead, only get their team members
    if (profileData.role === 'lead') {
      query = query.eq("lead_id", user.user.id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.log("TEAM MEMBERS ERROR:", error.message);
      return;
    }
    
    setTeamMembers(data || []);
  };

  useEffect(() => {
    if (!user) return; // user not ready yet

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single(); // single because id is PK

      if (error) {
        console.log("PROFILE ERROR:", error.message);
        return;
      }

      console.log("PROFILE DATA:", data);
      setProfile(data);
      setAvatarUrl(data?.avatar_url || null);
      
      // Set role flags
      setIsAdmin(data?.role === 'admin');
      setIsLead(data?.role === 'lead');
    };

    const fetchOrganizations = async () => {
      // First get profile to know org_id
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.log("ORG: no profile found or error:", profileError?.message);
        return;
      }

      const orgId = profileData?.org_id;
      if (!orgId || orgId === 0) {
        console.log("ORG: no org_id on profile");
        return;
      }

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId);

      if (error) {
        console.log("ORG ERROR:", error.message);
        return;
      }

      console.log("ORG DATA:", data);
      setOrg(data);
    };

    const loadAllData = async () => {
      await fetchProfile();
      await fetchOrganizations();
      // Fetch team members after profile is loaded
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, fullname, email, role, lead_id, org_id")
        .eq("id", user.user.id)
        .single();
      if (profileData) {
        await fetchTeamMembers(profileData);
      }
    };

    loadAllData();
  }, [user]);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data) {
        showToast("Invalid email");
        return;
      }

      // WARNING: no password check (not secure)
      // temporary only

      setUser(data);
      setIsLoggedIn(true);

      // Fetch profile to check if user needs to complete onboarding
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profileData || !profileData.fullname) {
        // No profile or no fullname, go to info page
        showToast("Login Successful");
        router.replace("/info");
        return;
      }

      if (!profileData.org_id) {
        // Profile exists but no organization, go to create organization
        showToast("Login Successful");
        router.replace("/createorganization");
        return;
      }

      // Profile and organization exist, go to home
      showToast("Login Successful");
      router.replace("/(tabs)/home");
    } catch (err) {
      console.log(err);
        showToast("Login error");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    router.replace("/signin");
  };

  const uploadImage = async (localUri, userId) => {
    try {
      // read file as base64
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileName = `avatars/${userId}_${Date.now()}.jpg`;

      // upload to supabase storage bucket "avatars"
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, base64, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // save url to profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // update local state
      setAvatarUrl(publicUrl);
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));

      return publicUrl;
    } catch (err) {
      console.error("uploadImage error:", err.message);
      return null;
    }
  };

  if (!initialized) return null;

  const sendInvite = async (email, orgId, role = 'member') => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data: existingInvite, error: existingInviteError } = await supabase
        .from("invites")
        .select("id")
        .eq("org_id", orgId)
        .eq("email", normalizedEmail)
        .limit(1);

      if (existingInviteError) throw existingInviteError;

      if (existingInvite && existingInvite.length > 0) {
        return { success: false, error: "This email has already been invited." };
      }

      const { data, error: insertError } = await supabase
        .from("invites")
        .insert({
          org_id: orgId,
          user_id: user.user.id,
          email: normalizedEmail,
          role: role,
        })
        .select("id, token")
        .single();

      if (insertError) throw insertError;

      const { error: funcerror } = await supabase.functions.invoke(
        "send-invite",
        {
          body: { email: normalizedEmail, orgId, token: data.token, userId: user.user.id, role },
        },
      );

      if (funcerror) throw funcerror;
      return { success: true, token: data.token };
    } catch (error) {
      console.error("Invite error:", error);
      return { success: false, error: error.message };
    }
  };

  // Assign task with hierarchy validation
  const canAssignTask = (assigneeEmail) => {
    if (!profile || !assigneeEmail) return false;
    
    // Admin can assign to anyone in org
    if (profile.role === 'admin') return true;
    
    // Lead can assign to their team members
    if (profile.role === 'lead') {
      const isTeamMember = teamMembers.some(m => {
        // Check if assignee is a team member
        return m.id && m.role === 'member';
      });
      return isTeamMember;
    }
    
    // Member can only self-assign
    return assigneeEmail === user.user.email;
  };

  // Get assignable users based on role
  const getAssignableUsers = () => {
    if (!profile) return [];
    
    if (profile.role === 'admin') {
      // Admin can see everyone in org
      return teamMembers;
    }
    
    if (profile.role === 'lead') {
      // Lead can see their team members
      return teamMembers.filter(m => m.lead_id === user.user.id);
    }
    
    // Member can only assign to self
    return [{ id: user.user.id, fullname: profile.fullname, email: user.user.email }];
  };
  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        logout,
        loading,
        login,
        uploadImage,
        profile,
        setProfile,
        Org,
        setOrg,
        sendInvite,
        isAdmin,
        isLead,
        teamMembers,
        setTeamMembers,
        fetchTeamMembers,
        canAssignTask,
        getAssignableUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;