import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import apiClient from "../../constants/apiClient";
import ToastModal from "../../components/ToastModal";

const { height } = Dimensions.get("window");

export default function ChangePwScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [reNewPassword, setReNewPassword] = useState("");
    const [icon, setIcon] = useState("");
    const [title, setTitle] = useState("");
    const [alert, setAlert] = useState(false);

    const validatePassword = () => {
        if (newPassword.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            setIcon("error");
            setTitle("Mật khẩu mới phải ít nhất 8 ký tự và có ít nhất 1 ký tự đặc biệt");
            setAlert(true);
            setTimeout(() => setAlert(false), 1100);
            return false;
        }
        if (newPassword !== reNewPassword) {
            setIcon("error");
            setTitle("Mật khẩu nhập lại không khớp");
            setAlert(true);
            setTimeout(() => setAlert(false), 1100);
            return false;
        }


        return true;
    };

    const handleChangePassword = async () => {
        if (!validatePassword()) return;

        try {
            const response = await apiClient.post(`/auth/change-password`, {
                currentPassword,
                newPassword
            });

            if (response.data.success) {
                setIcon("success");
                setTitle("Đổi mật khẩu thành công");
                setAlert(true);

                setTimeout(() => router.replace("/(tabs)"), 1200);
            } else {
                setIcon("error");
                setTitle(response.data.message);
                setAlert(true);
            }

            setTimeout(() => setAlert(false), 1200);
        } catch (error) {
            setIcon("error");
            setTitle(error.response?.data?.message || "Lỗi hệ thống");
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

                    <Text style={[TEXT.heading, LAYOUT.ml(22)]}>Đặt lại mật khẩu</Text>
                </View>
            </View>

            {/* Main Body */}
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82), LAYOUT.pt(32), LAYOUT.px(24)]}>
                {/* Old Password */}
                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.mb(8)]}>Mật khẩu hiện tại</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.rounded(12), LAYOUT.pl(14), LAYOUT.pr(34), LAYOUT.py(6), LAYOUT.mb(10), { backgroundColor: COLORS.background3 }]}>
                    <TextInput
                        placeholder="********"
                        placeholderTextColor={COLORS.paragraph}
                        secureTextEntry={!showPassword}
                        style={[LAYOUT.wFull, TEXT.paragraph]}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />

                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons style={[TEXT.size(20), { color: COLORS.heading }]} name={showPassword ? "eye-off-outline" : "eye-outline"}></Ionicons>
                    </TouchableOpacity>
                </View>

                {/* New Password */}
                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.mb(8)]}>Mật khẩu mới</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.rounded(12), LAYOUT.pl(14), LAYOUT.pr(34), LAYOUT.py(6), LAYOUT.mb(10), { backgroundColor: COLORS.background3 }]}>
                    <TextInput
                        placeholder="********"
                        placeholderTextColor={COLORS.paragraph}
                        secureTextEntry={!showPassword}
                        style={[LAYOUT.wFull, TEXT.paragraph]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />

                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons style={[TEXT.size(20), { color: COLORS.heading }]} name={showPassword ? "eye-off-outline" : "eye-outline"}></Ionicons>
                    </TouchableOpacity>
                </View>

                {/* Re New Password */}
                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.mb(8)]}>Nhập lại mật khẩu mới</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.rounded(12), LAYOUT.pl(14), LAYOUT.pr(34), LAYOUT.py(6), LAYOUT.mb(10), { backgroundColor: COLORS.background3 }]}>
                    <TextInput
                        placeholder="********"
                        placeholderTextColor={COLORS.paragraph}
                        secureTextEntry={!showPassword}
                        style={[LAYOUT.wFull, TEXT.paragraph]}
                        value={reNewPassword}
                        onChangeText={setReNewPassword}
                    />

                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons style={[TEXT.size(20), { color: COLORS.heading }]} name={showPassword ? "eye-off-outline" : "eye-outline"}></Ionicons>
                    </TouchableOpacity>
                </View>

                <View>
                    <Text style={[TEXT.subText, TEXT.size(14), { color: COLORS.heading }]}>Mật khẩu phải: </Text>
                    <Text style={[TEXT.subText]}><Ionicons name="ellipse-outline" size={8} color={COLORS.heading}></Ionicons> Có ít nhất 8 kí tự.</Text>
                    <Text style={[TEXT.subText]}><Ionicons name="ellipse-outline" size={8} color={COLORS.heading}></Ionicons> Có ít nhất 1 kí tự đặc biệt.</Text>
                </View>

                <TouchableOpacity style={[LAYOUT.bg(COLORS.button), LAYOUT.py(14), LAYOUT.mt(44), LAYOUT.rounded(20)]} onPress={handleChangePassword}>
                    <Text style={[TEXT.text, TEXT.size(22), TEXT.center, LAYOUT.color(COLORS.textLight)]}>Xác nhận</Text>
                </TouchableOpacity>
            </View>

            <ToastModal status={icon} title={title} content={null} visible={alert} />
        </SafeAreaView>
    );
}