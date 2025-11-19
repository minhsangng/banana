import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { API } from "../../constants/api";

const { width, height } = Dimensions.get("window");

const OrderScreen = () => {
    const [data, setData] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loadAllBestSeller = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/dishes/bestseller`);
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
                        <Text style={[TEXT.heading, LAYOUT.ml(72)]}>Đơn Hàng</Text>
                    </View>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.75)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx()]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {data.map((item) => (
                            <TouchableOpacity key={item.dishId}
                                style={[LAYOUT.wFull, LAYOUT.mb(20), LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.pb(12), LAYOUT.borderb(1, COLORS.background4)]}>
                                <ImageBackground
                                    source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/images/background-default.png")}
                                    style={[LAYOUT.w(80), LAYOUT.h(110), LAYOUT.rounded(20), LAYOUT.border(1, COLORS.border), { overflow: "hidden" }]}
                                />
                                <View>
                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                        <Text style={[TEXT.text, LAYOUT.w("50%")]} numberOfLines={1}>{item.dishName}</Text>
                                        <Text style={[TEXT.text, { color: COLORS.heading }]}>{formatPrice(item.price)} đ</Text>
                                    </View>
                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                        <Text style={[TEXT.text, TEXT.size(16)]}>09:23 - 19/11</Text>
                                        <Text style={[TEXT.text, TEXT.size(16)]}>2 items</Text>
                                    </View>
                                    <View style={[LAYOUT.mt(12), {alignItems: "flex-end"}]}>
                                        <TouchableOpacity style={[LAYOUT.px(10), LAYOUT.py(4), LAYOUT.w(100), LAYOUT.rounded(22), {backgroundColor: COLORS.background3}]}>
                                        <Text style={[TEXT.text, TEXT.size(16), TEXT.center, {color: COLORS.heading}]}>Hủy đơn</Text>
                                    </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

            </View>
        </View>
    );
};

export default OrderScreen;
