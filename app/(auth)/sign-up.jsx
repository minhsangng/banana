import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import { API_URL } from "../../constants/api";
import { LAYOUT, TEXT, BUTTON } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";

const { height } = Dimensions.get("window");

export default function SignUpScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    const handleSignup = async () => {
        try {
            if (!name || !email || !password || !phone) {
                alert("Vui lòng nhập đầy đủ thông tin");
                return;
            }

            const role = isChecked ? "Owner" : "Customer";

            const response = await axios.post(`${API_URL}/auth/register`, {
                fullName: name,
                email,
                phoneNumber: phone,
                password,
                role
            });

            if (response.data.success) {
                router.replace("./sign-in");
            } else {
                alert(response.data.message || "Đăng ký thất bại");
            }
        } catch (error) {
            console.log(error);
            alert("Lỗi kết nối server");
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
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                    placeholder="ba ba ba banana"
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />
                <Text style={styles.label}>Mật khẩu</Text>
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
                <Text style={styles.label}>Email</Text>
                <TextInput
                    placeholder="example@gmail.com"
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
                <Text style={styles.label}>Điện thoại</Text>
                <TextInput
                    placeholder="0123456789"
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                />

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

                <TouchableOpacity onPress={handleSignup}>
                    <Text style={[BUTTON.primary]}>Đăng ký</Text>
                </TouchableOpacity>

                <Text style={[TEXT.paragraph, TEXT.center, LAYOUT.pt(14)]}>hoặc</Text>

                <TouchableOpacity style={[LAYOUT.itemsCenter, LAYOUT.mt(14)]}>
                    <Ionicons name="logo-google" style={[TEXT.size(20), LAYOUT.p(14), LAYOUT.border(1, COLORS.background3), LAYOUT.rounded(44), { color: COLORS.heading, backgroundColor: COLORS.background4 }]}></Ionicons>
                </TouchableOpacity>

                <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.itemsCenter, LAYOUT.mt(32)]}>
                    <Text style={[TEXT.paragraph]}>Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
                        <Text style={[TEXT.paragraph, { color: COLORS.heading }]}>Đăng Nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        marginBottom: 18,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F4E9B4",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 18,
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
