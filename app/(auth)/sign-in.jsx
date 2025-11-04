import { View, Text, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SignInScreen() {
    return (
        <View style={{width, height}}>
            <Text>Sign In</Text>
        </View>
    );
}