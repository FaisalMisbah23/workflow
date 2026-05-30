import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
    Alert,
    Platform,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from "react-native";

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

const info = () => {
  const [fullname, setFullName] = useState("");
  const router = useRouter();
  const { user } = useContext(UserContext);

  const handleNext = async () => {
    if (!fullname) {
      showToast("Please Enter Your fullname.");
      router.replace("/info");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showToast("User not found. Please log in again.");
      router.replace("/signin");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      fullname: fullname,
    });

    if (error) {
      showToast(error.message);
      console.log(error.message);
    }
    router.replace("/createorganization");
  };
  console.log(user);

  return (
    <View className="absolute top-[220px] w-full">
      <View className="p-5">
        <View className="gap-3 mb-4">
          <Text className="text-xl">Full Name</Text>
          <TextInput
            value={fullname}
            onChangeText={(text) => setFullName(text)}
            className="bg-surface border border-secondary rounded-lg shadow-sm p-4"
            placeholder="John Doe"
          />
        </View>
        <View>
          <TouchableOpacity
            className="items-center p-3 bg-primary rounded-lg"
            onPress={() => handleNext()}
          >
            <Text className="text-white">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default info;
