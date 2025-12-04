import { View, Text, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import NavBar from "../../../components/NavBar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ToastModal from "../../../components/ToastModal";

const { width, height } = Dimensions.get("window");
const orderStatus = [
    "Giỏ hàng",
    "Đang chờ",
    "Đang chuẩn bị",
    "Đang giao",
    "Hoàn thành",
    "Bị hủy",
];

export default function OrderScreen() {
    const [isLogin, setIsLogin] = useState(false);
    const [orders, setOrders] = useState([]);
    const [alert, setAlert] = useState(false);
    const [icon, setIcon] = useState("");
    const [title, setTitle] = useState("");
    const [currentStatus, setCurrentStatus] = useState(1);
    const [userId, setUserId] = useState(0);
    const [deleteId, setDeleteId] = useState(0);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        loadOrders();
    }, [currentStatus]);

    // ===== LOAD API =====
    const loadOrders = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            setUserId(parseInt(user.userId));
            setIsLogin(true);

            const { data } = await axios.get(`${API_URL}/ordersowner/${user.userId}/${currentStatus}`);

            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.log("Lỗi API orders:", error);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            console.log(status);
            if (status === 4) {
                setAlert(true);
                setDeleteId(orderId);
                setIcon("warning");
                setTitle("Xác nhận hủy đơn hàng này");
            } else {
                const { data } = await axios.post(`${API_URL}/updateorderowner`, {
                    orderId,
                    status
                });

                setIcon(data.success ? "success" : "error");
                setTitle(data.message);
                setAlert(true);
                setTimeout(() => (setAlert(false), loadOrders()), 1200);
            }
        } catch (error) {
            console.error(error);
        }
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
            loadOrders();
        } catch (error) {
            console.error(error);
        }
    };

    const contentCancelAlert = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.justifyCenter, LAYOUT.mt(16)]}>
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
                                                <View style={[LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                                    <Text style={[TEXT.text]} numberOfLines={1}>
                                                        #DH264{String(item.orderId).length === 2 ? `0${item.orderId}` : item.orderId}
                                                    </Text>
                                                    <Text style={[TEXT.text, TEXT.size(16)]}>
                                                        Phòng: {item.deliveryAddress}
                                                    </Text>
                                                    <Text style={[TEXT.text, TEXT.size(16)]}>
                                                        Trạng thái: <Text style={[LAYOUT.color(item.orderStatus === "Bị hủy" ? COLORS.heading : item.orderStatus === "Hoàn thành" ? "#73AF6F" : "#67B2D8")]}>{item.orderStatus}</Text>
                                                    </Text>
                                                </View>
                                                <View style={[LAYOUT.mt(12), currentStatus !== 2 ? { justifyContent: "flex-end" } : ""]}>
                                                    {currentStatus === 1 && (<View style={[{ gap: 8 }]}>
                                                        {item.orderStatus !== "Đang giao" && (
                                                            <TouchableOpacity onPress={() => updateStatus(item.orderId, 4)}
                                                                style={[
                                                                    LAYOUT.px(10),
                                                                    LAYOUT.py(4),
                                                                    LAYOUT.w(100),
                                                                    LAYOUT.rounded(22),
                                                                    LAYOUT.bg(COLORS.background3)
                                                                ]}
                                                            >
                                                                <Text
                                                                    style={[
                                                                        TEXT.text,
                                                                        TEXT.size(16),
                                                                        TEXT.center,
                                                                        LAYOUT.color(COLORS.heading)
                                                                    ]}
                                                                >
                                                                    Hủy đơn
                                                                </Text>
                                                            </TouchableOpacity>
                                                        )}
                                                        <TouchableOpacity onPress={() => updateStatus(item.orderId, orderStatus.indexOf(item.orderStatus))}
                                                            style={[
                                                                LAYOUT.px(10),
                                                                LAYOUT.py(4),
                                                                LAYOUT.w(100),
                                                                LAYOUT.rounded(22),
                                                                LAYOUT.bg(COLORS.button),
                                                                LAYOUT.row, LAYOUT.justifyCenter,
                                                                LAYOUT.itemsCenter,
                                                                LAYOUT.gap(6)
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
                                                                Chuyển
                                                            </Text>
                                                            <Ionicons name="send-outline" color={COLORS.textLight}></Ionicons>
                                                        </TouchableOpacity>
                                                    </View>)}
                                                    {currentStatus === 2 && (<View style={[{ alignItems: "flex-end" }]}>
                                                        <Text style={[TEXT.paragraph]}>Hoàn thành:</Text>
                                                        <Text style={[TEXT.paragraph]}>8:20 PM</Text>
                                                    </View>)}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                                ))
                        )}
                </View>
            </View>

            <ToastModal width={"auto"} height={"auto"} status={icon} title={title} content={icon === "warning" ? contentCancelAlert : null} visible={alert} />
        </View>
    );
}