import { useAuth } from "./hooks/useAuth";
import {
  initSocket,
  joinUser,
  listenNotification,
  removeNotificationListeners,
} from "./services/socket";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import { useEffect } from "react";
import { initSearchHistoryTable } from "./services/searchHistory";
import { initRecentlyViewedTable } from "./services/recentlyViewed";


export default function App() {

  const { user } = useAuth(); // 🔥 dùng giống AddressForm

  useEffect(() => {
    initSearchHistoryTable();
    initRecentlyViewedTable();
  }, []);

  useEffect(() => {
    if (!user?.id) return; // 🔥 sửa ở đây

    const socket = initSocket();

    console.log("👉 USER ID:", user.id);

    joinUser(user.id);

    listenNotification();

    return () => {
      removeNotificationListeners();
      socket.disconnect();
    };
  }, [user]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}