import { View, Text, TouchableOpacity, Image, Dimensions, FlatList, TextInput, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { COLORS } from "../../../constants/colors";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { API_URL } from "../../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice, formatImage } from "../../../constants/format";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ToastModal from "../../../components/ToastModal";
import NavBar from "../../../components/NavBar";
import PickerSelect from "../../../components/PickerSelect";

const { width, height } = Dimensions.get("window");

const DishesScreen = () => {
    const [dishes, setDishes] = useState([]);
    const [detailDish, setDetailDish] = useState([]);
    const [isLogin, setIsLogin] = useState(false);

    const [icon, setIcon] = useState(false);
    const [title, setTitle] = useState(false);
    const [alert, setAlert] = useState(false);
    const [options, setOptions] = useState([
        { label: "Chọn danh mục", value: "" }
    ]);

    const [editName, setEditName] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editImage, setEditImage] = useState(null);

    const [addName, setAddName] = useState("");
    const [addCategory, setAddCategory] = useState("");
    const [addPrice, setAddPrice] = useState("");
    const [addDescription, setAddDescription] = useState("");
    const [addImage, setAddImage] = useState(null);

    const [errorName, setErrorName] = useState("");
    const [errorCate, setErrorCate] = useState("");
    const [errorPrice, setErrorPrice] = useState("");

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [role, setRole] = useState(true);

    const [originalDish, setOriginalDish] = useState(null);

    const loadDishes = async () => {
        try {
            setLoading(true);
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            if (JSON.parse(userStr).role === "Employee") { setRole(false); return; }
            else {
                setIsLogin(true);

                const uid = parseInt(JSON.parse(userStr).userId);
                const { data } = await axios.get(`${API_URL}/ownerdish/${uid}`);

                setDishes(data);
                setLoading(false);
            }
        } catch (error) {
            console.log("Lấy danh sách món thất bại :", error);
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

    const loadCategories = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/categories`);
            setOptions([
                ...data.map(c => ({
                    label: c.categoryName,
                    value: c.categoryId
                }))
            ]);

        } catch (error) {
            console.log("Lấy danh mục thất bại: ", error);
        }
    };

    const editDishStatus = async (dishId) => {
        try {
            const { data } = await axios.get(`${API_URL}/ownerdishdetail/${dishId}`);

            setIcon("edit");
            if (data) {
                setOriginalDish(data[0]);

                setDetailDish(data[0]);
                setEditName(data[0].dishName);
                setEditCategory(data[0].categoryId);
                setEditPrice(data[0].price.toString());
                setEditDescription(data[0].description);
                setEditImage(data[0].imageUrl);
                setTitle("Cập nhật thông tin món");
            } else {
                setIcon("error");
                setTitle(`Lấy thông tin món #MA2640${dishId} thất bại`);
            }
            setAlert(true);
        } catch (error) {
            console.log("Lấy chi tiết món thất bại: ", error);
        }
    };

    const isDishChanged = () => {
        if (!originalDish) return false;

        if (editName !== originalDish.dishName) return true;
        if (Number(editCategory) !== Number(originalDish.categoryId)) return true;
        if (Number(editPrice) !== Number(originalDish.price)) return true;
        if ((editDescription || "") !== (originalDish.description || "")) return true;

        if (typeof editImage === "object") return true;

        return false;
    };

    const contentEdit = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.mt(12)]}>
                <Text style={[TEXT.text, LAYOUT.borderb(1, COLORS.background3), LAYOUT.pb(2), LAYOUT.mb(8)]}>#MA264{detailDish.dishId}</Text>

                <Text style={[TEXT.text, TEXT.size(16)]}>Tên món ăn</Text>
                <TextInput value={editName} onChangeText={setEditName} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Danh mục</Text>
                <PickerSelect options={options} value={editCategory} setValue={setEditCategory} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Giá bán</Text>
                <TextInput value={editPrice} onChangeText={setEditPrice} keyboardType="numeric" style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Mô tả</Text>
                <TextInput value={editDescription} onChangeText={setEditDescription} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Hình ảnh</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(8), LAYOUT.mb(4), { overflow: "hidden" }]}>
                    <TouchableOpacity onPress={() => pickFile("edit")} style={[LAYOUT.w(100), LAYOUT.border(1, COLORS.border), LAYOUT.bg("rgba(0,0,0,0.1)"), LAYOUT.py(4), LAYOUT.rounded(12)]}>
                        <Text style={[TEXT.paragraph, TEXT.center, TEXT.itemsCenter]}>Chọn ảnh mới</Text>
                    </TouchableOpacity>
                    <Image source={
                        typeof editImage === "string"
                            ? formatImage(editImage)
                            : editImage?.uri
                                ? { uri: editImage.uri }
                                : null
                    } style={[LAYOUT.w(50), LAYOUT.h(50)]} />
                    {editImage && <Text style={[TEXT.paragraph, TEXT.size(14)]} numberOfLines={1}>{editImage ? editImage.name : ""}</Text>}
                </View>

                <Text style={[TEXT.text, TEXT.size(16)]}>Trạng thái</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.px(14), LAYOUT.py(10), LAYOUT.border(1, COLORS.border), LAYOUT.rounded(12), LAYOUT.mb(4)]}>
                    <Text style={[TEXT.subText, TEXT.center, TEXT.size(16), LAYOUT.color(detailDish.status !== "Active" ? COLORS.button : "#73AF6F")]}>{detailDish.status === "Active" ? "Đang kinh doanh" : "Ngừng kinh doanh"}</Text>
                </View>

                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mt(20), LAYOUT.bordert(1, COLORS.background3), LAYOUT.pt(20), LAYOUT.mt(8)]}>
                    <TouchableOpacity style={[LAYOUT.w("48%"), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background2)]} onPress={clearForm}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.paragraph)]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[LAYOUT.w("48%"), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.bg(COLORS.button)]} onPress={() => submitUpdate(detailDish.dishId)}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const addDish = async () => {
        try {
            if (addName.trim() === "" || addCategory === null || addCategory === undefined || addPrice === null || addPrice === undefined) {
                setErrorName("Chưa nhập tên món ăn");
                setErrorCate("Chưa chọn danh mục món ăn");
                setErrorPrice("Chưa nhập giá bán món ăn");
            } else {
                let base64Image = null;

                if (addImage && addImage.uri) {
                    const isPng = addImage.mimeType === "image/png";
                    const format = isPng
                        ? ImageManipulator.SaveFormat.PNG
                        : ImageManipulator.SaveFormat.JPEG;

                    const manipulatedImage = await ImageManipulator.manipulateAsync(
                        addImage.uri,
                        [{ resize: { width: 400 } }],
                        {
                            compress: isPng ? 1 : 0.6,
                            format: format,
                            base64: true
                        }
                    );

                    const prefix = isPng ? "data:image/png" : "data:image/jpeg";
                    base64Image = `${prefix};base64,${manipulatedImage.base64}`;
                }

                const userStr = await SecureStore.getItemAsync("userInfo");

                const uid = parseInt(JSON.parse(userStr).userId);
                const { data } = await axios.post(`${API_URL}/owneradddish`, {
                    dishName: addName, userId: uid, categoryId: addCategory, price: addPrice, description: addDescription, image: base64Image
                });

                setIcon(data.success ? "success" : "error");
                setTitle(data.message);
                setAlert(true);

                setTimeout(() => setAlert(false), 1100);
            }
        } catch (error) {
            console.log("Thêm món thất bại: ", error);
        }
    };

    const contentAdd = () => {
        return (
            <View style={[LAYOUT.wFull, LAYOUT.mt(12)]}>
                <Text style={[TEXT.text, TEXT.size(16)]}>Tên món ăn <Text style={[LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput value={addName} onChangeText={setAddName} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} />
                <Text style={[TEXT.paragraph, TEXT.size(12), LAYOUT.color(COLORS.heading), LAYOUT.mb(4)]}>{errorName}</Text>

                <Text style={[TEXT.text, TEXT.size(16)]}>Danh mục <Text style={[LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <PickerSelect options={options} value={addCategory} setValue={setAddCategory} />
                <Text style={[TEXT.paragraph, TEXT.size(12), LAYOUT.color(COLORS.heading), LAYOUT.mb(4)]}>{errorCate}</Text>

                <Text style={[TEXT.text, TEXT.size(16)]}>Giá bán <Text style={[LAYOUT.color(COLORS.heading)]}>*</Text></Text>
                <TextInput value={addPrice} onChangeText={setAddPrice} keyboardType="number-pad" style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} />
                <Text style={[TEXT.paragraph, TEXT.size(12), LAYOUT.color(COLORS.heading), LAYOUT.mb(4)]}>{errorPrice}</Text>

                <Text style={[TEXT.text, TEXT.size(16)]}>Mô tả</Text>
                <TextInput value={addDescription} onChangeText={setAddDescription} style={[TEXT.subText, TEXT.size(16), LAYOUT.wFull, LAYOUT.border(1, COLORS.border), LAYOUT.px(14), LAYOUT.py(10), LAYOUT.rounded(12), LAYOUT.mb(4)]} />

                <Text style={[TEXT.text, TEXT.size(16)]}>Hình ảnh</Text>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(8), LAYOUT.mb(6), { overflow: "hidden" }]}>
                    <TouchableOpacity onPress={() => pickFile("add")} style={[LAYOUT.w(100), LAYOUT.border(1, COLORS.border), LAYOUT.bg("rgba(0,0,0,0.1)"), LAYOUT.py(4), LAYOUT.rounded(12)]}>
                        <Text style={[TEXT.paragraph, TEXT.center, TEXT.itemsCenter]}>Chọn ảnh</Text>
                    </TouchableOpacity>
                    <Text style={[TEXT.paragraph, TEXT.size(14)]} numberOfLines={1}>{addImage ? addImage.name : ""}</Text>
                </View>

                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.mt(20), LAYOUT.bordert(1, COLORS.background3), LAYOUT.pt(20), LAYOUT.mt(8)]}>
                    <TouchableOpacity style={[LAYOUT.w("48%"), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.bg(COLORS.background2)]} onPress={clearForm}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.paragraph)]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[LAYOUT.w("48%"), LAYOUT.py(4), LAYOUT.rounded(12), LAYOUT.bg(COLORS.button)]} onPress={() => addDish()}>
                        <Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.textLight)]}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const pickFile = async (type) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*"],
            copyToCacheDirectory: true
        });

        if (result.canceled) return;

        const file = result.assets[0];

        if (type === "edit") setEditImage(file);
        else setAddImage(file);
    };

    const submitUpdate = async (dishId) => {
        if (!isDishChanged()) {
            setIcon("warning");
            setTitle("Bạn chưa thay đổi thông tin nào");
            setAlert(true);

            setTimeout(() => setAlert(false), 1200);
            return;
        }
        try {
            let base64Image = null;

            if (editImage && editImage.uri) {
                const isPng = editImage.mimeType === "image/png";
                const format = isPng
                    ? ImageManipulator.SaveFormat.PNG
                    : ImageManipulator.SaveFormat.JPEG;

                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    editImage.uri,
                    [{ resize: { width: 400 } }],
                    {
                        compress: isPng ? 1 : 0.6,
                        format: format,
                        base64: true
                    }
                );

                const prefix = isPng ? "data:image/png" : "data:image/jpeg";
                base64Image = `${prefix};base64,${manipulatedImage.base64}`;
            }

            const { data } = await axios.post(`${API_URL}/updatedishinfo`,
                {
                    dishId,
                    dishName: editName,
                    categoryId: editCategory,
                    price: editPrice,
                    description: editDescription,
                    image: base64Image
                }
            );

            setIcon(data.success ? "success" : "error");
            setTitle(data.message);
            setAlert(true);

            setTimeout(() => {
                setAlert(false);
                loadDishes();
            }, 1100);

        } catch (e) {
            console.log(e);
        }
    };

    const clearForm = () => {
        setAddName(null);
        setAddCategory(null);
        setAddPrice(null);
        setAddDescription(null);
        setAddImage(null);

        setEditName(null);
        setEditCategory(null);
        setEditPrice(null);
        setEditDescription(null);
        setEditImage(null);

        setAlert(false);
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDishes().finally(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        loadDishes();
        loadCategories();
    }, []);

    return (
        <View style={[LAYOUT.container]}>
            <NavBar isLogin={isLogin} heading={"Thực đơn"} />
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.77), { overflow: "hidden" }]}>
                {loading ? <LoadingSpinner /> : !role ? (<View style={[LAYOUT.justifyCenter, LAYOUT.itemsCenter, LAYOUT.h(height * 2 / 3), LAYOUT.w(width), LAYOUT.gap(14)]}><Ionicons name="ban" size={44} color={COLORS.heading}></Ionicons><Text style={[TEXT.text, TEXT.center, LAYOUT.color(COLORS.heading)]}>Chức năng dành cho chủ quán</Text></View>)
                    : (
                        <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.pb(0)]}>
                            <TouchableOpacity onPress={() => (setIcon("add"), setTitle("Thêm món mới"), setAlert(true))} style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.gap(4), LAYOUT.mb(20), LAYOUT.pb(2), LAYOUT.borderb(1, COLORS.background3)]}>
                                <Ionicons name="add-outline" color={COLORS.button} size={16}></Ionicons>
                                <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>Thêm món</Text>
                            </TouchableOpacity>
                            {dishes.length === 0 ? <Text style={[TEXT.paragraph, TEXT.center]}>Danh sách trống</Text> :
                                (<FlatList
                                    style={[LAYOUT.mb(50)]}
                                    data={dishes}
                                    keyExtractor={(item) => item.dishId.toString()}
                                    numColumns={1}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                    }
                                    renderItem={({ item }) => {
                                        return (
                                            <View
                                                style={[
                                                    LAYOUT.wFull,
                                                    LAYOUT.mb(20),
                                                    LAYOUT.row,
                                                    LAYOUT.justifyBetween,
                                                    LAYOUT.pb(12),
                                                    LAYOUT.borderb(1, COLORS.background4),
                                                    { borderStyle: "dashed" }
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
                                                            <Ionicons name={item.status === "Active" ? "download-outline" : "share-outline"} size={14} color={COLORS.heading}></Ionicons>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                        <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>
                                                            {formatPrice(item.price)} đ
                                                        </Text>
                                                        <TouchableOpacity onPress={() => editDishStatus(item.dishId)}
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
                                                            <Ionicons name="create-outline" size={14} color={COLORS.textLight}></Ionicons>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.mt(6)]}>
                                                        <Text style={[TEXT.subText, { color: item.status !== "Active" ? COLORS.heading : "#73AF6F" }]}>
                                                            {item.status === "Active" ? "Đang kinh doanh" : "Ngưng kinh doanh"}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    }}
                                />
                                )
                            }
                        </View>
                    )}
            </View>
            <ToastModal status={icon} title={title} content={icon === "edit" ? contentEdit : icon === "add" ? contentAdd : null} visible={alert} />
        </View>
    );
};

export default DishesScreen;