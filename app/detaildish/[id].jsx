import { View, Text, Dimensions, TextInput, Image, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { API_URL } from "../../constants/api";
import { formatPrice, formatImage } from "../../constants/format";
import { UserAPI } from "../../services/userInfo";
import { DishAPI } from "../../services/dishAPI";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import ToastModal from "../../components/ToastModal";

const { height, width } = Dimensions.get("window");

const OrderDishScreen = () => {
  const router = useRouter();
  const { id: dishId } = useLocalSearchParams();
  const [userId, setUserId] = useState(0);
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [alert, setAlert] = useState(false);
  const [addToCart, setAddToCart] = useState(false);
  const [note, setNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const loadDishDetail = async () => {
    try {
      setLoading(true);
      const userId = await UserAPI.getUserInfo();
      setUserId(userId);
      const data = await DishAPI.getDetailDish(dishId, userId);

      setIsFavorite(data.favoriteId ? true : false);

      setDish(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const addCart = async () => {
    try {
      setTimeout(() => setAddToCart(true), 200);
      setTimeout(() => setAddToCart(false), 1200);
      if (userId !== 0) {
        const { data } = await axios.post(`${API_URL}/cart/add`, {
          userId: userId,
          dishId: dishId,
          quantity,
          note
        });

        if (data.success)
          setQuantity(1);
      } else {
        setAlert(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addFavorite = async () => {
    try {
      if (userId !== 0) {
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);

        await axios.get(`${API_URL}/favorite/${newStatus ? "add" : "remove"}/${userId}/${dishId}`);
      } else {
        setAlert(true);
      }
    } catch (error) {
      console.error("Lỗi: ", error);
    }
  };

  const contentAlert = () => {
    return (
      <View style={[LAYOUT.row, LAYOUT.wFull, LAYOUT.justifyCenter, LAYOUT.mt(16)]}>
        <TouchableOpacity onPress={() => router.replace("../(auth)/sign-in")} style={[LAYOUT.w("50%"), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.button }]}>
          <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    loadDishDetail();
  }, []);

  useEffect(() => {
  }, [isFavorite]);

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

          <TouchableOpacity onPress={addFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={COLORS.light}
              style={[
                LAYOUT.rounded(20),
                LAYOUT.p(4),
                { backgroundColor: COLORS.button },
              ]}
            ></Ionicons>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN */}
      <ScrollView style={[LAYOUT.main, LAYOUT.h(height * 0.85)]}>
        <View
          style={[
            LAYOUT.w(width - 60),
            LAYOUT.h(240),
            LAYOUT.mx(),
            LAYOUT.mt(32),
            LAYOUT.rounded(28),
            { overflow: "hidden" },
          ]}
        >
          <Image
            source={formatImage(dish.imageUrl)}
            style={[LAYOUT.border(1, COLORS.border), LAYOUT.wFull, LAYOUT.hFull, LAYOUT.rounded(28), { overflow: "hidden" }]}
            resizeMode="cover"
          />
        </View>

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
            {formatPrice(dish.price)} đ
          </Text>

          <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
            <TouchableOpacity
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <Ionicons
                name="remove-outline"
                size={20}
                color={COLORS.heading}
                style={[
                  LAYOUT.rounded(50),
                  LAYOUT.p(6),
                  { backgroundColor: COLORS.background3 },
                ]}
              />
            </TouchableOpacity>

            <Text style={[TEXT.text, TEXT.size(20), LAYOUT.mx(16)]}>
              {quantity}
            </Text>

            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
              <Ionicons
                name="add-outline"
                size={20}
                color={COLORS.heading}
                style={[
                  LAYOUT.rounded(50),
                  LAYOUT.p(6),
                  { backgroundColor: COLORS.background3 },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

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

        <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(24)]}>
          <Text style={[TEXT.text, LAYOUT.mb(4)]}>Ghi chú:</Text>
          <TextInput value={note} onChangeText={setNote} style={[TEXT.paragraph, LAYOUT.px(20), LAYOUT.py(12), LAYOUT.border(1, COLORS.border), LAYOUT.rounded(12)]} />
        </View>

        <View style={[LAYOUT.my(24), LAYOUT.itemsCenter]}>
          <TouchableOpacity onPress={addCart}
            style={[
              LAYOUT.py(12),
              LAYOUT.w(200),
              LAYOUT.rounded(30),
              LAYOUT.row,
              LAYOUT.itemsCenter,
              LAYOUT.justifyCenter,
              { backgroundColor: COLORS.button, gap: 8 },
            ]}
          >
            <Ionicons name={addToCart ? "cart" : "cart-outline"} style={addToCart ? { transform: "rotate(-15deg)", color: COLORS.background1 } : {}} size={(24)} color={COLORS.textLight}></Ionicons>
            <Text style={[TEXT.text, TEXT.size(20), TEXT.center, addToCart ? { color: COLORS.background1 } : { color: COLORS.light }]}>
              Thêm giỏ hàng
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ToastModal width={"auto"} height={"auto"} status={"warning"} title={"Đăng nhập để thêm giỏ hàng!"} content={contentAlert} visible={alert} />
    </View>
  );
};

export default OrderDishScreen;
