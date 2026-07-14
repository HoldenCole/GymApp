import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FastsProvider } from "../src/fasts";
import { FitnessProvider } from "../src/fitness";
import { FoodProvider } from "../src/food";
import { JournalProvider } from "../src/journal";
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
        <FoodProvider>
          <FastsProvider>
            <JournalProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
                <Stack.Screen name="settings" options={detailScreen("Settings")} />
                <Stack.Screen name="plan" options={detailScreen("Plan")} />
                <Stack.Screen name="split" options={detailScreen("Split")} />
                <Stack.Screen name="recipe/[id]" options={detailScreen("Recipe")} />
                <Stack.Screen name="add-food" options={detailScreen("Add food")} />
                <Stack.Screen
                  name="add-commitment"
                  options={detailScreen("Your commitment")}
                />
                <Stack.Screen name="reading/[idx]" options={detailScreen("Reading")} />
              </Stack>
            </JournalProvider>
          </FastsProvider>
        </FoodProvider>
      </FitnessProvider>
    </ProfileProvider>
  );
}
