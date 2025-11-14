import { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from "recharts";

export default function Dashboard() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fakeData = [
            { name: "Tháng 1", orders: 400, revenue: 2400 },
            { name: "Tháng 2", orders: 300, revenue: 1398 },
            { name: "Tháng 3", orders: 500, revenue: 9800 },
            { name: "Tháng 4", orders: 200, revenue: 3908 },
            { name: "Tháng 5", orders: 350, revenue: 4800 },
            { name: "Tháng 6", orders: 350, revenue: 7466 },
            { name: "Tháng 7", orders: 350, revenue: 6800 },
            { name: "Tháng 8", orders: 350, revenue: 4800 },
            { name: "Tháng 9", orders: 350, revenue: 4344 },
            { name: "Tháng 10", orders: 350, revenue: 8930 },
            { name: "Tháng 11", orders: 350, revenue: 4500 },
            { name: "Tháng 12", orders: 350, revenue: 5600 },
        ];
        setData(fakeData);
    }, []);

    return (
        <div className="pt-6">
            <h1 className="font-bold text-3xl">Dashboard</h1>

            {/* Chart */}
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <form action="" method="GET">
                    <input type="date" name="startDate" id="startDate" style={{ fontSize: "16px", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--background4)", marginRight: "10px" }} />
                    <input type="date" name="endDate" id="endDate" style={{ fontSize: "16px", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--background4)", marginRight: "10px" }} />
                    <button type="submit" style={{ fontSize: "16px", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--background4)", backgroundColor: "var(--heading)", color: "var(--background2)" }} >Xem thống kê</button>
                </form>
            </div>
            <div style={{ marginTop: "10px" }}>
                {/* Biểu đồ kết hợp doanh thu + đơn hàng */}
                <div style={{ width: "100%", height: "300px" }}>
                    <h3>Doanh thu & Đơn hàng theo tháng</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="orders" barSize={30} fill="#82ca9d" name="Đơn hàng" />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Biểu đồ tròn */}
                <div className="mt-20">
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
            </div>

            {/* Account lists */}
            <h3>Tài khoản mới trong tuần</h3>
            <div style={{ display: "flex", marginBottom: "40px" }}>
                <div style={{ width: "50%" }}>
                    <table width="100%" style={{ borderCollapse: "collapse" }}>
                        <thead style={{ backgroundColor: "gray", position: "sticky", top: 0, zIndex: 2 }}>
                            <tr>
                                <th>STT</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Liên hệ</th>
                                <th></th>
                            </tr>
                        </thead>
                    </table>

                    <div style={{ maxHeight: "100px", overflowY: "auto", border: "1px solid var(--border)" }}>
                        <table width="100%" style={{ borderCollapse: "collapse" }}>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Nguyen Minh Sang</td>
                                    <td>fffein@gmail.com</td>
                                    <td>0992329256</td>
                                    <td>
                                        <button>Sửa</button>
                                        <button>Khóa</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Trần Văn A</td>
                                    <td>abc@gmail.com</td>
                                    <td>0123456789</td>
                                    <td>
                                        <button>Sửa</button>
                                        <button>Khóa</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>Lê Thị B</td>
                                    <td>bbb@gmail.com</td>
                                    <td>0987654321</td>
                                    <td>
                                        <button>Sửa</button>
                                        <button>Khóa</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>Lê Thị B</td>
                                    <td>bbb@gmail.com</td>
                                    <td>0987654321</td>
                                    <td>
                                        <button>Sửa</button>
                                        <button>Khóa</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>Lê Thị B</td>
                                    <td>bbb@gmail.com</td>
                                    <td>0987654321</td>
                                    <td>
                                        <button>Sửa</button>
                                        <button>Khóa</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                </div>
            </div>
        </div>
    );
}
