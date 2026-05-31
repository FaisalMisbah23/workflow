import { extractIntent, executeIntent, transcribeAudio, VoiceIntent } from "@/lib/voiceApi";
import { UserContext } from "@/context/UserContext";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

let globalRecording: Audio.Recording | null = null;

const Voice = () => {
  const { Org } = useContext(UserContext) as any;
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [intent, setIntent] = useState<VoiceIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingPhase, setRecordingPhase] = useState<"idle" | "preparing" | "recording" | "stopping">("idle");
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isPreparingRef = useRef(false);
  const isStoppingRef = useRef(false);

  const releaseRecordingSafely = async (rec: Audio.Recording | null) => {
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
    } catch {
      // Ignore if already stopped/unloaded.
    }
  };

  useEffect(() => {
    return () => {
      const cleanup = async () => {
        try {
          await releaseRecordingSafely(recordingRef.current);
          await releaseRecordingSafely(globalRecording);
        } catch {
          // Ignore cleanup errors during unmount.
        }
      };
      void cleanup();
    };
  }, []);

  const startRecording = async () => {
    if (loading || recordingRef.current || isPreparingRef.current || isStoppingRef.current) {
      return;
    }

    setError(null);
    setIntent(null);
    setTranscript("");
    isPreparingRef.current = true;
    setRecordingPhase("preparing");

    try {
      // Ensure no stale recording survives from prior renders/hot reloads.
      if (globalRecording) {
        await releaseRecordingSafely(globalRecording);
        globalRecording = null;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Microphone permission is needed.");
        setRecordingPhase("idle");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      globalRecording = newRecording;
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      recordingRef.current = newRecording;
      setRecording(newRecording);
      setRecordingPhase("recording");
    } catch (err: any) {
      await releaseRecordingSafely(globalRecording);
      globalRecording = null;
      setError(err?.message || "Could not start recording");
      setRecordingPhase("idle");
    } finally {
      isPreparingRef.current = false;
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current || isPreparingRef.current || isStoppingRef.current) return;

    const activeRecording = recordingRef.current;
    isStoppingRef.current = true;
    setRecordingPhase("stopping");
    setLoading(true);

    try {
      await activeRecording.stopAndUnloadAsync();
      const uri = activeRecording.getURI();
      recordingRef.current = null;
      globalRecording = null;
      setRecording(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      if (!uri) {
        setError("Recording failed to save.");
        return;
      }

       const base64 = await FileSystem.readAsStringAsync(uri, {
         encoding: FileSystem.EncodingType.Base64,
       });

       if (typeof base64 !== 'string') {
         throw new Error('Failed to read audio file as base64 string');
       }

      const transcribe = await transcribeAudio({
        audioBase64: base64,
        mimeType: "audio/m4a",
        locale: "en-US",
      });

      setTranscript(transcribe.transcript || "");
      if (!transcribe.transcript) {
        setError("No transcript returned. Try again.");
        return;
      }

      const intentResult = await extractIntent({
        transcript: transcribe.transcript,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        orgId: Org?.[0]?.id,
      });

      setIntent(intentResult);
    } catch (err: any) {
      setError(err?.message || "Voice processing failed");
    } finally {
      isStoppingRef.current = false;
      setLoading(false);
      setRecordingPhase("idle");
    }
  };

  const handlePressIn = () => {
    void startRecording();
  };

  const handlePressOut = () => {
    void stopRecording();
  };

  const updateIntentField = (field: keyof VoiceIntent["entities"], value: any) => {
    if (!intent) return;
    setIntent({
      ...intent,
      entities: { ...intent.entities, [field]: value },
    });
  };

  const submitIntent = async () => {
    if (!intent) return;
    setLoading(true);
    setError(null);
    try {
      const result = await executeIntent({ intent, confirmed: true });
      Alert.alert("Success", result.summary || "Task created");
      setIntent(null);
      setTranscript("");
    } catch (err: any) {
      setError(err?.message || "Failed to execute intent");
    } finally {
      setLoading(false);
    }
  };

  const confidenceWarning = intent && intent.confidence < 0.85;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-5">
        <Text className="text-2xl font-semibold mb-2">Voice Assistant</Text>
        <Text className="text-gray-600 mb-5">Hold to record and create a task.</Text>

        <TouchableOpacity
          className={`items-center justify-center h-16 rounded-xl ${recording ? "bg-red-500" : "bg-primary"}`}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={loading || recordingPhase === "preparing" || recordingPhase === "stopping"}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name={recording ? "mic" : "mic-outline"} size={22} color="white" />
            <Text className="text-white font-semibold">
              {recording ? "Recording..." : "Hold to Talk"}
            </Text>
          </View>
        </TouchableOpacity>

        {loading && (
          <Text className="text-gray-500 mt-4">Processing...</Text>
        )}

        {error && (
          <Text className="text-red-500 mt-4">{error}</Text>
        )}

        {transcript.length > 0 && (
          <View className="mt-6">
            <Text className="text-sm text-gray-500 mb-2">Transcript</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3"
              value={transcript}
              onChangeText={setTranscript}
              multiline
            />
          </View>
        )}

        {intent && (
          <View className="mt-6">
            <Text className="text-sm text-gray-500 mb-2">Confirm Task</Text>
            {confidenceWarning && (
              <Text className="text-amber-600 mb-2">
                Low confidence. Please verify fields before confirming.
              </Text>
            )}

            <Text className="text-xs text-gray-500 mb-1">Title</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 mb-3"
              value={intent.entities.title || ""}
              onChangeText={(val) => updateIntentField("title", val)}
            />

            <Text className="text-xs text-gray-500 mb-1">Priority</Text>
            <View className="border border-gray-200 rounded-lg mb-3">
              <Picker
                selectedValue={intent.entities.priority || "Medium"}
                onValueChange={(val) => updateIntentField("priority", val)}
              >
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>

            <Text className="text-xs text-gray-500 mb-1">Assignee Name</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 mb-3"
              value={intent.entities.assigneeName || ""}
              onChangeText={(val) => updateIntentField("assigneeName", val)}
            />

            <Text className="text-xs text-gray-500 mb-1">Deadline (ISO or YYYY-MM-DD)</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 mb-4"
              value={intent.entities.deadlineIso || ""}
              onChangeText={(val) => updateIntentField("deadlineIso", val)}
            />

            <TouchableOpacity
              className="bg-primary rounded-xl py-3 items-center"
              onPress={submitIntent}
              disabled={loading}
            >
              <Text className="text-white font-semibold">Confirm & Create</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Voice;
