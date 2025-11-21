import { View, ScrollView, Dimensions } from "react-native";
import { LAYOUT } from "../../assets/styles/base.styles";
import { homeStyles } from "../../assets/styles/home.styles";

import BestSeller from "../../components/BestSeller";
import SlideBanner from "../../components/SlideBanner";
import Categories from "../../components/Categories";
import Recommend from "../../components/Recommend";
import Header from "../../components/Header";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  return (
    <View style={[LAYOUT.container, LAYOUT.positive]}>
      {/* Header */}
      <Header />

      <View style={[LAYOUT.absolute, LAYOUT.bottom(0), LAYOUT.w(width), LAYOUT.h(height * 0.7), homeStyles.main]}>
        {/* Categories */}
        <Categories />

        <ScrollView>
          {/* Best Seller Section */}
          <BestSeller />

          {/* Ads Banner Section */}
          <SlideBanner />

          {/* Recommend Section */}
          <Recommend />
        </ScrollView>
      </View>
    </View>
  );
};
export default HomeScreen;
