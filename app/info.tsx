import { ThemeContext } from "@/context/ThemeContext";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { Bounce } from "react-native-animated-spinkit";

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

const info = () => {
  const [fullname, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { isDark } = useContext(ThemeContext);

  const handleNext = async () => {
    setLoading(true);
    try {
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View className="relative flex-1  h-full w-full dark:bg-gray-900">
      <View className="p-5 mt-auto mb-auto">
        <View className="gap-3 mb-4">
          <Text className="text-xl dark:text-white">Full Name</Text>
          <TextInput
            value={fullname}
            onChangeText={(text) => setFullName(text)}
            className={`dark:text-white dark:placeholder:text-gray-200 border border-secondary dark:border-white rounded-lg shadow-sm p-4`}
            placeholder="John Doe"
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

export default info;
