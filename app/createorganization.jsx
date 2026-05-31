import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Bounce } from "react-native-animated-spinkit";

const createorganization = () => {
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const router = useRouter();

  const handleNext = async () => {
    setLoading(false);
    try {
      if (!organization) {
        Alert.alert("Error", "Please enter the organization name.");
        return;
      }

      // Get current session to ensure auth context is established
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        Alert.alert("Error", "Session expired. Please log in again.");
        router.replace("/signin");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "User not found. Please log in again.");
        router.replace("/signin");
        return;
      }

      const { error: insertError } = await supabase
        .from("organizations")
        .insert({ name: organization, created_by: user.id });

      if (insertError) {
        Alert.alert("Error", insertError.message);
        return;
      }

      // Fetch the created organization by name to get its ID
      const { data: orgData, error: fetchError } = await supabase
        .from("organizations")
        .select("id")
        .eq("name", organization)
        .eq("created_by", user.id)
        .single();

      if (fetchError || !orgData) {
        Alert.alert("Error", "Failed to retrieve created organization");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ org_id: orgData.id, role: "admin" })
        .eq("id", user.id);

      if (profileError) {
        Alert.alert("Error", profileError.message);
        return;
      }
      setLoading(false);
      router.replace("/(tabs)/home");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  return (
    <View className="absolute top-[220px] w-full">
      <View className="p-5">
        <View className="gap-3 mb-4">
          <Text className="text-xl">Organization</Text>
          <TextInput
            value={organization}
            onChangeText={(text) => setOrganization(text)}
            className="bg-surface border border-secondary rounded-lg shadow-sm p-4"
            placeholder="Make Your Organization"
          />
        </View>
        <View>
          <TouchableOpacity
            className={`items-center p-3 ${loading ? "bg-blue-400" : "bg-primary"} rounded-lg`}
            onPress={() => handleNext()}
          >
            {loading ? (
              <Bounce size={25} color="white" className="text-center mx-auto" />
            ) : (
              <Text className="text-white">Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default createorganization;
