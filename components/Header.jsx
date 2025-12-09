import { useEffect, useState } from "react";
import { View, TextInput, Text, Dimensions, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Portal } from "react-native-paper";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { API_URL } from "../constants/api";
import SubMenu from "./SubMenu";
import PopupSearch from "./PopupSearch";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

export default function Header() {
    const [greeting, setGreeting] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [query, setQuery] = useState("");
    const [isShowSearch, setIsShowSearch] = useState(false);
    const [resultsSearch, setResultsSearch] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [orders, setOrders] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [type, setType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [countNotify, setCountNotify] = useState(0);

    const loadOrderProccessing = async (uid) => {
        if (!uid) return;

        try {
            const { data } = await axios.get(`${API_URL}/orderbeingprocessed/${uid}`);

            if (!data || data.length === 0) {
                setOrders([]);
                return;
            }

            const grouped = {};

            data.forEach((item) => {
                const orderId = item?.orderId;

                if (!grouped[orderId]) {
                    grouped[orderId] = {
                        orderId,
                        orderStatus: item.orderStatus ?? "",
                        dishes: []
                    };
                }

                grouped[orderId].dishes = item.items?.map(d => d?.dishName || "Món không tên") || [];
            });

            setOrders(Object.values(grouped));
            setCurrentIndex(0);

        } catch (error) {
            console.error("ORDER LOAD ERROR: ", error);
        }
    };

    const renderOrder = () => {
        if (orders.length === 0) return null;

        const order = orders[currentIndex];

        const dishNames = (order.dishes ?? []).join(" - ");

        return (
            <TouchableOpacity
                style={[
                    LAYOUT.px(10),
                    LAYOUT.py(6),
                    LAYOUT.rounded(12),
                    LAYOUT.itemsCenter,
                    {
                        maxWidth: 200,
                        backgroundColor: COLORS.background3,
                    },
                ]}
                onPress={() => router.push(`../detailorder/${order.orderId}`)}
            >
                <Text style={[TEXT.subText]} numberOfLines={1}>
                    {dishNames}
                    <Text style={[TEXT.subText, { color: COLORS.button }]}>
                        {" "}
                        ({order.orderStatus})
                    </Text>
                </Text>
            </TouchableOpacity>
        );
    };

    const loadNotify = async () => {
        const lastString = await SecureStore.getItemAsync("lastData");
        const count = await JSON.parse(lastString);
        setCountNotify(count.length);
    }

    useEffect(() => {
        if (orders.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % orders.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [orders.length]);

    useEffect(() => {
        const initData = async () => {
            updateGreeting();

            const userStr = await SecureStore.getItemAsync("userInfo");

            if (userStr) {
                const uid = JSON.parse(userStr).userId;
                setUserId(uid);
                setIsLogin(true);

                loadOrderProccessing(uid);
            }

            const greetingInterval = setInterval(updateGreeting, 60 * 1000);
            return () => clearInterval(greetingInterval);
        };

        initData();
    }, []);

    useEffect(() => {
        if (userId) {
            loadOrderProccessing(userId);
        }
    }, [userId]);

    const updateGreeting = () => {
        const hour = new Date().getHours();

        const greetings = [
            { range: [6, 10], title: "Chào buổi sáng" },
            { range: [11, 13], title: "Chào buổi trưa" },
            { range: [14, 18], title: "Chào buổi chiều" },
            { range: [19, 22], title: "Chào buổi tối" },
        ];

        const current = greetings.find((g) => hour >= g.range[0] && hour <= g.range[1]);

        if (!current) {
            setGreeting(["Chúc ngủ ngon"]);
            return;
        }

        setGreeting([current.title, current.subtitle]);
        loadNotify();
    };

    const handleSubmit = () => {
        if (query !== "") {
            setIsShowSearch(true);
            setResultsSearch(query);
        }
    };

    return (
        <>
            <View style={[LAYOUT.header, LAYOUT.pt(48)]}>
                {/* SEARCH BAR */}
                <View
                    style={[
                        LAYOUT.w(width - 60),
                        LAYOUT.mx,
                        LAYOUT.row,
                        LAYOUT.justifyBetween,
                        LAYOUT.itemsCenter,
                        homeStyles.headerContent,
                    ]}
                >
                    <TextInput
                        placeholder="Bạn tìm món gì?"
                        style={[
                            LAYOUT.w(200),
                            LAYOUT.rounded(30),
                            LAYOUT.px(14),
                            LAYOUT.py(10),
                            TEXT.size(14),
                            homeStyles.searchInput,
                        ]}
                        returnKeyType="search"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSubmit}
                    />

                    <Ionicons
                        name="options-outline"
                        style={[
                            LAYOUT.absolute,
                            LAYOUT.top(6),
                            LAYOUT.left(164),
                            LAYOUT.h(28),
                            LAYOUT.w(28),
                            LAYOUT.p(4),
                            LAYOUT.rounded(50),
                            TEXT.size(18),
                            homeStyles.searchIcon,
                        ]}
                    />

                    {/* RIGHT ICONS */}
                    <View style={[LAYOUT.row, LAYOUT.gap(6)]}>
                        <Ionicons
                            name="cart-outline"
                            style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]}
                            onPress={() => (setType("cart"), setMenuVisible(true))}
                        />
                        <View style={[LAYOUT.relative]}>
                            <Ionicons
                                name="notifications-outline"
                                style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]}
                                onPress={() => (setType("notify"), setMenuVisible(true))}
                            />
                            <Text style={[TEXT.text, LAYOUT.color(COLORS.heading), LAYOUT.rounded(20), LAYOUT.absolute, LAYOUT.top(-6), LAYOUT.right(5)]}>{countNotify !== 0 ? countNotify : ""}</Text>
                        </View>
                        <Ionicons
                            name="person-outline"
                            style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]}
                            onPress={() =>
                                isLogin
                                    ? (setType("person"), setMenuVisible(true))
                                    : router.replace("/(auth)/sign-in")
                            }
                        />
                    </View>
                </View>

                {/* GREETING & ORDER */}
                <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.pt(8)]}>
                    <Text style={TEXT.heading}>{greeting[0]}</Text>

                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
                        <Text style={[TEXT.paragraph, homeStyles.title]}>Ba ba ba banana...</Text>

                        {orders.length !== 0 && renderOrder()}
                    </View>
                </View>

                <Portal>
                    <SubMenu visible={menuVisible} setVisible={setMenuVisible} type={type} />
                </Portal>
            </View>

            {isShowSearch && (
                <PopupSearch
                    visible={isShowSearch}
                    query={resultsSearch}
                    onClose={() => {
                        setIsShowSearch(false);
                        setQuery("");
                    }}
                />
            )}
        </>
    );
}
