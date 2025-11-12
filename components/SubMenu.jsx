import { View, Text, Animated, Dimensions, TouchableWithoutFeedback } from "react-native";
import { useEffect, useRef } from "react";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");
const SUBMENU_WIDTH = 330;

export default function SubMenu({ visible, setVisible, header, content }) {
    const slideAnim = useRef(new Animated.Value(SUBMENU_WIDTH)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 0 : SUBMENU_WIDTH,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible, content]);

    if (!visible) return null;

    return (
        <View style={{ position: "absolute", top: 0, left: 0, width, height, zIndex: 1000 }}>
            <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                <View style={{ position: "absolute", width, height, backgroundColor: "rgba(0,0,0,0.3)" }} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    LAYOUT.w(SUBMENU_WIDTH),
                    LAYOUT.h(height),
                    LAYOUT.absolute,
                    LAYOUT.top(0),
                    LAYOUT.right(0),
                    LAYOUT.roundedtl(44),
                    LAYOUT.roundedbl(44),
                    {
                        backgroundColor: COLORS.heading,
                        shadowColor: "#000",
                        shadowOpacity: 0.25,
                        shadowOffset: { width: 0, height: 4 },
                        shadowRadius: 4,
                        elevation: 4,
                        transform: [{ translateX: slideAnim }]
                    }
                ]}
            >
                <View style={[LAYOUT.h(150), LAYOUT.w(SUBMENU_WIDTH - 60), LAYOUT.mx(), LAYOUT.justifyCenter, LAYOUT.borderb(1, COLORS.background3)]}>
                    {header}
                </View>
                <View style={[LAYOUT.w(SUBMENU_WIDTH - 60), LAYOUT.mx()]}>
                    {content}
                </View>
            </Animated.View>
        </View>
    );
}