import { useEffect, useState, useRef } from "react";
import { View, ScrollView, TextInput, Text, ImageBackground, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { router } from "expo-router";
import { Portal } from "react-native-paper";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { homeStyles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import SubMenu from "../../components/SubMenu";
import PopupSearch from "../../components/PopupSearch";
import CategoryFilter from "../../components/CategoryFilter";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(-1);

  const [loadingSearch, setLoadingSearch] = useState(false);

  const loadCategories = async () => {
    try {
      const response = await fetch(`http://192.168.1.171:5001/api/categories`);

      const results = await response.json();

      if (results) {
        setCategories(results);
      }
    } catch (error) {
      console.log('Lỗi', 'Không thể kết nối API');
      console.error(error);
    }
  }

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
    },
    {
      id: 2,
      heading: "Supper Sale",
      discount: "-50%",
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

  const loadData = async () => {
    try {
      setLoading(true);
      await loadCategories();   // chỉ gọi 1 lần
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    loadCategories();
    updateGreeting();
    const greetingInterval = setInterval(updateGreeting, 60 * 1000);

    return () => {
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

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuData, setMenuData] = useState({ header: null, content: null });

  const openMenu = (type) => {
    let header, content;

    header = <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.itemsCenter, LAYOUT.pt(22)]}>
      <Ionicons name="cart-outline" style={[LAYOUT.rounded(44), LAYOUT.p(4), LAYOUT.mr(20), TEXT.size(30), { backgroundColor: COLORS.textLight, color: COLORS.heading }]}></Ionicons>
      <Text style={[TEXT.heading]}>{type === "cart" ? "Giỏ Hàng" : "Thông Báo"}</Text>
    </View>;
    content = <View style={[LAYOUT.pt(12)]}>
      <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>Chưa có món nào được chọn</Text>
      <View style={[LAYOUT.wFull, LAYOUT.h(height - 200), LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
        <TouchableOpacity style={[LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
          <Ionicons name="add-circle-outline" style={[TEXT.size(92), LAYOUT.pb(12), { color: COLORS.textLight }]}></Ionicons>
          <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>Lựa món</Text>
        </TouchableOpacity>
      </View>
    </View>;

    content = <View style={[LAYOUT.pt(12)]}>
      <Text style={[TEXT.paragraph, TEXT.center, { color: COLORS.textLight }]}>{type === "cart" ? "Chưa có món nào được chọn" : "Chưa có thông báo"}</Text>
      {type === "cart" ?
        <View style={[LAYOUT.wFull, LAYOUT.h(height - 200), LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
          <TouchableOpacity style={[LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
            <Ionicons name="add-circle-outline" style={[TEXT.size(92), LAYOUT.pb(12), { color: COLORS.textLight }]}></Ionicons>
            <Text style={[TEXT.paragraph, { color: COLORS.textLight }]}>Lựa món</Text>
          </TouchableOpacity>
        </View>
        : ""
      }
    </View>;

    setMenuData({ header, content });
    setMenuVisible(true);
  };

  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [isShowSearch, setIsShowSearch] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoadingSearch(true);
      const response = await fetch(`http://192.168.1.171:5001/api/search/${query}`);

      const results = await response.json();

      setData(results);
      setIsShowSearch(true);
      setLoadingSearch(false);
    } catch (error) {
      console.log('Lỗi', 'Không thể kết nối API');
      console.error(error);
    }
  };

  if ((loading && !refreshing) || loadingSearch) return <LoadingSpinner message="Đợi móc con API cái..." />;

  return (
    <View style={[LAYOUT.container, LAYOUT.positive]}>
      <View style={[LAYOUT.header, LAYOUT.pt(52)]}>
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.positive, homeStyles.headerContent]}>
          <TextInput placeholder="Bạn tìm món gì?" style={[LAYOUT.w(200), LAYOUT.rounded(30), LAYOUT.px(14), LAYOUT.py(10), TEXT.size(14), homeStyles.searchInput]} returnKeyType="search" value={query} onChangeText={setQuery} onSubmitEditing={handleSubmit} />
          <Ionicons name="options-outline" onPress={() => router.replace("./search")} style={[LAYOUT.absolute, LAYOUT.top(6), LAYOUT.left(164), LAYOUT.h(28), LAYOUT.w(28), LAYOUT.p(4), LAYOUT.rounded(50), LAYOUT.jsutifyCenter, LAYOUT.itemsCenter, TEXT.size(18), homeStyles.searchIcon]}></Ionicons>
          <View style={[LAYOUT.row, LAYOUT.justifyAround, { gap: 4 }]}>
            <Ionicons name="cart-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => openMenu("cart")}></Ionicons>
            <Ionicons name="notifications-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => openMenu("notify")}></Ionicons>
            <Ionicons name="person-outline" style={[LAYOUT.p(5), LAYOUT.rounded(14), TEXT.size(28), homeStyles.rightIcon]} onPress={() => router.replace("./(auth)/sign-in")}></Ionicons>
          </View>
        </View>
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx, LAYOUT.pt(12)]}>
          <Text style={TEXT.heading}>{greeting[0]}</Text>
          <Text style={[TEXT.paragraph, homeStyles.title]}>{greeting[1]}</Text>
        </View>
        <Portal>
          <SubMenu visible={menuVisible} setVisible={setMenuVisible} header={menuData.header} content={menuData.content} />
        </Portal>
      </View>
      <View style={[LAYOUT.absolute, LAYOUT.bottom(0), LAYOUT.w(width), LAYOUT.h(height * 0.7), homeStyles.main]}>
        <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(32), LAYOUT.pb(10), LAYOUT.borderb(1, COLORS.background3), LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, homeStyles.categories]}>
          {categories.map((item, index) => (
            <TouchableOpacity key={item.categoryId} style={LAYOUT.itemsCenter} onPress={() => setCurrentCategory(item.categoryId === currentCategory ? -1 : item.categoryId)}>
              <Ionicons style={[LAYOUT.p(10), LAYOUT.rounded(50), TEXT.size(32), homeStyles.categoryIcon, item.categoryId === currentCategory ? homeStyles.categorySelected : ""]} name={item.categoryIcon}></Ionicons>
              <Text style={[LAYOUT.mt(4), TEXT.subText]}>{item.categoryName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView>
          <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(20)]}>
            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
              <Text style={TEXT.subHeading}>Best seller</Text>
              <Text style={[TEXT.paragraph, homeStyles.bestSellerSeeAll]}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
            </View>
            <View style={[LAYOUT.mt(4), LAYOUT.row, LAYOUT.justifyBetween]}>
              <View style={[LAYOUT.border(1, COLORS.background1), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110)]}>
                <ImageBackground style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]} source={require("../../assets/images/lamb.png")} >
                  <Text style={[LAYOUT.absolute, LAYOUT.bottom(10), LAYOUT.right(-1), LAYOUT.w(45), TEXT.subText, homeStyles.bestSellerNameDish]}>Cơm...</Text>
                </ImageBackground>
              </View>
              <View style={[LAYOUT.border(1, COLORS.background1), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110)]}>
                <ImageBackground style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]} source={require("../../assets/images/lamb.png")} >
                  <Text style={[LAYOUT.absolute, LAYOUT.bottom(10), LAYOUT.right(-1), LAYOUT.w(45), TEXT.subText, homeStyles.bestSellerNameDish]}>Cơm...</Text>
                </ImageBackground>
              </View>
              <View style={[LAYOUT.border(1, COLORS.background1), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110)]}>
                <ImageBackground style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]} source={require("../../assets/images/lamb.png")} >
                  <Text style={[LAYOUT.absolute, LAYOUT.bottom(10), LAYOUT.right(-1), LAYOUT.w(45), TEXT.subText, homeStyles.bestSellerNameDish]}>Cơm...</Text>
                </ImageBackground>
              </View>
              <View style={[LAYOUT.border(1, COLORS.background1), LAYOUT.rounded(20), LAYOUT.w("23%"), LAYOUT.h(110)]}>
                <ImageBackground style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]} source={require("../../assets/images/lamb.png")} >
                  <Text style={[LAYOUT.absolute, LAYOUT.bottom(10), LAYOUT.right(-1), LAYOUT.w(45), TEXT.subText, homeStyles.bestSellerNameDish]}>Cơm...</Text>
                </ImageBackground>
              </View>
            </View>
          </View>

          <View>
            <FlatList
              style={{ width: width - 60, marginHorizontal: "auto" }}
              data={slides}
              ref={flatListRef}
              horizontal
              pagingEnabled
              decelerationRate="fast"
              snapToAlignment="center"
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={handleScroll}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(24)]}>
                  <ImageBackground source={item.image} style={[LAYOUT.relative, LAYOUT.wFull, LAYOUT.h(128), homeStyles.advertiseImage]}>
                    <View style={[LAYOUT.absolute, LAYOUT.top(30), LAYOUT.left(15), LAYOUT.itemsCenter]}>
                      <Text style={[TEXT.text, TEXT.size(18), { color: COLORS.textLight }]}>{item.heading}</Text>
                      <Text style={[TEXT.heading, { color: COLORS.textLight }]}>{item.discount}</Text>
                    </View>
                  </ImageBackground>

                  <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.mt(8)]}>
                    {slides.map((_, index) => (
                      <View
                        key={index}
                        style={[LAYOUT.w(24), LAYOUT.h(6), LAYOUT.rounded(10), LAYOUT.mx(2),
                        { opacity: index === currentIndex ? 1 : 0.3, backgroundColor: COLORS.heading },
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
            />
          </View>

          <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(24), LAYOUT.mb(40)]}>
            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
              <Text style={TEXT.subHeading}>Dành cho bạn</Text>
              <Text style={[TEXT.paragraph, homeStyles.recommendSeeAll]}>Xem tất cả <Ionicons name="chevron-forward-outline" style={{ fontSize: 16 }}></Ionicons></Text>
            </View>
            <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.pt(6)]}>
              <View style={[LAYOUT.w("48%"), LAYOUT.h(160), LAYOUT.border(1, COLORS.background3), LAYOUT.rounded(6)]}>
                <ImageBackground style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]} source={require("../../assets/images/chicken.png")}>
                  <View style={[LAYOUT.absolute, LAYOUT.top(5), LAYOUT.left(5), LAYOUT.row, LAYOUT.itemsCenter, { gap: 6 }]}>
                    <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.rounded(30), LAYOUT.border(0.5, COLORS.accent), LAYOUT.px(6), LAYOUT.py(2), homeStyles.rateContainer]}>
                      <Text style={TEXT.subText}>5.0</Text>
                      <Ionicons name="star" style={{ fontSize: 14, color: COLORS.background1 }}></Ionicons>
                    </View>
                    <View style={[LAYOUT.rounded(30), LAYOUT.border(0.5, COLORS.accent), LAYOUT.p(4), homeStyles.favoritesContainer]}>
                      <Ionicons name="heart" style={{ fontSize: 14, color: COLORS.heading }}></Ionicons>
                    </View>
                  </View>
                </ImageBackground>
              </View>

              <View style={[LAYOUT.w("48%"), LAYOUT.h(160), LAYOUT.border(1, COLORS.background3), LAYOUT.rounded(6)]}>
                <ImageBackground style={[LAYOUT.wFull, LAYOUT.hFull, LAYOUT.relative]} source={require("../../assets/images/chicken.png")}>
                  <View style={[LAYOUT.absolute, LAYOUT.top(5), LAYOUT.left(5), LAYOUT.row, LAYOUT.itemsCenter, { gap: 6 }]}>
                    <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.rounded(30), LAYOUT.border(0.5, COLORS.accent), LAYOUT.px(6), LAYOUT.py(2), homeStyles.rateContainer]}>
                      <Text style={TEXT.subText}>5.0</Text>
                      <Ionicons name="star" style={{ fontSize: 14, color: COLORS.background1 }}></Ionicons>
                    </View>
                    <View style={[LAYOUT.rounded(30), LAYOUT.border(0.5, COLORS.accent), LAYOUT.p(4), homeStyles.favoritesContainer]}>
                      <Ionicons name="heart" style={{ fontSize: 14, color: COLORS.heading }}></Ionicons>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {isShowSearch && (
        <PopupSearch
          visible={isShowSearch}
          query={query}
          data={data}
          onClose={() => setIsShowSearch(false)}
        />
      )}
      <CategoryFilter categoryId={currentCategory} visible={currentCategory !== -1} />
    </View>

  );
};
export default HomeScreen;
