import { View, ScrollView, Text, Dimensions, TouchableOpacity, ImageBackground } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { COLORS } from "../constants/colors";
import LoadingSpinner from "../components/LoadingSpinner";

const { width, height } = Dimensions.get("window");

export default function CategoryFilter({ categoryId, visible }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState("Phổ biến");

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

    useEffect(() => {
        const loadDishByCategoryId = async () => {
            try {
                if (categoryId !== -1) {
                    setLoading(true);
                    const response = await fetch(`http://192.168.1.171:5001/api/category/${categoryId}`);
                    const results = await response.json();
                    setData(results);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.log("Lỗi không thể kết nối API", error);
            } finally {
                setLoading(false);
            }
        }

        loadDishByCategoryId();
    }, [categoryId]);

    if (!visible) return null;

    if (loading)
        return (
            <View style={[LAYOUT.main, { height: height * 0.59, backgroundColor: COLORS.light }]}>
                <LoadingSpinner />
            </View>
        );

    return (
        <View style={[LAYOUT.main, { height: height * 0.59, backgroundColor: COLORS.light }]}>
            <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(20)]}>
                <Text style={[TEXT.text, TEXT.size(14), LAYOUT.pr(10)]}>Sắp xếp</Text>
                <TouchableOpacity onPress={() => setSortBy(sortBy === "Phổ biến" ? "Mới nhất" : "Phổ biến")}>
                    <Text style={[TEXT.text, TEXT.size(14), { color: COLORS.heading }]}>{sortBy}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={[LAYOUT.mt(12), LAYOUT.w(width - 60), LAYOUT.mx()]} showsVerticalScrollIndicator={false}>
                {data.length === 0 ? (
                    <Text style={[TEXT.paragraph, { textAlign: "center" }]}>Không có món nào</Text>
                ) : (
                    data.map((d) => (
                        <View key={d.dishId} style={[LAYOUT.mb(24), LAYOUT.pb(10), LAYOUT.borderb(1, COLORS.background3)]}>
                            <ImageBackground style={[LAYOUT.w("100%"), LAYOUT.h(160), LAYOUT.rounded(36)]} borderRadius={36} source={d.imageUrl ? d.imageUrl : require("../assets/images/background-default.png")}></ImageBackground>
                            <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.w("75%"), LAYOUT.pt(4)]}>
                                    <Text style={[TEXT.text]} numberOfLines={1}>{d.dishName}</Text>
                                    <Ionicons name="ellipse-sharp" color={COLORS.button} size={8} style={[LAYOUT.mx(5)]}></Ionicons>
                                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.px(6), LAYOUT.py(2), LAYOUT.rounded(12), { backgroundColor: COLORS.button }]}>
                                        <Text style={[TEXT.subText, LAYOUT.mr(2), { color: COLORS.textLight }]}>5.0</Text>
                                        <Ionicons name="star" size={12} color={COLORS.background1}></Ionicons>
                                    </View>
                                </View>
                                <Text style={[TEXT.text, { color: COLORS.heading }]}>{formatPrice(d.price)} đ</Text>
                            </View>
                            <Text style={[TEXT.paragraph]}>{d.description}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
