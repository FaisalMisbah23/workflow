import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env variables");
}

let storage;
// Choose storage based on runtime environment to avoid server-side `window` errors.
if (typeof window !== "undefined") {
  // Web (browser) environment: prefer localStorage
  if (typeof localStorage !== "undefined") {
    storage = localStorage;
  }
  // React Native environment (including web via react-native-web): use AsyncStorage when available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    if (AsyncStorage) storage = AsyncStorage;
  } catch (e) {
    // ignore, fallback to localStorage if present
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(storage ? { storage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
