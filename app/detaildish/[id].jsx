import { View, Text, Dimensions, TextInput, Image, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import axios from "axios";

const { height, width } = Dimensions.get("window");

const OrderDetailScreen = () => {
  const { id: dishId } = useLocalSearchParams();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const loadDishDetail = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/dish/${dishId}`);

      setDish(data[0]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const userId = 1;

  const addCart = async () => {
    try {
      const response = await axios.post(`${API_URL}/cart/add`, {
        userId,
        dishId,
        quantity
      });

      console.log(response);
      console.log("Thêm giỏ hàng thành công");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadDishDetail();
  }, []);

  if (loading || !dish) return <LoadingSpinner />;

  return (
    <View style={[LAYOUT.container]}>
      {/* HEADER */}
      <View style={[LAYOUT.header]}>
        <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
          <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
            <Ionicons
              name="chevron-back"
              size={22}
              color={COLORS.heading}
              onPress={() => router.back()}
            />
            <Text style={[TEXT.text, TEXT.size(24), LAYOUT.ml(8)]}>
              {dish.dishName}
            </Text>
          </View>

          <Ionicons
            name="heart"
            size={20}
            color={COLORS.light}
            style={[
              LAYOUT.rounded(20),
              LAYOUT.p(4),
              { backgroundColor: COLORS.button },
            ]}
          />
        </View>
      </View>

      {/* BODY */}
      <ScrollView style={[LAYOUT.main, LAYOUT.h(height * 0.85)]}>
        {/* IMAGE */}
        <View
          style={[
            LAYOUT.w(width - 60),
            LAYOUT.h(240),
            LAYOUT.mx(),
            LAYOUT.mt(32),
            LAYOUT.rounded(28),
            { overflow: "hidden", backgroundColor: COLORS.background3 },
          ]}
        >
          <Image
            source={{ uri: dish.dishImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        {/* PRICE + QUANTITY */}
        <View
          style={[
            LAYOUT.row,
            LAYOUT.justifyBetween,
            LAYOUT.itemsCenter,
            LAYOUT.w(width - 60),
            LAYOUT.mx(),
            LAYOUT.mt(24),
            LAYOUT.pb(8),
            LAYOUT.borderb(1, COLORS.background3),
          ]}
        >
          <Text style={[TEXT.text, TEXT.size(26), { color: COLORS.heading }]}>
            ${dish.price}.00
          </Text>

          <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
            <TouchableOpacity
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <Ionicons
                name="remove"
                size={20}
                color={COLORS.heading}
                style={[
                  LAYOUT.rounded(50),
                  LAYOUT.p(6),
                  { backgroundColor: COLORS.background },
                ]}
              />
            </TouchableOpacity>

            <Text style={[TEXT.text, TEXT.size(20), LAYOUT.mx(16)]}>
              {quantity}
            </Text>

            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
              <Ionicons
                name="add"
                size={20}
                color={COLORS.heading}
                style={[
                  LAYOUT.rounded(50),
                  LAYOUT.p(6),
                  { backgroundColor: COLORS.background },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(18)]}>
          <Text style={[TEXT.text, TEXT.size(20)]}>
            {dish.dishName}
          </Text>
          <Text
            style={[
              TEXT.subText,
              LAYOUT.mt(4),
              { lineHeight: 20, textAlign: "justify" },
            ]}
          >
            {dish.description}
          </Text>
        </View>

        {/* NOTE */}
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(24)]}>
          <Text style={[TEXT.text, LAYOUT.mb(4)]}>Ghi chú:</Text>
          <TextInput style={[TEXT.paragraph, LAYOUT.px(20), LAYOUT.py(12), LAYOUT.border(1, COLORS.border), LAYOUT.rounded(12)]} />
        </View>

        {/* ADD TO CART */}
        <View style={[LAYOUT.my(24), LAYOUT.itemsCenter]}>
          <TouchableOpacity onPress={addCart}
            style={[
              LAYOUT.py(12),
              LAYOUT.px(24),
              LAYOUT.rounded(30),
              LAYOUT.row,
              LAYOUT.itemsCenter,
              LAYOUT.justifyCenter,
              { backgroundColor: COLORS.button, gap: 8 },
            ]}
          >
            <Ionicons name="cart-outline" size={(20)} color={COLORS.textLight}></Ionicons>
            <Text style={[TEXT.text, TEXT.size(20), TEXT.center, { color: COLORS.light }]}>
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen;
