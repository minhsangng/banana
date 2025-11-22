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

const BestSeller = () => {
    const [dataBS, setDataBS] = useState([]);

    const loadBestSeller = async () => {
        const { data } = await axios.get(`${API_URL}/dishes/bestseller/4`);
        setDataBS(data);
    }

    const loadData = async () => {
        try {
            await loadBestSeller();
        } catch (error) {
            console.log("Error loading the data", error);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(20)]}>
            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
                <Text style={TEXT.subHeading}>Best seller</Text>
                <TouchableOpacity onPress={() => router.push("../bestseller/")}>
                    <Text style={[TEXT.paragraph, homeStyles.bestSellerSeeAll]}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
                </TouchableOpacity>
            </View>
            <View style={[LAYOUT.mt(4), LAYOUT.row, LAYOUT.justifyBetween]}>
                {dataBS.length === 0
                    ?
                    (<View><Text>Không có dữ liệu</Text></View>)
                    :
                    dataBS.map((d) => (
                        <TouchableOpacity key={d.dishId} onPress={() => router.push(`/detaildish/${d.dishId}`)} style={[LAYOUT.border(1, COLORS.border), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110), { overflow: "hidden" }]}>
                            <ImageBackground
                                style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]}
                                source={d.imageUrl ? { uri: d.imageUrl } : require("../assets/images/background-default.png")}
                            >
                                <Text
                                    style={[
                                        LAYOUT.absolute, LAYOUT.bottom(10), LAYOUT.right(-1), LAYOUT.w(45), LAYOUT.pt(2), LAYOUT.px(3), LAYOUT.roundedtl(30), LAYOUT.roundedbl(30),
                                        TEXT.subText, homeStyles.bestSellerNameDish
                                    ]}
                                    numberOfLines={1}
                                >
                                    {d.dishName}
                                </Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    ))}
            </View>
        </View>
    );
};

export default BestSeller;