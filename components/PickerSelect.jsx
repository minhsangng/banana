import { View, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { LAYOUT } from "../assets/styles/base.styles";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";

export default function PickerSelect({options, value, setValue}) {
    return (
        <View style={[LAYOUT.relative]}>
                    <RNPickerSelect style={pickerSelectStyles}
                        value={value}
                        onValueChange={(value) => setValue(value)}
                        items={options}
                        useNativeAndroidPickerStyle={false}
                        placeholder={{ label: "Chọn danh mục", value: null }}
                        activeItemStyle={{ color: COLORS.button }}
                    />
                    <Ionicons name="caret-down-outline" color={COLORS.button} size={18} style={[LAYOUT.absolute, LAYOUT.top("25%"), LAYOUT.right(10)]}></Ionicons>
                </View>
    );
};

const pickerSelectStyles = StyleSheet.create({
    inputAndroid: {
        width: "100%",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 4,
        fontFamily: "GochiHand",
        fontSize: 16,
        color: COLORS.paragraph
    },
    inputIOS: {
        width: "100%",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 4,
        fontFamily: "GochiHand",
        fontSize: 16,
        color: COLORS.paragraph
    }
});