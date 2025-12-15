import { useEffect } from "react";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { Provider as PaperProvider } from "react-native-paper";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Modak: require("../assets/fonts/DFVN-Modak.ttf"),
    GochiHand: require("../assets/fonts/DFVN-GochiHand.ttf"),
  });

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url;
        if (url) {
          Linking.openURL(url);
        }
      }
    );

    Notifications.getLastNotificationResponseAsync().then((response) => {
      const url = response?.notification.request.content.data?.url;
      if (url) {
        Linking.openURL(url);
      }
    });

    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
