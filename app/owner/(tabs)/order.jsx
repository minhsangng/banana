import { View, Text, TouchableOpacity, TextInput, Image, FlatList, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import { API_URL } from "../../../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ToastModal from "../../../components/ToastModal";

const { width, height } = Dimensions.get("window");

export default function OrderScreen() {
    const [isLogin, setIsLogin] = useState(false);
    const [orders, setOrders] = useState([]);
    const [alert, setAlert] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(1);
    const [userId, setUserId] = useState(0);
    const [deleteId, setDeleteId] = useState(0);

    useEffect(() => {
        loadOrders();
    }, [currentStatus]);

    const reasons = [
        { id: 1, label: "Tôi muốn thay đổi địa chỉ giao" },
        { id: 2, label: "Thời gian chờ quá lâu" },
        { id: 3, label: "Tôi không muốn mua nữa" },
        { id: 4, label: "Lý do khác" },
    ];

    // ===== LOAD API =====
    const loadOrders = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;

            setUserId(parseInt(JSON.parse(userStr).userId));
            setIsLogin(true);

            let status = "";
            if (currentStatus === 1)
                status = "Đang chuẩn bị";
            else if (currentStatus === 2) {
                status = "Hoàn thành";
            } else if (currentStatus === 3) {
                status = "Bị hủy";
            }

            const { data } = await axios.get(`${API_URL}/ordersowner/${userId}/${status}`);

            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.log("Lỗi API orders:", error);
        }
    };

    const cancelOrder = (orderId) => {
        setAlert(true);
        setDeleteId(orderId);
    }

    const handleCancer = async () => {
        try {
            setAlert(false);

            const { data } = await axios.get(`${API_URL}/cancelorder/${deleteId}`);

            await axios.post(`${API_URL}/pushnotification`, {
                userId: userId,
                title: "Thông báo mới",
                content: data.message,
                metadata: {}
            });

            setSelectedReason(0);
            loadOrders();
        } catch (error) {
            console.error(error);
        }
    };


    const contentCancelAlert = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.justifyCenter, LAYOUT.mt(16)]}>
                <View style={[LAYOUT.wFull]}>
                    {reasons.map((item) => (
                        <View key={item.id} style={[LAYOUT.row, LAYOUT.mb(12)]}>
                            <TouchableOpacity onPress={() => setSelectedReason(item.id)}>
                                <Ionicons
                                    name={
                                        selectedReason === item.id
                                            ? "checkmark-circle-outline"
                                            : "ellipse-outline"
                                    }
                                    size={20}
                                />
                            </TouchableOpacity>

                            <Text style={[TEXT.text, LAYOUT.ml(6)]}>{item.label}</Text>
                        </View>
                    ))}

                    {selectedReason === 4 && (<TextInput placeholder="Nhập lý do" style={[LAYOUT.px(14), LAYOUT.py(8), LAYOUT.rounded(12), LAYOUT.mb(20), TEXT.paragraph, { backgroundColor: COLORS.background2 }]}></TextInput>)}

                </View>
                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.wFull]}>
                    <TouchableOpacity onPress={() => setAlert(false)} style={[LAYOUT.w(150), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.background3 }]}>
                        <Text style={[TEXT.text, TEXT.center, { color: COLORS.button }]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCancer()} style={[LAYOUT.w(150), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.button }]}>
                        <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View >
        );
    };

    return (
        <View style={[LAYOUT.container]}>
            <NavBar isLogin={isLogin} heading={"Đơn hàng"} />
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.77)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80)]}>
                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mb(20)]}>
                        <TouchableOpacity onPress={() => setCurrentStatus(1)} style={[LAYOUT.w("33%"), LAYOUT.py(6), LAYOUT.rounded(12), currentStatus === 1 ? { backgroundColor: COLORS.background4 } : { backgroundColor: COLORS.background3 }]}>
                            <Text style={[TEXT.subText, TEXT.size(14), TEXT.center, { color: COLORS.textLight }]}>Đang làm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCurrentStatus(2)} style={[LAYOUT.w("33%"), LAYOUT.py(6), LAYOUT.rounded(12), currentStatus === 2 ? { backgroundColor: COLORS.background4 } : { backgroundColor: COLORS.background3 }]}>
                            <Text style={[TEXT.subText, TEXT.size(14), TEXT.center, { color: COLORS.textLight }]}>Hoàn thành</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCurrentStatus(3)} style={[LAYOUT.w("33%"), LAYOUT.py(6), LAYOUT.rounded(12), currentStatus === 3 ? { backgroundColor: COLORS.background4 } : { backgroundColor: COLORS.background3 }]}>
                            <Text style={[TEXT.subText, TEXT.size(14), TEXT.center, { color: COLORS.textLight }]}>Đã hủy</Text>
                        </TouchableOpacity>
                    </View>
                    {loading ? (<LoadingSpinner />) :
                        (!isLogin ? (<Text style={[TEXT.paragraph, TEXT.center]}>Đăng nhập để đặt hàng ngay</Text>) : (
                            orders.length === 0 ? <Text style={[TEXT.paragraph, TEXT.center]}>Chưa có đơn hàng mới</Text> :
                                (<FlatList
                                    data={orders}
                                    keyExtractor={(item) => item.orderId.toString()}
                                    numColumns={1}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => {
                                        const dishNames = item.items.map(d => d.dishName).join(" - ");

                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    LAYOUT.wFull,
                                                    LAYOUT.mb(20),
                                                    LAYOUT.row,
                                                    LAYOUT.justifyBetween,
                                                    LAYOUT.pb(12),
                                                    LAYOUT.borderb(1, COLORS.background3),
                                                    { borderStyle: "dashed" }
                                                ]}
                                            >
                                                <Image
                                                    source={item.items[0].dishImage ? { uri: item.items[0].dishImage } : require("../../../assets/images/background-default.png")}
                                                    style={[
                                                        LAYOUT.w(80),
                                                        LAYOUT.h(110),
                                                        LAYOUT.rounded(20),
                                                        LAYOUT.border(1, COLORS.border),
                                                        { overflow: "hidden" }
                                                    ]}
                                                />

                                                <View style={[LAYOUT.ml(12), LAYOUT.row, LAYOUT.justifyBetween]}>
                                                    <View style={[LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                                        <Text style={[TEXT.text]} numberOfLines={1}>
                                                            {dishNames}
                                                        </Text>
                                                        <Text style={[TEXT.text, TEXT.size(16)]}>
                                                            {item.orderStatus}
                                                        </Text>
                                                        <Text style={[TEXT.text, TEXT.size(16)]}>
                                                            {item.deliveryAddress}
                                                        </Text>
                                                    </View>
                                                    <View style={[LAYOUT.mt(12), {justifyContent: "flex-end"}]}>
                                                        {currentStatus === 1 && (<View style={[{gap: 8}]}>
                                                            <TouchableOpacity onPress={() => cancelOrder(item.orderId)}
                                                            style={[
                                                                LAYOUT.px(10),
                                                                LAYOUT.py(4),
                                                                LAYOUT.w(100),
                                                                LAYOUT.rounded(22),
                                                                { backgroundColor: COLORS.background3 }
                                                            ]}
                                                        >
                                                            <Text
                                                                style={[
                                                                    TEXT.text,
                                                                    TEXT.size(16),
                                                                    TEXT.center,
                                                                    { color: COLORS.heading }
                                                                ]}
                                                            >
                                                                Hủy đơn
                                                            </Text>
                                                        </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={[
                                                                    LAYOUT.px(10),
                                                                    LAYOUT.py(4),
                                                                    LAYOUT.w(100),
                                                                    LAYOUT.rounded(22),
                                                                    { backgroundColor: COLORS.button }
                                                                ]}
                                                            >
                                                                <Text
                                                                    style={[
                                                                        TEXT.text,
                                                                        TEXT.size(16),
                                                                        TEXT.center,
                                                                        { color: COLORS.textLight }
                                                                    ]}
                                                                >
                                                                    Tiếp theo
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>)}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                                ))
                        )}
                </View>
            </View>

            <ToastModal width={"auto"} height={"auto"} status={"warning"} title={"Chọn lý do hủy"} content={contentCancelAlert} visible={alert} />
        </View>
    );
}