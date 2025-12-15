import { View, Text, Dimensions, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import ToastModal from "../../components/ToastModal";

const { width, height } = Dimensions.get("window");

export default function AccountScreen() {
    const router = useRouter();
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [storeName, setStoreName] = useState("");
    const [location, setLocation] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankNumber, setBankNumber] = useState("");

    const [errorName, setErrorName] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPhone, setErrorPhone] = useState("");

    const [originalUser, setOriginalUser] = useState(null);

    const [alert, setAlert] = useState(false);
    const [icon, setIcon] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        loadDataUser();
    }, []);

    const loadDataUser = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            const uid = JSON.parse(userStr).userId;
            const role = JSON.parse(userStr).role;

            const { data } = await axios.get(`${API_URL}/accountuser/${uid}/${role}`);

            if (data && data[0]) {
                const u = data[0];

                setFullName(u.fullName || "");
                setEmail(u.email || "");
                setPhoneNumber(u.phoneNumber || "");

                if (role === "Owner") {
                    setStoreName(u.storeName || "");
                    setLocation(u.location || "");
                    setBankName(u.bankName || "");
                    setBankNumber(u.bankNumber || "");
                }

                setUser(u);
                setOriginalUser(u);
            }

            setUser(data[0]);
            setLoading(false);
        } catch (error) {
            console.log("Lấy thông tin người dùng thất bại: ", error);
        }
    };

    const isAccountChanged = () => {
        if (!originalUser) return false;

        if (fullName !== (originalUser.fullName || "")) return true;
        if (email !== (originalUser.email || "")) return true;
        if (phoneNumber !== (originalUser.phoneNumber || "")) return true;

        if (originalUser.role === "Owner") {
            if (storeName !== (originalUser.storeName || "")) return true;
            if (location !== (originalUser.location || "")) return true;
            if (bankName !== (originalUser.bankName || "")) return true;
            if (bankNumber !== (originalUser.bankNumber || "")) return true;
        }

        return false;
    };

    const validate = () => {
        let isValid = true;

        setErrorName("");
        setErrorEmail("");
        setErrorPhone("");

        if (!isValid) return false;

        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
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

    const updateInfo = async () => {
        if (!validate()) return;

        if (!isAccountChanged()) {
            setIcon("warning");
            setTitle("Chưa có thay đổi thông tin");
            setAlert(true);
            setTimeout(() => setAlert(false), 1100);
            return;
        }
        
        try {
            const userStr = await SecureStore.getItemAsync("userInfo");
            const uid = JSON.parse(userStr).userId;
            const role = JSON.parse(userStr).role;

            if (fullName === "" && email === "" && phoneNumber === "") {
                if ((role === "Owner" && storeName === "" && location === "" && bankName === "" && bankNumber === "") || role !== "Owner") {
                    setIcon("warning");
                    setTitle("Chưa cập nhật thông tin");
                }
            } else {
                const { data } = await axios.post(`${API_URL}/updateaccount`, {
                    userId: uid,
                    fullName,
                    email,
                    phoneNumber,
                    role,
                    storeName,
                    location,
                    bankName,
                    bankNumber
                });

                setIcon(data.success ? "success" : "error");
                setTitle(data.message);
            }
            setAlert(true);
            setTimeout(() => setAlert(false), 1100);
        } catch (error) {
            console.log("Cập nhật thông tin thất bại: ", error);
        }
    }

    if (loading || !user) return <LoadingSpinner />

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.heading} onPress={() => router.back()}></Ionicons>
                        <Text style={[TEXT.heading, LAYOUT.ml(70)]}>Tài khoản</Text>
                    </View>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mb(50)]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[TEXT.text, LAYOUT.color(COLORS.heading), LAYOUT.pb(3), LAYOUT.mb(10), LAYOUT.borderb(1, COLORS.background4)]}>Thông tin cá nhân</Text>

                        <View style={[LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text, TEXT.size(16), LAYOUT.mb(4)]}>Họ tên</Text>
                            <TextInput value={fullName} onChangeText={setFullName} style={[TEXT.paragraph, TEXT.size(16), LAYOUT.px(20), LAYOUT.py(12), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background3)]} />
                            {errorName !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorName}</Text>}
                        </View>
                        <View style={[LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text, TEXT.size(16), LAYOUT.mb(4)]}>Email</Text>
                            <TextInput keyboardType="email-address" value={email} onChangeText={setEmail} style={[TEXT.paragraph, TEXT.size(16), LAYOUT.px(20), LAYOUT.py(12), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background3)]} />
                            {errorEmail !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorEmail}</Text>}
                        </View>
                        <View style={[LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text, TEXT.size(16), LAYOUT.mb(4)]}>Liên hệ</Text>
                            <TextInput keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} style={[TEXT.paragraph, TEXT.size(16), LAYOUT.px(20), LAYOUT.py(12), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background3)]} />
                            {errorPhone !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorPhone}</Text>}
                        </View>

                        {user?.role === "Owner" && (<View>
                            <Text style={[TEXT.text, LAYOUT.color(COLORS.heading), LAYOUT.pb(3), LAYOUT.mb(10), LAYOUT.borderb(1, COLORS.background4)]}>Thông tin cửa hàng</Text>

                            <View style={[LAYOUT.mb(12)]}>
                                <Text style={[TEXT.text, TEXT.size(16), LAYOUT.mb(4)]}>Tên cửa hàng</Text>
                                <TextInput value={storeName} onChangeText={setStoreName} style={[TEXT.paragraph, TEXT.size(16), LAYOUT.px(20), LAYOUT.py(12), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background3)]} />
                            </View>
                            <View style={[LAYOUT.mb(12)]}>
                                <Text style={[TEXT.text, TEXT.size(16), LAYOUT.mb(4)]}>Vị trí</Text>
                                <TextInput value={location} onChangeText={setLocation} style={[TEXT.paragraph, TEXT.size(16), LAYOUT.px(20), LAYOUT.py(12), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background3)]} />
                            </View>
                            <View style={[LAYOUT.mb(12)]}>
                                <Text style={[TEXT.text, TEXT.size(16), LAYOUT.mb(4)]}>Ngân hàng</Text>
                                <TextInput value={bankName} onChangeText={setBankName} style={[TEXT.paragraph, TEXT.size(16), LAYOUT.px(20), LAYOUT.py(12), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background3)]} />
                            </View>
                            <View style={[LAYOUT.mb(12)]}>
                                <Text style={[TEXT.text, TEXT.size(16), LAYOUT.mb(4)]}>Số tài khoản</Text>
                                <TextInput keyboardType="number-pad" value={bankNumber} onChangeText={setBankNumber} style={[TEXT.paragraph, TEXT.size(16), LAYOUT.px(20), LAYOUT.py(12), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background3)]} />
                            </View>
                        </View>)}

                        <TouchableOpacity onPress={updateInfo} style={[LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.bg(COLORS.button), LAYOUT.mt(32)]}>
                            <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Cập nhật</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>

            <ToastModal status={icon} title={title} content={null} visible={alert} />
        </View>
    );
}