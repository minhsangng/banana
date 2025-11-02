import { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();
  const [sound, setSound] = useState(null);

  // Hàm phát âm thanh
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

    // Chuyển trang sau 3.2 giây
    const timer = setTimeout(() => {
      router.replace("../onboard/");
    }, 3200);

    // Dọn dẹp timer khi component unmount
    return () => clearTimeout(timer);
  }, [router]); // thêm router vào dependency để không báo ESLint

  useEffect(() => {
    // Dọn dẹp âm thanh khi component unmount hoặc sound thay đổi
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
    backgroundColor: COLORS.primary,
  },
});
