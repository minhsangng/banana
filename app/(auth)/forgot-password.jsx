import { useState } from "react";
import { View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LAYOUT, TEXT, BUTTON } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import axios from "axios";
import { API_URL } from "../../constants/api";

export default function ForgotPassScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [alert, setAlert] = useState(null);

    const handleForgot = async () => {
        if (!email) return setAlert({ type: "error", message: "Nhập email" });

        try {
            const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            setAlert({ type: "success", message: res.data.message });
        } catch (err) {
            setAlert({ type: "error", message: err.response?.data?.message || "Lỗi hệ thống" });
        }
    };

    return (
        <SafeAreaView style={LAYOUT.container}>
            <View style={[LAYOUT.main, LAYOUT.px(24), LAYOUT.pt(32)]}>
                <Text style={[TEXT.heading, LAYOUT.mb(16)]}>Quên mật khẩu</Text>
                <TextInput
                    placeholder="Nhập email"
                    value={email}
                    onChangeText={setEmail}
                    style={[LAYOUT.rounded(12), LAYOUT.py(10), LAYOUT.px(12), { backgroundColor: COLORS.background3, color: COLORS.heading }]}
                />

                {alert && <Text style={{ color: alert.type === "error" ? "red" : "green", marginTop: 10 }}>{alert.message}</Text>}

                <TouchableOpacity onPress={handleForgot} style={[LAYOUT.mt(24)]}>
                    <Text style={[BUTTON.primary]}>Xác nhận</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
