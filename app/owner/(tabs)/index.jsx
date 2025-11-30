import { View, ImageBackground, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import * as SecureStore from "expo-secure-store";
import PushNotification from "../../../components/PushNotification";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
    const [isLogin, setIsLogin] = useState(false);

    const initData = async () => {
        const userStr = await SecureStore.getItemAsync("userInfo");
        if (userStr) setIsLogin(true);
    };

    useEffect(() => {
        initData();
    }, [])

    return (
        <PushNotification>
            <View style={[LAYOUT.container]}>
                <NavBar isLogin={isLogin} heading={"Trang chủ"} />
                <View style={[LAYOUT.main, LAYOUT.h(height * 0.77), { overflow: "hidden" }]}>
                    <ImageBackground source={require("../../../assets/images/background-dashboard.png")} style={[LAYOUT.wFull, LAYOUT.hFull]}></ImageBackground>
                </View>
            </View>
        </PushNotification>
    );
}