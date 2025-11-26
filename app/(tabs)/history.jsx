import { View, Text, TouchableOpacity, Image, Dimensions, FlatList } from "react-native";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { formatPrice } from "../../constants/formatPrice";
import { API_URL } from "../../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const HistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    // ===== LOAD API =====
    const loadHistory = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            setIsLogin(true);

            const userId = parseInt(JSON.parse(userStr).userId);
            const { data } = await axios.get(`${API_URL}/history/${userId}`);

            setHistory(data);
            setLoading(false);
        } catch (error) {
            console.log("Lỗi API orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                    <Text style={[TEXT.heading]}>Lịch sử đơn</Text>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.75)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80)]}>
                    {!isLogin ? (<Text style={[TEXT.text, TEXT.center]}>Đăng nhập để đặt hàng ngay</Text>) :
                        (history.length === 0 ? (<Text style={[TEXT.text, TEXT.center]}>Danh sách trống</Text>) :
                            (<FlatList
                                data={history}
                                keyExtractor={(item) => item.orderId.toString()}
                                numColumns={1}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => {
                                    // nối tên các món
                                    const dishNames = item.items.map(d => d.dishName).join(" - ");

                                    return (
                                        <TouchableOpacity
                                            style={[
                                                LAYOUT.wFull,
                                                LAYOUT.mb(20),
                                                LAYOUT.row,
                                                LAYOUT.justifyBetween,
                                                LAYOUT.pb(12),
                                                LAYOUT.borderb(1, COLORS.background4)
                                            ]}
                                        >
                                            <Image
                                                source={item.items[0].dishImage ? { uri: item.items[0].dishImage } : require("../../assets/images/background-default.png")}
                                                style={[
                                                    LAYOUT.w(80),
                                                    LAYOUT.h(110),
                                                    LAYOUT.rounded(20),
                                                    LAYOUT.border(1, COLORS.border),
                                                    { overflow: "hidden" }
                                                ]}
                                            />

                                            <View style={[LAYOUT.ml(12)]}>
                                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                                    <Text style={[TEXT.text, LAYOUT.w("60%")]} numberOfLines={1}>
                                                        {dishNames}
                                                    </Text>
                                                    <Text style={[TEXT.text, { color: COLORS.heading }]}>
                                                        {item.items.length} món
                                                    </Text>
                                                </View>

                                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                    <Text style={[TEXT.text, TEXT.size(16), item.orderStatus === "Success" ? { color: "green" } : { color: "red" }]}>
                                                        {item.orderStatus}
                                                    </Text>
                                                    <Text style={[TEXT.text, TEXT.size(16)]}>
                                                        {item.deliveryAddress}
                                                    </Text>
                                                </View>

                                                <View style={[LAYOUT.mt(12), { alignItems: "flex-end" }]}>
                                                    <TouchableOpacity
                                                        style={[
                                                            LAYOUT.px(10),
                                                            LAYOUT.py(4),
                                                            LAYOUT.w(100),
                                                            LAYOUT.rounded(22),
                                                            { backgroundColor: COLORS.button }
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                TEXT.text,
                                                                TEXT.size(16),
                                                                TEXT.center,
                                                                { color: COLORS.textLight }
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
