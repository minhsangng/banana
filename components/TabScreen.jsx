import { View, Text, Dimensions } from "react-native";
import { LAYOUT, TEXT } from "../assets/styles/base.styles";

const { width, height } = Dimensions.get("window");

const TabScreen = ({ header, data }) => {
    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                    <Text style={[TEXT.heading, TEXT.center]}>{header}</Text>
                </View>
            </View>
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.75)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx()]}>
                    {data}
                </View>
            </View>
        </View>
    );
};

export default TabScreen;
