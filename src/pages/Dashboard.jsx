import { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from "recharts";
import { API_URL } from "./../constants/api";

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [user, setUser] = useState([]);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 2);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const [startDate, setStartDate] = useState(formatDate(firstDay));
    const [endDate, setEndDate] = useState(formatDate(lastDay));

    function formatDate(date) {
        return date.toISOString().split("T")[0]; // yyyy-MM-dd
    }

    function buildDailyStats(start, end, orders) {
        const startD = new Date(start);
        const endD = new Date(end);
        const year = startD.getFullYear();

        const days = [];
        let current = new Date(startD);

        while (current <= endD) {
            const yyyy = current.getFullYear();
            const mm = String(current.getMonth() + 1).padStart(2, "0");
            const dd = String(current.getDate()).padStart(2, "0");

            days.push({
                name: `${dd}/${mm}`,
                fullDate: `${yyyy}-${mm}-${dd}`,
                orders: 0,
                revenue: 0,
                year: year
            });

            current.setDate(current.getDate() + 1);
        }

        orders.forEach(order => {
            const orderDay = order.orderDate.split("T")[0]; // yyyy-mm-dd
            const item = days.find(d => d.fullDate === orderDay);
            if (item) {
                item.orders += 1;
                item.revenue += parseFloat(order.totalAmount);
            }
        });

        return days;
    }

    const visualizeData = async () => {
        try {
            const response = await fetch(`${API_URL}/orders/${startDate}/${endDate}`);
            const results = await response.json();

            const daily = buildDailyStats(startDate, endDate, results);

            setData(daily);
        } catch (error) {
            console.log("Lỗi không thể kết nối API ", error);
        }
    };

    function YearLegend({ year }) {
        return (
            <span className="text-[1rem] text-[var(--paragraph)] float-right">
                Năm {year}
            </span>
        );
    }

    const loadUser = async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            const results = await response.json();

            if (results)
                setUser(results);
        } catch (error) {
            console.log("Lỗi không thể kết nối API ", error);
        }
    }

    useEffect(() => {
        visualizeData();
        loadUser();
    }, []);

    return (
        <div className="pt-6">
            <h1 className="font-bold text-3xl">Dashboard</h1>

            {/* Revenue chart */}
            <div className="border-b border-[var(--border)] pb-[8px] mt-6">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    visualizeData();
                }}>
                    <input type="date" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} id="startDate" style={{ fontSize: "16px", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--background4)", marginRight: "10px" }} />
                    <input type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} id="endDate" style={{ fontSize: "16px", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--background4)", marginRight: "10px" }} />
                    <button type="submit" style={{ fontSize: "16px", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--background4)", backgroundColor: "var(--heading)", color: "var(--background2)" }} >Xem thống kê</button>
                </form>
            </div>
            <div className="mt-4">
                {/* Biểu đồ kết hợp doanh thu + đơn hàng */}
                <div style={{ width: "100%", height: "300px" }}>
                    <h3>Doanh thu & Đơn hàng theo tháng</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend
                                content={<YearLegend year={data[0]?.year} />}
                                layout="horizontal"
                                verticalAlign="top"
                                align="right"
                            />
                            <Bar dataKey="orders" barSize={30} fill="#82ca9d" name="Đơn hàng" />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex justify-between gap-x-8 my-20">
                {/* Biểu đồ tròn */}
                <div>
                    <div style={{ width: "400px", height: "400px" }}>
                        <h3>Tỷ lệ sản phẩm bán chạy</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Sinh tố dâu", value: 400 },
                                        { name: "Trà sữa", value: 300 },
                                        { name: "Cà phê", value: 300 },
                                        { name: "Bánh ngọt", value: 200 },
                                    ]}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    fill="#8884d8"
                                    label
                                />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>

                    </div>
                </div>

                <div className="w-full">
                    {/* Account users */}
                    <h3>Danh sách người dùng mới</h3>
                    <div className="mb-[40px] w-full">
                        <div>
                            <table width="100%">
                                <thead className="bg-gray-300">
                                    <tr>
                                        <th className="w-14 border-1 border-gray-500 text-center py-1">STT</th>
                                        <th className="w-20 border-1 border-gray-500 text-center py-1">ID</th>
                                        <th className="border-1 border-gray-500 text-center py-1">Họ tên</th>
                                        <th className="w-52 border-1 border-gray-500 text-center py-1">Email</th>
                                        <th className="w-34 border-1 border-gray-500 text-center py-1">Liên hệ</th>
                                        <th className="w-24 border-1 border-gray-500 text-center py-1">Trạng thái</th>
                                        <th className="w-24 border-1 border-gray-500 text-center py-1">-</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.length === 0 ? (<tr><td colSpan={5}>Không có dữ liệu</td></tr>)
                                        : (user.map((item, index) => (
                                            <tr key={item.userId}>
                                                <td className="border-1 border-gray-300 text-center py-1">{index + 1}</td>
                                                <td className="border-1 border-gray-300 text-center py-1">#UB01{item.userId}</td>
                                                <td className="border-1 border-gray-300 text-center py-1">{item.fullName}</td>
                                                <td className="border-1 border-gray-300 text-center py-1">{item.email}</td>
                                                <td className="border-1 border-gray-300 text-center py-1">{item.phoneNumber}</td>
                                                <td className={`border-1 border-gray-300 text-center py-1 ${item.status === 'Active' ? ' text-green-400' : ' text-red-400'}`}>{item.status}</td>
                                                <td className="border-1 border-gray-300 text-center py-1" align="center">
                                                    <button className="bg-[var(--button)] px-3 rounded-lg text-[var(--textLight)]">Xem</button>
                                                </td>
                                            </tr>
                                        )))
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
