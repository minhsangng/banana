import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import { API_URL } from "../../constants/api";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import ToastModal from "../../components/ToastModal";

const { height } = Dimensions.get("window");

export default function SignUpScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    const [icon, setIcon] = useState(null);
    const [title, setTitle] = useState(null);
    const [alert, setAlert] = useState(false);

    const [errorName, setErrorName] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPhone, setErrorPhone] = useState("");
    const [errorPass, setErrorPass] = useState("");

    const validate = () => {
        let isValid = true;

        setErrorName("");
        setErrorEmail("");
        setErrorPhone("");
        setErrorPass("");

        if (!name.trim()) {
            setErrorName("Chưa nhập họ tên");
            isValid = false;
        }
        if (!email.trim()) {
            setEmail("");
        }
        if (!phone.trim()) {
            setErrorPhone("Chưa nhập số điện thoại");
            isValid = false;
        }
        if (!password.trim()) {
            setErrorPass("Chưa nhập mật khẩu");
            isValid = false;
        }

        if (!isValid) return false;

        if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setErrorPass("Mật khẩu phải từ 8 ký tự và có ít nhất 1 ký tự đặc biệt");
            isValid = false;
        }

        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phone)) {
            setErrorPhone("Số liên hệ phải có 10 số và bắt đầu là 0");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorEmail("Email chưa đúng định dạng (example@gmail.com)");
            isValid = false;
        }

        return isValid;
    };

    const handleSignup = async () => {
        if (!validate()) return;
        
        try {
            const role = isChecked ? "Owner" : "Customer";

            const response = await axios.post(`${API_URL}/auth/register`, {
                fullName: name,
                email,
                phoneNumber: phone,
                password,
                role
            });

            setIcon(response.data.success ? "success" : "error");
            setTitle(response.data.message);
            setAlert(true);
            if (response.data.success) {
                setTimeout(() => {
                    router.replace("./sign-in");
                }, 1100);
            } else setTimeout(() => setAlert(false), 1100);
        } catch (error) {
            console.log(error);
            setIcon("error");
            setTitle("Có lỗi xảy ra. Vui lòng thử lại sau!");
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

                    <Text style={[TEXT.heading, LAYOUT.ml(80)]}>Đăng Ký</Text>
                </View>
            </View>

            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82), styles.formWrapper]}>
                <Text style={styles.label}>Họ và tên <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput
                    placeholder="ba ba ba banana"
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />
                {errorName !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(4), LAYOUT.color(COLORS.heading)]}>{errorName}</Text>}

                <Text style={styles.label}>Email</Text>
                <TextInput keyboardType="email-address"
                    placeholder="example@gmail.com"
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
                {errorEmail !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(4), LAYOUT.color(COLORS.heading)]}>{errorEmail}</Text>}
                
                <Text style={styles.label}>Điện thoại <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput keyboardType="phone-pad"
                    placeholder="0123456789"
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                />
                {errorPhone !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(4), LAYOUT.color(COLORS.heading)]}>{errorPhone}</Text>}

                <Text style={styles.label}>Mật khẩu <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <View style={styles.passwordContainer}>
                    <TextInput 
                        placeholder="********"
                        placeholderTextColor={COLORS.paragraph}
                        secureTextEntry={!showPassword}
                        style={styles.passwordInput}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={[LAYOUT.pr(6)]}
                    >
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={22} color={COLORS.heading}
                        />
                    </TouchableOpacity>
                </View>
                {errorPass !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(4), LAYOUT.color(COLORS.heading)]}>{errorPass}</Text>}

                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.mb(22)]}>
                    <Pressable onPress={() => setIsChecked(!isChecked)}>
                        <Ionicons
                            name={isChecked ? "checkbox" : "square-outline"}
                            size={24}
                            color={COLORS.button}
                        />
                    </Pressable>
                    <Text style={[TEXT.center, TEXT.paragraph, LAYOUT.ml(8), { color: COLORS.paragraph }]}>Tài khoản bán hàng</Text>
                </View>

                <TouchableOpacity style={[LAYOUT.bg(COLORS.button), LAYOUT.py(14), LAYOUT.rounded(20)]} onPress={handleSignup}>
                    <Text style={[TEXT.text, TEXT.size(22), TEXT.center, LAYOUT.color(COLORS.textLight)]}>Đăng ký</Text>
                </TouchableOpacity>

                <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.itemsCenter, LAYOUT.mt(32)]}>
                    <Text style={[TEXT.paragraph]}>Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
                        <Text style={[TEXT.paragraph, LAYOUT.color(COLORS.heading)]}>Đăng Nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ToastModal status={icon} title={title} content={null} visible={alert} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F7D72E" },
    headerContainer: {
        height: height * 0.18,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 20,
        position: "relative",
    },
    backButton: { position: "absolute", left: 20, top: 60, padding: 8 },
    formWrapper: {
        flex: 1,
        backgroundColor: "#FFF7E7",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 150,
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
});
