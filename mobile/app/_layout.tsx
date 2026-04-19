import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaProvider>
        <StatusBar
          style="light"
          backgroundColor={colors.background}
          translucent={false}
        />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="preview"
            options={{
              animation: "slide_from_right",
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          <Stack.Screen
            name="generate"
            options={{
              animation: "slide_from_bottom",
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
