import { useState, useEffect, useRef } from "react";
import { View, ScrollView, Text, TextInput, Image, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import { formatPrice } from "../../constants/formatPrice";
import axios from "axios";
import ToastModal from "../../components/ToastModal";

const { width, height } = Dimensions.get("window");

export default function CheckoutScreen() {
    const router = useRouter();
    const { id: orderId } = useLocalSearchParams();
    const [dataOrder, setDataOrder] = useState([]);
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState(null);
    const addressInputRef = useRef(null);
    const [alert, setAlert] = useState(false);

    const loadOrder = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/order/${orderId}`);

            if (data) {
                setDataOrder(data);
                if (data.length === 0) {
                    router.replace("../(tabs)/");
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const totalAmount = () => {
        let total = 0;
        dataOrder.forEach((item) => {
            total += item.dishes.price * item.order_items.quantity;
        });

        return total;
    };

    const removeOrderItem = async (orderItemId) => {
        try {
            const { data } = await axios.delete(`${API_URL}/orderItem/${orderItemId}`);

            if (data.success) {
                await loadOrder();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const checkout = async () => {
        try {
            if (address === "") {
                setStatus("warning");
                setTitle("Chưa chọn địa chỉ nhận hàng");
                setContent(<View style={[LAYOUT.mt(12)]}>
                    <TouchableOpacity onPress={() => {
                        setAlert(false);
                        setTimeout(() => {
                            addressInputRef.current?.focus();
                        }, 100);
                    }}
                        style={[LAYOUT.w(200), LAYOUT.py(10), LAYOUT.rounded(20), { backgroundColor: COLORS.button }]}>
                        <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>);
                setAlert(true);
            } else {
                const { data } = await axios.post(`${API_URL}/checkout`, { orderId, address });

                setStatus(data.success ? "success" : "error");
                setTitle(data.success ? "Đặt hàng thành công" : "Đặt hàng thất bại");
                setContent(<View style={[LAYOUT.mt(12)]}>
                    <Text style={[TEXT.paragraph]}>{data.success ? "Vui lòng chờ đủ 3 món để giao hàng" : "Thử đặt lại nhé"}</Text>
                </View>);
                setAlert(true);

                setTimeout(() => {
                    setAlert(false);
                }, 1000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [dataOrder]);

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color={COLORS.heading}
                            onPress={() => router.replace("../(tabs)/")}
                        />
                        <Text style={[TEXT.heading, LAYOUT.ml(64)]}>
                            Thanh toán
                        </Text>
                    </View>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.85)]}>
                <ScrollView style={[LAYOUT.w(width - 60), LAYOUT.h(240), LAYOUT.mx(), LAYOUT.mt(32)]} showsVerticalScrollIndicator={false}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.mb(8), { gap: 24 }]}>
                        <Text style={[TEXT.text]}>Địa chỉ nhận</Text>
                        <TouchableOpacity>
                            <Ionicons name="pin-outline" size={20} color={COLORS.button}></Ionicons>
                        </TouchableOpacity>
                    </View>
                    <View style={[LAYOUT.px(12), LAYOUT.py(4), LAYOUT.rounded(20), { backgroundColor: COLORS.background3 }]}>
                        <TextInput style={[TEXT.paragraph]} ref={addressInputRef} placeholder="Phòng V6.02 (IUH - CS1)" value={address} onChangeText={setAddress}></TextInput>
                    </View>

                    <View style={[LAYOUT.mt(28)]}>
                        <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(6), LAYOUT.mb(12), LAYOUT.wFull]}>
                            <Text style={[TEXT.text]}>Thông tin đơn hàng</Text>
                            <View style={[LAYOUT.row]}>
                                <Text style={[TEXT.subText, LAYOUT.mr(4), { color: COLORS.paragraph }]}>Giao ngay</Text>
                                <Ionicons name="time-outline" color={COLORS.paragraph}></Ionicons>
                            </View>
                        </View>
                        <View style={[LAYOUT.wFull]}>
                            {dataOrder.map((item) => (
                                <View key={item.dishes.dishId} style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mb(14), LAYOUT.pb(10), LAYOUT.borderb(1, COLORS.background3), { borderStyle: "dashed" }]}>
                                    <View style={[LAYOUT.border(1, COLORS.border), LAYOUT.rounded(12)]}>
                                        <Image style={[LAYOUT.w(80), LAYOUT.h(110), LAYOUT.rounded(12)]} source={item.dishes.imageUrl ? { uri: item.dishes.imageUrl } : require("../../assets/images/background-default.png")}></Image>
                                    </View>
                                    <View style={[LAYOUT.w("50%")]}>
                                        <Text numberOfLines={1} style={[TEXT.text]}>{item.dishes.dishName}</Text>
                                        <View style={[LAYOUT.row]}>
                                            <Ionicons name="reader-outline" color={COLORS.paragraph}></Ionicons>
                                            <Text style={[TEXT.subText, LAYOUT.ml(4), { color: COLORS.paragraph }]}>Ghi chú</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => removeOrderItem(`${item.order_items.orderItemId}`)} style={[LAYOUT.w(60), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.mt(14), { backgroundColor: COLORS.background3 }]}>
                                            <Text style={[TEXT.subText, TEXT.center, { color: COLORS.button }]}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[LAYOUT.justifyBetween]}>
                                        <View>
                                            <Text style={[TEXT.paragraph, { color: COLORS.paragraph }]}>{formatPrice(item.dishes.price)} đ</Text>
                                            <Text style={[TEXT.paragraph, { color: COLORS.text }]}>x{item.order_items.quantity}</Text>
                                        </View>
                                        <View>
                                            <Text style={[TEXT.paragraph, { color: COLORS.heading }]}>{formatPrice(item.dishes.price * item.order_items.quantity)} đ</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                            }
                        </View>
                        <View>
                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mb(4)]}>
                                <Text style={[TEXT.text]}>Tổng đơn</Text>
                                <Text style={[TEXT.text]}>{formatPrice(totalAmount())} đ</Text>
                            </View>
                            <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                <Text style={[TEXT.text]}>Phí dịch vụ</Text>
                                <Text style={[TEXT.text]}>5.000 đ</Text>
                            </View>
                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(20), LAYOUT.pt(10), LAYOUT.bordert(1, COLORS.background3)]}>
                                <Text style={[TEXT.text]}>Thanh toán</Text>
                                <Text style={[TEXT.text]}>{formatPrice(totalAmount() + 5000)} đ</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[LAYOUT.mt(32), LAYOUT.mb(52), LAYOUT.itemsCenter]}>
                        <TouchableOpacity onPress={checkout} style={[LAYOUT.w(200), LAYOUT.py(10), LAYOUT.rounded(20), { backgroundColor: COLORS.button }]}>
                            <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>Đặt Hàng</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
            <ToastModal status={status} title={title} content={content} visible={alert} />
        </View>
    );
}