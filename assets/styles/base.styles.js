// assets/styles/base.styles.js
import { StyleSheet, Dimensions, Platform } from "react-native";
import { COLORS } from "../../constants/colors";

const { width, height } = Dimensions.get("window");

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT = {
  heading: "Modak",
  title: "GochiHand",
};

export const SHADOW = {
  light: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heavy: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
};

export const TEXT = StyleSheet.create({
  heading: {
    fontFamily: FONT.heading,
    fontSize: 24,
    color: COLORS.text,
  },
  subHeading: {
    fontFamily: FONT.title,
    fontSize: 18,
    color: COLORS.heading,
  },
  paragraph: {
    fontFamily: FONT.title,
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  center: {
    textAlign: "center",
  },
});

export const LAYOUT = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    ...SHADOW.light,
  },
});

export const BUTTON = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.heading,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    fontFamily: FONT.title,
    color: COLORS.heading,
    fontSize: 16,
  },
});

export const IMAGE = {
  fullWidth: {
    width: width,
    height: height * 0.3,
    resizeMode: "cover",
  },
  rounded: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 16,
    resizeMode: "cover",
  },
};
