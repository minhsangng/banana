import { View, Text, FlatList, TouchableOpacity, Image, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice, formatImage } from "../../constants/format";
import { API_URL } from "../../constants/api";
import { UserAPI } from "../../services/userInfo";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const FavoriteScreen = () => {
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            setIsLogin(true);

            const userId = parseInt(JSON.parse(userStr).userId);
            const { data } = await axios.get(`${API_URL}/favorites/${userId}`);

            if (data)
                setFavorites(data);

            setLoading(false);
        } catch (error) {
            console.log("Lỗi không thể kết nối API ", error);
        }
    }

    const removeFavorite = async (dishId) => {
        try {
            const userId = await UserAPI.getUserInfo();
            if (userId !== 0) {
                await axios.get(`${API_URL}/favorite/remove/${userId}/${dishId}`);
                setFavorites((prev) => prev.filter(item => item.dishId !== dishId));
            }
        } catch (error) {
            console.error("Lỗi: ", error);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                    <Text style={[TEXT.heading]}>Yêu Thích</Text>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.75)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80)]}>
                    {!isLogin ? (<Text style={[TEXT.text, TEXT.center]}>Đăng nhập để thêm món yêu thích</Text>) :
                        (favorites.length === 0 ? (<Text style={[TEXT.text, TEXT.center]}>Danh sách trống</Text>) : (
                            <FlatList
                                data={favorites}
                                keyExtractor={(item) => item.dishId}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                columnWrapperStyle={{ justifyContent: "space-between" }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => router.push(`../detaildish/${item.dishId}`)}
                                        style={[LAYOUT.w("48%"), LAYOUT.mb(16), LAYOUT.relative]}>
                                        <Image
                                            source={formatImage(item.imageUrl)}
                                            style={[LAYOUT.wFull, LAYOUT.h(150), LAYOUT.rounded(20), LAYOUT.border(1, COLORS.border), { overflow: "hidden" }]}
                                        />
                                        <TouchableOpacity onPress={() => removeFavorite(item.dishId)} style={[LAYOUT.absolute, LAYOUT.top(10), LAYOUT.left(10)]}>
                                            <Ionicons name="heart" size={16} color={COLORS.button} style={[LAYOUT.rounded(30), LAYOUT.border(1, COLORS.border), LAYOUT.px(4), LAYOUT.py(3), { backgroundColor: COLORS.light }]}></Ionicons>
                                        </TouchableOpacity>
                                        <Text style={[TEXT.text, TEXT.size(16), LAYOUT.absolute, LAYOUT.right(0), LAYOUT.bottom(50), LAYOUT.px(6), LAYOUT.roundedtl(22), LAYOUT.roundedbl(22), { color: COLORS.textLight, backgroundColor: COLORS.button }]}>{formatPrice(item.price)} đ</Text>
                                        <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                            <Text style={[TEXT.text, TEXT.size(18), LAYOUT.w("65%")]} numberOfLines={1}>{item.dishName}</Text>
                                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.px(4), LAYOUT.py(1), LAYOUT.rounded(22), { backgroundColor: COLORS.button, gap: 2 }]}>
                                                <Text style={[TEXT.text, TEXT.size(16), { color: COLORS.textLight }]}>{item.rateStar}</Text>
                                                <Ionicons name="star" size={14} color={COLORS.background1}></Ionicons>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )
                        )}
                </View>

            </View>
        </View>
    );
};

export default FavoriteScreen;
