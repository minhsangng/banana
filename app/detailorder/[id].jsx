import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import axios from "axios";
import { formatImage, formatPrice, formatOrderId } from "../../constants/format";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const SERVICES_FEE = 0;

const OrderDetailScreen = () => {
    const { id: orderId } = useLocalSearchParams();
    const [order, setOrder] = useState(null);
    const [role, setRole] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loadOrderDetail = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            const user = JSON.parse(userStr);
            setRole(user.role);
            
            const { data } = await axios.get(`${API_URL}/orderdetail/${orderId}`);

            setOrder(data[0]);

            setLoading(false);
        } catch (error) {
            console.log("Lỗi không thể kết nối API ", error);
        }
    }

    useEffect(() => {
        loadOrderDetail();
    }, []);

    if (loading || !order) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.heading} onPress={() => router.back()}></Ionicons>
                        <Text style={[TEXT.heading, LAYOUT.ml(60)]}>Chi Tiết Đơn</Text>
                    </View>
                </View>
            </View>
            <View key={order.orderId} style={[LAYOUT.main, LAYOUT.h(height * 0.85)]}>
                <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(32)]}>
                    <View style={[LAYOUT.borderb(1, COLORS.background4), LAYOUT.pb(12)]}>
                        <Text style={[TEXT.text]}>{formatOrderId(order.orderId)}</Text>
                        <Text style={[TEXT.paragraph]}>{order.orderDate.toString().slice(0, 10)} - {order.orderDate.toString().slice(11, 16)}</Text>
                    </View>

                    {/* Dish items */}
                    <View style={[LAYOUT.py(32)]}>
                        {order.items.map((item) => (
                            <View
                                key={item.orderItemId}
                                style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.borderb(1, COLORS.background4), LAYOUT.pb(12), LAYOUT.mb(12)]}
                            >
                                <Image
                                    source={formatImage(item.dishImage)}
                                    style={[
                                        LAYOUT.w(80),
                                        LAYOUT.h(80),
                                        LAYOUT.rounded(20),
                                        LAYOUT.border(1, COLORS.border),
                                        { overflow: "hidden" },
                                    ]}
                                />

                                <View>
                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                        <Text style={[TEXT.text, LAYOUT.w("50%")]} numberOfLines={1}>
                                            {item.dishName}
                                        </Text>
                                        <View>
                                            <Text style={[TEXT.text, TEXT.size(16), { textAlign: "right" }]}>
                                                {formatPrice(item.dishPrice * item.quantity)} đ
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                                        <Text style={[TEXT.text, { color: COLORS.heading }]}>
                                            {formatPrice(item.dishPrice)} đ
                                        </Text>

                                        <View>
                                            <Text style={[TEXT.text]}>x{item.quantity}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Fees */}
                    <View style={[LAYOUT.borderb(1, COLORS.background4), LAYOUT.mb(12), { borderStyle: "dashed" }]}>
                        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text]}>Tạm tính</Text>
                            <Text style={[TEXT.text]}>{formatPrice(order.totalAmount)} đ</Text>
                        </View>
                        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text]}>Phí dịch vụ</Text>
                            <Text style={[TEXT.text]}>{formatPrice(SERVICES_FEE)} đ</Text>
                        </View>
                    </View>

                    {/* Total amount */}
                    <View>
                        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text, TEXT.size(22)]}>Tổng tiền</Text>
                            <Text style={[TEXT.text, TEXT.size(22)]}>{formatPrice(order.totalAmount + SERVICES_FEE)} đ</Text>
                        </View>
                    </View>

                    {/* Re-Order */}
                    {(order.orderStatus === "Hoàn thành" || order.orderStatus === "Bị hủy") && role === "Customer" && <View style={[LAYOUT.wFull, LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.mt(44)]}>
                        <TouchableOpacity style={[LAYOUT.w(150), LAYOUT.rounded(30), LAYOUT.py(6), { backgroundColor: COLORS.button }]}>
                            <Text style={[TEXT.text, TEXT.size(24), TEXT.center, { color: COLORS.textLight }]}>Đặt lại</Text>
                        </TouchableOpacity>
                    </View>
                    }
                </View>
            </View>
        </View>
    );
};

export default OrderDetailScreen;
