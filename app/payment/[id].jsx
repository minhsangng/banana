import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import axios from "axios";

const { width, height } = Dimensions.get("window");

export default function PaymentScreen() {
    const router = useRoute();
    const { id: orderId } = useLocalSearchParams();
    const [dataOrder, setDataOrder] = useState([]);

    const loadOrder = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/order/${orderId}`);
            
            if (data) {
                setDataOrder(data);
            }
        } catch (error) {
            console.error(error);
        }
    };
    
    useEffect(() => {
        loadOrder();
    }, []);

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color={COLORS.heading}
                            onPress={() => router.replace("../(tabs)/")}
                        />
                        <Text style={[TEXT.heading, LAYOUT.ml(64)]}>
                            Thanh toán
                        </Text>
                    </View>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.85)]}>
                <View style={[LAYOUT.w(width - 60), LAYOUT.h(240), LAYOUT.mx(), LAYOUT.mt(32)]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.mb(8), { gap: 24 }]}>
                        <Text style={[TEXT.text]}>Địa chỉ nhận</Text>
                        <TouchableOpacity>
                            <Ionicons name="pin-outline" size={20} color={COLORS.button}></Ionicons>
                        </TouchableOpacity>
                    </View>
                    <View style={[LAYOUT.px(12), LAYOUT.py(4), LAYOUT.rounded(20), { backgroundColor: COLORS.background3 }]}>
                        <Text style={[TEXT.paragraph]}>Phòng V6.02 (IUH - CS1)</Text>
                    </View>

                    <View style={[LAYOUT.mt(28)]}>
                        <Text style={[TEXT.text, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(6), LAYOUT.mb(12), LAYOUT.wFull]}>Thông tin đơn hàng</Text>
                        <View style={[LAYOUT.wFull]}>
                            {dataOrder.length === 0 ? (<Text>Không có dữ liệu</Text>)
                                : dataOrder.map((item) => (
                                    <View key={item.dishes.dishId}>
                                        <Text>{item.dishes.dishName}</Text>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}