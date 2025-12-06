import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    StyleSheet
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { API_URL } from "../../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import ToastModal from "../../components/ToastModal";

const { height } = Dimensions.get("window");

export default function SignInScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [icon, setIcon] = useState("");
    const [title, setTitle] = useState("");
    const [alert, setAlert] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            return setAlert({ type: "error", message: "Vui lòng nhập đủ thông tin" });
        }

        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            setIcon(data.success ? "success" : "error");
            setTitle(data.success ? "Đăng nhập thành công" : "Đăng nhập thất bại");
            setAlert(true);

            await SecureStore.setItemAsync("accessToken", data.token);

            if (data.refreshToken) {
                await SecureStore.setItemAsync("refreshToken", data.refreshToken);
            }

            await SecureStore.setItemAsync("userInfo", JSON.stringify(data.user));

            await new Promise(r => setTimeout(r, 700));

            if (data.user.role === "Customer") {
                router.replace("/(tabs)");
            } else {
                router.replace("/owner/(tabs)");
            }
        } catch (error) {
            setIcon("error");
            setTitle(error.response?.data?.message || "Lỗi hệ thống");
            setAlert(true);

            setTimeout(() => setAlert(false), 1100);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.h("fit-content"), LAYOUT.itemsCenter]}>
                    <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
                        <Ionicons name="chevron-back-outline" size={22} color={COLORS.heading} />
                    </TouchableOpacity>

                    <Text style={[TEXT.heading, LAYOUT.ml(65)]}>Đăng Nhập</Text>
                </View>
            </View>

            {/* Main Body */}
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82), styles.formWrapper]}>
                <Text style={styles.welcome}>Welcome!</Text>
                <Text style={styles.subText}>
                    Đăng nhập vào tài khoản của bạn để đặt hàng ngay
                </Text>

                {/* Phone Number */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                    placeholder="example@gmail.com"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                />

                {/* Password */}
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        placeholder="********"
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor={COLORS.paragraph}
                        secureTextEntry={!showPassword}
                        style={styles.passwordInput}
                    />

                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={[LAYOUT.pr(6)]}
                    >
                        <Ionicons style={[TEXT.size(20), { color: COLORS.heading }]} name={showPassword ? "eye-off-outline" : "eye-outline"}></Ionicons>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push("/(auth)/reset-password")}>
                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity style={[LAYOUT.bg(COLORS.button), LAYOUT.py(14), LAYOUT.rounded(20)]} onPress={handleLogin}>
                    <Text style={[TEXT.text, TEXT.size(22), TEXT.center, LAYOUT.color(COLORS.textLight)]}>Đăng nhập</Text>
                </TouchableOpacity>

                <Text style={[TEXT.paragraph, TEXT.center, LAYOUT.pt(14)]}>hoặc</Text>

                <TouchableOpacity style={[LAYOUT.itemsCenter, LAYOUT.mt(14)]}>
                    <Ionicons name="logo-google" style={[TEXT.size(20), LAYOUT.p(14), LAYOUT.border(1, COLORS.background3), LAYOUT.rounded(44), { color: COLORS.heading, backgroundColor: COLORS.background4 }]}></Ionicons>
                </TouchableOpacity>

                <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.itemsCenter, LAYOUT.mt(44)]}>
                    <Text style={[TEXT.paragraph]}>Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
                        <Text style={[TEXT.paragraph, { color: COLORS.heading }]}>Đăng Ký</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ToastModal status={icon} title={title} content={null} visible={alert} />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background1,
    },

    headerTitle: {
        fontSize: 32,
        fontFamily: "Modak",
        color: "#FFFFFF",
    },

    formWrapper: {
        flex: 1,
        backgroundColor: "#FFF7E7",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 90,
    },

    welcome: {
        fontSize: 26,
        fontFamily: "Modak",
        color: "#5B3A29",
    },

    subText: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 44,
        color: "#333",
        fontFamily: "GochiHand",
    },

    label: {
        fontSize: 18,
        fontFamily: "GochiHand",
        color: "#5B3A29",
        marginBottom: 6,
    },

    input: {
        backgroundColor: "#F4E9B4",
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 12,
        fontSize: 16,
        fontFamily: "GochiHand",
        marginBottom: 15,
    },

    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F4E9B4",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 10,
    },

    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 6,
        fontSize: 16,
        fontFamily: "GochiHand",
        color: "#000",
    },

    forgotText: {
        alignSelf: "flex-end",
        color: "#FF6B3D",
        fontFamily: "GochiHand",
        marginBottom: 20,
    },
});