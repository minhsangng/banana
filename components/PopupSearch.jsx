import {
  View,
  ScrollView,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function PopupSearch({ visible, query, data = [], onClose }) {
  function formatPrice(price) {
    if (price === null || price === undefined || price === "") return "";

    const num = Number(price);
    if (isNaN(num)) return String(price);

    if (Number.isInteger(num)) return num.toLocaleString("vi-VN");

    const s = num.toFixed(3).replace(/\.?0+$/, "");
    const parts = s.split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return parts[1] ? `${intPart},${parts[1]}` : intPart;
  }

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
            <Text style={[TEXT.text, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(5)]}>
              Kết quả tìm kiếm cho: <Text style={[TEXT.underline]}>{query}</Text>
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {data.length === 0 && (
                <View style={[LAYOUT.wFull, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                  <Text style={[TEXT.paragraph, LAYOUT.mt(12), { color: COLORS.paragraph }]}>Không tìm thấy kết quả</Text>
                </View>
              )}

              {data.map((d) => (
                <View
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
                  <ImageBackground
                    source={typeof d.imageUrl === "string" ? { uri: d.imageUrl } : d.imageUrl}
                    style={[LAYOUT.rounded(12), LAYOUT.w(80), LAYOUT.hFull, LAYOUT.border(1, COLORS.accent)]}
                    imageStyle={{ borderRadius: 12 }}
                  />

                  <View style={[LAYOUT.pl(10), LAYOUT.pt(10), LAYOUT.row, LAYOUT.justifyBetween, { width: width - 60 - 80 - 20 }]}>
                    <View>
                      <Text style={[TEXT.text]} numberOfLines={1}>{d.dishName}</Text>
                      <Text style={[TEXT.subText, { color: COLORS.accent }]}>A Food</Text>
                      <Text style={[TEXT.text, { color: COLORS.heading }]}>{formatPrice(d.price)} đ</Text>
                    </View>

                    <TouchableOpacity style={styles.addButton}>
                      <Ionicons name="cart-outline" size={22} color={COLORS.paragraph} />
                      <Text style={[TEXT.subText, { color: COLORS.paragraph }]}>Thêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
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
    overflow: "hidden",
  },
  addButton: {
    alignItems: "center",
    gap: 6,
    paddingLeft: 12,
  },
});
