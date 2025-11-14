import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT, BUTTON } from "../../assets/styles/base.styles";

const { height } = Dimensions.get("window");
export default function SignUpScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

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
                    placeholder="Nguyễn Văn a"
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                />
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        placeholder="********"
                        placeholderTextColor={COLORS.paragraph}
                        secureTextEntry={!showPassword}
                        style={styles.passwordInput}
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
                />
                <Text style={styles.label}>Điện thoại</Text>
                <TextInput
                    placeholder="0123456789"
                    placeholderTextColor={COLORS.paragraph}
                    style={styles.input}
                />
                <Text style={[TEXT.center, TEXT.paragraph]}>
                    Bằng việc tiếp tục, bạn đồng ý với
                </Text>
                <Text style={[TEXT.center, TEXT.paragraph, LAYOUT.mb(28), { color: COLORS.heading }]}>Điều Khoản <Text style={{ color: COLORS.paragraph }}> và </Text> Chính Sách</Text>

                <TouchableOpacity>
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
    headerTitle: { fontSize: 30, fontFamily: "Modak", color: "#FFFFFF" },
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
