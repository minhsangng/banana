import { useEffect, useState, useRef } from "react";
import { View, ScrollView, TextInput, Text, ImageBackground, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { router } from "expo-router";
import { useFonts } from "expo-font";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {

  return (
    <View style={LAYOUT.container}>
      <View style={[LAYOUT.header, LAYOUT.justifyCenter, LAYOUT.relative]}>
        <Ionicons name="chevron-back-outline" style={[LAYOUT.absolute, LAYOUT.top(86), LAYOUT.left(0), TEXT.size(20), { color: COLORS.heading }]}></Ionicons>
        <Text style={[TEXT.heading]}>Tìm Kiếm</Text>
      </View>
      <View style={[LAYOUT.main, { height: height * 0.84 }]}>
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.mt(32)]}>
          <Text style={[TEXT.text, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(5)]}>Kết quả tìm kiếm cho: <Text style={[TEXT.underline]}>sinh tố</Text></Text>
          <ScrollView style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.mt(20)]}>
            <View style={[LAYOUT.wFull, LAYOUT.h(120)]}>
              <ImageBackground source={require("../assets/images/favicon.png")} style={[LAYOUT.rounded(20), LAYOUT.w(80), LAYOUT.hFull, LAYOUT.border(1, COLORS.accent)]}></ImageBackground>
              <View style={[LAYOUT.wFull, LAYOUT.row]}>
                <View style={[{color: COLORS.heading}]}>
                  <Text>Sinh tố dâu</Text>
                  <Text>A Food</Text>
                  <Text>50,000</Text>
                </View>
                <View>
                  <TouchableOpacity>
                    <Ionicons name="cart-outline"></Ionicons>
                    <Text>Thêm giỏ hàng</Text>
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
export default HomeScreen;
