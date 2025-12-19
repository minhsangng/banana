import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { Provider as PaperProvider } from "react-native-paper";
import PushNotification from "../components/PushNotification";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Modak: require("../assets/fonts/DFVN-Modak.ttf"),
    GochiHand: require("../assets/fonts/DFVN-GochiHand.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <PushNotification>
      <PaperProvider>
        <Slot />
      </PaperProvider>
    </PushNotification>
  );
}
