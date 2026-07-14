import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FitnessProvider } from "../src/fitness";
import { ProfileProvider } from "../src/profile";
import { colors } from "../src/theme";

const detailScreen = (title: string) => ({
  headerShown: true,
  title,
  headerTintColor: colors.inkNavy,
  headerStyle: { backgroundColor: colors.paperWhite },
  headerShadowVisible: false,
});

export default function RootLayout() {
  return (
    <ProfileProvider>
      <FitnessProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" options={detailScreen("Settings")} />
          <Stack.Screen name="plan" options={detailScreen("Plan")} />
          <Stack.Screen name="split" options={detailScreen("Split")} />
        </Stack>
      </FitnessProvider>
    </ProfileProvider>
  );
}
