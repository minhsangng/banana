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
import { formatPrice, formatImage } from "../../constants/format";
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
    const [note, setNote] = useState("");
    const [alert, setAlert] = useState(false);
    const [change, setChange] = useState(false);
    const [addressList, setAddressList] = useState([]);
    const [suggestAddress, setSuggestAddress] = useState([]);
    const addressInputRef = useRef(null);
    const SEVICE_FEE = 0;

    const getSuggestAddress = (keyword) => {
        const key = keyword.toString().trim().toUpperCase();
        if (!key) {
            setSuggestAddress([]);
            return;
        }

        const suggestions = [];

        addressList.forEach((r) => {
            if (r.building.startsWith(key)) {
                const [minF, maxF] = r.floor.split(",").map((f) => Number(f.trim()));

                for (let f = minF; f <= maxF; f++) {
                    suggestions.push(`${r.building}${f}`);
                }
            }
        });

        setSuggestAddress(suggestions);
    };

    /* ------------------- LOAD DATA ------------------- */
    useEffect(() => {
        const loadData = async () => {
            try {
                let userStr = null;
                let addressData = null;

                await Promise.all([
                    (userStr = await SecureStore.getItemAsync("userInfo")),
                    (addressData = await axios.get(`${API_URL}/address`))
                ]);

                if (userStr) {
                    setUserId(parseInt(JSON.parse(userStr).userId));
                }

                if (addressData?.data) {
                    setAddressList(addressData.data);
                }
            } catch (error) {
                console.error("Lấy thông tin người dùng thất bại: ", error);
            }
        };

        loadData();
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
                console.log("Error loading checkout:", error);
                setDataOrder([]);
            }
        };

        loadOrder();
    }, [change, userId]);

    /* ------------------- TỔNG TIỀN ------------------- */
    const totalAmount = () => {
        return dataOrder.reduce((sumOrder, order) => {
            const sumItems = order.items.reduce((sumItem, item) => {
                return sumItem + parseFloat(item.price) * item.quantity;
            }, 0);
            return sumOrder + sumItems;
        }, 0);
    };

    /* ------------------- XOÁ MÓN ------------------- */
    const removeOrderItem = async (orderItemId) => {
        try {
            const { data } = await axios.delete(`${API_URL}/orderItem/${orderItemId}`);
            if (data.success) {
                setDataOrder((prev) =>
                    prev.filter((item) => item.items.orderItemId !== orderItemId)
                );

                setChange(!change);
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
                note
            });

            if (data.success) {
                setTimeout(() => { setChange(!change) }, 750);
            }

            setStatus(data.success ? "success" : "error");
            setTitle(data.success ? "Đặt hàng thành công" : "Đặt hàng thất bại");

            setAlert(true);
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
                            LAYOUT.relative,
                            LAYOUT.bg(COLORS.background3)
                        ]}
                    >
                        <TextInput
                            ref={addressInputRef}
                            placeholder="V6.02"
                            value={address}
                            selection={{ start: parseInt(`${address.length}`), end: parseInt(`${address.length}`) }}
                            onChangeText={(text) => (setAddress(text), getSuggestAddress(text))}
                            style={[TEXT.paragraph]}
                        />
                        <View style={[LAYOUT.absolute, LAYOUT.top("130%"), LAYOUT.left(0), LAYOUT.row, LAYOUT.flexWrap, LAYOUT.w("120%"), LAYOUT.gap(14), LAYOUT.zIndex(1)]}>
                            {suggestAddress.map((item) => (
                                <TouchableOpacity onPress={() => (setAddress(`${item}.`), setSuggestAddress([]), setTimeout(() => addressInputRef.current?.focus(), 150))} key={item} style={[LAYOUT.bg(COLORS.background4), LAYOUT.w(44), LAYOUT.py(4), LAYOUT.rounded(10)]}><Text style={[TEXT.text, TEXT.center]}>{item}</Text></TouchableOpacity>
                            ))}
                        </View>
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

                        {dataOrder.map((order) => (
                            <View key={order.orderId}>
                                {order.items.map((item) => (
                                    <View
                                        key={item.orderItemId}
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
                                            source={formatImage(item.imageUrl)}
                                        />

                                        <View style={[LAYOUT.w("50%")]}>
                                            <Text numberOfLines={1} style={[TEXT.text]}>
                                                {item.dishName}
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
                                                    {item.note ? item.note : "Ghi chú"}
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => removeOrderItem(item.orderItemId)}
                                                style={[
                                                    LAYOUT.w(60),
                                                    LAYOUT.py(4),
                                                    LAYOUT.rounded(12),
                                                    LAYOUT.mt(14),
                                                    { backgroundColor: COLORS.background3 },
                                                ]}
                                            >
                                                <Text
                                                    style={[TEXT.subText, TEXT.center, { color: COLORS.button }]}
                                                >
                                                    Xóa
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={[LAYOUT.justifyBetween]}>
                                            <View>
                                                <Text style={[TEXT.paragraph, { color: COLORS.paragraph }]}>
                                                    {formatPrice(parseFloat(item.price))} đ
                                                </Text>
                                                <Text style={[TEXT.paragraph]}>x{item.quantity}</Text>
                                            </View>

                                            <Text style={[TEXT.paragraph, { color: COLORS.heading }]}>
                                                {formatPrice(parseFloat(item.price) * item.quantity)} đ
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}

                        <View style={[LAYOUT.mt(12), LAYOUT.pb(12), LAYOUT.borderb(1, COLORS.background3)]}>
                            <Text style={[TEXT.text, LAYOUT.mb(4)]}>Ghi chú</Text>
                            <TextInput value={note} onChangeText={setNote} style={[LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), TEXT.paragraph, { backgroundColor: COLORS.background3 }]}></TextInput>
                        </View>

                        {/* TỔNG TIỀN */}
                        <View style={[LAYOUT.mt(12)]}>
                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mb(4)]}>
                                <Text style={[TEXT.text]}>Tổng đơn</Text>
                                <Text style={[TEXT.text]}>{formatPrice(totalAmount())} đ</Text>
                            </View>

                            <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                <Text style={[TEXT.text]}>Phí dịch vụ</Text>
                                <Text style={[TEXT.text]}>{formatPrice(SEVICE_FEE)} đ</Text>
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
                                    {formatPrice(totalAmount() + SEVICE_FEE)} đ
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
                                LAYOUT.bg(COLORS.button)
                            ]}
                        >
                            <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>
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
