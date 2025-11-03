import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width, height } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    position: "relative",
  },
  header: {
    width,
    height,
    paddingTop: 52,
    paddingHorizontal: 35,
  },
  headerContent: {
    width,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  main: {
    position: "absolute",
    bottom: 0,
    width,
    height: height * 0.7,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  searchInput: {
    backgroundColor: COLORS.textLight,
    width: 200,
    borderRadius: 30,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: "GochiHand",
  },
  searchIcon: {
    position: "absolute",
    top: 6,
    left: 164,
    height: 28,
    width: 28,
    backgroundColor: COLORS.heading,
    color: COLORS.textLight,
    padding: 4,
    borderRadius: 50,
    fontSize: 18,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rightHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    right: 50
  },
  rightIcon: {
    backgroundColor: COLORS.textLight,
    color: COLORS.heading,
    padding: 2,
    marginHorizontal: 4,
    borderRadius: 10,
    fontSize: 28
  },
  headerMessage: {
    width,
    paddingTop: 12
  },
  heading: {
    fontSize: 32,
    fontFamily: "Modak",
    color: COLORS.textLight,
  },
  title: {
    fontSize: 12,
    lineHeight: 12,
    fontFamily: "GochiHand",
    color: COLORS.heading
  },
  categories: {
    width: width - 60,
    marginHorizontal: "auto",
    marginTop: 40,
    paddingBottom: 10,
    borderBottomColor: COLORS.background2,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  categorySelected: {
    backgroundColor: COLORS.background3,
    color: COLORS.heading,
    padding: 6,
    borderRadius: 50,
    fontSize: 40
  },
  categoryIcon: {
    backgroundColor: COLORS.background2,
    color: COLORS.heading,
    padding: 6,
    borderRadius: 50,
    fontSize: 40
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "GochiHand",
  },
});

export const recipeCardStyles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.border,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: "500",
  },
  servingsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  servingsText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: "500",
  },
});
