import { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { COLORS } from "../constants/colors";
import { LAYOUT } from "../assets/styles/base.styles";
import * as SecureStore from "expo-secure-store";

export default function Splash() {
  const router = useRouter();
  const [sound, setSound] = useState(null);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/audios/babababanana.mp3")
      );

      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log("Error loading sound:", error);
    }
  };

  useEffect(() => {
    playSound();

    const loadUser = async () => {
      try {
        const userStr = await SecureStore.getItemAsync("userInfo");

        setTimeout(() => {
          if (!userStr) {
            router.replace("./onboard/");
            return;
          }

          const user = JSON.parse(userStr);

          if (user.role === "Owner" || user.role === "Employee") {
            router.replace("./owner/(tabs)/");
          } else {
            router.replace("./onboard/");
          }
        }, 3200);
      } catch (error) {
        console.log("Lỗi load user:", error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  return (
    <View style={[LAYOUT.container, LAYOUT.bg(COLORS.background1), LAYOUT.justifyCenter, LAYOUT.itemsCenter]}>
      <Image source={require("../assets/images/main-logo.png")} />
    </View>
  );
}