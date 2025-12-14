import { View, Text, Dimensions, Image, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";
import axios from "axios";
import { API_URL } from "../../constants/api";
import * as SecureStore from "expo-secure-store";
import LoadingSpinner from "../../components/LoadingSpinner";
import ToastModal from "../../components/ToastModal";
import { formatPrice } from "../../constants/format";

const { width, height } = Dimensions.get("window");

const bankNameToBIN = {
    "vietcombank": "970436",
    "vcb": "970436",

    "techcombank": "970407",
    "tcb": "970407",

    "mb bank": "970422",
    "mb": "970422",
    "mbland": "970422",

    "bidv": "970418",

    "acb": "970416"
};

export default function PaymentScreen() {
    const router = useRouter();
    const { id: orderId } = useLocalSearchParams();
    const [userInfo, setUserInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectPayment, setSelectPayment] = useState(1);
    const [alert, setAlert] = useState(false);
    const [icon, setIcon] = useState("");
    const [title, setTitle] = useState("");

    const [contentQR, setContentQR] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            const user = JSON.parse(userStr);
            const { data } = await axios.get(`${API_URL}/paymentinfo/${orderId}/${user.userId}/${user.role}`);
            setUserInfo(data[0]);

            const bankName = data[0].bankName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/\s+/g, "").toLowerCase();
            const accountName = user.fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toUpperCase();
            
            const content = `${bankName}-${data[0].bankNumber}-compact2.jpg?amount=${parseInt(data[0].totalAmount)}&addInfo=TT%20HD%20${data[0].orderCode}&accountName=${accountName}`;
            setContentQR(content);
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    const updateStatus = async () => {
        try {
            const { data } = await axios.post(`${API_URL}/updateorderowner`, {
                orderId,
                paymentMethod: selectPayment === 1 ? "Tiền mặt" : "Ngân hàng",
                status: 4
            });

            setIcon(data.success ? "success" : "error");
            setTitle("Đơn hàng đã được xử lý");
            setAlert(true);
            setTimeout(() => router.replace("../owner/(tabs)/order"), 1200);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.heading} onPress={() => router.back()}></Ionicons>
                        <Text style={[TEXT.heading, LAYOUT.ml(70)]}>Thanh toán</Text>
                    </View>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.82)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(80), LAYOUT.itemsCenter]}>
                    <Text style={[TEXT.text, LAYOUT.color(COLORS.heading), LAYOUT.mb(20)]}>Chọn phương thức thanh toán</Text>
                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.gap(8)]}>
                        <TouchableOpacity onPress={() => setSelectPayment(1)} style={[LAYOUT.bg(selectPayment === 1 ? COLORS.background4 : COLORS.background3), LAYOUT.py(6), LAYOUT.rounded(12), LAYOUT.w("48%")]}>
                            <Text style={[TEXT.text, TEXT.size(16), TEXT.center, selectPayment === 1 ? LAYOUT.color(COLORS.textLight) : ""]}>Tiền mặt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectPayment(2)} style={[LAYOUT.bg(selectPayment === 2 ? COLORS.background4 : COLORS.background3), LAYOUT.py(6), LAYOUT.rounded(12), LAYOUT.w("48%")]}>
                            <Text style={[TEXT.text, TEXT.size(16), TEXT.center, selectPayment === 2 ? LAYOUT.color(COLORS.textLight) : ""]}>QR thanh toán</Text>
                        </TouchableOpacity>
                    </View>

                    {selectPayment === 1 ? (<><Text style={[TEXT.text, LAYOUT.my(12)]}>Thanh toán: {formatPrice(userInfo.totalAmount)} đ</Text><Text style={[TEXT.paragraph, TEXT.size(14), LAYOUT.mt(32)]}>Nhấn Hoàn thành để hoàn thành đơn hàng sau khi đã được thanh toán đủ giá trị đơn hàng</Text></>) : (<>
                        <Image source={{ uri: `https://img.vietqr.io/image/${contentQR}` }} style={[LAYOUT.wFull, LAYOUT.h(500), LAYOUT.mt(14), LAYOUT.rounded(8)]} />
                    </>)}

                    <TouchableOpacity onPress={updateStatus} style={[LAYOUT.bg(COLORS.button), LAYOUT.py(8), LAYOUT.rounded(12), LAYOUT.mt(32), LAYOUT.wFull]}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Hoàn thành</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ToastModal status={icon} title={title} content={null} visible={alert} />
        </View>
    );
}