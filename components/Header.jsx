import { useEffect, useState } from "react";
import { View, TextInput, Text, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { Portal } from "react-native-paper";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/api";
import axios from "axios";
import SubMenu from "./SubMenu";
import PopupSearch from "./PopupSearch";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

export default function Header() {
    const [greeting, setGreeting] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuData, setMenuData] = useState({ header: null, content: null });
    const [query, setQuery] = useState("");
    const [isShowSearch, setIsShowSearch] = useState(false);
    const [resultsSearch, setResultsSearch] = useState("");
    const [dataCart, setDataCart] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const loginInfo = SecureStore.getItemAsync("userInfo");

    useEffect(() => {
        initData();
    }, []);

    const initData = async () => {
        updateGreeting();

        const greetingInterval = setInterval(updateGreeting, 60 * 1000);

        // Lấy user
        const userStr = await SecureStore.getItemAsync("userInfo");
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsLogin(true);
            setMenuData(prev => ({ ...prev, user }));
        }

        await loadCart();

        return () => clearInterval(greetingInterval);
    };

    const loadCart = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/cart/get/1`);
            setDataCart(data);
        } catch (e) {
            console.log("Load cart failed", e);
        }
    };

    const updateGreeting = () => {
        const hour = new Date().getHours();

        const greetings = [
            {
                range: [6, 10],
                title: "Chào buổi sáng",
                subtitle: "Ngày mới tràn đầy năng lượng!"
            },
            {
                range: [11, 13],
                title: "Chào buổi trưa",
                subtitle: "Buổi trưa thật thoải mái!"
            },
            {
                range: [14, 18],
                title: "Chào buổi chiều",
                subtitle: "Tiếp tục một ngày hiệu quả!"
            },
            {
                range: [19, 22],
                title: "Chào buổi tối",
                subtitle: "Buổi tối thư giãn!"
            },
        ];

        const current = greetings.find(g => hour >= g.range[0] && hour <= g.range[1]);

        if (!current) {
            setGreeting([
                "Chúc bạn ngủ ngon",
                "Hẹn gặp lại!"
            ]);
            return;
        }

        setGreeting([current.title, current.subtitle]);
    };

    const openMenu = (type) => {
        let header = null;
        let content = null;

        // ===== HEADER =====
        if (type === "cart") {
            header = (
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.pt(22)]}>
                    <Ionicons name="cart-outline" size={32} color={COLORS.heading} style={[LAYOUT.rounded(22), LAYOUT.p(4), {backgroundColor: COLORS.textLight}]} />
                    <Text style={[TEXT.heading, LAYOUT.ml(20), LAYOUT.pt(6)]}>Giỏ Hàng</Text>
                </View>
            );
        }
        else if (type === "notify") {
            header = (
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.pt(22)]}>
                    <Ionicons name="notifications-outline" size={32} color={COLORS.heading} style={[LAYOUT.rounded(22), LAYOUT.p(4), {backgroundColor: COLORS.textLight}]} />
                    <Text style={[TEXT.heading, LAYOUT.ml(20), LAYOUT.pt(6)]}>Thông Báo</Text>
                </View>
            );
        }
        else if (type === "person") {
            header = (
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.pt(22)]}>
                    <Ionicons name="person-outline" size={32} color={COLORS.heading} style={[LAYOUT.rounded(22), LAYOUT.p(4), {backgroundColor: COLORS.textLight}]} />
                    <Text style={[TEXT.heading, LAYOUT.ml(20), LAYOUT.pt(6)]}>
                        {menuData.user?.fullName || "Tài khoản"}
                    </Text>
                </View>
            );
        }

        // ===== CONTENT =====
        if (type === "cart") {
            content = renderCart();
        }
        else if (type === "notify") {
            content = (
                <View style={[LAYOUT.pt(12)]}>
                    <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                        Chưa có thông báo
                    </Text>
                </View>
            );
        }
        else if (type === "person") {
            content = renderUserMenu();
        }

        setMenuData({ header, content });
        setMenuVisible(true);
    };

    const renderCart = () => {
        if (!dataCart || dataCart.length === 0) {
            return (
                <View style={[LAYOUT.pt(12)]}>
                    <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                        Chưa có món nào được chọn
                    </Text>
                </View>
            );
        }

        return dataCart.map((order) => (
            <View key={order.orderId} style={[LAYOUT.pt(12)]}>
                <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                    Order #{order.orderId}
                </Text>

                {order.items?.length > 0 ? (
                    order.items.map((item, idx) => (
                        <View key={idx} style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.px(10), LAYOUT.py(6)]}>
                            <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>{item.name}</Text>
                            <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>x{item.quantity}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                        Chưa có món nào trong order
                    </Text>
                )}
            </View>
        ));
    };

    const renderUserMenu = () => (
        <View style={[LAYOUT.pt(12), LAYOUT.px(20)]}>
            <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>
                {menuData.user?.email}
            </Text>

            <TouchableOpacity
                style={[LAYOUT.mt(20)]}
                onPress={async () => {
                    await SecureStore.deleteItemAsync("userInfo");
                    setIsLogin(false);
                    setMenuVisible(false);
                    router.replace("/(auth)/sign-in");
                }}
            >
                <Text style={[TEXT.paragraph]}>
                    Đăng xuất
                </Text>
            </TouchableOpacity>
        </View>
    );

    const handleSubmit = () => {
        if (query !== "") {
            setIsShowSearch(true);
            setResultsSearch(query);
        }
    };

    return (
        <>
            <View style={[LAYOUT.header, LAYOUT.pt(52)]}>
                <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.positive, homeStyles.headerContent]}>
                    <TextInput placeholder="Bạn tìm món gì?" style={[LAYOUT.w(200), LAYOUT.rounded(30), LAYOUT.px(14), LAYOUT.py(10), TEXT.size(14), homeStyles.searchInput]} returnKeyType="search" value={query} onChangeText={setQuery} onSubmitEditing={handleSubmit} />
                    <Ionicons name="options-outline" style={[LAYOUT.absolute, LAYOUT.top(6), LAYOUT.left(164), LAYOUT.h(28), LAYOUT.w(28), LAYOUT.p(4), LAYOUT.rounded(50), LAYOUT.jsutifyCenter, LAYOUT.itemsCenter, TEXT.size(18), homeStyles.searchIcon]}></Ionicons>
                    <View style={[LAYOUT.row, LAYOUT.justifyAround, { gap: 6 }]}>
                        <Ionicons name="cart-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => openMenu("cart")}></Ionicons>
                        <Ionicons name="notifications-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => openMenu("notify")}></Ionicons>
                        <Ionicons name="person-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => isLogin ? openMenu("person") : router.replace("../(auth)/sign-in")}></Ionicons>
                    </View>
                </View>
                <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.pt(12)]}>
                    <Text style={TEXT.heading}>{greeting[0]}</Text>
                    <Text style={[TEXT.paragraph, homeStyles.title]}>{greeting[1]}</Text>
                </View>
                <Portal>
                    <SubMenu visible={menuVisible} setVisible={setMenuVisible} header={menuData.header} content={menuData.content} />
                </Portal>
            </View>

            {
                isShowSearch && (
                    <PopupSearch
                        visible={isShowSearch}
                        query={resultsSearch}
                        onClose={() => (setIsShowSearch(false), setQuery(""))}
                    />
                )
            }
        </>
    );
}