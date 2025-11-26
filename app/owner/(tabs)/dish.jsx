import { View, Text, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

export default function DishScreen() {
    const [isLogin, setIsLogin] = useState(false);

    const initData = async () => {
        const userStr = await SecureStore.getItemAsync("userInfo");
        if (userStr) setIsLogin(true);
    };

    useEffect(() => {
        initData();
    }, [])

    return (
        <View style={[LAYOUT.container]}>
            <NavBar isLogin={isLogin} heading={"Thực đơn"} />
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.77)]}>

            </View>
        </View>
    );
}