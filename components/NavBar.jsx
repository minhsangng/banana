import { View, Text } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { Portal } from "react-native-paper";
import SubMenu from "../components/SubMenu";

export default function NavBar({ isLogin, heading }) {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [type, setType] = useState(null);

    return (
        <View style={[LAYOUT.header, LAYOUT.pt(52)]}>
            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
                <Text style={[TEXT.heading]}>{heading}</Text>
                <View>
                    <Ionicons
                        name="person-outline"
                        style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]}
                        onPress={() =>
                            isLogin
                                ? (setType("person"), setMenuVisible(true))
                                : router.replace("../(auth)/sign-in")
                        }
                    />
                </View>
            </View>
            <Portal>
                <SubMenu visible={menuVisible} setVisible={setMenuVisible} type={type} />
            </Portal>
        </View>
    );
}