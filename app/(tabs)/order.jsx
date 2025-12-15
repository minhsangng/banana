import { View, Text, TouchableOpacity, Image, Dimensions, FlatList, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { API_URL } from "../../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import LoadingSpinner from "../../components/LoadingSpinner";
import ToastModal from "../../components/ToastModal";
import { formatImage } from "../../constants/format";

const { width, height } = Dimensions.get("window");

const OrderScreen = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [deleteId, setDeleteId] = useState(0);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [icon, setIcon] = useState(false);
    const [title, setTitle] = useState(false);
    const [content, setContent] = useState(null);
    const [alert, setAlert] = useState(false);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            setIsLogin(true);

            const uid = parseInt(JSON.parse(userStr).userId);
            setUserId(uid);
            const { data } = await axios.get(`${API_URL}/currentorder/${uid}`);

            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.log("Lấy danh sách đơn hàng thất bại: ", error);
        } finally {
            setLoading(false);
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

    const cancelOrder = (orderId) => {
        setIcon("warning");
        setTitle("Xác nhận hủy đơn hàng");
        setContent(contentCancelAlert);
        setAlert(true);
        setDeleteId(orderId);
    }

    const handleCancer = async () => {
        try {
            setAlert(false);

            const { data } = await axios.get(`${API_URL}/cancelorder/${deleteId}`);

            if (data.success) {
                await axios.post(`${API_URL}/pushnotification`, {
                    userId: userId,
                    title: "Banana - Hủy đơn",
                    content: data.message,
                    metadata: {}
                });
            }

            setIcon(data.success ? "success" : "error");
            setTitle(data.success ? "Hủy đơn thành công" : "Hủy đơn thất bại");
            setContent(null);
            setAlert(true);
            
            setTimeout(() => {
                setAlert(false);    
                loadOrders();
            }, 1100);
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadOrders().finally(() => setRefreshing(false));
    }, []);

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
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                                renderItem={({ item }) => {
                                    const dishNames = item.items.map(d => d.dishName).join(" - ");

                                    return (
                                        <TouchableOpacity onPress={() => router.push(`../detailorder/${item.orderId}`)}
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
                                                source={formatImage(item.items[0].dishImage)}
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

            <ToastModal status={icon} title={title} content={content} visible={alert} />
        </View>
    );
};

export default OrderScreen;
