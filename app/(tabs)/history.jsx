import { View, Text, TouchableOpacity, Dimensions, FlatList, RefreshControl, ScrollView } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { formatPrice } from "../../constants/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { API_URL } from "../../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const HistoryScreen = () => {
    const router = useRouter();
    const [history, setHistory] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // ===== LOAD API =====
    const loadHistory = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            setIsLogin(true);

            const userId = parseInt(JSON.parse(userStr).userId);
            const { data } = await axios.get(`${API_URL}/passorder/${userId}`);

            setHistory(data);
        } catch (error) {
            console.log("Lỗi API orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadHistory().finally(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        loadHistory();
    }, []);

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                    <Text style={[TEXT.heading]}>Lịch sử đơn</Text>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.75)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx()]}>
                    {loading ? (<LoadingSpinner />) : !isLogin ? (<ScrollView refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }><Text style={[TEXT.text, TEXT.center]}>Đăng nhập để đặt hàng ngay</Text></ScrollView>) :
                        (history.length === 0 ? (<ScrollView refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }><Text style={[TEXT.text, TEXT.center]}>Danh sách trống</Text></ScrollView>) :
                            (<FlatList
                                data={history}
                                keyExtractor={(item) => item.orderId.toString()}
                                numColumns={1}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                                renderItem={({ item }) => {
                                    const dateString = item.orderDate.slice(8, 10) + "/" + item.orderDate.slice(5, 7) + " - " + item.orderDate.slice(11, 16);

                                    return (
                                        <TouchableOpacity onPress={() => router.push(`../detailorder/${item.orderId}`)}
                                            style={[
                                                LAYOUT.wFull,
                                                LAYOUT.mb(20),
                                                LAYOUT.justifyBetween,
                                                LAYOUT.pb(12),
                                                LAYOUT.borderb(1, COLORS.background4),
                                                { borderStyle: "dashed" }
                                            ]}
                                        >
                                            <View style={[LAYOUT.wFull]}>
                                                <View style={[LAYOUT.mt(12)]}>
                                                    <Text style={[TEXT.text, TEXT.size(20)]} numberOfLines={1}>
                                                        #{item.orderCode}
                                                    </Text>
                                                </View>

                                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(6)]}>
                                                        <Ionicons size={20} color={COLORS.heading} name="storefront-outline"></Ionicons>
                                                        <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]} numberOfLines={1}>{item.storeName}</Text>
                                                    </View>
                                                    <Text style={[TEXT.text, TEXT.size(18)]}>
                                                        {formatPrice(item.totalAmount)} đ
                                                    </Text>
                                                </View>

                                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(6)]}>
                                                        <Ionicons size={18} color={COLORS.paragraph} name="location-outline"></Ionicons>
                                                        <Text style={[TEXT.text, TEXT.size(16), LAYOUT.color(COLORS.paragraph)]}>{item.deliveryAddress}</Text>
                                                    </View>
                                                    <Text style={[TEXT.text, TEXT.size(16), LAYOUT.color(item.orderStatus === "Hoàn thành" ? "green" : item.orderStatus === "Bị hủy" ? "red" : COLORS.background4)]}>
                                                        {item.orderStatus}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View>
                                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(6)]}>
                                                        <Ionicons size={18} color={COLORS.paragraph} name="time-outline"></Ionicons>
                                                        <Text style={[TEXT.text, TEXT.size(18), LAYOUT.color(COLORS.paragraph)]}>
                                                            {dateString}
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={[
                                                            LAYOUT.px(10),
                                                            LAYOUT.py(4),
                                                            LAYOUT.w(100),
                                                            LAYOUT.rounded(22),
                                                            LAYOUT.bg(COLORS.background3)
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                TEXT.text,
                                                                TEXT.size(16),
                                                                TEXT.center,
                                                                LAYOUT.color(COLORS.button)
                                                            ]}
                                                        >
                                                            Đặt lại
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                            )
                        )}
                </View>
            </View>
        </View>
    );
};

export default HistoryScreen;
