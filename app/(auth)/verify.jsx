import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ToastModal from "../../components/ToastModal";
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
    
    const [errorCode, setErrorCode] = useState("");
    const [errorPass, setErrorPass] = useState("");
    
    const validate = () => {
        let isValid = true;

        setErrorPass("");
        
        if (!code.trim()) {
            setErrorCode("Chưa nhập mã khôi phục");
            isValid = false;
        }
        if (!pass.trim()) {
            setErrorPass("Chưa nhập mật khẩu");
            isValid = false;
        }

        if (!isValid) return false;

        if (pass.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
            setErrorPass("Mật khẩu phải từ 8 ký tự và có ít nhất 1 ký tự đặc biệt");
            isValid = false;
        }

        return isValid;
    };

    const handleForgot = async () => {
        if (!validate()) return;
        
        try {
            const { data: verify } = await axios.post(`${API_URL}/auth/verify-otp`, { otp: code });
            
            if (verify.success) {
                const { data: reset } = await axios.post(`${API_URL}/auth/reset-password`, { userId: verify.userId, newPassword: pass });

                setIcon(reset.success ? "success" : "error");
                setTitle(reset.message);
                setAlert(true);
                if (reset.success)
                    setTimeout(() => router.replace("./sign-in"), 1100);
                setTimeout(() => setAlert(false), 1100);
            }
        } catch (err) {
            setIcon("error");
            setTitle(err.response?.data?.message || "Lỗi xác thực OTP");
            setAlert(true);

            setTimeout(() => setAlert(false), 1100);
        }
    };

    return (
        <View style={LAYOUT.container}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.h("fit-content"), LAYOUT.itemsCenter]}>
                    <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
                        <Ionicons name="chevron-back-outline" size={22} color={COLORS.heading} />
                    </TouchableOpacity>

                    <Text style={[TEXT.heading, LAYOUT.ml(16)]}>Xác thực khôi phục</Text>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82), LAYOUT.pt(32), LAYOUT.px(24)]}>
                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.mb(12)]}>Mã khôi phục</Text>
                <TextInput
                    placeholder=""
                    value={code}
                    onChangeText={setCode}
                    style={[LAYOUT.rounded(12), LAYOUT.py(14), LAYOUT.px(18), LAYOUT.bg(COLORS.background3), LAYOUT.color(COLORS.paragraph), TEXT.subText, TEXT.size(16)]}
                />
                {errorCode !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorCode}</Text>}

                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.mb(8)]}>Mật khẩu mới</Text>
                <TextInput
                    placeholder=""
                    value={pass}
                    onChangeText={setPass}
                    style={[LAYOUT.rounded(12), LAYOUT.py(10), LAYOUT.px(12), LAYOUT.bg(COLORS.background3), LAYOUT.color(COLORS.paragraph), TEXT.subText, TEXT.size(16)]}
                />
                {errorPass !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorPass}</Text>}

                <TouchableOpacity onPress={handleForgot} style={[LAYOUT.bg(COLORS.button), LAYOUT.py(14), LAYOUT.mt(44), LAYOUT.rounded(20)]}>
                    <Text style={[TEXT.text, TEXT.size(22), TEXT.center, LAYOUT.color(COLORS.textLight)]}>Xác nhận</Text>
                </TouchableOpacity>
            </View>

            <ToastModal status={icon} title={title} content={null} visible={alert} />
        </View>
    );
}
