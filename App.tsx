import "react-native-gesture-handler";
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DailyTargetScreen from "./src/screens/DailyTargetScreen";
import LogFoodScreen from "./src/screens/LogFoodScreen";
import TodaysFoodLogScreen from "./src/screens/TodaysFoodLogScreen";
import StandaloneScreen from "./src/screens/StandaloneScreen";
import PantryListScreen from "./src/screens/PantryListScreen";
import PantryFormScreen from "./src/screens/PantryFormScreen";
import CookRecommendationScreen from "./src/screens/CookRecommendationScreen";
import EatOutRecommendationScreen from "./src/screens/EatOutRecommendationScreen";
import { colors } from "./src/theme";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Restoring a saved session (checking the stored token against
    // /auth/me) - avoids a flash of the login screen for users who are
    // already logged in.
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="DailyTarget"
            component={DailyTargetScreen}
            options={{ headerShown: true, title: "Daily Target" }}
          />
          <Stack.Screen
            name="LogFood"
            component={LogFoodScreen}
            options={{ headerShown: true, title: "Log Food" }}
          />
          <Stack.Screen
            name="TodaysFoodLog"
            component={TodaysFoodLogScreen}
            options={{ headerShown: true, title: "Today's Log" }}
          />
          <Stack.Screen
            name="Standalone"
            component={StandaloneScreen}
            options={{ headerShown: true, title: "Quick Calculator" }}
          />
          <Stack.Screen
            name="Pantry"
            component={PantryListScreen}
            options={{ headerShown: true, title: "Pantry" }}
          />
          <Stack.Screen
            name="PantryForm"
            component={PantryFormScreen}
            options={{ headerShown: true, title: "Pantry Item" }}
          />
          <Stack.Screen
            name="CookRecommendation"
            component={CookRecommendationScreen}
            options={{ headerShown: true, title: "Cook" }}
          />
          <Stack.Screen
            name="EatOutRecommendation"
            component={EatOutRecommendationScreen}
            options={{ headerShown: true, title: "Eat Out" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
