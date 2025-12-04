import { View, Text } from "react-native";
import Modal from "react-native-modal";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";

export default function ToastModal({ width = "auto", height = "auto", status, title, content, visible }) {
    return (
        <Modal
            isVisible={visible}
            animationIn="zoomIn"
            animationOut="zoomOut"
            backdropOpacity={0.5}
        >
            <View style={[LAYOUT.rounded(22), LAYOUT.p(24), LAYOUT.itemsCenter, LAYOUT.w(width), LAYOUT.h(height), { backgroundColor: "#fff" }]}>
                <Ionicons name={status === "success" ? "checkmark-circle-outline" : status === "warning" ? "alert-circle-outline" : "close-circle-outline" } size={status === "handle" ? 1 : 72} color={status === "success" ? "#4CAF50" : status === "warning" ? "orange" : "red"} />
                <Text style={[TEXT.text, TEXT.center, TEXT.size(24), LAYOUT.mt(10)]}>
                    {title}
                </Text>
                {typeof content === "function" ? content() : content}
            </View>
        </Modal>
    );
}