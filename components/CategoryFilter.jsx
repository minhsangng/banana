import { View, ScrollView, Text, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";
import LoadingSpinner from "../components/LoadingSpinner";

const { height } = Dimensions.get("window");

export default function CategoryFilter({ categoryId, visible }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadDishByCategoryId = async () => {
            try {
                if (categoryId !== -1) {
                    setLoading(true);
                    const response = await fetch(`http://192.168.1.171:5001/api/category/${categoryId}`);
                    const results = await response.json();
                    setData(results);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.log("Lỗi không thể kết nối API", error);
            } finally {
                setLoading(false);
            }
        }

        loadDishByCategoryId();
    }, [categoryId]);

    if (!visible) return null;

    if (loading)
        return (
            <View style={[LAYOUT.main, { height: height * 0.57 }]}>
                <LoadingSpinner message="Đợi móc con API cái..." />
            </View>
        );

    return (
        <View style={[LAYOUT.main, { height: height * 0.57 }]}>
            <ScrollView style={[LAYOUT.py(12)]}>
                {data.length === 0 ? (
                    <Text style={[TEXT.paragraph, { textAlign: "center" }]}>Không có món nào</Text>
                ) : (
                    data.map((d) => (
                        <View key={d.dishId}>
                            <Text style={[TEXT.paragraph]}>{d.dishName}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
