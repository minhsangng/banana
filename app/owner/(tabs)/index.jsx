import { View, TouchableOpacity, ImageBackground, Dimensions, ScrollView, Text, RefreshControl, Pressable } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { LAYOUT, TEXT } from "../../../assets/styles/base.styles";
import { COLORS } from "../../../constants/colors";
import { formatPrice } from "../../../constants/format";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_URL } from "../../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import PushNotification from "../../../components/PushNotification";
import NavBar from "../../../components/NavBar";
import LoadingSpinner from "../../../components/LoadingSpinner";

const { width, height } = Dimensions.get("window");

const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const formatMoney = (value) => {
    value = Number(value);

    if (value >= 1_000_000)
        return (value / 1_000_000).toFixed(1).replace(".0", "") + "M";

    if (value >= 1_000)
        return (value / 1_000).toFixed(1).replace(".0", "") + "k";

    return value.toString();
};

const getCurrentWeekRange = () => {
    const today = new Date();
    const day = today.getDay() === 0 ? 7 : today.getDay();

    const monday = new Date(today);
    monday.setDate(today.getDate() - (day - 1));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { start: monday, end: sunday };
};

const convertRevenueToChart = (orders) => {
    if (!orders || orders.length === 0) {
        return {
            labels: ["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"],
            datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
        };
    }

    const revenue = [0, 0, 0, 0, 0, 0, 0];

    orders.forEach(order => {
        const date = new Date(order.date);
        let day = date.getDay();

        const index = day === 0 ? 6 : day - 1;

        const price = Number(order.totalRevenue) || 0;
        revenue[index] += price;
    });

    return {
        labels: ["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"],
        datasets: [{ data: revenue }]
    };
};

export default function HomeScreen() {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [isLogin, setIsLogin] = useState(false);
    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState(true);

    const { start, end } = getCurrentWeekRange();

    const [startDate, setStartDate] = useState(start);
    const [endDate, setEndDate] = useState(end);

    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);

    const [revenue, setRevenue] = useState(0);
    const [quantity, setQuantity] = useState(0);

    const initData = async () => {
        const userStr = await SecureStore.getItemAsync("userInfo");
        if (userStr) {
            setIsLogin(true);
            const user = JSON.parse(userStr);
            setUserId(user.userId);

            if (user.role === "Employee") setRole(false);
        }
    };

    const onChangeStartDate = (event, selectedDate) => {
        setShowStartDate(false);
        if (selectedDate) setStartDate(selectedDate);
    };

    const onChangeEndDate = (event, selectedDate) => {
        setShowEndDate(false);
        if (selectedDate) setEndDate(selectedDate);
    };

    const loadRevenue = async () => {
        if (!userId) return;

        const { data } = await axios.post(`${API_URL}/revenue`, {
            userId,
            start: formatDate(startDate),
            end: formatDate(endDate),
        });

        const total = data.reduce((sum, item) => sum + item.totalRevenue, 0);
        setRevenue(total);
        setLineData(convertRevenueToChart(data));
    };

    const loadTopDishes = async () => {
        if (!userId) return;

        const { data } = await axios.post(`${API_URL}/topdishes`, {
            userId,
            start: formatDate(startDate),
            end: formatDate(endDate),
        });

        const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
        setQuantity(totalQuantity);

        setBarData({
            labels: data.map(item =>
                item.dishName.length > 8 ? item.dishName.slice(0, 8) + "…" : item.dishName
            ),
            datasets: [{ data: data.map(item => item.quantity) }]
        });
    };

    const loadCategories = async () => {
        const { data } = await axios.post(`${API_URL}/topcategories`, {
            userId,
            start: formatDate(startDate),
            end: formatDate(endDate),
        });

        const colors = ["#f39c12", "#3498db", "#27ae60", "#e74c3c"];

        setPieData(
            data.map((item, index) => ({
                name: item.categoryName,
                population: Number(item.quantity) || 0,
                color: colors[index] ?? "#000",
                legendFontColor: "#333",
                legendFontSize: 12
            }))
        );
    };

    const [lineData, setLineData] = useState({
        labels: ["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
    });

    const [pieData, setPieData] = useState([{ name: "", population: 0, color: "#f39c12", legendFontColor: "#333", legendFontSize: 12 }]);

    const [barData, setBarData] = useState({
        labels: [],
        datasets: [{ data: [] }]
    });

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#ffffff",
        backgroundGradientToOpacity: 0,
        strokeWidth: 2,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(100,100,100, ${opacity})`,
        propsForDots: { r: "4", strokeWidth: "1", stroke: COLORS.background1 ?? "#000" },
    };

    const loadData = async () => {
        setLoading(true);
        Promise.all([
            loadRevenue(),
            loadTopDishes(),
            loadCategories()
        ]).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        initData();
    }, []);

    useEffect(() => {
        if (userId) {
            loadData();
        }
    }, [userId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
    }, []);

    return (
        <PushNotification>
            <View style={[LAYOUT.container]}>
                <NavBar isLogin={isLogin} heading={"Trang chủ"} />
                <View style={[LAYOUT.main, LAYOUT.h(height * 0.77), { overflow: "hidden" }]}>
                    {!role ? (<ImageBackground source={require("../../../assets/images/background-dashboard.png")} style={[LAYOUT.w(width), LAYOUT.h(height)]} />) : loading ? <LoadingSpinner />
                        : (
                            <ScrollView style={[LAYOUT.w(width - 60), LAYOUT.mx(), LAYOUT.mt(44)]}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }>
                                <View style={[LAYOUT.row, LAYOUT.center, LAYOUT.borderb(1, COLORS.border), LAYOUT.pb(8), LAYOUT.mb(20)]}>
                                    <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter, LAYOUT.gap(14)]}>
                                        <View>
                                            <Text style={[TEXT.text, TEXT.size(16)]}>Từ ngày</Text>
                                            <Pressable style={[LAYOUT.px(8), LAYOUT.py(2), LAYOUT.rounded(12), LAYOUT.border(1, "rgba(0,0,0,0.1)")]} onPress={() => setShowStartDate(true)}>
                                                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.color(COLORS.paragraph)]}>{formatDate(startDate)}</Text>
                                            </Pressable>
                                            {showStartDate && (
                                                <DateTimePicker
                                                    value={startDate}
                                                    mode="date"
                                                    onChange={onChangeStartDate}
                                                />
                                            )}
                                        </View>

                                        <View>
                                            <Text style={[TEXT.text, TEXT.size(16)]}>Đến ngày</Text>
                                            <Pressable style={[LAYOUT.px(8), LAYOUT.py(2), LAYOUT.rounded(12), LAYOUT.border(1, "rgba(0,0,0,0.1)")]} onPress={() => setShowEndDate(true)}>
                                                <Text style={[TEXT.text, TEXT.size(18), LAYOUT.color(COLORS.paragraph)]}>{formatDate(endDate)}</Text>
                                            </Pressable>
                                            {showEndDate && (
                                                <DateTimePicker
                                                    value={endDate}
                                                    mode="date"
                                                    onChange={onChangeEndDate}
                                                />
                                            )}
                                        </View>

                                        <View style={[LAYOUT.borderl(1, COLORS.background4), LAYOUT.pl(14)]}>
                                            <TouchableOpacity style={[LAYOUT.px(22), LAYOUT.py(6), LAYOUT.rounded(12), LAYOUT.bg(COLORS.button)]} onPress={loadData}>
                                                <Text style={[TEXT.text, LAYOUT.color(COLORS.textLight)]}>Xem</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <View style={[LAYOUT.row, LAYOUT.justifyBetween, LAYOUT.itemsCenter]}>
                                    <Text style={[TEXT.text, LAYOUT.color(COLORS.heading), LAYOUT.mb(8)]}>Doanh thu bán hàng</Text>
                                    <TouchableOpacity style={[LAYOUT.row, LAYOUT.itemsCenter]}>
                                        <Text style={[TEXT.subText, LAYOUT.color(COLORS.paragraph)]}>Xem chi tiết</Text>
                                        <Ionicons name="chevron-forward-outline" color={COLORS.paragraph}></Ionicons>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <LineChart
                                        data={lineData}
                                        width={width}
                                        height={220}
                                        chartConfig={chartConfig}
                                        formatYLabel={(value) => formatMoney(value)}
                                        bezier
                                        style={{ borderRadius: 12 }}
                                        fromZero
                                    />
                                </ScrollView>

                                <Text style={[TEXT.text, TEXT.right, LAYOUT.mb(24)]}>Tổng doanh thu: {formatPrice(revenue)} đ</Text>

                                <Text style={[TEXT.text, LAYOUT.color(COLORS.heading), LAYOUT.mb(8)]}>Sản phẩm bán chạy</Text>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <BarChart
                                        data={barData}
                                        width={Math.max(width, barData.labels.length * 80)}
                                        height={250}
                                        yAxisLabel=""
                                        chartConfig={chartConfig}
                                        style={{
                                            marginTop: 8,
                                            borderRadius: 12,
                                        }}
                                        fromZero
                                        showValuesOnTopOfBars
                                    />
                                </ScrollView>

                                <Text style={[TEXT.text, TEXT.right, LAYOUT.mb(24)]}>Lượng bán ra: {quantity} món</Text>

                                <Text style={[TEXT.text, LAYOUT.color(COLORS.heading)]}>Danh mục bán chạy</Text>

                                <PieChart
                                    data={pieData}
                                    width={width - 32}
                                    height={220}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    chartConfig={chartConfig}
                                    absolute
                                />
                            </ScrollView>
                        )}
                </View>
            </View>
        </PushNotification>
    );
}