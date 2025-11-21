import { useState, useRef } from "react";
import { View, ImageBackground, FlatList, Dimensions } from "react-native";
import { LAYOUT } from "../assets/styles/base.styles";
import { homeStyles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");

export default function SlideBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const slides = [
        {
            id: 0,
            storeId: 1,
            dishId: 1,
            image: require("./../assets/images/ads-banner-1.png"),
        },
        {
            id: 1,
            storeId: 1,
            dishId: 1,
            image: require("./../assets/images/ads-banner-2.png"),
        },
        {
            id: 2,
            storeId: 1,
            dishId: 1,
            image: require("./../assets/images/ads-banner-2.png"),
        }
    ]

    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
    };

    return (
        <View>
            <FlatList
                style={{ width: width - 60, marginHorizontal: "auto" }}
                data={slides}
                ref={flatListRef}
                horizontal
                pagingEnabled
                decelerationRate="fast"
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={handleScroll}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(24)]}>
                        <ImageBackground source={item.image} style={[LAYOUT.relative, LAYOUT.wFull, LAYOUT.h(160), LAYOUT.rounded(20), homeStyles.advertiseImage, { overflow: "hidden" }]}>
                            <View style={[LAYOUT.absolute, LAYOUT.top(30), LAYOUT.left(15), LAYOUT.itemsCenter]}></View>
                        </ImageBackground>

                        <View style={[LAYOUT.row, LAYOUT.justifyCenter, LAYOUT.mt(8)]}>
                            {slides.map((_, index) => (
                                <View
                                    key={index}
                                    style={[LAYOUT.w(24), LAYOUT.h(6), LAYOUT.rounded(10), LAYOUT.mx(2),
                                    { opacity: index === currentIndex ? 1 : 0.3, backgroundColor: COLORS.heading },
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                )
                }
                getItemLayout={(data, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />
        </View >
    );
}