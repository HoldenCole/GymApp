import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";
import { useProfile } from "../../src/profile";
import { colors } from "../../src/theme";

/**
 * The five tabs (Project Master §1; UI brief §3):
 * Home the glance · Fasting the crown jewel · Macros the ledger ·
 * Food the browse · Rule the page. Five layouts, one soul.
 */

function glyph(char: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ color, fontSize: 18, fontFamily: "Georgia" }}>{char}</Text>
  );
}

export default function TabsLayout() {
  const { profile, loaded } = useProfile();
  if (!loaded) return null; // wait for persisted state — no flash
  if (!profile.onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.inkNavy,
        tabBarInactiveTintColor: colors.grayInactive,
        tabBarStyle: {
          backgroundColor: colors.paperWhite,
          borderTopColor: colors.hairlineMajor,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 10, letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: glyph("⌂") }} />
      <Tabs.Screen name="fasting" options={{ title: "Fasting", tabBarIcon: glyph("✠") }} />
      <Tabs.Screen name="macros" options={{ title: "Macros", tabBarIcon: glyph("≡") }} />
      <Tabs.Screen name="food" options={{ title: "Food", tabBarIcon: glyph("❖") }} />
      <Tabs.Screen name="rule" options={{ title: "Rule", tabBarIcon: glyph("¶") }} />
    </Tabs>
  );
}
