import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");

export const homeStyles = StyleSheet.create({
  main: {
    backgroundColor: COLORS.background2,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  searchInput: {
    backgroundColor: COLORS.textLight,
    color: COLORS.text,
    lineHeight: 20,
    fontFamily: "GochiHand",
  },
  searchIcon: {
    backgroundColor: COLORS.heading,
    color: COLORS.textLight,
  },
  rightIcon: {
    backgroundColor: COLORS.textLight,
    color: COLORS.heading,
  },
  title: {
    fontSize: 12,
    lineHeight: 12,
    color: COLORS.heading,
  },
  categoryIcon: {
    backgroundColor: COLORS.background3,
    color: COLORS.heading,
  },
  categorySelected: {
    backgroundColor: COLORS.background4,
  },
  bestSellerSeeAll: {
    color: COLORS.heading,
  },
  bestSellerCard: {
    borderColor: COLORS.background3,
  },
  bestSellerImage: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  bestSellerNameDish: {
    position: "absolute",
    bottom: 10,
    right: -1,
    backgroundColor: COLORS.heading,
    color: COLORS.textLight,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 8,
    textAlign: "right",
    width: 45,
    fontSize: 14,
    fontFamily: "GochiHand",
  },
  advertiseSection: {
    width: width - 60,
    marginHorizontal: "auto",
    marginTop: 24,
  },
  advertiseImage: {
    position: "relative",
    width: "100%",
    height: 128,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 24,
    height: 6,
    borderRadius: 5,
    backgroundColor: COLORS.heading,
    marginHorizontal: 2,
  },
  recommendSection: {
    width: width - 60,
    height: "auto",
    marginHorizontal: "auto",
    marginTop: 24,
    marginBottom: 40,
  },
  recommendTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recommendSeeAll: {
    fontSize: 16,
    fontFamily: "GochiHand",
    color: COLORS.heading,
  },
  recommendDishes: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  recommendCard: {
    width: "48%",
    height: 160,
    borderWidth: 1,
    borderColor: COLORS.background3,
    borderRadius: 20,
  },
  recommendImage: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  rateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.textLight,
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: COLORS.accent,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  rate: {
    fontSize: 14,
    fontFamily: "GochiHand",
    color: COLORS.text,
  },
  favoritesContainer: {
    backgroundColor: COLORS.textLight,
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: COLORS.accent,
    padding: 4,
  },
});
