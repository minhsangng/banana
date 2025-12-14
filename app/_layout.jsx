import { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { Provider as PaperProvider } from "react-native-paper";
import * as Notifications from 'expo-notifications';
export default function RootLayout() {
  const [fontLoader] = useFonts({
    "Modak": require("../assets/fonts/DFVN-Modak.ttf"),
    "GochiHand": require("../assets/fonts/DFVN-GochiHand.ttf"),
  });
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.screen === "detail-order" && data?.orderId) {
          router.push(`/detailorder/${data.orderId}`);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  if (!fontLoader) return null;

  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}