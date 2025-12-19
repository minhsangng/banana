import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_URL } from "../constants/api";
import { formatPrice, formatImage } from "../constants/format";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import LoadingSpinner from "./LoadingSpinner";
import ToastModal from "./ToastModal";

const { width, height } = Dimensions.get("window");

export default function PopupSearch({ visible, query, onClose }) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [addToCart, setAddToCart] = useState(false);
  const [alert, setAlert] = useState(false);
  const [dishSelected, setDishSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  const addCart = async (dishId) => {
    try {
      const userStr = await SecureStore.getItemAsync("userInfo");
      if (userStr) {
        setTimeout(() => setAddToCart(true), 200);
        setTimeout(() => setAddToCart(false), 1000);
        setDishSelected(dishId);
        const { data } = await axios.post(`${API_URL}/cart/add`, {
          userId: JSON.parse(userStr).userId,
          dishId: dishId,
          quantity: 1
        });
      } else {
        setAlert(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const contentAlert = () => {
    return (
      <View style={[LAYOUT.row, LAYOUT.wFull, LAYOUT.justifyBetween, LAYOUT.mt(16)]}>
        <TouchableOpacity onPress={() => setAlert(false)} style={[LAYOUT.w("48%"), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.background3 }]}>
          <Text style={[TEXT.text, TEXT.center, { color: COLORS.heading }]}>Bỏ qua</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("../(auth)/sign-in")} style={[LAYOUT.w("48%"), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.button }]}>
          <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    const loadDataSearch = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/search/${query}`);

        setData(data);
        setLoading(false);
      } catch (error) {
        console.log("Lỗi", "Không thể kết nối API", error);
      }
    };

    loadDataSearch();
  }, [query]);

  return (
    <Modal
      visible={!!visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.popupWrapper, { width: width, maxHeight: height * 0.92 }]} onPress={(e) => e.stopPropagation()}>
          <View style={[LAYOUT.w(width - 60), LAYOUT.h("100%"), LAYOUT.mx(), LAYOUT.mt(12)]}>
            <Text style={[TEXT.text, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(6)]}>
              Kết quả tìm kiếm cho: <Text style={[TEXT.underline]}>{query}</Text>
            </Text>

            <View style={[LAYOUT.pb(110)]}>
              {loading ? (<LoadingSpinner />) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {data.length === 0 && (
                    <View style={[LAYOUT.wFull, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                      <Text style={[TEXT.paragraph, LAYOUT.mt(12), { color: COLORS.paragraph }]}>Không tìm thấy kết quả</Text>
                    </View>
                  )}

                  {data.map((d) => (
                    <TouchableOpacity onPress={() => router.push(`../detaildish/${d.dishId}`)}
                      key={d.dishId}
                      style={[
                        LAYOUT.wFull,
                        LAYOUT.h(120),
                        LAYOUT.row,
                        LAYOUT.borderb(1, COLORS.background3),
                        LAYOUT.pb(10),
                        LAYOUT.mt(20),
                        styles.resultItem,
                      ]}
                    >
                      <Image
                        source={formatImage(d.imageUrl)}
                        resizeMode="cover"
                        style={[LAYOUT.rounded(12), LAYOUT.w(80), LAYOUT.hFull, LAYOUT.border(1, COLORS.border)]}
                        imageStyle={{ borderRadius: 12 }}
                      />

                      <View style={[LAYOUT.pl(10), LAYOUT.pt(10), LAYOUT.row, LAYOUT.justifyBetween, { width: width - 60 - 80 - 20 }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[TEXT.text]} numberOfLines={1} ellipsizeMode="tail"><Ionicons name="shield-checkmark" size={16} style={{ color: COLORS.background4 }}></Ionicons> {d.storeName}</Text>
                          <Text style={[TEXT.text, TEXT.size(14)]}>{d.dishName}</Text>
                          <Text style={[TEXT.subText, { color: COLORS.paragraph }]}>{d.selled} lượt mua</Text>
                          <Text style={[TEXT.text, { color: COLORS.heading }]}>{formatPrice(d.price)} đ</Text>
                        </View>

                        <TouchableOpacity style={[LAYOUT.pl(12)]} onPress={() => addCart(d.dishId)}>
                          <Ionicons name={(addToCart && dishSelected === d.dishId) ? "cart" : "cart-outline"} size={22} style={[LAYOUT.p(6), LAYOUT.rounded(20), (addToCart && dishSelected === d.dishId) ? { transform: "rotate(-15deg)", color: COLORS.background1 } : { color: COLORS.light }, { backgroundColor: COLORS.button }]} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                  
                  {data.length !== 0 && <Text style={[LAYOUT.pt(12), TEXT.subText, TEXT.center, { color: COLORS.paragraph }]}>Đã hiển thị tất cả kết quả</Text>}
                </ScrollView>)}
            </View>
          </View>
        </Pressable>
      </Pressable>
      <ToastModal width={"auto"} height={"auto"} status={"warning"} title={"Đăng nhập để thêm giỏ hàng!"} content={contentAlert} visible={alert} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    height,
    width,
  },
  popupWrapper: {
    backgroundColor: COLORS.background2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 12,
  },
});
