import { View, Text, TouchableOpacity, Image, TextInput, Dimensions, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { COLORS } from "../../constants/colors";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatImage, formatPrice } from "../../constants/format";
import { API_URL } from "../../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import ToastModal from "../../components/ToastModal";

const { width, height } = Dimensions.get("window");

const SERVICES_FEE = 0;

export default function OrderDetailScreen() {
    const { id: orderId } = useLocalSearchParams();
    const [order, setOrder] = useState(null);
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("");
    const [reviews, setReviews] = useState({});

    const [deleteId, setDeleteId] = useState(0);

    const [icon, setIcon] = useState(false);
    const [title, setTitle] = useState(false);
    const [content, setContent] = useState(null);
    const [alert, setAlert] = useState(false);

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loadOrderDetail = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            const user = JSON.parse(userStr);
            setUserId(user.userId);
            setRole(user.role);

            const { data } = await axios.get(`${API_URL}/orderdetail/${orderId}`);
            setOrder(data[0]);

            setLoading(false);
        } catch (error) {
            console.log("Lỗi không thể kết nối API ", error);
        }
    }

    const hasUnReviewedItem = order?.items.some(item => !item.isReviewed);

    const handleRate = (dishId, star) => {
        setReviews(prev => ({
            ...prev,
            [dishId]: {
                rating: star,
                content: prev[dishId]?.content || "",
            },
        }));
    };

    const handleContentChange = (dishId, text) => {
        setReviews(prev => ({
            ...prev,
            [dishId]: {
                rating: prev[dishId]?.rating || 0,
                content: text,
            },
        }));
    };

    const contentCancelAlert = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.justifyCenter, LAYOUT.mt(16)]}>
                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.wFull]}>
                    <TouchableOpacity onPress={() => setAlert(false)} style={[LAYOUT.w(150), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.background3 }]}>
                        <Text style={[TEXT.text, TEXT.center, { color: COLORS.button }]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCancer()} style={[LAYOUT.w(150), LAYOUT.py(6), LAYOUT.rounded(20), { backgroundColor: COLORS.button }]}>
                        <Text style={[TEXT.text, TEXT.center, { color: COLORS.textLight }]}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View >
        );
    };

    const cancelOrder = (orderId) => {
        setAlert(true);
        setDeleteId(orderId);
    }

    const handleCancer = async () => {
        try {
            setAlert(false);

            const { data } = await axios.get(`${API_URL}/cancelorder/${deleteId}`);

            if (data.success) {
                await axios.post(`${API_URL}/pushnotification`, {
                    userId: userId,
                    title: "Banana - Hủy đơn",
                    content: data.message,
                    metadata: {}
                });
            }

            setIcon(data.success ? "success" : "error");
            setTitle(data.success ? "Hủy đơn thành công" : "Hủy đơn thất bại");
            setContent(null);
            setAlert(true);

            setTimeout(() => {
                setAlert(false);
                router.back();
            }, 1100);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReview = async () => {
        const payload = Object.entries(reviews).map(([dishId, value]) => ({
            dishId: Number(dishId),
            rating: value.rating,
            content: value.content,
            orderId,
            userId,
        }));

        const { data } = await axios.post(`${API_URL}/addreview`, payload);

        if (data.success)
            setOrder(prev => ({
                ...prev,
                items: prev.items.map(item => ({
                    ...item,
                    isReviewed: true,
                })),
            }));

        setIcon(data.success ? "success" : "error");
        setTitle(data.message);
        setAlert(true);

        setTimeout(() => {
            setReviews([]);
            setAlert(false);
        }, 1100);
    };

    useEffect(() => {
        loadOrderDetail();
    }, []);

    if (loading || !order) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                    <View style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.heading} onPress={() => router.back()}></Ionicons>
                        <Text style={[TEXT.heading, LAYOUT.ml(60)]}>Chi Tiết Đơn</Text>
                    </View>
                </View>
            </View>
            <View key={order.orderId} style={[LAYOUT.main, LAYOUT.h(height * 0.85)]}>
                <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(32)]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={[LAYOUT.pb(80)]}>
                            <View style={[LAYOUT.borderb(1, COLORS.background4), LAYOUT.pb(12)]}>
                                <Text style={[TEXT.text]}>#{order.orderCode}</Text>
                                <Text style={[TEXT.paragraph]}>{order.orderDate.toString().slice(0, 10)}, {order.orderDate.toString().slice(11, 16)}</Text>
                            </View>

                            {/* Dish items */}
                            <View style={[LAYOUT.py(32)]}>
                                {order.items.map((item) => (
                                    <View
                                        key={item.orderItemId}
                                        style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.borderb(1, COLORS.background4), LAYOUT.pb(12), LAYOUT.mb(12)]}
                                    >
                                        <Image
                                            source={formatImage(item.dishImage)}
                                            style={[
                                                LAYOUT.w(80),
                                                LAYOUT.h(80),
                                                LAYOUT.rounded(20),
                                                LAYOUT.border(1, COLORS.border),
                                                LAYOUT.overflowHidden,
                                            ]}
                                        />

                                        <View>
                                            <View style={[LAYOUT.row, LAYOUT.justifyBetween]}>
                                                <Text style={[TEXT.text, LAYOUT.w("50%")]} numberOfLines={1}>
                                                    {item.dishName}
                                                </Text>
                                                <View>
                                                    <Text style={[TEXT.text, TEXT.size(16), TEXT.right]}>
                                                        {formatPrice(item.dishPrice * item.quantity)} đ
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween]}>
                                                <Text style={[TEXT.text, { color: COLORS.heading }]}>
                                                    {formatPrice(item.dishPrice)} đ
                                                </Text>

                                                <View>
                                                    <Text style={[TEXT.text]}>x{item.quantity}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Fees */}
                            <View style={[LAYOUT.borderb(1, COLORS.background4), LAYOUT.mb(12), { borderStyle: "dashed" }]}>
                                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                                    <Text style={[TEXT.text]}>Tạm tính</Text>
                                    <Text style={[TEXT.text]}>{formatPrice(order.totalAmount)} đ</Text>
                                </View>
                                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                                    <Text style={[TEXT.text]}>Phí dịch vụ</Text>
                                    <Text style={[TEXT.text]}>{formatPrice(SERVICES_FEE)} đ</Text>
                                </View>
                            </View>

                            {/* Total amount */}
                            <View>
                                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyBetween, LAYOUT.mb(12)]}>
                                    <Text style={[TEXT.text, TEXT.size(22)]}>Tổng tiền</Text>
                                    <Text style={[TEXT.text, TEXT.size(22)]}>{formatPrice(order.totalAmount + SERVICES_FEE)} đ</Text>
                                </View>
                            </View>

                            {/* Re-Order */}
                            {(order.orderStatus === "Hoàn thành" || order.orderStatus === "Bị hủy") && role === "Customer" && <View style={[LAYOUT.wFull, LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.mt(22)]}>
                                <TouchableOpacity style={[LAYOUT.rounded(12), LAYOUT.py(6), LAYOUT.wFull, { backgroundColor: COLORS.background4 }]}>
                                    <Text style={[TEXT.text, TEXT.center]}>Đặt lại</Text>
                                </TouchableOpacity>
                            </View>
                            }

                            {/* Cancel */}
                            {(order.orderStatus === "Đang chờ" || order.orderStatus === "Đang chuẩn bị") && role === "Customer" && <View style={[LAYOUT.wFull, LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.mt(22)]}>
                                <TouchableOpacity onPress={() => (setIcon("warning"), setTitle("Xác nhận hủy đơn hàng này"), setContent(contentCancelAlert), cancelOrder(order.orderId))} style={[LAYOUT.rounded(12), LAYOUT.py(6), LAYOUT.wFull, { backgroundColor: COLORS.background4 }]}>
                                    <Text style={[TEXT.text, TEXT.center]}>Hủy đơn</Text>
                                </TouchableOpacity>
                            </View>
                            }

                            {/* Review */}
                            {(hasUnReviewedItem && role === "Customer" && order.orderStatus === "Hoàn thành") && (<View style={[LAYOUT.mt(22), LAYOUT.bordert(1, COLORS.border), LAYOUT.pt(22)]}>
                                <Text style={[TEXT.text, TEXT.size(22), LAYOUT.mb(20)]}>
                                    Đánh giá đơn hàng
                                </Text>

                                {order.items.map(item => {
                                    if (item.isReviewed) return null;

                                    const rating = reviews[item.dishId]?.rating || 0;
                                    const content = reviews[item.dishId]?.content || "";

                                    return (
                                        <View key={item.dishId} style={[LAYOUT.mb(14)]}>
                                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.gap(8)]}>
                                                <Text style={[TEXT.text, LAYOUT.mb(8), LAYOUT.w("50%")]} numberOfLines={1}>
                                                    {item.dishName}
                                                </Text>

                                                <View style={[LAYOUT.row, LAYOUT.gap(8), LAYOUT.mb(8)]}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <TouchableOpacity
                                                            key={star}
                                                            onPress={() => handleRate(item.dishId, star)}
                                                        >
                                                            <Ionicons
                                                                name={star <= rating ? "star" : "star-outline"}
                                                                size={22}
                                                                color={COLORS.button}
                                                            />
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>

                                            <View>
                                                <TextInput
                                                    placeholder="Để lại nhận xét (không quá 100 kí tự)"
                                                    value={content}
                                                    onChangeText={(text) =>
                                                        handleContentChange(item.dishId, text)
                                                    }
                                                    maxLength={100}
                                                    multiline
                                                    style={[
                                                        TEXT.text,
                                                        TEXT.size(16),
                                                        LAYOUT.color(COLORS.paragraph),
                                                        LAYOUT.border(1, COLORS.border),
                                                        LAYOUT.rounded(12),
                                                        LAYOUT.px(18),
                                                        LAYOUT.py(12),
                                                    ]}
                                                />

                                                <Text
                                                    style={[
                                                        TEXT.subText,
                                                        TEXT.right,
                                                        LAYOUT.color(
                                                            content.length >= 90
                                                                ? "red"
                                                                : COLORS.paragraph
                                                        ),
                                                        LAYOUT.mt(4),
                                                    ]}
                                                >
                                                    {content.length}/100
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}

                                <TouchableOpacity
                                    onPress={handleReview}
                                    style={[
                                        LAYOUT.mt(14),
                                        LAYOUT.wFull,
                                        LAYOUT.py(8),
                                        LAYOUT.rounded(12),
                                        LAYOUT.bg(COLORS.button),
                                    ]}
                                >
                                    <Text
                                        style={[
                                            TEXT.text,
                                            TEXT.center,
                                            LAYOUT.color(COLORS.textLight),
                                        ]}
                                    >
                                        Xác nhận
                                    </Text>
                                </TouchableOpacity>
                            </View>)}

                        </View>
                    </ScrollView>
                </View>
            </View >

            <ToastModal status={icon} title={title} content={content} visible={alert} />
        </View >
    );
};
