import { View, Text, TouchableOpacity, FlatList, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice, formatImage } from "../../constants/format";
import { DishAPI } from "../../services/dishAPI";

const { width, height } = Dimensions.get("window");

const BestSellerScreen = () => {
    const [dishes, setDishes] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const response = await DishAPI.getAllBestSeller();
            setDishes(response);
            setLoading(false);
        };
        
        loadData();
    }, []);

    if (loading) return <LoadingSpinner />;

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
                <Text style={[LAYOUT.mt(20), TEXT.text, TEXT.center, LAYOUT.color(COLORS.heading)]}>Khám phá ngay nhưng món ngon nhất!</Text>

                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80)]}>
                    <FlatList
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
                                <Ionicons name="heart" size={16} color={COLORS.button} style={[LAYOUT.absolute, LAYOUT.top(10), LAYOUT.left(10), LAYOUT.rounded(30), LAYOUT.border(1, COLORS.border), LAYOUT.px(4), LAYOUT.py(3), LAYOUT.bg(COLORS.light)]}></Ionicons>
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
                </View>

            </View>
        </View>
    );
};

export default BestSellerScreen;
