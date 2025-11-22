import { useEffect, useState } from "react";
import { View, Text, ImageBackground, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/api";
import axios from "axios";

const { width } = Dimensions.get("window");

const Recommend = () => {
    const [recommends, setRecommends] = useState([]);

    const loadRecommend = async () => {
        const { data } = await axios.get(`${API_URL}/dishes/bestseller/2`);
        setRecommends(data);
    }

    const loadData = async () => {
        try {
            await loadRecommend();
        } catch (error) {
            console.log("Error loading the data", error);
        } 
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(24), LAYOUT.mb(40)]}>
            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
                <Text style={TEXT.subHeading}>Dành cho bạn</Text>
                <Text style={[TEXT.paragraph, homeStyles.recommendSeeAll]}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
            </View>
            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.pt(6)]}>
                {recommends.length === 0 ? (<View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}><Text style={[TEXT.text]}>Chưa có dữ liệu</Text></View>)
                    : recommends.map((data) => (
                        <TouchableOpacity key={data.dishId} onPress={() => router.push(`/detaildish/${data.dishId}`)} style={[LAYOUT.w("48%"), LAYOUT.h(160), LAYOUT.border(1, COLORS.border), LAYOUT.rounded(8), { overflow: "hidden" }]}>
                            <ImageBackground style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]} source={require("../assets/images/background-default.png")}>
                                <View style={[LAYOUT.absolute, LAYOUT.top(5), LAYOUT.left(5), LAYOUT.row, LAYOUT.itemsCenter, { gap: 6 }]}>
                                    <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.rounded(30), LAYOUT.border(0.5, COLORS.border), LAYOUT.px(6), LAYOUT.py(2), homeStyles.rateContainer]}>
                                        <Text style={TEXT.subText}>{data.rateStar}</Text>
                                        <Ionicons name="star" style={{ fontSize: 14, color: COLORS.background1 }}></Ionicons>
                                    </View>
                                    <View style={[LAYOUT.rounded(30), LAYOUT.border(0.5, COLORS.border), LAYOUT.p(4), homeStyles.favoritesContainer]}>
                                        <Ionicons name="heart" style={{ fontSize: 14, color: COLORS.heading }}></Ionicons>
                                    </View>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    ))}
            </View>
        </View>
    );
};

export default Recommend;