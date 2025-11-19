import { View, Text, ScrollView, TouchableOpacity, FlatList, ImageBackground, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";

const { width, height } = Dimensions.get("window");

const DishDetailScreen = () => {
    const [data, setData] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loadAllBestSeller = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/dishes/bestseller`);
            const results = await response.json();

            if (results)
                setData(results);

            setLoading(false);
        } catch (error) {
            console.log("Lỗi không thể kết nối API ", error);
        }
    }

    useEffect(() => {
        loadAllBestSeller();
    }, []);

    function formatPrice(price) {
        if (price === null || price === undefined || price === "") return "";

        const num = Number(price);
        if (isNaN(num)) return String(price);

        if (Number.isInteger(num)) return num.toLocaleString("vi-VN");

        const s = num.toFixed(3).replace(/\.?0+$/, "");
        const parts = s.split(".");
        const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        return parts[1] ? `${intPart},${parts[1]}` : intPart;
    }

    if (loading) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.heading} onPress={() => router.push("../(tabs)/")}></Ionicons>
                        <Text style={[TEXT.heading, LAYOUT.ml(70)]}>Best Seller</Text>
                    </View>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82)]}>
                <Text style={[LAYOUT.mt(20), TEXT.text, TEXT.center, { color: COLORS.heading }]}>Khám phá ngay nhưng món ngon nhất!</Text>

                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80)]}>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.dishId}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        columnWrapperStyle={{ justifyContent: "space-between" }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[LAYOUT.w("48%"), LAYOUT.mb(16), LAYOUT.relative]}>
                                <ImageBackground
                                    source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/images/background-default.png")}
                                    style={[LAYOUT.wFull, LAYOUT.h(150), LAYOUT.rounded(20), LAYOUT.border(1, COLORS.border), { overflow: "hidden" }]}
                                />
                                <Ionicons name="heart" size={16} color={COLORS.button} style={[LAYOUT.absolute, LAYOUT.top(10), LAYOUT.left(10), LAYOUT.rounded(30), LAYOUT.border(1, COLORS.border), LAYOUT.px(4), LAYOUT.py(3), { backgroundColor: COLORS.light }]}></Ionicons>
                                <Text style={[TEXT.text, TEXT.size(16), LAYOUT.absolute, LAYOUT.right(0), LAYOUT.bottom(50), LAYOUT.px(6), LAYOUT.roundedtl(22), LAYOUT.roundedbl(22), {color: COLORS.textLight, backgroundColor: COLORS.button}]}>{formatPrice(item.price)} đ</Text>
                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                    <Text style={[TEXT.text, TEXT.size(18), LAYOUT.w("65%")]} numberOfLines={1}>{item.dishName}</Text>
                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.px(4), LAYOUT.py(1), LAYOUT.rounded(22), { backgroundColor: COLORS.button, gap: 2 }]}>
                                        <Text style={[TEXT.text, TEXT.size(16), { color: COLORS.textLight }]}>5.0</Text>
                                        <Ionicons name="star" size={14} color={COLORS.background1}></Ionicons>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>

            </View>
        </View>
    );
};

export default DishDetailScreen;
