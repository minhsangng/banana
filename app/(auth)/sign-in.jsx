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
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [icon, setIcon] = useState("");
    const [title, setTitle] = useState("");
    const [alert, setAlert] = useState(false);

    const [errorPhone, setErrorPhone] = useState("");
    const [errorPass, setErrorPass] = useState("");

    const validate = () => {
        let isValid = true;

        setErrorPhone("");
        setErrorPass("");

        if (!phoneNumber.trim()) {
            setErrorPhone("Chưa nhập số điện thoại");
            isValid = false;
        }
        if (!password.trim()) {
            setErrorPass("Chưa nhập mật khẩu");
            isValid = false;
        }

        if (!isValid) return false;

        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setErrorPhone("Số liên hệ phải có 10 số và bắt đầu là 0");
            isValid = false;
        }

        if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setErrorPass("Mật khẩu phải từ 8 ký tự và có ít nhất 1 ký tự đặc biệt");
            isValid = false;
        }

        return isValid;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, {
                phoneNumber,
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
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput keyboardType="phone-pad"
                    placeholder="0123456789"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                />
                {errorPhone !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorPhone}</Text>}

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
                {errorPass !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(4), LAYOUT.color(COLORS.heading)]}>{errorPass}</Text>}

                <TouchableOpacity onPress={() => router.push("/(auth)/reset-password")}>
                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity style={[LAYOUT.bg(COLORS.button), LAYOUT.py(14), LAYOUT.rounded(20)]} onPress={handleLogin}>
                    <Text style={[TEXT.text, TEXT.size(22), TEXT.center, LAYOUT.color(COLORS.textLight)]}>Đăng nhập</Text>
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
        marginBottom: 6,
    },

    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F4E9B4",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 6,
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