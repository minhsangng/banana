import { View, Animated, Dimensions, Text, TouchableOpacity, FlatList, Image, TouchableWithoutFeedback, InteractionManager } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/api";
import { formatPrice } from "../constants/formatPrice";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import ToastModal from "./ToastModal";

const { width, height } = Dimensions.get("window");
const SUBMENU_WIDTH = 330;

export default function SubMenu({ visible, setVisible, type }) {
    const slideAnim = useRef(new Animated.Value(SUBMENU_WIDTH)).current;

    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(visible);
    const [isLogin, setIsLogin] = useState(false);
    const [header, setHeader] = useState("");
    const [dataCart, setDataCart] = useState([]);
    const [user, setUser] = useState([]);
    const [totalCart, setTotalCart] = useState(0);
    const [alert, setAlert] = useState(false);

    const loadCart = async () => {
        try {
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (userStr) {
                const user = JSON.parse(userStr);
                const userId = parseInt(user?.userId);
                const { data } = await axios.get(`${API_URL}/cart/get/${userId}`);
                setDataCart(data || []);
            }
        } catch (e) {
            console.log("Load cart failed", e);
        }
    };

    const updateQuantity = async (orderItemId, newQuantity) => {
        try {
            await axios.post(`${API_URL}/cart/update`, { orderItemId, quantity: newQuantity });
            setDataCart(prev =>
                prev.map(item =>
                    item.order_items.orderItemId === orderItemId
                        ? { ...item, order_items: { ...item.order_items, quantity: newQuantity } }
                        : item
                )
            );

            await loadCart();
        } catch (e) {
            console.log("Update quantity failed", e);
        }
    };

    const calculateTotal = async () => {
        const total = dataCart.reduce((sum, item) => sum + Number(item.dishes.price) * item.order_items.quantity, 0);
        setTotalCart(total);
        await loadCart();
    };

    const loadData = async () => {
        const userStr = await SecureStore.getItemAsync("userInfo");
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsLogin(true);
            setUser(user);
        }
        await loadCart();
    };

    useEffect(() => {
        loadData();

        if (type === "cart") {
            setHeader(
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.pt(22)]}>
                    <Ionicons name="cart-outline" size={32} color={COLORS.heading} style={[LAYOUT.rounded(22), LAYOUT.p(4), { backgroundColor: COLORS.textLight }]} />
                    <Text style={[TEXT.heading, LAYOUT.ml(20), LAYOUT.pt(6)]}>Giỏ Hàng</Text>
                </View>
            );
        }
        else if (type === "notify") {
            setHeader(
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.pt(22)]}>
                    <Ionicons name="notifications-outline" size={32} color={COLORS.heading} style={[LAYOUT.rounded(22), LAYOUT.p(4), { backgroundColor: COLORS.textLight }]} />
                    <Text style={[TEXT.heading, LAYOUT.ml(20), LAYOUT.pt(6)]}>Thông Báo</Text>
                </View>
            );
        }
        else if (type === "person") {
            setHeader(
                <View style={[LAYOUT.pt(22)]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                        <Ionicons name="person-outline" size={32} color={COLORS.heading} style={[LAYOUT.rounded(22), LAYOUT.p(4), { backgroundColor: COLORS.textLight }]} />
                        <Text style={[TEXT.heading, LAYOUT.ml(20), LAYOUT.pt(6)]}>Tài khoản</Text>
                    </View>
                    <Text style={[TEXT.text, TEXT.size(22), LAYOUT.mt(6), LAYOUT.px(8), LAYOUT.py(2), { backgroundColor: COLORS.background1 }]}>Hi, {user.fullName}</Text>
                </View>
            );
        }

        if (visible) {
            setShouldRender(true);

            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SUBMENU_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setShouldRender(false);
            });
        }
    }, [visible]);

    useEffect(() => {
        calculateTotal();
    }, [dataCart]);

    const contentLogout = () => {
        return (
            <View style={[LAYOUT.row, LAYOUT.wFull, LAYOUT.justifyBetween, LAYOUT.mt(16)]}>
                <TouchableOpacity onPress={() => setAlert(false)} style={[LAYOUT.w("45%"), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.background2 }]}>
                    <Text style={[TEXT.text, TEXT.center, { color: COLORS.heading }]}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={[LAYOUT.w("45%"), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.button }]}>
                    <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync("userInfo");
            setIsLogin(false);
            setVisible(false);
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            InteractionManager.runAfterInteractions(() => {
                router.replace("../(auth)/sign-in");
            });
        }
    };

    if (!shouldRender) return null;

    return (
        <View style={{ position: "absolute", top: 0, left: 0, width, height, zIndex: 1000 }}>
            <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                <View style={{ position: "absolute", width, height, backgroundColor: "rgba(0,0,0,0.3)" }} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    LAYOUT.w(SUBMENU_WIDTH),
                    LAYOUT.h(height),
                    LAYOUT.absolute,
                    LAYOUT.top(0),
                    LAYOUT.right(0),
                    LAYOUT.roundedtl(44),
                    LAYOUT.roundedbl(44),
                    {
                        backgroundColor: COLORS.heading,
                        shadowColor: "#000",
                        shadowOpacity: 0.25,
                        shadowOffset: { width: 0, height: 4 },
                        shadowRadius: 4,
                        elevation: 4,
                        transform: [{ translateX: slideAnim }]
                    }
                ]}
            >
                <View style={[LAYOUT.h(150), LAYOUT.w(SUBMENU_WIDTH - 60), LAYOUT.mx(), LAYOUT.borderb(1, COLORS.background3), LAYOUT.justifyCenter]}>
                    {header}
                </View>
                <View style={[LAYOUT.w(SUBMENU_WIDTH - 60), LAYOUT.mx()]}>
                    {type !== "cart" ?
                        type !== "notify" ? (<View style={[LAYOUT.pb(12), LAYOUT.relative, LAYOUT.hFull]}>
                            <TouchableOpacity style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.borderb(1, COLORS.background2), LAYOUT.pt(20), LAYOUT.pb(22)]}>
                                <Ionicons name="person-outline" size={24} color={COLORS.textLight} />
                                <Text style={[TEXT.text, LAYOUT.ml(14), { color: COLORS.textLight }]}>Thông tin tài khoản</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.borderb(1, COLORS.background2), LAYOUT.pt(20), LAYOUT.pb(22)]}>
                                <Ionicons name="key-outline" size={24} color={COLORS.textLight} />
                                <Text style={[TEXT.text, LAYOUT.ml(14), { color: COLORS.textLight }]}>Đặt lại mật khẩu</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.borderb(1, COLORS.background2), LAYOUT.pt(20), LAYOUT.pb(22)]}>
                                <Ionicons name="cog-outline" size={24} color={COLORS.textLight} />
                                <Text style={[TEXT.text, LAYOUT.ml(14), { color: COLORS.textLight }]}>Cài đặt</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    LAYOUT.row,
                                    LAYOUT.itemsCenter,
                                    LAYOUT.absolute,
                                    LAYOUT.bottom(250)
                                ]}
                                onPress={() => setAlert(true)}
                            >
                                <Ionicons name="log-out-outline" size={24} color={COLORS.textLight} />
                                <Text style={[TEXT.text, LAYOUT.ml(14), { color: COLORS.textLight }]}>
                                    Đăng xuất
                                </Text>
                            </TouchableOpacity>

                            <ToastModal width={"auto"} height={"auto"} status={"warning"} title={"Chắc chắn đăng xuất"} content={contentLogout} visible={alert} />

                        </View>) : (<View style={[LAYOUT.pt(12)]}>
                            <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>Thông báo trống!</Text>
                        </View>) : (!isLogin ? (<View style={[LAYOUT.pt(12)]}>
                            <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                                Đăng nhập để thêm giỏ hàng
                            </Text>
                        </View>) : dataCart.length === 0 ? (<View style={[LAYOUT.pt(12)]}>
                            <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                                Giỏ hàng trống!
                            </Text>
                        </View>) : (<View style={[LAYOUT.pt(12)]}>
                            <Text style={[TEXT.paragraph, LAYOUT.mt(10), { color: COLORS.textLight }]}>
                                {dataCart.length} món
                            </Text>

                            <FlatList
                                style={[LAYOUT.h("65%")]}
                                data={dataCart}
                                extraData={dataCart}
                                keyExtractor={(item) => item.order_items.orderItemId.toString()}
                                renderItem={({ item }) => (
                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.borderb(1, COLORS.background2), LAYOUT.pb(20), LAYOUT.pt(12), { borderStyle: "dashed" }]}>
                                        <Image
                                            source={item.dishes.imageUrl ? { uri: item.dishes.imageUrl } : require("../assets/images/background-default.png")}
                                            style={[LAYOUT.w(80), LAYOUT.h(80), LAYOUT.rounded(20)]}
                                        />

                                        <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.w("68%")]}>
                                            <View style={[LAYOUT.w("60%")]}>
                                                <Text style={[TEXT.text, { color: COLORS.textLight }]} numberOfLines={1}>
                                                    {item.dishes.dishName}
                                                </Text>
                                                <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>
                                                    {formatPrice(item.dishes.price)}
                                                </Text>
                                            </View>

                                            <View style={[LAYOUT.justifyBetween, { alignItems: "flex-end" }]}>
                                                <Text style={[TEXT.subText, TEXT.size(14), { color: COLORS.textLight }]}>
                                                    {formatPrice(item.dishes.price * item.order_items.quantity)}
                                                </Text>

                                                <View style={[LAYOUT.row, LAYOUT.itemsCenter, { gap: 6 }]}>
                                                    <TouchableOpacity
                                                        style={[LAYOUT.rounded(20), { backgroundColor: COLORS.textLight }]}
                                                        onPress={() => item.order_items.quantity > 1 && updateQuantity(item.order_items.orderItemId, item.order_items.quantity - 1)}
                                                    >
                                                        <Ionicons size={20} color={COLORS.button} name="remove-outline" />
                                                    </TouchableOpacity>

                                                    <Text style={[TEXT.text, { color: COLORS.textLight }]}>
                                                        {item.order_items.quantity}
                                                    </Text>

                                                    <TouchableOpacity
                                                        style={[LAYOUT.rounded(20), { backgroundColor: COLORS.textLight }]}
                                                        onPress={() => updateQuantity(item.order_items.orderItemId, item.order_items.quantity + 1)}
                                                    >
                                                        <Ionicons size={20} color={COLORS.button} name="add-outline" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            />

                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.bordert(1, COLORS.background4), LAYOUT.pt(12), LAYOUT.mb(40)]}>
                                <Text style={[TEXT.text, { color: COLORS.textLight }]}>Tổng đơn</Text>
                                <Text style={[TEXT.text, { color: COLORS.textLight }]}>{formatPrice(totalCart)} đ</Text>
                            </View>

                            <TouchableOpacity onPress={() => router.push("../checkout/")} style={[LAYOUT.rounded(30), LAYOUT.py(12), { backgroundColor: COLORS.background1 }]}>
                                <Text style={[TEXT.text, TEXT.size(24), TEXT.center, { color: COLORS.heading }]}>Thanh toán</Text>
                            </TouchableOpacity>
                        </View>))
                    }
                </View>
            </Animated.View>
        </View>
    );
}
