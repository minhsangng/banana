import { View, Text, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

export default function SupportScreen() {
    const [isLogin, setIsLogin] = useState(false);

    const initData = async () => {
        const userStr = await SecureStore.getItemAsync("userInfo");
        if (userStr) setIsLogin(true);
    };

    useEffect(() => {
        initData();
    }, [])

    return (
        <View style={[LAYOUT.container]}>
            <NavBar isLogin={isLogin} heading={"Trợ giúp"} />
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.77)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx()]}>
                    <TextInput placeholder="Nhập từ khóa" style={[LAYOUT.wFull, LAYOUT.px(18), LAYOUT.py(8), LAYOUT.rounded(12), TEXT.paragraph, { backgroundColor: COLORS.background3 }]}></TextInput>

                    <Text style={[TEXT.text, TEXT.size(22), LAYOUT.pt(30), LAYOUT.pb(12), LAYOUT.borderb(1, COLORS.background3)]}>Tra cứu nhanh</Text>
                    <View style={[LAYOUT.mt(20), LAYOUT.pb(16), { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                        <Text style={[TEXT.text]}>Về đơn hàng</Text>
                        <TouchableOpacity style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mb(3)]} >
                            <Text style={[TEXT.subText, LAYOUT.mt(4)]}>Làm thế nào để hủy đơn hàng đã đặt?</Text>
                            <Ionicons name="chevron-forward-outline" style={[TEXT.size(18)]} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mb(3)]} >
                            <Text style={[TEXT.subText, LAYOUT.mt(4)]}>Tôi muốn thay đổi địa điểm giao hàng?</Text>
                            <Ionicons name="chevron-forward-outline" style={[TEXT.size(18)]} />
                        </TouchableOpacity>
                    </View>

                    <View style={[LAYOUT.mt(20), LAYOUT.pb(16), { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                        <Text style={[TEXT.text]}>Về tài khoản</Text>
                        <TouchableOpacity style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mb(3)]} >
                            <Text style={[TEXT.subText, LAYOUT.mt(4)]}>Làm thế nào để xóa tài khoản?</Text>
                            <Ionicons name="chevron-forward-outline" style={[TEXT.size(18)]} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mb(3)]} >
                            <Text style={[TEXT.subText, LAYOUT.mt(4)]}>Quên mật khẩu?</Text>
                            <Ionicons name="chevron-forward-outline" style={[TEXT.size(18)]} />
                        </TouchableOpacity>
                    </View>

                    <View style={[LAYOUT.mt(20), LAYOUT.pb(16), { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                        <Text style={[TEXT.text]}>Về thanh toán</Text>
                        <TouchableOpacity style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mb(3)]} >
                            <Text style={[TEXT.subText, LAYOUT.mt(4)]}>Các phương thức thanh toán hỗ trợ?</Text>
                            <Ionicons name="chevron-forward-outline" style={[TEXT.size(18)]} />
                        </TouchableOpacity>
                    </View>

                    <View style={[LAYOUT.mt(20), LAYOUT.pb(16), { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                        <Text style={[TEXT.text]}>Về cửa hàng/đối tác</Text>
                        <TouchableOpacity style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mb(3)]} >
                            <Text style={[TEXT.subText, LAYOUT.mt(4)]}>Tôi muốn trở thành đối tác cửa hàng?</Text>
                            <Ionicons name="chevron-forward-outline" style={[TEXT.size(18)]} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View >
    );
}