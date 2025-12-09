import { View, Text, FlatList, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_URL } from "../../../constants/api";
import ToastModal from "../../../components/ToastModal";

const { width, height } = Dimensions.get("window");

export default function EmployeeScreen() {
    const [isLogin, setIsLogin] = useState(false);
    const [employees, setEmployees] = useState(null);
    const [userId, setUserId] = useState(null);
    const [icon, setIcon] = useState(false);
    const [title, setTitle] = useState(false);
    const [content, setContent] = useState(null);
    const [alert, setAlert] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [role, setRole] = useState(true);

    const initData = async () => {
        const userStr = await SecureStore.getItemAsync("userInfo");
        if (userStr) setIsLogin(true);
        const user = JSON.parse(userStr);

        if (user.role === "Employee") {
            setRole(false);
            return;
        } else {
            setUserId(user.userId);

            const { data } = await axios.get(`${API_URL}/employees/${user.userId}`);
            setEmployees(data);
        }
    };

    const addEmployee = async () => {
        try {
            if (email === "" || password === "" || fullName === "") {
                setError("* Chưa nhập đầy đủ thông tin");
            } else {
                const { data } = await axios.post(`${API_URL}/employee/add`, {
                    ownerId: userId,
                    fullName,
                    email,
                    phoneNumber,
                    password
                });

                setIcon(data.success ? "success" : "error");
                setTitle(data.message);
                setContent(null);
                setAlert(true);
                setTitle(() => setAlert(false), 1100);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const contentAdd = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.mt(12)]}>
                <Text style={[TEXT.text, TEXT.size(16)]}>Họ tên</Text>
                <TextInput style={[LAYOUT.bg(COLORS.background2), LAYOUT.rounded(12), LAYOUT.px(12), LAYOUT.py(10), LAYOUT.mb(6)]} value={fullName} onChangeText={setFullName} />
                <Text style={[TEXT.text, TEXT.size(16)]}>Email</Text>
                <TextInput style={[LAYOUT.bg(COLORS.background2), LAYOUT.rounded(12), LAYOUT.px(12), LAYOUT.py(10), LAYOUT.mb(6)]} value={email} onChangeText={setEmail} />
                <Text style={[TEXT.text, TEXT.size(16)]}>Liên hệ</Text>
                <TextInput style={[LAYOUT.bg(COLORS.background2), LAYOUT.rounded(12), LAYOUT.px(12), LAYOUT.py(10), LAYOUT.mb(6)]} value={phoneNumber} onChangeText={setPhoneNumber} />
                <Text style={[TEXT.text, TEXT.size(16)]}>Mật khẩu</Text>
                <TextInput style={[LAYOUT.bg(COLORS.background2), LAYOUT.rounded(12), LAYOUT.px(12), LAYOUT.py(10), LAYOUT.mb(6)]} value={password} onChangeText={setPassword} />

                <Text style={[TEXT.paragraph, LAYOUT.py(4), LAYOUT.color(COLORS.heading)]}>{error}</Text>

                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.gap(8), LAYOUT.mt(32)]}>
                    <TouchableOpacity onPress={() => setAlert(false)} style={[LAYOUT.bg(COLORS.background3), LAYOUT.w("48%"), LAYOUT.py(6), LAYOUT.rounded(12)]}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.heading)]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => addEmployee()} style={[LAYOUT.bg(COLORS.button), LAYOUT.w("48%"), LAYOUT.py(6), LAYOUT.rounded(12)]}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Thêm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    useEffect(() => {
        initData();
    }, []);

    if (!role) return <View style={[LAYOUT.justifyCenter, LAYOUT.itemsCenter, LAYOUT.h(height), LAYOUT.w(width)]}><Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>Không có quyền truy cập</Text></View>;

    return (
        <View style={[LAYOUT.container]}>
            <NavBar isLogin={isLogin} heading={"Nhân viên"} />
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.77), { overflow: "hidden" }]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80)]}>
                    <TouchableOpacity onPress={() => (setIcon("edit"), setTitle("Tạo tài khoản nhân viên"), setContent(contentAdd), setError(""), setAlert(true))} style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(4), LAYOUT.mb(20), LAYOUT.pb(2), LAYOUT.borderb(1, COLORS.background3)]}>
                        <Ionicons name="add-outline" color={COLORS.button} size={16}></Ionicons>
                        <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>Tạo tài khoản</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={employees}
                        keyExtractor={(item) => item.employeeId.toString()}
                        numColumns={1}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            return (
                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.pb(6), LAYOUT.mb(12), LAYOUT.borderb(1, COLORS.background4), { borderStyle: "dashed" }]}>
                                    <View style={[LAYOUT.row, LAYOUT.gap(5)]}>
                                        <Text style={[LAYOUT.w(20)]}>#{item.employeeId}</Text>
                                        <View>
                                            <Text>{item.fullName}</Text>
                                            <Text>{item.phoneNumber}</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <TouchableOpacity style={[LAYOUT.bg(COLORS.background3), LAYOUT.w(60), LAYOUT.rounded(12), LAYOUT.py(4)]}>
                                            <Text style={[TEXT.paragraph, TEXT.center, LAYOUT.color(COLORS.heading)]}>Khóa</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }}
                    />
                </View>
            </View>

            <ToastModal status={icon} title={title} content={content} visible={alert} />
        </View>
    );
}