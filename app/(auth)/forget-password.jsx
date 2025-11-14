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
import { LAYOUT, TEXT, BUTTON } from "../../assets/styles/base.styles";

const { height } = Dimensions.get("window");

export default function ForgetPassScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <SafeAreaView style={LAYOUT.container}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.h("fit-content"), LAYOUT.itemsCenter]}>
                    <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
                        <Ionicons name="chevron-back-outline" size={22} color={COLORS.heading} />
                    </TouchableOpacity>

                    <Text style={[TEXT.heading, LAYOUT.ml(6)]}>Khôi phục mật khẩu</Text>
                </View>
            </View>

            {/* Main Body */}
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82), LAYOUT.pt(32), LAYOUT.px(24)]}>
                {/* Password */}
                <Text style={[TEXT.text, LAYOUT.mb(8)]}>Mật khẩu</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.rounded(12), LAYOUT.px(14), LAYOUT.py(6), LAYOUT.mb(10), {backgroundColor: COLORS.background3}]}>
                    <TextInput
                        placeholder="********"
                        placeholderTextColor={COLORS.paragraph}
                        secureTextEntry={!showPassword}
                        style={[LAYOUT.wFull, TEXT.paragraph, LAYOUT.rounded(12)]}
                    />

                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={[]}
                    >
                        <Ionicons style={[TEXT.size(20), { color: COLORS.heading }]} name={showPassword ? "eye-off-outline" : "eye-outline"}></Ionicons>
                    </TouchableOpacity>
                </View>
                
                {/* Password */}
                <Text style={[TEXT.text, LAYOUT.mb(8)]}>Nhập lại mật khẩu</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.rounded(12), LAYOUT.px(14), LAYOUT.py(6), LAYOUT.mb(10), LAYOUT.rounded(12), {backgroundColor: COLORS.background3}]}>
                    <TextInput
                        placeholder="********"
                        placeholderTextColor={COLORS.paragraph}
                        secureTextEntry={!showPassword}
                        style={[LAYOUT.wFull, TEXT.paragraph, LAYOUT.rounded(12)]}
                    />

                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={[LAYOUT.pr(40)]}
                    >
                        <Ionicons style={[TEXT.size(20), { color: COLORS.heading }]} name={showPassword ? "eye-off-outline" : "eye-outline"}></Ionicons>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={[LAYOUT.mt(44)]}>
                    <Text style={[BUTTON.primary]}>Xác nhận</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}