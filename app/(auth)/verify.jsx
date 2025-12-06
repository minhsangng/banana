import { useState } from "react";
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ToastModal from "../../components/ToastModal";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../constants/api";
import axios from "axios";

const { height } = Dimensions.get("window");

export default function VerifyPassScreen() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [pass, setPass] = useState("");
    const [icon, setIcon] = useState("");
    const [title, setTitle] = useState("");
    const [alert, setAlert] = useState(false);

    const handleForgot = async () => {
        if (code === "") {
            setIcon("error");
            setTitle("Nhập mã khôi phục");
            setAlert(true);

            setTimeout(() => setAlert(false), 1100);
        }
        try {
            const userStr = await SecureStore.getItemAsync("userInfo");
            const refreshToken = JSON.parse(userStr).refreshToken;
            const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { otp: code, resetToken: refreshToken });

            if (data.allowReset) {
                const { data } = await axios.post(`${API_URL}/reset-password`, { resetToken: refreshToken, newPassword: pass })

                setIcon(data.success ? "success" : "error");
                setTitle(data.success ? "Khôi phục mật khẩu thành công" : "Khôi phục mật khẩu thất bại");
                setAlert(true);
                setTimeout(() => (setAlert(false), router.replace("./sign-in")), 1100);
            }
        } catch (err) {
            setIcon("error");
            setTitle(err.response?.data?.message || "Lỗi hệ thống");
            setAlert(true);

            setTimeout(() => setAlert(false), 1100);
        }
    };

    return (
        <SafeAreaView style={LAYOUT.container}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.h("fit-content"), LAYOUT.itemsCenter]}>
                    <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
                        <Ionicons name="chevron-back-outline" size={22} color={COLORS.heading} />
                    </TouchableOpacity>

                    <Text style={[TEXT.heading, LAYOUT.ml(16)]}>Xác thực khôi phục</Text>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82), LAYOUT.pt(32), LAYOUT.px(24)]}>
                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.mb(8)]}>Mã khôi phục</Text>
                <TextInput
                    placeholder=""
                    value={code}
                    onChangeText={setCode}
                    style={[LAYOUT.rounded(12), LAYOUT.py(10), LAYOUT.px(12), LAYOUT.bg(COLORS.background3), LAYOUT.color(COLORS.paragraph), TEXT.subText, TEXT.size(16)]}
                />

                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.mb(8)]}>Mật khẩu mới</Text>
                <TextInput
                    placeholder=""
                    value={pass}
                    onChangeText={setPass}
                    style={[LAYOUT.rounded(12), LAYOUT.py(10), LAYOUT.px(12), LAYOUT.bg(COLORS.background3), LAYOUT.color(COLORS.paragraph), TEXT.subText, TEXT.size(16)]}
                />

                <TouchableOpacity onPress={handleForgot} style={[LAYOUT.bg(COLORS.button), LAYOUT.py(14), LAYOUT.mt(44), LAYOUT.rounded(20)]}>
                    <Text style={[TEXT.text, TEXT.size(22), TEXT.center, LAYOUT.color(COLORS.textLight)]}>Nhận mã khôi phục</Text>
                </TouchableOpacity>
            </View>

            <ToastModal status={icon} title={title} content={null} visible={alert} />
        </SafeAreaView>
    );
}
