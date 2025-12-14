import { useRef, useState } from "react";
import {
    View,
    Dimensions,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    Text,
    FlatList
} from "react-native";
import { router } from "expo-router";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function FirstOnboard() {
    const slides = [
        {
            id: "0",
            icon: "document-attach-outline",
            heading: "Đặt hàng tiện lợi",
            title: "Chỉ với vài thao tác đơn giản",
            image: require("../../assets/images/onboard1.png"),
        },
        {
            id: "1",
            icon: "wallet-outline",
            heading: "Thanh toán dễ dàng",
            title: "Hỗ trợ tiền mặt và chuyển khoản",
            image: require("../../assets/images/onboard2.png"),
        },
        {
            id: "2",
            icon: "bicycle-outline",
            heading: "Giao hàng tận nơi",
            title: "Không cần phải di chuyển",
            image: require("../../assets/images/onboard3.png"),
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            router.replace("/(tabs)/");
        }
    };

    const handleSkip = () => {
        router.replace("/(tabs)/");
    };

    return (
        <View style={styles.container}>
            {currentIndex < slides.length - 1 ?
                <TouchableOpacity onPress={handleSkip} style={{ position: "absolute", top: 50, right: 20, zIndex: 999, flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: COLORS.background1, fontSize: 18, fontFamily: "GochiHand" }}>Bỏ qua</Text>
                    <Ionicons name="chevron-forward-outline" style={{ color: COLORS.background1, fontSize: 18 }}></Ionicons>
                </TouchableOpacity> : ""}
            <ImageBackground
                source={slides[currentIndex].image}
                style={{ width, height }}
            >
                <View style={styles.bottom}>
                    <FlatList
                        data={slides}
                        ref={flatListRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={[styles.slide, { width }]}>
                                <Ionicons name={slides[currentIndex].icon} style={styles.icon} />
                                <Text style={styles.heading}>{slides[currentIndex].heading}</Text>
                                <Text style={styles.title}>{slides[currentIndex].title}</Text>

                                <View style={styles.dotsContainer}>
                                    {slides.map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.dot,
                                                { opacity: index === currentIndex ? 1 : 0.3 },
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                        getItemLayout={(data, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>
                            {currentIndex === slides.length - 1 ? "Bắt đầu" : "Tiếp tục"}
                        </Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        height,
        justifyContent: "center",
        alignItems: "center"
    },
    bottom: {
        height: (height * 2) / 5,
        width,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: COLORS.background2,
        position: "absolute",
        bottom: 0,
        alignItems: "center",
        paddingBottom: 60
    },
    icon: {
        color: COLORS.heading,
        fontSize: 40,
        marginTop: 20,
    },
    heading: {
        fontFamily: "Modak",
        fontSize: 32,
        color: COLORS.heading,
        marginTop: 8
    },
    title: {
        fontFamily: "GochiHand",
        fontSize: 16,
        marginBottom: 60
    },
    slide: {
        alignItems: "center",
        justifyContent: "center"
    },
    dotsContainer: {
        flexDirection: "row"
    },
    dot: {
        width: 24,
        height: 6,
        borderRadius: 5,
        backgroundColor: COLORS.heading,
        marginHorizontal: 2
    },
    button: {
        backgroundColor: COLORS.heading,
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 20,
        marginTop: 20,
        alignItems: "center"
    },
    buttonText: {
        color: COLORS.textLight,
        fontFamily: "Modak",
        fontSize: 18
    }
});