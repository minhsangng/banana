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

const { width, height } = Dimensions.get("window");

export default function Header() {
    const [greeting, setGreeting] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuData, setMenuData] = useState({ header: null, content: null });
    const [query, setQuery] = useState("");
    const [isShowSearch, setIsShowSearch] = useState(false);
    const [resultsSearch, setResultsSearch] = useState("");
    const [dataCart, setDataCart] = useState([]);

    useEffect(() => {
        updateGreeting();
        const greetingInterval = setInterval(updateGreeting, 60 * 1000);

        loadCart();

        return () => {
            clearInterval(greetingInterval);
        };
    }, []);

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

    const loadCart = async () => {
        const { data } = await axios.get(`${API_URL}/cart/get/1`);
        setDataCart(data);
    }

    const openMenu = (type) => {
        let header, content;

        // Header menu
        header = (
            <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.itemsCenter, LAYOUT.pt(22)]}>
                <Ionicons
                    name={type === "cart" ? "cart-outline" : "notifications-outline"}
                    style={[
                        LAYOUT.rounded(44),
                        LAYOUT.p(4),
                        LAYOUT.mr(20),
                        TEXT.size(30),
                        { backgroundColor: COLORS.textLight, color: COLORS.heading }
                    ]}
                />
                <Text style={[TEXT.heading]}>{type === "cart" ? "Giỏ Hàng" : "Thông Báo"}</Text>
            </View>
        );

        // Content menu
        if (type === "cart") {
            if (dataCart.length === 0) {
                content = (
                    <View style={[LAYOUT.pt(12)]}>
                        <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                            Chưa có món nào được chọn
                        </Text>
                        <View style={[LAYOUT.wFull, LAYOUT.h(height - 200), LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                            <TouchableOpacity style={[LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                                <Ionicons
                                    name="add-circle-outline"
                                    style={[TEXT.size(92), LAYOUT.pb(12), { color: COLORS.textLight }]}
                                />
                                <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>Lựa món</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            } else {
                content = dataCart.map((order, idx) => (
                    <View style={[LAYOUT.pt(12)]} key={`${order.orderId}-${idx}`}>
                        <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                            Order #NO001{order.orderId}
                        </Text>
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, i) => (
                                <View key={`${item.id || i}`} style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.px(10), LAYOUT.py(6)]}>
                                    <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>{item.name}</Text>
                                    <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>x{item.quantity}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                                Chưa có món nào trong order này
                            </Text>
                        )}
                    </View>
                ));
            }
        } else {
            // Thông báo
            content = (
                <View style={[LAYOUT.pt(12)]}>
                    <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>
                        Chưa có thông báo
                    </Text>
                </View>
            );
        }

        setMenuData({ header, content });
        setMenuVisible(true);
    };

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
                        <Ionicons name="person-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => router.replace("../(auth)/sign-in")}></Ionicons>
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