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
import WheelPickerExpo from "react-native-wheel-picker-expo";
import ToastModal from "../../components/ToastModal";
import LoadingSpinner from "../../components/LoadingSpinner";

const { width, height } = Dimensions.get("window");
const SEVICE_FEE = 0;

export default function CheckoutScreen() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [dataOrder, setDataOrder] = useState([]);

    const [status, setStatus] = useState();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState(null);
    const [note, setNote] = useState("");
    const [alert, setAlert] = useState(false);

    const [change, setChange] = useState(false);
    const [rawRooms, setRawRooms] = useState([]);
    const [allCodes, setAllCodes] = useState([]);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const addressInputRef = useRef(null);
    const [address, setAddress] = useState("");

    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const hours = Array
        .from({ length: 11 }, (_, i) => i + 6)
        .filter(h => h > currentHour || h === currentHour)
        .map(h => ({
            label: String(h).padStart(2, "0"),
            value: h,
        }));

    const minutes = Array
        .from({ length: 60 }, (_, i) => i)
        .filter(m => {
            if (hour === currentHour) return m > currentMinute;
            if (hour === 17) return m <= 15;
            return true;
        })
        .map(m => ({
            label: String(m).padStart(2, "0"),
            value: m,
        }));

    const timerOrder = () => {
        setStatus("edit");
        setTitle("Chọn giờ giao hàng");
        setContent((
            <View style={[LAYOUT.mt(12)]}>
                <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.itemsCenter]}>
                    <WheelPickerExpo
                        height={200}
                        width={100}
                        itemHeight={200}
                        selectedStyle={{
                            borderColor: COLORS.background4,
                            borderWidth: 1,
                        }}
                        items={hours}
                        initialSelectedIndex={0}
                        onChange={({ item }) => setHour(item.value)}
                    />
                    <WheelPickerExpo
                        height={200}
                        width={100}
                        itemHeight={200}
                        selectedStyle={{
                            borderColor: COLORS.background4,
                            borderWidth: 1,
                        }}
                        items={minutes}
                        initialSelectedIndex={0}
                        onChange={({ item }) => setMinute(item.value)}
                    />
                </View>

                <View style={[LAYOUT.mt(20), LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.gap(8)]}>
                    <TouchableOpacity style={[LAYOUT.w(150), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background3), LAYOUT.py(8)]} onPress={() => (setAlert(false), setHour(0), setMinute(0))}>
                        <Text style={[TEXT.text, TEXT.center]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[LAYOUT.w(150), LAYOUT.rounded(12), LAYOUT.bg(COLORS.button), LAYOUT.py(8)]} onPress={() => setAlert(false)}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ));

        setAlert(true);
    };

    const parseRange = (s) => {
        if (s == null) return [0, 0];
        const str = s.toString().trim();
        if (str === "") return [0, 0];

        const cleaned = str.replace(/\s+/g, "");
        if (cleaned.includes("-")) {
            const [a, b] = cleaned.split("-").map(x => Number(x));
            return [Math.min(a, b), Math.max(a, b)];
        }
        if (cleaned.includes(",")) {
            const parts = cleaned.split(",");
            const a = Number(parts[0]);
            const b = Number(parts[1] ?? parts[0]);
            return [Math.min(a, b), Math.max(a, b)];
        }
        const n = Number(cleaned);
        return [n, n];
    };

    const pad2 = (n) => String(n).padStart(2, "0");

    const normalize = (s) =>
        s
            .toString()
            .toUpperCase()
            .replace(/\s+/g, "")
            .replace(/\./g, "");

    const expandRooms = (roomsList) => {
        const codes = [];
        if (!Array.isArray(roomsList)) return codes;

        roomsList.forEach((r) => {
            const building = (r.building ?? "").toString().trim().toUpperCase();
            if (!building) return;

            const [minF, maxF] = parseRange(r.floor);
            const [minR, maxR] = parseRange(r.room);

            for (let f = minF; f <= maxF; f++) {
                for (let rm = minR; rm <= maxR; rm++) {
                    const code = `${building}${f}.${pad2(rm)}`;
                    codes.push(code);
                }
            }
        });

        return Array.from(new Set(codes)).sort();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                let userStr = null;
                let addressData = null;

                await Promise.all([
                    (userStr = await SecureStore.getItemAsync("userInfo")),
                    (addressData = await axios.get(`${API_URL}/address`)),
                ]);

                if (userStr) {
                    setUserId(parseInt(JSON.parse(userStr).userId));
                }

                if (addressData?.data) {
                    setRawRooms(addressData.data || []);
                }
            } catch (error) {
                console.error("Lấy thông tin người dùng thất bại: ", error);
                setRawRooms([]);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const codes = expandRooms(rawRooms);
        setAllCodes(codes);
    }, [rawRooms]);

    useEffect(() => {
        const key = (query ?? "").toString().trim();
        if (!key) {
            setSuggestions([]);
            return;
        }

        const keyNorm = normalize(key);

        const maxResults = 200;
        const result = [];

        for (let i = 0; i < allCodes.length; i++) {
            const code = allCodes[i];
            if (normalize(code).startsWith(keyNorm)) {
                result.push(code);
                if (result.length >= maxResults) break;
            }
        }

        setSuggestions(result);
    }, [query, allCodes]);

    useEffect(() => {
        if (!userId) return;

        const loadOrder = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_URL}/ordercheckout/${userId}`);
                if (Array.isArray(data)) {
                    setDataOrder(data);
                    if (data.length === 0) {
                        router.replace("../(tabs)/");
                    }
                } else {
                    setDataOrder([]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Thanh toán thất bại: ", error);
                setDataOrder([]);
            }
        };

        loadOrder();
    }, [change, userId]);

    const totalAmount = () => {
        return dataOrder.reduce((sumOrder, order) => {
            const sumItems = order.items.reduce((sumItem, item) => {
                return sumItem + parseFloat(item.price) * item.quantity;
            }, 0);
            return sumOrder + sumItems;
        }, 0);
    };

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
            console.error("Cập nhật đơn hàng thất bại: ", error);
        }
    };

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
                            LAYOUT.bg(COLORS.button),
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
                timer: (hour !== 0 || minute !== 0) ? (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute) : "Giao ngay",
                note
            });

            if (data.success) {
                setTimeout(() => { setChange(!change) }, 750);
            }

            setStatus(data.success ? "success" : "error");
            setTitle(data.success ? "Đặt hàng thành công" : "Đặt hàng thất bại");
            setContent(null);

            setAlert(true);
            setTimeout(() => router.replace("../(tabs)/"), 1200);
        } catch (error) {
            console.log("Thanh toán thất bại: ", error);
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
                {loading ? <LoadingSpinner /> :
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
                                selection={{
                                    start: address.length,
                                    end: address.length
                                }}
                                onChangeText={(text) => {
                                    setAddress(text);
                                    setQuery(text);
                                }}
                                style={[TEXT.paragraph]}
                            />

                            {suggestions.length > 0 && (
                                <View
                                    style={[
                                        LAYOUT.absolute,
                                        LAYOUT.top("130%"),
                                        LAYOUT.left(0),
                                        LAYOUT.row,
                                        LAYOUT.flexWrap,
                                        LAYOUT.w("112%"),
                                        LAYOUT.gap(8),
                                        LAYOUT.zIndex(1)
                                    ]}
                                >
                                    {suggestions.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            onPress={() => {
                                                setAddress(item);
                                                setQuery(item);
                                                setSuggestions([]);
                                            }}
                                            style={[
                                                LAYOUT.bg(COLORS.background4),
                                                LAYOUT.w(60),
                                                LAYOUT.py(6),
                                                LAYOUT.rounded(10)
                                            ]}
                                        >
                                            <Text style={[TEXT.text, TEXT.center]}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* THÔNG TIN ĐƠN */}
                        <View style={[LAYOUT.mt(24)]}>
                            <View
                                style={[
                                    LAYOUT.row,
                                    LAYOUT.justifyBetween,
                                    LAYOUT.itemsCenter,
                                    LAYOUT.pb(6),
                                    LAYOUT.mb(12),
                                    LAYOUT.borderb(1, COLORS.background3),
                                ]}
                            >
                                <Text style={[TEXT.text]}>Thông tin đơn hàng</Text>
                                <TouchableOpacity style={[LAYOUT.row, LAYOUT.itemsCenter]} onPress={() => timerOrder()}>
                                    <Text style={[TEXT.subText, TEXT.size(14), LAYOUT.mr(4), { color: COLORS.paragraph }]}>
                                        {(hour !== 0 || minute !== 0) ? (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute) : "Hẹn giao"}
                                    </Text>
                                    <Ionicons name="time-outline" size={14} color={COLORS.paragraph} />
                                </TouchableOpacity>
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
                    </ScrollView>}
            </View>

            <ToastModal visible={alert} status={status} title={title} content={content} />
        </View>
    );
}
