import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

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
  bestSellerNameDish: {
    backgroundColor: COLORS.heading,
    color: COLORS.textLight,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 8,
    textAlign: "right",
  },
  recommendSeeAll: {
    color: COLORS.heading,
  },
  rateContainer: {
    gap: 6,
    backgroundColor: COLORS.textLight,
  },
  favoritesContainer: {
    backgroundColor: COLORS.textLight,
  },
});
