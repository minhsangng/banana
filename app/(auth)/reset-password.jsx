import { useState } from "react";
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ToastModal from "../../components/ToastModal";
import { API_URL } from "../../constants/api";
import axios from "axios";

const { height } = Dimensions.get("window");

export default function ForgotPassScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [icon, setIcon] = useState("");
    const [title, setTitle] = useState("");
    const [alert, setAlert] = useState(false);
    
    const [errorEmail, setErrorEmail] = useState("");
    
    const validate = () => {
        let isValid = true;

        setErrorEmail("");

        if (!email.trim()) {
            setErrorEmail("Chưa nhập email");
            isValid = false;
        }

        if (!isValid) return false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorEmail("Email chưa đúng định dạng (example@gmail.com)");
            isValid = false;
        }

        return isValid;
    };

    const handleForgot = async () => {
        if (!validate()) return;
        
        try {
            const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            if (data.success) {
                setIcon("success");
                setTitle(data.message);
                setAlert(true);
                
                setTimeout(() => router.push("./verify"), 1100);
            } else {
                setIcon("error");
                setTitle(data.message);
                setAlert(true);
                
                setTimeout(() => setAlert(false), 1100);
            }
        } catch (err) {
            setIcon("error");
            setTitle(err.response?.data?.message || "Lỗi tạo OTP");
            setAlert(true);

            setTimeout(() => setAlert(false), 1100);
        }
    };

    return (
        <SafeAreaView style={LAYOUT.container}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.h("fit-content"), LAYOUT.itemsCenter]}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back-outline" size={22} color={COLORS.heading} />
                    </TouchableOpacity>

                    <Text style={[TEXT.heading, LAYOUT.ml(16)]}>Khôi phục mật khẩu</Text>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82), LAYOUT.pt(32), LAYOUT.px(24)]}>
                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.mb(8)]}>Email khôi phục</Text>
                <TextInput keyboardType="email-address"
                    placeholder="Nhập email"
                    value={email}
                    onChangeText={setEmail}
                    style={[LAYOUT.rounded(12), LAYOUT.py(14), LAYOUT.px(18), LAYOUT.bg(COLORS.background3), LAYOUT.color(COLORS.paragraph), TEXT.subText, TEXT.size(16)]}
                />
                {errorEmail !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorEmail}</Text>}
                
                <Text style={[TEXT.paragraph, TEXT.size(12), LAYOUT.mt(8)]}>* Mã khôi phục mật khẩu sẽ được gửi qua email của bạn. Đừng quên kiểm tra trong mục spam nếu bạn chưa nhận được!</Text>

                <TouchableOpacity onPress={handleForgot} style={[LAYOUT.bg(COLORS.button), LAYOUT.py(14), LAYOUT.mt(44), LAYOUT.rounded(20)]}>
                    <Text style={[TEXT.text, TEXT.size(22), TEXT.center, LAYOUT.color(COLORS.textLight)]}>Nhận mã khôi phục</Text>
                </TouchableOpacity>
            </View>

            <ToastModal status={icon} title={title} content={null} visible={alert} />
        </SafeAreaView>
    );
}
