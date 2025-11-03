import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { homeStyles } from "../../assets/styles/home.styles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import CategoryFilter from "../../components/CategoryFilter";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HomeScreen = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categoryLists = [
    {
      id: 1,
      name: "Ăn vặt",
      icon: "fast-food-outline",
    },
    {
      id: 2,
      name: "Món chính",
      icon: "restaurant-outline",
    },
    {
      id: 3,
      name: "Tráng miệng",
      icon: "ice-cream-outline",
    },
    {
      id: 4,
      name: "Thức uống",
      icon: "wine-outline",
    }
  ]

  const loadData = async () => {
    try {
      setLoading(true);

      setCategories(categoryLists);
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !refreshing) return <LoadingSpinner message="Chờ em xíu..." />;

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.header}>
        <View style={homeStyles.headerContent}>
          <TextInput placeholder="Bạn tìm món gì?" style={homeStyles.searchInput} />
          <Ionicons name="options-outline" style={homeStyles.searchIcon}></Ionicons>
          <View style={homeStyles.rightHeader}>
            <Ionicons name="cart-outline" style={homeStyles.rightIcon}></Ionicons>
            <Ionicons name="notifications-outline" style={homeStyles.rightIcon}></Ionicons>
            <Ionicons name="person-outline" style={homeStyles.rightIcon}></Ionicons>
          </View>
        </View>
        <View style={homeStyles.headerMessage}>
          <Text style={homeStyles.heading}>Chào Buổi Sáng</Text>
          <Text style={homeStyles.title}>Thức dậy thôi, đến giờ ăn sáng rồi!</Text>
        </View>
      </View>
      <View style={homeStyles.main}>
        <View style={homeStyles.categories}>
          {categoryLists.map((item, index) => (
            <TouchableOpacity key={item.id} style={{ alignItems: "center" }}>
              <Ionicons style={item.id != 1 ? homeStyles.categoryIcon : homeStyles.categorySelected} name={item.icon}></Ionicons>
              <Text style={homeStyles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
export default HomeScreen;
