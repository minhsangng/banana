import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width, height } = Dimensions.get("window");

export const FONT = {
  heading: "Modak",
  title: "GochiHand",
};

export const TEXT = StyleSheet.create({
  heading: {
    fontFamily: FONT.heading,
    fontSize: 32,
    color: COLORS.textLight,
  },
  subHeading: {
    fontFamily: FONT.heading,
    fontSize: 24,
    color: COLORS.text,
  },
  text: {
    fontFamily: FONT.title,
    fontSize: 20,
    color: COLORS.text,
  },
  subText: {
    fontFamily: FONT.title,
    fontSize: 12,
    color: COLORS.text,
  },
  paragraph: {
    fontFamily: FONT.title,
    fontSize: 16,
    color: COLORS.paragraph,
  },
  center: {
    textAlign: "center",
  },
  right: {
    textAlign: "right",
  },
  size: (v) => ({
    fontSize: v,
  }),
  underline: {
    textDecorationLine: "underline",
  },
});

export const LAYOUT = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width,
    height: "auto",
    backgroundColor: COLORS.background1,
  },
  row: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  justifyCenter: {
    justifyContent: "center",
  },
  justifyAround: {
    justifyContent: "space-around",
  },
  alignCenter: {
    alignItems: "center",
  },
  header: {
    width: width - 60,
    marginHorizontal: "auto",
    height,
    paddingTop: 72,
  },
  main: {
    position: "absolute",
    bottom: 0,
    width,
    height: height * 0.7,
    backgroundColor: COLORS.background2,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  relative: {
    position: "relative",
  },
  absolute: {
    position: "absolute",
  },
  top: (v) => ({
    top: v,
  }),
  right: (v) => ({
    right: v,
  }),
  bottom: (v) => ({
    bottom: v,
  }),
  left: (v) => ({
    left: v,
  }),
  m: (v) => ({ margin: v }),
  mt: (v) => ({ marginTop: v }),
  mr: (v) => ({ marginRight: v }),
  mb: (v) => ({ marginBottom: v }),
  ml: (v) => ({ marginLeft: v }),
  p: (v) => ({ padding: v }),
  pt: (v) => ({ paddingTop: v }),
  pr: (v) => ({ paddingRight: v }),
  pb: (v) => ({ paddingBottom: v }),
  pl: (v) => ({ paddingLeft: v }),
  px: (v = "auto") => ({
    paddingHorizontal: v,
  }),
  py: (v = "auto") => ({
    paddingVertical: v,
  }),
  mx: (v = "auto") => ({
    marginHorizontal: v,
  }),
  my: (v = "auto") => ({
    marginVertical: v,
  }),
  rounded: (v) => ({
    borderRadius: v,
  }),
  wFull: {
    width: "100%",
  },
  w: (v) => ({
    width: typeof v === "number" ? v : String(v),
  }),
  hFull: {
    height: "100%",
  },
  h: (v) => ({
    height: typeof v === "number" ? v : String(v),
  }),
  border: (w, c) => ({
    borderWidth: w,
    borderColor: c,
  }),
  bordert: (w, c) => ({
    borderTopWidth: w,
    borderTopColor: c,
  }),
  borderb: (w, c) => ({
    borderBottomWidth: w,
    borderBottomColor: c,
  }),
});

export const BUTTON = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.button,
    borderRadius: 50,
    fontFamily: TEXT.heading,
    textAlign: "center",
    height: 45,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondary: {
    backgroundColor: COLORS.background2,
    borderRadius: 32,
    fontFamily: TEXT.title,
    textAlign: "center",
    height: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
});
