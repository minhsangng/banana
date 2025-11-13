import { useState, useEffect } from "react";

export default function Products() {
    const [content, setContent] = useState([]);

    async function showDishes() {
        try {
            const response = await fetch(`http://localhost:5001/api/search/a`);

            const data = await response.json();

            setContent(data);
            console.log(content);
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
                        <h3>{item.dishName}</h3>
                        <p>{item.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
