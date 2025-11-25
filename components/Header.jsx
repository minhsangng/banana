import { useEffect, useState } from "react";
import { View, TextInput, Text, Dimensions, TouchableOpacity, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { Portal } from "react-native-paper";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import SubMenu from "./SubMenu";
import PopupSearch from "./PopupSearch";
import { API_URL } from "../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");

export default function Header() {
    const [greeting, setGreeting] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [query, setQuery] = useState("");
    const [isShowSearch, setIsShowSearch] = useState(false);
    const [resultsSearch, setResultsSearch] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [orders, setOrders] = useState([]);
    const [type, setType] = useState(null);

    const loadOrderPeding = async () => {
        try {
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (userStr) {
                const userId = parseInt(JSON.parse(userStr).userId);

                const { data } = await axios.get(`${API_URL}/orderbyuseridstatus/${userId}/Pending`);

                if (data) {
                    let dishNames = "";
                    { data.map((item) => (dishNames += item.dishName + " - ")) };
                    let content =
                        <TouchableOpacity
                            style={[LAYOUT.px(10), LAYOUT.py(6), LAYOUT.rounded(12), LAYOUT.itemsCenter, { maxWidth: 200, backgroundColor: COLORS.background3 }]}
                            onPress={() => router.push(`../detailorder/${data[0].orderId}`)}
                        >
                            <Text style={[TEXT.subText, LAYOUT.row, LAYOUT.itemsCenter]} numberOfLines={1}>{dishNames}<Text style={[TEXT.subText, { color: COLORS.button }]}>{data[0].orderStatus}</Text></Text>
                        </TouchableOpacity>;
                    setOrders(content);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        initData();
        loadOrderPeding();
    }, []);

    const initData = async () => {
        updateGreeting();

        const greetingInterval = setInterval(updateGreeting, 60 * 1000);

        const userStr = await SecureStore.getItemAsync("userInfo");
        if (userStr) {
            setIsLogin(true);
        }

        return () => clearInterval(greetingInterval);
    };

    const updateGreeting = () => {
        const hour = new Date().getHours();

        const greetings = [
            { range: [6, 10], title: "Chào buổi sáng", subtitle: "Ngày mới tràn đầy năng lượng!" },
            { range: [11, 13], title: "Chào buổi trưa", subtitle: "Buổi trưa thật thoải mái!" },
            { range: [14, 18], title: "Chào buổi chiều", subtitle: "Tiếp tục một ngày hiệu quả!" },
            { range: [19, 22], title: "Chào buổi tối", subtitle: "Buổi tối thư giãn!" },
        ];

        const current = greetings.find(g => hour >= g.range[0] && hour <= g.range[1]);

        if (!current) {
            setGreeting(["Chúc bạn ngủ ngon", "Hẹn gặp lại!"]);
            return;
        }

        setGreeting([current.title, current.subtitle]);
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
                    <TextInput
                        placeholder="Bạn tìm món gì?"
                        style={[LAYOUT.w(200), LAYOUT.rounded(30), LAYOUT.px(14), LAYOUT.py(10), TEXT.size(14), homeStyles.searchInput]}
                        returnKeyType="search"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSubmit}
                    />
                    <Ionicons name="options-outline" style={[LAYOUT.absolute, LAYOUT.top(6), LAYOUT.left(164), LAYOUT.h(28), LAYOUT.w(28), LAYOUT.p(4), LAYOUT.rounded(50), LAYOUT.jsutifyCenter, LAYOUT.itemsCenter, TEXT.size(18), homeStyles.searchIcon]} />
                    <View style={[LAYOUT.row, LAYOUT.justifyAround, { gap: 6 }]}>
                        <Ionicons name="cart-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => (setType("cart"), setMenuVisible(true))} />
                        <Ionicons name="notifications-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => (setType("notify"), setMenuVisible(true))} />
                        <Ionicons name="person-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => isLogin ? (setType("person"), setMenuVisible(true)) : router.replace("/(auth)/sign-in")} />
                    </View>
                </View>

                <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.pt(12)]}>
                    <Text style={TEXT.heading}>{greeting[0]}</Text>
                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
                        <Text style={[TEXT.paragraph, homeStyles.title]}>{greeting[1]}</Text>
                        {orders}
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
                    onClose={() => { setIsShowSearch(false); setQuery(""); }}
                />
            )}
        </>
    );
}
