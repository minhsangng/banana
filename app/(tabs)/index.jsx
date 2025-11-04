import { useEffect, useState, useRef } from "react";
import { View, ScrollView, TextInput, Text, ImageBackground, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { useFonts } from "expo-font";
import { homeStyles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../../components/LoadingSpinner";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [currentCategory, setCurrentCategory] = useState(0);
  const [fontLoader] = useFonts({
    "Modak": require("../../assets/fonts/DFVN-Modak.ttf"),
    "GochiHand": require("../../assets/fonts/DFVN-GochiHand.ttf"),
  });

  const categoryLists = [
    {
      id: 0,
      name: "Ăn vặt",
      icon: "fast-food-outline",
    },
    {
      id: 1,
      name: "Món chính",
      icon: "restaurant-outline",
    },
    {
      id: 2,
      name: "Tráng miệng",
      icon: "ice-cream-outline",
    },
    {
      id: 3,
      name: "Thức uống",
      icon: "wine-outline",
    }
  ]

  const slides = [
    {
      id: 0,
      heading: "Thử ngay món mới",
      discount: "-30%",
      image: require("../../assets/images/bannerAds.png")
    },
    {
      id: 1,
      heading: "Happy hour",
      discount: "-25%",
      image: require("../../assets/images/bannerAds.png")
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

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

    const slideInterval = setInterval(() => {
      handleNext();
    }, 3000);

    updateGreeting();
    const greetingInterval = setInterval(updateGreeting, 60 * 1000);
    return () => {
      clearInterval(slideInterval);
      clearInterval(greetingInterval);
    };
  }, []);

  const updateGreeting = () => {
    let hour = new Date().getHours();

    if (hour >= 6 && hour <= 10)
      setGreeting("Chào buổi sáng");
    else if (hour > 10 && hour <= 13)
      setGreeting("Chào buổi trưa");
    else if (hour > 13 && hour <= 18)
      setGreeting("Chào buổi chiều");
    else if (hour > 18 && hour <= 22)
      setGreeting("Chào buổi tối");
    else setGreeting("Chúc ngủ ngon");
  };

  if ((loading && !refreshing) || !fontLoader) return <LoadingSpinner message="Chờ xíu..." />;

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
          <Text style={homeStyles.heading}>{greeting}</Text>
          <Text style={homeStyles.title}>Thức dậy thôi, đến giờ ăn sáng rồi!</Text>
        </View>
      </View>
      <ScrollView style={homeStyles.main}>
        <View style={homeStyles.categories}>
          {categories.map((item, index) => (
            <TouchableOpacity key={item.id} style={{ alignItems: "center" }} onPress={() => setCurrentCategory(item.id)}>
              <Ionicons style={[homeStyles.categoryIcon, item.id === currentCategory ? homeStyles.categorySelected : ""]} name={item.icon}></Ionicons>
              <Text style={homeStyles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={homeStyles.bestSellerSection}>
          <View style={homeStyles.bestSellerTop}>
            <Text style={homeStyles.bestSellerTitle}>Best seller</Text>
            <Text style={homeStyles.bestSellerSeeAll}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
          </View>
          <View style={homeStyles.bestSellerDishes}>
            <View style={homeStyles.bestSellerCard}>
              <ImageBackground style={homeStyles.bestSellerImage} source={require("../../assets/images/lamb.png")} >
                <Text style={homeStyles.bestSellerNameDish}>Cơm...</Text>
              </ImageBackground>
            </View>
            <View style={homeStyles.bestSellerCard}>
              <ImageBackground style={homeStyles.bestSellerImage} source={require("../../assets/images/lamb.png")} >
                <Text style={homeStyles.bestSellerNameDish}>Cơm...</Text>
              </ImageBackground>
            </View>
            <View style={homeStyles.bestSellerCard}>
              <ImageBackground style={homeStyles.bestSellerImage} source={require("../../assets/images/lamb.png")} >
                <Text style={homeStyles.bestSellerNameDish}>Cơm...</Text>
              </ImageBackground>
            </View>
            <View style={homeStyles.bestSellerCard}>
              <ImageBackground style={homeStyles.bestSellerImage} source={require("../../assets/images/lamb.png")} >
                <Text style={homeStyles.bestSellerNameDish}>Cơm...</Text>
              </ImageBackground>
            </View>
          </View>
        </View>

        <View>
          <FlatList style={{ width: width - 60, marginHorizontal: "auto" }}
            data={slides}
            ref={flatListRef}
            horizontal
            onScroll={handleScroll}
            pagingEnabled
            decelerationRate="fast"
            snapToAlignment="center"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={homeStyles.advertiseSection}>
                <ImageBackground source={slides[currentIndex].image} style={homeStyles.advertiseImage}>
                  <View style={{ position: "absolute", top: 30, left: 15, alignItems: "center" }}>
                    <Text style={{ fontSize: 16, fontFamily: "GochiHand", color: COLORS.textLight }}>{slides[currentIndex].heading}</Text>
                    <Text style={{ fontSize: 40, fontFamily: "Modak", color: COLORS.textLight }}>{slides[currentIndex].discount}</Text>
                  </View>
                </ImageBackground>

                <View style={homeStyles.dotsContainer}>
                  {slides.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        homeStyles.dot,
                        { opacity: index === currentIndex ? 1 : 0.3 },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          >
          </FlatList>
        </View>

        <View style={homeStyles.recommendSection}>
          <View style={homeStyles.recommendTop}>
            <Text style={homeStyles.recommendTitle}>Dành cho bạn</Text>
            <Text style={homeStyles.recommendSeeAll}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
          </View>
          <View style={homeStyles.recommendDishes}>
            <View style={homeStyles.recommendCard}>
              <ImageBackground style={homeStyles.recommendImage} source={require("../../assets/images/chicken.png")}>
                <View style={{ position: "absolute", top: 5, left: 5, flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={homeStyles.rateContainer}>
                    <Text style={homeStyles.rate}>5.0</Text>
                    <Ionicons name="star" style={{ fontSize: 14, color: COLORS.primary }}></Ionicons>
                  </View>
                  <View style={homeStyles.favoritesContainer}>
                    <Ionicons name="heart" style={{ fontSize: 14, color: COLORS.heading }}></Ionicons>
                  </View>
                </View>
              </ImageBackground>
            </View>
            
            <View style={homeStyles.recommendCard}>
              <ImageBackground style={homeStyles.recommendImage} source={require("../../assets/images/chicken.png")}>
                <View style={{ position: "absolute", top: 5, left: 5, flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={homeStyles.rateContainer}>
                    <Text style={homeStyles.rate}>5.0</Text>
                    <Ionicons name="star" style={{ fontSize: 14, color: COLORS.primary }}></Ionicons>
                  </View>
                  <View style={homeStyles.favoritesContainer}>
                    <Ionicons name="heart" style={{ fontSize: 14, color: COLORS.heading }}></Ionicons>
                  </View>
                </View>
              </ImageBackground>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
export default HomeScreen;
