import { View, Text, TouchableOpacity, FlatList, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice, formatImage } from "../../constants/format";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../constants/api";
import axios from "axios";
import ToastModal from "../../components/ToastModal";

const { width, height } = Dimensions.get("window");

const BestSellerScreen = () => {
    const [dishes, setDishes] = useState([]);
    const router = useRouter();
    const [alert, setAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    const addFavorite = async (dishId) => {
        try {
            const userStr = await SecureStore.getItemAsync("userInfo");

            if (!userStr) {
                setAlert(true);
                return;
            };

            const userId = JSON.parse(userStr).userId;

            const currentDish = dishes.find(d => d.dishId === dishId);
            if (!currentDish) return;

            const newStatus = !currentDish.isFavorite;

            await axios.get(
                `${API_URL}/favorite/${newStatus ? "add" : "remove"}/${userId}/${dishId}`
            );

            setDishes(prev =>
                prev.map(d =>
                    d.dishId === dishId
                        ? { ...d, isFavorite: newStatus }
                        : d
                )
            );
        } catch (error) {
            console.error("Lỗi favorite:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) {
                const { data } = await axios.get(`${API_URL}/bestseller/20`);
                setDishes(data);
            } else {
                const userId = JSON.parse(userStr).userId;
                const { data } = await axios.get(`${API_URL}/bestsellerlogin/${userId}/20`);
                setDishes(data);
            }
            setLoading(false);
        };

        loadData();
    }, []);

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.heading} onPress={() => router.push("../(tabs)/")}></Ionicons>
                        <Text style={[TEXT.heading, LAYOUT.ml(70)]}>Best seller</Text>
                    </View>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82)]}>
                <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(44)]}>
                    {loading ? <LoadingSpinner /> : (
                        <FlatList
                            style={[LAYOUT.pb(80)]}
                            data={dishes}
                            keyExtractor={(item) => item.dishId}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            columnWrapperStyle={LAYOUT.justifyBetween}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => router.push(`../detaildish/${item.dishId}`)}
                                    style={[LAYOUT.w("48%"), LAYOUT.mb(16), LAYOUT.relative]}>
                                    <Image
                                        source={formatImage(item.imageUrl)}
                                        style={[LAYOUT.wFull, LAYOUT.h(150), LAYOUT.rounded(20), LAYOUT.border(1, COLORS.border), LAYOUT.overflowHidden]}
                                    />
                                    <TouchableOpacity onPress={() => addFavorite(item.dishId)} style={[LAYOUT.absolute, LAYOUT.top(10), LAYOUT.left(10), LAYOUT.rounded(30), LAYOUT.border(1, COLORS.border), LAYOUT.bg(COLORS.light)]}>
                                        <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={20} color={COLORS.button} style={[LAYOUT.px(4), LAYOUT.py(3)]}></Ionicons>
                                    </TouchableOpacity>
                                    <Text style={[TEXT.text, TEXT.size(16), LAYOUT.absolute, LAYOUT.right(0), LAYOUT.bottom(50), LAYOUT.px(6), LAYOUT.roundedtl(22), LAYOUT.roundedbl(22), { color: COLORS.textLight, backgroundColor: COLORS.button }]}>{formatPrice(item.price)} đ</Text>
                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                        <Text style={[TEXT.text, TEXT.size(18), LAYOUT.w("65%")]} numberOfLines={1}>{item.dishName}</Text>
                                        <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.px(4), LAYOUT.py(1), LAYOUT.rounded(22), LAYOUT.bg(COLORS.button), LAYOUT.gap(2)]}>
                                            <Text style={[TEXT.text, TEXT.size(16), LAYOUT.color(COLORS.textLight)]}>5.0</Text>
                                            <Ionicons name="star" size={14} color={COLORS.background1}></Ionicons>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>

            </View>

            <ToastModal status={"warning"} title={"Đăng nhập để thêm yêu thích"} content={(<View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.wFull]}>
                <TouchableOpacity onPress={() => setAlert(false)} style={[LAYOUT.bg(COLORS.background3), LAYOUT.w("48%"), LAYOUT.py(8), LAYOUT.rounded(20), LAYOUT.mt(12)]}><Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.heading)]}>Bỏ qua</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("../(auth)/sign-in")} style={[LAYOUT.bg(COLORS.button), LAYOUT.w("48%"), LAYOUT.py(8), LAYOUT.rounded(20), LAYOUT.mt(12)]}><Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Đăng nhập</Text></TouchableOpacity>
            </View>)} visible={alert} />
        </View>
    );
};

export default BestSellerScreen;
