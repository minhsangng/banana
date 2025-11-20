import { View, Text, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import axios from "axios";

const { height } = Dimensions.get("window");

const OrderDetailScreen = () => {
  const { id: dishId } = useLocalSearchParams();
  const [dishes, setDishes] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loadDishDetail = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/dish/${dishId}`);

      setDishes(data[0]);
      setLoading(false);
    } catch (error) {
      console.log(error);
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
            <Text style={[TEXT.text, TEXT.size(24), LAYOUT.ml(8)]}>{dishes.dishName}</Text>
          </View>
          <Ionicons name="heart" size={20} color={COLORS.light} style={[LAYOUT.rounded(20), LAYOUT.p(4), { backgroundColor: COLORS.button }]}></Ionicons>
        </View>
      </View>
      <View style={[LAYOUT.main, LAYOUT.h(height * 0.82)]}>

      </View>
    </View>
  );
};

export default OrderDetailScreen;
