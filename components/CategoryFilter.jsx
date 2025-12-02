import { View, ScrollView, Text, Dimensions, TouchableOpacity, Image } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { COLORS } from "../constants/colors";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatPrice, formatImage } from "../constants/format";
import { DishAPI } from "../services/dishAPI";

const { width, height } = Dimensions.get("window");

export default function CategoryFilter({ categoryId, visible }) {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState("Phổ biến");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const results = await DishAPI.getDishByCategoryId(categoryId);
            setData(results);
            setLoading(false);
        };

        loadData();
    }, [categoryId]);

    if (!visible) return null;

    if (loading)
        return (
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.59), LAYOUT.bg(COLORS.light), LAYOUT.zIndex(100)]}>
                <LoadingSpinner />
            </View>
        );

    return (
        <View style={[LAYOUT.main, LAYOUT.h(height * 0.59), LAYOUT.bg(COLORS.light), LAYOUT.zIndex(100)]}>
            <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(20)]}>
                <Text style={[TEXT.text, TEXT.size(14), LAYOUT.pr(10)]}>Sắp xếp</Text>
                <TouchableOpacity onPress={() => setSortBy(sortBy === "Phổ biến" ? "Mới nhất" : "Phổ biến")}>
                    <Text style={[TEXT.text, TEXT.size(14), LAYOUT.color(COLORS.heading)]}>{sortBy}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={[LAYOUT.mt(12), LAYOUT.pt(4), LAYOUT.w(width - 60), LAYOUT.mx()]} showsVerticalScrollIndicator={false}>
                {data.length === 0 ? (
                    <Text style={[TEXT.paragraph, { textAlign: "center" }]}>Không có món nào</Text>
                ) : (
                    data.map((d) => (
                        <TouchableOpacity onPress={() => router.push(`../detaildish/${d.dishId}`)} key={d.dishId} style={[LAYOUT.mb(24), LAYOUT.pb(10), LAYOUT.borderb(1, COLORS.background3)]}>
                            <Image
                                style={[LAYOUT.w("100%"), LAYOUT.h(160), LAYOUT.rounded(36)]}
                                borderRadius={36} source={formatImage(d.imageUrl)} resizeMode="cover" />
                            <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.w("75%"), LAYOUT.pt(4)]}>
                                    <Text style={[TEXT.text]} numberOfLines={1}>{d.dishName}</Text>
                                    <Ionicons name="ellipse-sharp" color={COLORS.button} size={8} style={[LAYOUT.mx(5)]}></Ionicons>
                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.px(6), LAYOUT.py(2), LAYOUT.rounded(12), LAYOUT.bg(COLORS.button)]}>
                                        <Text style={[TEXT.subText, LAYOUT.mr(2), LAYOUT.color(COLORS.textLight)]}>5.0</Text>
                                        <Ionicons name="star" size={12} color={COLORS.background1}></Ionicons>
                                    </View>
                                </View>
                                <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>{formatPrice(d.price)} đ</Text>
                            </View>
                            <Text style={[TEXT.paragraph]}>{d.description}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};