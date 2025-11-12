import { useEffect, useState, useRef } from "react";
import { View, ScrollView, TextInput, Text, ImageBackground, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const SearchScreen = (query) => {
  const { results } = query.params;

  return (
    <View style={[LAYOUT.container, LAYOUT.relative]}>
      <View style={[LAYOUT.header, LAYOUT.row, LAYOUT.justifyCenter]}>
        <Ionicons name="chevron-back-outline" onPress={() => router.replace("./(tabs)/")} style={[LAYOUT.absolute, LAYOUT.top(86), LAYOUT.left(0), TEXT.size(20), { color: COLORS.heading }]}></Ionicons>
        <Text style={[TEXT.heading]}>Tìm Kiếm</Text>
      </View>
      <View style={[LAYOUT.main, { height: height * 0.85 }]}>
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(32)]}>
          <Text style={[TEXT.text, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(5)]}>Kết quả tìm kiếm cho: <Text style={[TEXT.underline]}>{results}</Text></Text>
          <ScrollView>
            <View style={[LAYOUT.wFull, LAYOUT.h(120), LAYOUT.row, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(10), LAYOUT.mt(20)]}>
              <ImageBackground source={require("../assets/images/favicon.png")} style={[LAYOUT.rounded(20), LAYOUT.w(80), LAYOUT.hFull, LAYOUT.border(1, COLORS.accent)]}></ImageBackground>
              <View style={[LAYOUT.pl(10), LAYOUT.pt(10), LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.w(width - 60 - 80)]}>
                <View style={[]}>
                  <Text style={[TEXT.subHeading]}>Sinh tố dâu</Text>
                  <Text style={[TEXT.text, { color: COLORS.accent }]}>A Food</Text>
                  <Text style={[TEXT.text, { color: COLORS.heading }]}>50,000</Text>
                </View>
                <View style={[LAYOUT.w("fit-content")]}>
                  <TouchableOpacity>
                    <Ionicons name="cart-outline" style={[TEXT.size(22), { color: COLORS.paragraph }]}></Ionicons>
                    <Text style={[TEXT.subText, { color: COLORS.paragraph }]}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[LAYOUT.wFull, LAYOUT.h(120), LAYOUT.row, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(10), LAYOUT.mt(20)]}>
              <ImageBackground source={require("../assets/images/favicon.png")} style={[LAYOUT.rounded(20), LAYOUT.w(80), LAYOUT.hFull, LAYOUT.border(1, COLORS.accent)]}></ImageBackground>
              <View style={[LAYOUT.pl(10), LAYOUT.pt(10), LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.w(width - 60 - 80)]}>
                <View style={[]}>
                  <Text style={[TEXT.subHeading]}>Sinh tố bưởi</Text>
                  <Text style={[TEXT.text, { color: COLORS.accent }]}>B Food</Text>
                  <Text style={[TEXT.text, { color: COLORS.heading }]}>45,000</Text>
                </View>
                <View style={[LAYOUT.w("fit-content")]}>
                  <TouchableOpacity>
                    <Ionicons name="cart-outline" style={[TEXT.size(22), { color: COLORS.paragraph }]}></Ionicons>
                    <Text style={[TEXT.subText, { color: COLORS.paragraph }]}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
export default SearchScreen;
