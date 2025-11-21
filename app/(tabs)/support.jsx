import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LAYOUT, TEXT } from "../../assets/styles/base.styles";
import { COLORS } from "../../constants/colors";

const { width, height } = Dimensions.get("window");

export default function SupportScreen() {
    return (
        <View style={[LAYOUT.container]}>
            <View style={[LAYOUT.header]}>
                <View style={[LAYOUT.row, LAYOUT.itemsCenter, LAYOUT.justifyCenter]}>
                    <Text style={[TEXT.heading, TEXT.center]}>Trợ giúp</Text>
                </View>
            </View>

            {/* Body */}
            <View style={[LAYOUT.main, LAYOUT.h(height * 0.75)]}>
                <View style={[LAYOUT.mt(44), LAYOUT.w(width - 60), LAYOUT.mx()]}>
                    <Text style={[TEXT.paragraph, { lineHeight: 22 }]}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
                        pellentesque congue lorem, vel tincidunt tortor.
                    </Text>

                    <TouchableOpacity style={[LAYOUT.mt(24), LAYOUT.pb(16), { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                        <Text style={[TEXT.subHeading]}>Help with the order</Text>
                        <Text style={[TEXT.subText, LAYOUT.mt(4)]}>Support</Text>
                        <Ionicons
                            name="chevron-forward"
                            style={[TEXT.size(18), { position: "absolute", right: 0, top: 20 }]}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={[LAYOUT.mt(24), LAYOUT.pb(16), { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                        <Text style={[TEXT.subHeading]}>Help Center</Text>
                        <Text style={[TEXT.subText, LAYOUT.mt(4)]}>General Information</Text>
                        <Ionicons
                            name="chevron-forward"
                            style={[TEXT.size(18), { position: "absolute", right: 0, top: 20 }]}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View >
    );
}