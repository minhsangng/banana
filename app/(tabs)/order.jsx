import { View, Text, TouchableOpacity, Image, Dimensions, FlatList, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import LoadingSpinner from "../../components/LoadingSpinner";
import ToastModal from "../../components/ToastModal";

const { width, height } = Dimensions.get("window");

const OrderScreen = () => {
    const [orders, setOrders] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [alert, setAlert] = useState(false);
    const [deleteId, setDeleteId] = useState(0);
    const [userId, setUserId] = useState(null);
    const [selectedReason, setSelectedReason] = useState(null);
    const [loading, setLoading] = useState(false);

    const reasons = [
        { id: 1, label: "Tôi muốn thay đổi địa chỉ nhận" },
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
            setIsLogin(true);

            setUserId(parseInt(JSON.parse(userStr).userId));
            const { data } = await axios.get(`${API_URL}/currentorder/${userId}`);

            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.log("Lỗi API orders:", error);
        } finally {
            setLoading(false);
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

            setSelectedReason(null);
            loadOrders();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                    <Text style={[TEXT.heading]}>Đơn hàng</Text>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.75)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80)]}>
                    {!isLogin ? (<Text style={[TEXT.text, TEXT.center]}>Đăng nhập để đặt hàng ngay</Text>) : (
                        orders.length === 0 ? <Text style={[TEXT.text, TEXT.center]}>Danh sách trống</Text> :
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
                                                LAYOUT.borderb(1, COLORS.background4)
                                            ]}
                                        >
                                            <Image
                                                source={item.items[0].dishImage ? { uri: item.items[0].dishImage } : require("../../assets/images/background-default.png")}
                                                style={[
                                                    LAYOUT.w(80),
                                                    LAYOUT.h(110),
                                                    LAYOUT.rounded(20),
                                                    LAYOUT.border(1, COLORS.border),
                                                    { overflow: "hidden" }
                                                ]}
                                            />

                                            <View style={[LAYOUT.ml(12)]}>
                                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                                    <Text style={[TEXT.text, LAYOUT.w("60%")]} numberOfLines={1}>
                                                        {dishNames}
                                                    </Text>
                                                    <Text style={[TEXT.text, { color: COLORS.heading }]}>
                                                        {item.items.length} món
                                                    </Text>
                                                </View>

                                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                    <Text style={[TEXT.text, TEXT.size(16)]}>
                                                        {item.orderStatus}
                                                    </Text>
                                                    <Text style={[TEXT.text, TEXT.size(16)]}>
                                                        {item.deliveryAddress}
                                                    </Text>
                                                </View>

                                                <View style={[LAYOUT.mt(12), { alignItems: "flex-end" }]}>
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
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                            )
                    )}
                </View>
            </View>

            <ToastModal width={"auto"} height={"auto"} status={"warning"} title={"Chọn lý do hủy"} content={contentCancelAlert} visible={alert} />
        </View>
    );
};

export default OrderScreen;
