import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { Provider as PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const [fontLoader] = useFonts({
    "Modak": require("../assets/fonts/DFVN-Modak.ttf"),
    "GochiHand": require("../assets/fonts/DFVN-GochiHand.ttf"),
  });

  if (!fontLoader) return null;
  
  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}