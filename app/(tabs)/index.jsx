import { useEffect, useState, useRef } from "react";
import { View, ScrollView, TextInput, Text, ImageBackground, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { router } from "expo-router";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { homeStyles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../../components/LoadingSpinner";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(0);

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
      setGreeting(["Chào buổi sáng", "Lạng quạng trễ học"]);
    else if (hour > 10 && hour <= 13)
      setGreeting(["Chào buổi trưa", "Tà tưa gì hôn"]);
    else if (hour > 13 && hour <= 18)
      setGreeting(["Chào buổi chiều", "Khiều khiều tí đơn"]);
    else if (hour > 18 && hour <= 22)
      setGreeting(["Chào buổi tối", "Tối rồi lại sáng"]);
    else setGreeting(["Chúc ngủ ngon", "Không ngon thì thôi"]);
  };

  if ((loading && !refreshing)) return <LoadingSpinner message="Chờ xíu..." />;

  return (
    <View style={[LAYOUT.container, LAYOUT.positive]}>
      <View style={[LAYOUT.header, LAYOUT.pt(52)]}>
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.alignCenter, LAYOUT.positive, homeStyles.headerContent]}>
          <TextInput placeholder="Bạn tìm món gì?" style={[LAYOUT.w(200), LAYOUT.rounded(30), LAYOUT.px(14), LAYOUT.py(10), TEXT.size(14), homeStyles.searchInput]} returnKeyType="search" onSubmitEditing={() => router.replace("../search")}/>
          <ScrollView>
            <Text></Text>
          </ScrollView>
          <Ionicons name="options-outline" style={[LAYOUT.absolute, LAYOUT.top(6), LAYOUT.left(164), LAYOUT.h(28), LAYOUT.w(28), LAYOUT.p(4), LAYOUT.rounded(50), LAYOUT.jsutifyCenter, LAYOUT.alignCenter, TEXT.size(18), homeStyles.searchIcon]}></Ionicons>
          <View style={[LAYOUT.row, LAYOUT.justifyAround]}>
            <Ionicons name="cart-outline" style={[LAYOUT.p(2), LAYOUT.mx(4), LAYOUT.rounded(12), TEXT.size(28), homeStyles.rightIcon]}></Ionicons>
            <Ionicons name="notifications-outline" style={[LAYOUT.p(2), LAYOUT.mx(4), LAYOUT.rounded(12), TEXT.size(28), homeStyles.rightIcon]}></Ionicons>
            <Ionicons name="person-outline" style={[LAYOUT.p(2), LAYOUT.mx(4), LAYOUT.rounded(12), TEXT.size(28), homeStyles.rightIcon]} onPress={() => router.replace("../(auth)/sign-in")}></Ionicons>
          </View>
        </View>
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.pt(12)]}>
          <Text style={TEXT.heading}>{greeting[0]}</Text>
          <Text style={[TEXT.subText, homeStyles.title]}>{greeting[1]}</Text>
        </View>
      </View>
      <View style={[LAYOUT.absolute, LAYOUT.bottom(0), LAYOUT.w(width), LAYOUT.h(height * 0.7), homeStyles.main]}>
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(32), LAYOUT.pb(10), LAYOUT.borderb(1, COLORS.background3), LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.alignCenter, homeStyles.categories]}>
          {categories.map((item, index) => (
            <TouchableOpacity key={item.id} style={LAYOUT.alignCenter} onPress={() => setCurrentCategory(item.id)}>
              <Ionicons style={[LAYOUT.p(10), LAYOUT.rounded(50), TEXT.size(32), homeStyles.categoryIcon, item.id === currentCategory ? homeStyles.categorySelected : ""]} name={item.icon}></Ionicons>
              <Text style={[LAYOUT.mt(4), TEXT.subText]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView>
          <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(20)]}>
            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.alignCenter]}>
              <Text style={TEXT.subHeading}>Best seller</Text>
              <Text style={[LAYOUT.paragraph, homeStyles.bestSellerSeeAll]}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
            </View>
            <View style={[LAYOUT.mt(4), LAYOUT.row, LAYOUT.justifyBetween]}>
              <View style={[LAYOUT.border(1, COLORS.background1), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110)]}>
                <ImageBackground style={homeStyles.bestSellerImage} source={require("../../assets/images/lamb.png")} >
                  <Text style={homeStyles.bestSellerNameDish}>Cơm...</Text>
                </ImageBackground>
              </View>
              <View style={[LAYOUT.border(1, COLORS.background1), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110)]}>
                <ImageBackground style={homeStyles.bestSellerImage} source={require("../../assets/images/lamb.png")} >
                  <Text style={homeStyles.bestSellerNameDish}>Cơm...</Text>
                </ImageBackground>
              </View>
              <View style={[LAYOUT.border(1, COLORS.background1), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110)]}>
                <ImageBackground style={homeStyles.bestSellerImage} source={require("../../assets/images/lamb.png")} >
                  <Text style={homeStyles.bestSellerNameDish}>Cơm...</Text>
                </ImageBackground>
              </View>
              <View style={[LAYOUT.border(1, COLORS.background1), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110)]}>
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
              <Text style={TEXT.subHeading}>Dành cho bạn</Text>
              <Text style={homeStyles.recommendSeeAll}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
            </View>
            <View style={homeStyles.recommendDishes}>
              <View style={homeStyles.recommendCard}>
                <ImageBackground style={homeStyles.recommendImage} source={require("../../assets/images/chicken.png")}>
                  <View style={{ position: "absolute", top: 5, left: 5, flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={homeStyles.rateContainer}>
                      <Text style={homeStyles.rate}>5.0</Text>
                      <Ionicons name="star" style={{ fontSize: 14, color: COLORS.background1 }}></Ionicons>
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
                      <Ionicons name="star" style={{ fontSize: 14, color: COLORS.background1 }}></Ionicons>
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
    </View>
  );
};
export default HomeScreen;
