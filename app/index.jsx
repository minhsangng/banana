import { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { Sound } from "expo-audio";
import * as SecureStore from "expo-secure-store";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();
  const [sound, setSound] = useState(null);

  const playSound = async () => {
    try {
      const s = new Sound();

      await s.loadAsync(
        require("../assets/audios/babababanana.mp3")
      );

      setSound(s);
      await s.playAsync();
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

          if (user.role === "Owner") {
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
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/main-logo.png")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background1,
  },
});
