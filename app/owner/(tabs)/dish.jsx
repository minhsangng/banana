import { View, Text, TouchableOpacity, Image, Dimensions, FlatList, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { API_URL } from "../../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { formatPrice } from "../../../constants/format";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ToastModal from "../../../components/ToastModal";
import NavBar from "../../../components/NavBar";
import PushNotification from "../../../components/PushNotification";

const { width, height } = Dimensions.get("window");

const DishesScreen = () => {
    const router = useRouter();
    const [dishes, setDishes] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    // ===== LOAD API =====
    const loadDishes = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            setIsLogin(true);

            setUserId(parseInt(JSON.parse(userStr).userId));
            const { data } = await axios.get(`${API_URL}/ownerdish/${userId}`);

            setDishes(data);
            setLoading(false);
        } catch (error) {
            console.log("Lỗi API orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDishes();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <PushNotification>
            <View style={[LAYOUT.container]}>
                <NavBar isLogin={isLogin} heading={"Thực đơn"} />
                <View style={[LAYOUT.main, LAYOUT.h(height * 0.77), { overflow: "hidden" }]}>
                    <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(0)]}>
                        {dishes.length === 0 ? <Text style={[TEXT.text, TEXT.center]}>Danh sách trống</Text> :
                            (<FlatList
                                data={dishes}
                                keyExtractor={(item) => item.dishId.toString()}
                                numColumns={1}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => {
                                    return (
                                        <TouchableOpacity onPress={() => router.push(`../../detaildish/${item.dishId}`)}
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
                                                source={item.imageUrl ? { uri: item.imageUrl } : require("../../../assets/images/background-default.png")}
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
                                                    <Text style={[TEXT.text, LAYOUT.w("50%")]} numberOfLines={1}>
                                                        {item.dishName}
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={[
                                                            LAYOUT.px(10),
                                                            LAYOUT.py(4),
                                                            LAYOUT.w(70),
                                                            LAYOUT.rounded(22),
                                                            { backgroundColor: COLORS.background3 }
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                TEXT.text,
                                                                TEXT.size(16),
                                                                TEXT.center,
                                                                { color: COLORS.heading }
                                                            ]}
                                                        >
                                                            Sửa
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                    <Text style={[TEXT.text, { color: COLORS.heading }]}>
                                                        {formatPrice(item.price)} đ
                                                    </Text>
                                                </View>

                                                <View style={[LAYOUT.mt(12), { alignItems: "flex-end" }]}>
                                                    <TouchableOpacity
                                                        style={[
                                                            LAYOUT.px(10),
                                                            LAYOUT.py(4),
                                                            LAYOUT.w(70),
                                                            LAYOUT.rounded(22),
                                                            { backgroundColor: COLORS.background3 }
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                TEXT.text,
                                                                TEXT.size(16),
                                                                TEXT.center,
                                                                { color: COLORS.heading }
                                                            ]}
                                                        >
                                                            Khóa
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                            )
                        }
                    </View>
                </View>
            </View>
        </PushNotification>
    );
};

export default DishesScreen;
