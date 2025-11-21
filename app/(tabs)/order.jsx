import { View, Text, TouchableOpacity, ImageBackground, Dimensions, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import TabScreen from "../../components/TabScreen";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { API_URL } from "../../constants/api";
import axios from "axios";

const OrderScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // ===== RENDER 1 ĐƠN HÀNG =====
    const dataContainer = (id, date) => {
        return (
            <TouchableOpacity
                key={id}
                style={[
                    LAYOUT.wFull,
                    LAYOUT.mb(20),
                    LAYOUT.row,
                    LAYOUT.justifyBetween,
                    LAYOUT.pb(12),
                    LAYOUT.borderb(1, COLORS.background4)
                ]}
            >
                <ImageBackground
                    source={require("../../assets/images/background-default.png")}
                    style={[
                        LAYOUT.w(80),
                        LAYOUT.h(110),
                        LAYOUT.rounded(20),
                        LAYOUT.border(1, COLORS.border),
                        { overflow: "hidden" }
                    ]}
                />

                <View>
                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                        <Text style={[TEXT.text, LAYOUT.w("50%")]} numberOfLines={1}>
                            {id}
                        </Text>

                        <Text style={[TEXT.text, { color: COLORS.heading }]}>{date}</Text>
                    </View>

                    <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                        <Text style={[TEXT.text, TEXT.size(16)]}>{date}</Text>
                        <Text style={[TEXT.text, TEXT.size(16)]}>2 items</Text>
                    </View>

                    <View style={[LAYOUT.mt(12), { alignItems: "flex-end" }]}>
                        <TouchableOpacity
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
    };

    // ===== LOAD API =====
    const loadOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/orders`);
            setOrders(data);
        } catch (error) {
            console.log("Lỗi API orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    if (loading) return <LoadingSpinner />;

    // ===== GỬI GIAO DIỆN VÀO TabScreen.data =====
    const renderBody = (
        <ScrollView>
            {orders.length === 0 ? (
                <Text style={[TEXT.text, TEXT.size(18)]}>Chưa có dữ liệu</Text>
            ) : (
                orders.map((item) => dataContainer(item.orderId, item.orderDate))
            )}
        </ScrollView>
    );

    return <TabScreen header="Đơn hàng" data={renderBody} />;
};

export default OrderScreen;
