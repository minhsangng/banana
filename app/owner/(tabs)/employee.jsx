import { View, Text, FlatList, TouchableOpacity, TextInput, Dimensions, RefreshControl } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_URL } from "../../../constants/api";
import ToastModal from "../../../components/ToastModal";
import LoadingSpinner from "../../../components/LoadingSpinner";

const { width, height } = Dimensions.get("window");

export default function EmployeeScreen() {
    const [isLogin, setIsLogin] = useState(false);
    const [employees, setEmployees] = useState(null);
    const [userId, setUserId] = useState(null);
    const [icon, setIcon] = useState(false);
    const [title, setTitle] = useState(false);
    const [alert, setAlert] = useState(false);

    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");

    const [originalEmployee, setOriginalEmployee] = useState(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");

    const [errorName, setErrorName] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPhone, setErrorPhone] = useState("");
    const [errorPass, setErrorPass] = useState("");

    const [role, setRole] = useState(true);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;

            setIsLogin(true);
            const user = JSON.parse(userStr);

            if (user.role === "Employee") {
                setRole(false);
                return;
            } else {
                setUserId(user.userId);

                const { data } = await axios.get(`${API_URL}/employees/${user.userId}`);
                setEmployees(data);
            }
        } catch (error) {
            console.log("Lỗi lấy danh sách nhân viên: ", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (userId, status) => {
        try {
            const { data } = await axios.get(`${API_URL}/ownerupdatestatusemployee/${userId}/${status === "Active" ? "Inactive" : "Active"}`);

            setIcon(data.success ? "success" : "error");
            setTitle(data.message);

            setAlert(true);
            setTimeout(() => (setAlert(false), loadEmployees()), 1000);
        } catch (error) {
            console.error(error);
        }
    };

    const validate = () => {
        let isValid = true;

        setErrorName("");
        setErrorEmail("");
        setErrorPhone("");
        setErrorPass("");

        if (!fullName.trim()) {
            setErrorName("Chưa nhập họ tên nhân viên");
            isValid = false;
        }
        if (!email.trim()) {
            setErrorEmail("Chưa nhập email");
            isValid = false;
        }
        if (!phoneNumber.trim()) {
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

    const clearForm = () => {
        setFullName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");

        setErrorName("");
        setErrorEmail("");
        setErrorPhone("");
        setErrorPass("");
    };

    const addEmployee = async () => {
        if (!validate()) return;

        try {
            const { data: register } = await axios.post(`${API_URL}/auth/register`, {
                fullName,
                email,
                phoneNumber,
                password,
                role: "Employee"
            });

            if (register.success) {
                const { data: add } = await axios.post(`${API_URL}/employee/add`, { ownerId: userId });

                setIcon(add.success ? "success" : "error");
                setTitle(add.message);
                setAlert(true);
                setTimeout(() => (setAlert(false), clearForm()), 1100);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const contentAdd = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.mt(12)]}>
                <Text style={[TEXT.text, TEXT.size(16)]}>Họ tên <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput style={[TEXT.subText, LAYOUT.color(COLORS.paragraph), TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} value={fullName} onChangeText={setFullName} />
                {errorName !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorName}</Text>}

                <Text style={[TEXT.text, TEXT.size(16)]}>Email <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput keyboardType="email-address" style={[TEXT.subText, LAYOUT.color(COLORS.paragraph), TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} value={email} onChangeText={setEmail} />
                {errorEmail !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorEmail}</Text>}

                <Text style={[TEXT.text, TEXT.size(16)]}>Liên hệ <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput keyboardType="number-pad" style={[TEXT.subText, LAYOUT.color(COLORS.paragraph), TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} value={phoneNumber} onChangeText={setPhoneNumber} />
                {errorPhone !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorPhone}</Text>}

                <Text style={[TEXT.text, TEXT.size(16)]}>Mật khẩu <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput keyboardType="visible-password" style={[TEXT.subText, LAYOUT.color(COLORS.paragraph), TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} value={password} onChangeText={setPassword} />
                {errorPass !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorPass}</Text>}

                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.gap(8), LAYOUT.mt(32)]}>
                    <TouchableOpacity onPress={() => (setAlert(false), clearForm())} style={[LAYOUT.bg(COLORS.background3), LAYOUT.w("48%"), LAYOUT.py(6), LAYOUT.rounded(12)]}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.heading)]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => addEmployee()} style={[LAYOUT.bg(COLORS.button), LAYOUT.w("48%"), LAYOUT.py(6), LAYOUT.rounded(12)]}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Thêm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const editEmployee = async (employeeId) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/employeedetail/${employeeId}`);

            console.log(data);
            if (data) {
                setIcon("edit");
                setOriginalEmployee(data[0]);
                
                setEditName(data[0].fullName);
                setEditEmail(data[0].email);
                setEditPhone(data[0].phoneNumber);
                setTitle("Cập nhật thông tin nhân viên");
            } else {
                setIcon("error");
                setTitle(`Lấy thông tin nhân viên thất bại thất bại`);
            }
            setAlert(true);
        } catch (error) {
            console.log("Lấy chi tiết nhân viên thất bại: ", error);
        } finally {
            setLoading(false);
        }
    };

    const contentEdit = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.mt(12)]}>
                <Text style={[TEXT.text, TEXT.size(16)]}>Họ tên</Text>
                <TextInput style={[TEXT.subText, LAYOUT.color(COLORS.paragraph), TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} value={editName} onChangeText={setEditName} />
                {errorName !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorName}</Text>}

                <Text style={[TEXT.text, TEXT.size(16)]}>Email</Text>
                <TextInput keyboardType="email-address" style={[TEXT.subText, LAYOUT.color(COLORS.paragraph), TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} value={editEmail} onChangeText={setEditEmail} />
                {errorEmail !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorEmail}</Text>}

                <Text style={[TEXT.text, TEXT.size(16)]}>Liên hệ</Text>
                <TextInput keyboardType="number-pad" style={[TEXT.subText, LAYOUT.color(COLORS.paragraph), TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} value={editPhone} onChangeText={setEditPhone} />
                {errorPhone !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorPhone}</Text>}

                {/* <Text style={[TEXT.text, TEXT.size(16)]}>Mật khẩu <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput keyboardType="visible-password" style={[TEXT.subText, LAYOUT.color(COLORS.paragraph), TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} value={password} onChangeText={setPassword} />
                {errorPass !== "" && <Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.pb(2), LAYOUT.color(COLORS.heading)]}>{errorPass}</Text>} */}

                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.gap(8), LAYOUT.mt(32)]}>
                    <TouchableOpacity onPress={() => (setAlert(false), clearForm())} style={[LAYOUT.bg(COLORS.background3), LAYOUT.w("48%"), LAYOUT.py(6), LAYOUT.rounded(12)]}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.heading)]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => submitEdit(originalEmployee.userId)} style={[LAYOUT.bg(COLORS.button), LAYOUT.w("48%"), LAYOUT.py(6), LAYOUT.rounded(12)]}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Thêm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const isDishChanged = () => {
        if (!originalEmployee) return false;

        if (editName !== originalEmployee.fullName) return true;
        if (editEmail !== originalEmployee.email) return true;
        if (editPhone !== originalEmployee.phoneNumber) return true;

        return false;
    };

    const submitEdit = async (employeeId) => {
        if (!isDishChanged()) {
            setIcon("warning");
            setTitle("Bạn chưa thay đổi thông tin nào");
            setAlert(true);

            setTimeout(() => setAlert(false), 1200);
            return;
        }

        try {
            console.log(employeeId);
            const { data } = await axios.post(`${API_URL}/updateemployeeinfo`, { userId: employeeId, fullName: editName, email: editEmail, phoneNumber: editPhone });

            setIcon(data.success ? "success" : "error");
            setTitle(data.message);
            setAlert(true);

            setTimeout(() => {
                setAlert(false);
                loadEmployees();
            }, 1100);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadEmployees().finally(() => setRefreshing(false));
    }, []);

    return (
        <View style={[LAYOUT.container]}>
            <NavBar isLogin={isLogin} heading={"Nhân viên"} />
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.77), { overflow: "hidden" }]}>
                {loading ? <LoadingSpinner /> : !role ? (<View style={[LAYOUT.justifyCenter, LAYOUT.itemsCenter, LAYOUT.h(height * 2 / 3), LAYOUT.w(width), LAYOUT.gap(14)]}><Ionicons name="ban" size={44} color={COLORS.heading}></Ionicons><Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.heading)]}>Chức năng dành cho chủ quán</Text></View>)
                    : (
                        <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80)]}>
                            <TouchableOpacity onPress={() => (setIcon("add"), setTitle("Thêm nhân viên mới"), setAlert(true))} style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(4), LAYOUT.mb(20), LAYOUT.pb(2), LAYOUT.borderb(1, COLORS.background3)]}>
                                <Ionicons name="add-outline" color={COLORS.button} size={16}></Ionicons>
                                <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>Thêm nhân viên</Text>
                            </TouchableOpacity>
                            {employees && employees.length === 0 && <Text style={[TEXT.paragraph, TEXT.center]}>Danh sách nhân viên đang trống</Text>}
                            <FlatList
                                data={employees || []}
                                keyExtractor={(item) => item.employeeId.toString()}
                                numColumns={1}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                                renderItem={({ item }) => {
                                    return (
                                        <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.pb(6), LAYOUT.mb(12), LAYOUT.borderb(1, COLORS.background4), { borderStyle: "dashed" }]}>
                                            <View style={[LAYOUT.row, LAYOUT.gap(5)]}>
                                                <Text style={[TEXT.text, LAYOUT.w(30)]}>#{item.employeeId}</Text>
                                                <View>
                                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                                                        <Text style={[TEXT.text, TEXT.size(18)]} numberOfLines={1}>{item.fullName}</Text>
                                                        <Ionicons name="ellipse" color={item.status === "Active" ? "#73AF6F" : COLORS.heading} size={10} style={[LAYOUT.ml(8), LAYOUT.mr(4)]}></Ionicons>
                                                        <Text style={[TEXT.subText]}>{item.status === "Active" ? "Đang làm việc" : "Đã nghỉ việc"}</Text>
                                                    </View>
                                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(6)]}>
                                                        <Ionicons name="call-outline" size={14}></Ionicons>
                                                        <Text style={[TEXT.paragraph, TEXT.size(16)]}>{item.phoneNumber}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={[LAYOUT.gap(6)]}>
                                                <TouchableOpacity onPress={() => updateStatus(item.userId, item.status)} style={[LAYOUT.bg(COLORS.background3), LAYOUT.rounded(12), LAYOUT.py(4), LAYOUT.px(10), LAYOUT.w(70), LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.gap(4)]}>
                                                    <Text style={[TEXT.paragraph, TEXT.center, LAYOUT.color(COLORS.heading)]}>{item.status === "Active" ? "Khóa" : "Mở"}</Text>
                                                    <Ionicons name={item.status === "Active" ? "download-outline" : "share-outline"} size={14} color={COLORS.heading}></Ionicons>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => editEmployee(item.userId)}
                                                    style={[
                                                        LAYOUT.px(10), LAYOUT.py(4),
                                                        LAYOUT.w(70),
                                                        LAYOUT.rounded(22),
                                                        LAYOUT.bg(COLORS.button),
                                                        LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.gap(4)
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            TEXT.text,
                                                            TEXT.size(16),
                                                            TEXT.center,
                                                            LAYOUT.color(COLORS.textLight)
                                                        ]}
                                                    >
                                                        Sửa
                                                    </Text>
                                                    <Ionicons name="create-outline" size={14} color={COLORS.textLight}></Ionicons>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    )}
            </View>

            <ToastModal status={icon} title={title} content={icon === "add" ? contentAdd : icon === "edit" ? contentEdit : null} visible={alert} />
        </View>
    );
}