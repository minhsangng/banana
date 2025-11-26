import { useState, useEffect, useRef } from "react";
import {
    View,
    ScrollView,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import { formatPrice } from "../../constants/formatPrice";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import ToastModal from "../../components/ToastModal";

const { width, height } = Dimensions.get("window");

export default function CheckoutScreen() {
    const router = useRouter();

    const [userId, setUserId] = useState(null);
    const [dataOrder, setDataOrder] = useState([]);
    const [address, setAddress] = useState("");

    const [status, setStatus] = useState();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState(null);
    const [alert, setAlert] = useState(false);

    const addressInputRef = useRef(null);

    /* ------------------- LOAD USER ------------------- */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userStr = await SecureStore.getItemAsync("userInfo");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setUserId(parseInt(user.userId));
                }
            } catch (error) {
                console.log("Error loading user:", error);
            }
        };
        loadUser();
    }, []);

    /* ------------------- LOAD ORDER ------------------- */
    useEffect(() => {
        if (!userId) return;

        const loadOrder = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/ordercheckout/${userId}`);
                if (Array.isArray(data)) {
                    setDataOrder(data);
                    if (data.length === 0) {
                        router.replace("../(tabs)/");
                    }
                } else {
                    setDataOrder([]);
                }
            } catch (error) {
                console.log("Error loading order:", error);
                setDataOrder([]);
            }
        };

        loadOrder();
    }, [userId]);

    /* ------------------- TỔNG TIỀN ------------------- */
    const totalAmount = () => {
        return dataOrder.reduce((sum, item) => {
            return sum + item.dishes.price * item.order_items.quantity;
        }, 0);
    };

    /* ------------------- XOÁ MÓN ------------------- */
    const removeOrderItem = async (orderItemId) => {
        try {
            const { data } = await axios.delete(`${API_URL}/orderItem/${orderItemId}`);
            if (data.success) {
                setDataOrder((prev) =>
                    prev.filter((item) => item.order_items.orderItemId !== orderItemId)
                );
            }
        } catch (error) {
            console.log("Error removing item:", error);
        }
    };

    /* ------------------- CHECKOUT ------------------- */
    const checkout = async () => {
        if (!address.trim()) {
            setStatus("warning");
            setTitle("Chưa chọn địa chỉ nhận hàng");
            setContent(
                <View style={[LAYOUT.mt(12)]}>
                    <TouchableOpacity
                        onPress={() => {
                            setAlert(false);
                            setTimeout(() => addressInputRef.current?.focus(), 150);
                        }}
                        style={[
                            LAYOUT.w(200),
                            LAYOUT.py(10),
                            LAYOUT.rounded(20),
                            { backgroundColor: COLORS.button },
                        ]}
                    >
                        <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>
                            Xác nhận
                        </Text>
                    </TouchableOpacity>
                </View>
            );
            setAlert(true);
            return;
        }

        try {
            const { data } = await axios.post(`${API_URL}/checkout`, {
                userId,
                address,
            });

            setStatus(data.success ? "success" : "error");
            setTitle(data.success ? "Đặt hàng thành công" : "Đặt hàng thất bại");
            setContent(
                <View style={[LAYOUT.mt(12)]}>
                    <Text style={[TEXT.paragraph]}>
                        {data.success
                            ? "Vui lòng chờ đủ 3 món để giao hàng"
                            : "Thử đặt lại nhé"}
                    </Text>
                </View>
            );
            setAlert(true);

            if (data.success) {
                setTimeout(() => router.replace("../(tabs)/"), 1200);
            }
        } catch (error) {
            console.log("Checkout error:", error);
        }
    };

    return (
        <View style={[LAYOUT.container]}>
            {/* HEADER */}
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                    <Ionicons
                        name="chevron-back"
                        size={22}
                        color={COLORS.heading}
                        onPress={() => router.replace("../(tabs)/")}
                    />
                    <Text style={[TEXT.heading, LAYOUT.ml(64)]}>Thanh toán</Text>
                </View>
            </View>

            {/* MAIN */}
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.85)]}>
                <ScrollView
                    style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(24)]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ĐỊA CHỈ */}
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.mb(8), { gap: 24 }]}>
                        <Text style={[TEXT.text]}>Địa chỉ nhận</Text>
                        <Ionicons name="pin-outline" size={20} color={COLORS.button} />
                    </View>
                    <View
                        style={[
                            LAYOUT.px(12),
                            LAYOUT.py(4),
                            LAYOUT.rounded(20),
                            { backgroundColor: COLORS.background3 },
                        ]}
                    >
                        <TextInput
                            ref={addressInputRef}
                            placeholder="Phòng V6.02 (IUH - CS1)"
                            value={address}
                            onChangeText={setAddress}
                            style={[TEXT.paragraph]}
                        />
                    </View>

                    {/* THÔNG TIN ĐƠN */}
                    <View style={[LAYOUT.mt(24)]}>
                        <View
                            style={[
                                LAYOUT.row,
                                LAYOUT.justifyBetween,
                                LAYOUT.pb(6),
                                LAYOUT.mb(12),
                                LAYOUT.borderb(1, COLORS.background3),
                            ]}
                        >
                            <Text style={[TEXT.text]}>Thông tin đơn hàng</Text>
                            <View style={[LAYOUT.row]}>
                                <Text style={[TEXT.subText, LAYOUT.mr(4), { color: COLORS.paragraph }]}>
                                    Giao ngay
                                </Text>
                                <Ionicons name="time-outline" color={COLORS.paragraph} />
                            </View>
                        </View>

                        {dataOrder.map((item) => (
                            <View
                                key={item.order_items.orderItemId}
                                style={[
                                    LAYOUT.row,
                                    LAYOUT.justifyBetween,
                                    LAYOUT.mb(14),
                                    LAYOUT.pb(10),
                                    LAYOUT.borderb(1, COLORS.background3),
                                    { borderStyle: "dashed" },
                                ]}
                            >
                                <Image
                                    style={[LAYOUT.w(80), LAYOUT.h(110), LAYOUT.rounded(12)]}
                                    source={
                                        item.dishes.imageUrl
                                            ? { uri: item.dishes.imageUrl }
                                            : require("../../assets/images/background-default.png")
                                    }
                                />

                                <View style={[LAYOUT.w("50%")]}>
                                    <Text numberOfLines={1} style={[TEXT.text]}>
                                        {item.dishes.dishName}
                                    </Text>

                                    <View style={[LAYOUT.row, LAYOUT.mt(4)]}>
                                        <Ionicons name="reader-outline" color={COLORS.paragraph} />
                                        <Text
                                            style={[
                                                TEXT.subText,
                                                LAYOUT.ml(4),
                                                { color: COLORS.paragraph },
                                            ]}
                                        >
                                            Ghi chú
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => removeOrderItem(item.order_items.orderItemId)}
                                        style={[
                                            LAYOUT.w(60),
                                            LAYOUT.py(4),
                                            LAYOUT.rounded(12),
                                            LAYOUT.mt(14),
                                            { backgroundColor: COLORS.background3 },
                                        ]}
                                    >
                                        <Text style={[TEXT.subText, TEXT.center, { color: COLORS.button }]}>
                                            Xóa
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={[LAYOUT.justifyBetween]}>
                                    <View>
                                        <Text style={[TEXT.paragraph, { color: COLORS.paragraph }]}>
                                            {formatPrice(item.dishes.price)} đ
                                        </Text>
                                        <Text style={[TEXT.paragraph]}>x{item.order_items.quantity}</Text>
                                    </View>

                                    <Text style={[TEXT.paragraph, { color: COLORS.heading }]}>
                                        {formatPrice(item.dishes.price * item.order_items.quantity)} đ
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {/* TỔNG TIỀN */}
                        <View style={[LAYOUT.mt(12)]}>
                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mb(4)]}>
                                <Text style={[TEXT.text]}>Tổng đơn</Text>
                                <Text style={[TEXT.text]}>{formatPrice(totalAmount())} đ</Text>
                            </View>

                            <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                <Text style={[TEXT.text]}>Phí dịch vụ</Text>
                                <Text style={[TEXT.text]}>5.000 đ</Text>
                            </View>

                            <View
                                style={[
                                    LAYOUT.row,
                                    LAYOUT.justifyBetween,
                                    LAYOUT.mt(20),
                                    LAYOUT.pt(10),
                                    LAYOUT.bordert(1, COLORS.background3),
                                ]}
                            >
                                <Text style={[TEXT.text]}>Thanh toán</Text>
                                <Text style={[TEXT.text]}>
                                    {formatPrice(totalAmount() + 5000)} đ
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* BUTTON */}
                    <View style={[LAYOUT.mt(32), LAYOUT.itemsCenter, LAYOUT.mb(52)]}>
                        <TouchableOpacity
                            onPress={checkout}
                            style={[
                                LAYOUT.w(200),
                                LAYOUT.py(10),
                                LAYOUT.rounded(20),
                                { backgroundColor: COLORS.button },
                            ]}
                        >
                            <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>
                                Đặt Hàng
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            <ToastModal visible={alert} status={status} title={title} content={content} />
        </View>
    );
}
