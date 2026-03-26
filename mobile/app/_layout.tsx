import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0A0A0F" }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0A0A0F" translucent={false} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0A0A0F" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="preview"
            options={{
              animation: "slide_from_right",
              contentStyle: { backgroundColor: "#0A0A0F" },
            }}
          />
          <Stack.Screen
            name="generate"
            options={{
              animation: "slide_from_bottom",
              contentStyle: { backgroundColor: "#0A0A0F" },
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}