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
        <div>
            <h1>Stores</h1>
            <div>
                {content.length > 0 && content.map((item, index) => (
                    <div key={index}>
                        <h3>{item.storeName}</h3>
                        <p>{item.location}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
