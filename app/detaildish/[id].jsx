import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { API } from "../../constants/api";

const { width, height } = Dimensions.get("window");

const OrderDetailScreen = () => {
  const { id: dishId } = useLocalSearchParams();
  const [data, setData] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loadDishDetail = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/dish/${dishId}`);
      const results = response.data;

      if (results)
        setData(results[0]);
        
      setLoading(false);
    } catch (error) {
      console.log("Lỗi không thể kết nối API ", error);
    }
  }

  useEffect(() => {
    loadDishDetail();
  }, []);
  
  if (loading) return <LoadingSpinner />;

  return (
    <View style={[LAYOUT.container]}>
      <View style={[LAYOUT.header]}>
        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
          <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
            <Ionicons name="chevron-back" size={20} color={COLORS.heading} onPress={() => router.push("../(tabs)/")}></Ionicons>
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

export default OrderDetailScreen;
