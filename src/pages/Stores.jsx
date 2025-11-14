import { useState, useEffect } from "react";

export default function Products() {
    const [content, setContent] = useState([]);

    async function showDishes() {
        try {
            const response = await fetch(`http://localhost:5001/api/stores`);

            const data = await response.json();

            setContent(data);
        } catch (error) {
            console.log('Lỗi', 'Không thể kết nối API');
            console.error(error);
        }
    };

    useEffect(() => {
        showDishes();
    }, []);

    return (
        <div className="pt-6">
            <h1 className="font-bold text-3xl">Stores</h1>
            <div>
                <table className="w-[100%] text-center">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="border border-gray-400">STT</th>
                            <th className="border border-gray-400">Cửa hàng</th>
                            <th className="border border-gray-400">Vị trí</th>
                            <th className="border border-gray-400">Liên hệ</th>
                            <th className="border border-gray-400"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {content.length > 0 && content.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-gray-400 py-1">
                                    {item.storeId}
                                </td>
                                <td className="border border-gray-400 py-1">
                                    {item.storeName}
                                </td>
                                <td className="border border-gray-400 py-1">
                                    {item.location}
                                </td>
                                <td className="border border-gray-400 py-1">
                                    {item.phoneNumber}
                                </td>
                                <td className="border border-gray-400 py-1">
                                    <button className="border border-[var(--background4)] bg-[var(--background3)] px-6 rounded text-[var(--heading)] mr-2">Sửa</button>
                                    <button className="border border-[var(--background4)] bg-[var(--heading)] px-6 rounded text-[var(--background3)]">Khóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
