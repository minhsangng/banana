import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const OrderDetailScreen = () => {
    const { id: orderId } = useLocalSearchParams();
    const [order, setOrder] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loadOrderDetail = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/order/${orderId}`);

                setOrder(data[0]);

            setLoading(false);
        } catch (error) {
            console.log("Lỗi không thể kết nối API ", error);
        }
    }

    useEffect(() => {
        /* loadOrderDetail(); */
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.heading} onPress={() => router.push("../(tabs)/history")}></Ionicons>
                        <Text style={[TEXT.heading, LAYOUT.ml(60)]}>Chi Tiết Đơn</Text>
                    </View>
                </View>
            </View>
            <View key={order.orderId} style={[LAYOUT.main, LAYOUT.h(height * 0.85)]}>
                <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(32)]}>
                    <View style={[LAYOUT.borderb(1, COLORS.background4), LAYOUT.pb(12)]}>
                        <Text style={[TEXT.text]}>Order No. #0123</Text>
                        <Text style={[TEXT.paragraph]}>09:23 - 19/11</Text>
                    </View>

                    {/* Dish items */}
                    <View style={[LAYOUT.py(32)]}>
                        <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.borderb(1, COLORS.background4), LAYOUT.pb(12)]}>
                            <ImageBackground source={require("../../assets/images/background-default.png")} style={[LAYOUT.w(80), LAYOUT.h(80), LAYOUT.rounded(20), LAYOUT.border(1, COLORS.border), { overflow: "hidden" }]} />
                            <View style={[LAYOUT.justifyBetween]}>
                                <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                    <Text style={[TEXT.text, LAYOUT.w("60%")]} numberOfLines={1}>Hủ tiếu sa tế</Text>
                                    <View>
                                        <Text style={[TEXT.text, TEXT.size(16), { textAlign: "right" }]}>19/11</Text>
                                        <Text style={[TEXT.paragraph, { textAlign: "right" }]}>09:23</Text>
                                    </View>
                                </View>
                                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                                    <Text style={[TEXT.text, { color: COLORS.heading }]}>15.000 đ</Text>
                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, { gap: 8 }]}>
                                        <TouchableOpacity style={[LAYOUT.rounded(20), { backgroundColor: COLORS.light }]}>
                                            <Ionicons name="remove-outline" size={20} color={COLORS.button}></Ionicons>
                                        </TouchableOpacity>
                                        <Text style={[TEXT.text]}>3</Text>
                                        <TouchableOpacity style={[LAYOUT.rounded(20), { backgroundColor: COLORS.light }]}>
                                            <Ionicons name="add-outline" size={20} color={COLORS.button}></Ionicons>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Fees */}
                    <View style={[LAYOUT.borderb(1, COLORS.background4), LAYOUT.mb(12), { borderStyle: "dashed" }]}>
                        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text]}>Tạm tính</Text>
                            <Text style={[TEXT.text]}>45.000 đ</Text>
                        </View>
                        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text]}>Phí dịch vụ</Text>
                            <Text style={[TEXT.text]}>5.000 đ</Text>
                        </View>
                    </View>

                    {/* Total amount */}
                    <View>
                        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                            <Text style={[TEXT.text, TEXT.size(22)]}>Tổng tiền</Text>
                            <Text style={[TEXT.text, TEXT.size(22)]}>50.000 đ</Text>
                        </View>
                    </View>

                    {/* Re-Order */}
                    <View style={[LAYOUT.wFull, LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.mt(44)]}>
                        <TouchableOpacity style={[LAYOUT.w(150), LAYOUT.rounded(30), LAYOUT.py(6), {backgroundColor: COLORS.button}]}>
                            <Text style={[TEXT.text, TEXT.size(24), TEXT.center, { color: COLORS.textLight }]}>Đặt lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default OrderDetailScreen;
