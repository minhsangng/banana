import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { homeStyles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import { dishImage } from "../../constants/format";
import axios from "axios";

import SlideBanner from "../../components/SlideBanner";
import Categories from "../../components/Categories";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import PushNotification from "../../components/PushNotification";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const router = useRouter();
  const [dataBS, setDataBS] = useState([]);
  const [recommends, setRecommends] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBestSeller = async () => {
    const { data } = await axios.get(`${API_URL}/dishes/bestseller/4`);
    setDataBS(data);
    return data;
  }

  const loadRecommend = async () => {
    const { data } = await axios.get(`${API_URL}/dishes/bestseller/2`);
    setRecommends(data);
    return data;
  }

  const loadData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        loadBestSeller(),
        loadRecommend(),
      ]);

      setLoading(false);
    } catch (error) {
      console.log("Error loading the data", error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <PushNotification>
      <View style={[LAYOUT.container, LAYOUT.positive]}>
        {/* Header */}
        <Header />

        <View style={[LAYOUT.absolute, LAYOUT.bottom(0), LAYOUT.w(width), LAYOUT.h(height * 0.7), homeStyles.main]}>
          {/* Categories */}
          <Categories />

          <ScrollView>
            {/* Best Seller Section */}
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
                    <TouchableOpacity key={d.dishId} onPress={() => router.push(`../detaildish/${d.dishId}`)} style={[LAYOUT.border(1, COLORS.border), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110), { overflow: "hidden" }]}>
                      <Image
                        style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]}
                        source={dishImage(d.imageUrl)}
                      ></Image>
                      <Text
                        style={[
                          LAYOUT.absolute, LAYOUT.bottom(10), LAYOUT.right(-1), LAYOUT.w(45), LAYOUT.pt(2), LAYOUT.px(3), LAYOUT.roundedtl(30), LAYOUT.roundedbl(30),
                          TEXT.subText, homeStyles.bestSellerNameDish
                        ]}
                        numberOfLines={1}
                      >
                        {d.dishName}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>

            {/* Ads Banner Section */}
            <SlideBanner />

            {/* Recommend Section */}
            <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(24), LAYOUT.mb(40)]}>
              <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
                <Text style={TEXT.subHeading}>Dành cho bạn</Text>
                <TouchableOpacity onPress={() => router.push(`../recommend/`)}>
                  <Text style={[TEXT.paragraph, homeStyles.recommendSeeAll]}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
                </TouchableOpacity>
              </View>
              <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.pt(6)]}>
                {recommends.length === 0 ? (<View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}><Text style={[TEXT.text]}>Chưa có dữ liệu</Text></View>)
                  : recommends.map((data) => (
                    <TouchableOpacity key={data.dishId} onPress={() => router.push(`../detaildish/${data.dishId}`)} style={[LAYOUT.w("48%"), LAYOUT.h(160), LAYOUT.border(1, COLORS.border), LAYOUT.rounded(8), { overflow: "hidden" }]}>
                      <Image style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]} source={dishImage(data.imageUrl)}></Image>
                      <View style={[LAYOUT.absolute, LAYOUT.top(5), LAYOUT.left(5), LAYOUT.row, LAYOUT.itemsCenter, { gap: 6 }]}>
                        <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.rounded(30), LAYOUT.border(0.5, COLORS.border), LAYOUT.px(6), LAYOUT.py(2), homeStyles.rateContainer]}>
                          <Text style={TEXT.subText}>5.0</Text>
                          <Ionicons name="star" style={{ fontSize: 14, color: COLORS.background1 }}></Ionicons>
                        </View>
                        <View style={[LAYOUT.rounded(30), LAYOUT.border(0.5, COLORS.border), LAYOUT.p(4), homeStyles.favoritesContainer]}>
                          <Ionicons name="heart" style={{ fontSize: 14, color: COLORS.heading }}></Ionicons>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </PushNotification>
  );
};
export default HomeScreen;
