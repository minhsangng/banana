import { useEffect, useState, } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import CategoryFilter from "../components/CategoryFilter";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/api";
import axios from "axios";

const { width } = Dimensions.get("window");

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(-1);

    const loadCategories = async () => {
        const { data } = await axios.get(`${API_URL}/categories`);
        setCategories(data);
    }

    const loadData = async () => {
        try {
            await loadCategories();
        } catch (error) {
            console.log("Error loading the data", error);
        } 
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <>
            <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(12), LAYOUT.pb(10), LAYOUT.borderb(1, COLORS.background3), LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, homeStyles.categories]}>
                {categories.map((item) => (
                    <TouchableOpacity key={item.categoryId} style={[LAYOUT.w(75), LAYOUT.roundedtl(28), LAYOUT.roundedtr(28), { overflow: "hidden" }]} onPress={() => setCurrentCategory(item.categoryId === currentCategory ? -1 : item.categoryId)}>
                        <View style={[LAYOUT.pt(10), LAYOUT.pb(4), LAYOUT.itemsCenter, { backgroundColor: item.categoryId === currentCategory ? COLORS.light : "transparent" }]}>
                            <Ionicons style={[LAYOUT.p(10), LAYOUT.rounded(50), TEXT.size(32), homeStyles.categoryIcon, item.categoryId === currentCategory ? homeStyles.categorySelected : ""]} name={item.categoryIcon}></Ionicons>
                            <Text style={[LAYOUT.mt(4), TEXT.subText]}>{item.categoryName}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <CategoryFilter categoryId={currentCategory} visible={currentCategory !== -1} />
        </>
    );
};

export default Categories;