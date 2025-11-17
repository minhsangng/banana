import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const DishDetailScreen = () => {
  const { id: dishId } = useLocalSearchParams();
  const [data, setData] = useState([]);

  const loadDishDetail = async () => {
    try {
      const response = await fetch(`http://192.168.1.171:5001/api/dish/${dishId}`);
      const results = await response.json();

      if (results)
        setData(results[0]);
    } catch (error) {
      console.log("Lỗi không thể kết nối API ", error);
    }
  }

  useEffect(() => {
    loadDishDetail();
  }, []);

  return (
    <View style={[LAYOUT.container]}>
      <View style={[LAYOUT.header]}>
        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
          <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
            <Ionicons name="chevron-back" size={20} color={COLORS.heading}></Ionicons>
            <Text style={[TEXT.text, TEXT.size(24), LAYOUT.ml(8)]}>{data.dishName}</Text>
          </View>
          <Ionicons name="heart" size={20} color={COLORS.light} style={[LAYOUT.rounded(20), LAYOUT.p(4), { backgroundColor: COLORS.button }]}></Ionicons>
        </View>
      </View>
      <View key={data.dishId} style={[LAYOUT.main, LAYOUT.h(height * 0.82)]}>

      </View>
    </View>
  );
};

export default DishDetailScreen;
