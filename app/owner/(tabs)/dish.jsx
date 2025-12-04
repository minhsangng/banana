import { View, Text, TouchableOpacity, Image, Dimensions, FlatList, TextInput, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { API_URL } from "../../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { formatPrice, formatImage } from "../../../constants/format";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as DocumentPicker from 'expo-document-picker';
import LoadingSpinner from "../../../components/LoadingSpinner";
import ToastModal from "../../../components/ToastModal";
import NavBar from "../../../components/NavBar";

const { width, height } = Dimensions.get("window");

const DishesScreen = () => {
    const router = useRouter();
    const [dishes, setDishes] = useState([]);
    const [detailDish, setDetailDish] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [userId, setUserId] = useState(0);
    const [file, setFile] = useState(null);
    const [icon, setIcon] = useState(false);
    const [title, setTitle] = useState(false);
    const [alert, setAlert] = useState(false);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadDishes = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            setIsLogin(true);

            const uid = parseInt(JSON.parse(userStr).userId);
            setUserId(uid);
            const { data } = await axios.get(`${API_URL}/ownerdish/${userId}`);

            setDishes(data);
            setLoading(false);
        } catch (error) {
            console.log("Lỗi API orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (dishId, status) => {
        try {
            const { data } = await axios.get(`${API_URL}/ownerupdatestatusdish/${dishId}/${status === "Active" ? "Inactive" : "Active"}`);

            setIcon(data.success ? "success" : "error");
            setTitle(data.message);

            setAlert(true);
            setTimeout(() => (setAlert(false), loadDishes()), 1000);
        } catch (error) {
            console.error(error);
        }
    };

    const editStatus = async (dishId) => {
        try {
            const { data } = await axios.get(`${API_URL}/ownerdishdetail/${dishId}`);

            setIcon("handle");
            if (data) {
                setDetailDish(data[0]);

                setTitle("Cập nhật thông tin #MA2640" + dishId);
            } else {
                setTitle(`Lấy thông tin món #MA2640${dishId} thất bại`);
            }
            setAlert(true);
        } catch (error) {
            console.error(error);
        }
    };

    const contentEdit = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.mt(12)]}>
                <Text style={[TEXT.text, TEXT.size(16)]}>Tên món ăn</Text>
                <TextInput placeholder={detailDish.dishName} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(10), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Danh mục</Text>
                <TextInput placeholder={detailDish.categoryName} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(10), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Giá bán</Text>
                <TextInput placeholder={detailDish.price} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(10), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Mô tả</Text>
                <TextInput placeholder={detailDish.description} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(10), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Hình ảnh</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(8), LAYOUT.mb(4)]}>
                    <TouchableOpacity onPress={() => pickFile()}>
                        <Text style={[TEXT.paragraph, TEXT.size(16), LAYOUT.border(1, COLORS.border), LAYOUT.px(10), LAYOUT.py(4), LAYOUT.rounded(12)]}>Chọn ảnh</Text>
                    </TouchableOpacity>
                    <Text style={[TEXT.paragraph, TEXT.size(16)]}>{file ? file.name : detailDish.dishName}</Text>
                </View>

                <Text style={[TEXT.text, TEXT.size(16)]}>Trạng thái</Text>
                <TextInput placeholder={detailDish.status} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(10), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mt(20)]}>
                    <TouchableOpacity style={[LAYOUT.w("48%"), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background2)]} onPress={() => setAlert(false)}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.paragraph)]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[LAYOUT.w("48%"), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.bg(COLORS.button)]}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*"
        });

        if (result.type !== "cancel") {
            setFile(result.assets[0]);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDishes().finally(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        loadDishes();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <View style={[LAYOUT.container]}>
            <NavBar isLogin={isLogin} heading={"Thực đơn"} />
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.77), { overflow: "hidden" }]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(0)]}>
                    {dishes.length === 0 ? <Text style={[TEXT.paragraph, TEXT.center]}>Danh sách trống</Text> :
                        (<FlatList
                            data={dishes}
                            keyExtractor={(item) => item.dishId.toString()}
                            numColumns={1}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity onPress={() => router.push(`../../detaildish/${item.dishId}`)}
                                        style={[
                                            LAYOUT.wFull,
                                            LAYOUT.mb(20),
                                            LAYOUT.row,
                                            LAYOUT.justifyBetween,
                                            LAYOUT.pb(12),
                                            LAYOUT.borderb(1, COLORS.background4)
                                        ]}
                                    >
                                        <Image
                                            source={formatImage(item.imageUrl)}
                                            style={[
                                                LAYOUT.w(80),
                                                LAYOUT.h(110),
                                                LAYOUT.rounded(20),
                                                LAYOUT.border(1, COLORS.border),
                                                { overflow: "hidden" }
                                            ]}
                                        />

                                        <View style={[LAYOUT.ml(12)]}>
                                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(12)]}>
                                                <Text style={[TEXT.text, LAYOUT.w("50%")]} numberOfLines={1}>
                                                    {item.dishName}
                                                </Text>
                                                <TouchableOpacity onPress={() => updateStatus(item.dishId, item.status)}
                                                    style={[
                                                        LAYOUT.px(10), LAYOUT.py(4),
                                                        LAYOUT.w(70),
                                                        LAYOUT.rounded(22),
                                                        LAYOUT.bg(COLORS.background3),
                                                        LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.gap(4)
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            TEXT.text,
                                                            TEXT.size(16),
                                                            TEXT.center,
                                                            LAYOUT.color(COLORS.heading)
                                                        ]}
                                                    >
                                                        {item.status === "Active" ? "Khóa" : "Mở"}
                                                    </Text>
                                                    <Ionicons name={item.status === "Active" ? "download-outline" : "share-outline"} color={COLORS.heading}></Ionicons>
                                                </TouchableOpacity>
                                            </View>

                                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>
                                                    {formatPrice(item.price)} đ
                                                </Text>
                                                <TouchableOpacity onPress={() => editStatus(item.dishId)}
                                                    style={[
                                                        LAYOUT.px(10), LAYOUT.py(4),
                                                        LAYOUT.w(70),
                                                        LAYOUT.rounded(22),
                                                        LAYOUT.bg(COLORS.button),
                                                        LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter, LAYOUT.gap(4)
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            TEXT.text,
                                                            TEXT.size(16),
                                                            TEXT.center,
                                                            LAYOUT.color(COLORS.textLight)
                                                        ]}
                                                    >
                                                        Sửa
                                                    </Text>
                                                    <Ionicons name="build-outline" color={COLORS.textLight}></Ionicons>
                                                </TouchableOpacity>
                                            </View>

                                            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                <Text style={[TEXT.subText, { color: item.status !== "Active" ? COLORS.heading : "#73AF6F" }]}>
                                                    {item.status === "Active" ? "Đang kinh doanh" : "Ngưng kinh doanh"}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        )
                    }
                </View>
            </View>
            <ToastModal width={"auto"} height={"auto"} status={icon} title={title} content={icon === "handle" ? contentEdit : null} visible={alert} />
        </View>
    );
};

export default DishesScreen;
