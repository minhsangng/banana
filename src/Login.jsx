import { useState } from "react";
import "./assets/css/style.login.css";

export default function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log(email, password);

        try {
            const response = await fetch(`http://172.16.80.28:5001/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem("isLogin", true);
                onLoginSuccess();
            } else {
                alert("Đăng nhập thất bại!");
            }
        } catch (error) {
            console.error("Lỗi không thể kết nối API ", error);
        }
    };

    return (
        <div className="container">
            <div className="login-form">
                <h1>ADMIN</h1>

                <form onSubmit={handleSubmit}>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="email">Email</label>
                                    <input type="email" name="email" id="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="password">Password</label>
                                    <input type="password" name="password" id="password" value={password} required onChange={(e) => setPassword(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td align="center">
                                    <button type="submit">ĐĂNG NHẬP</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
    );
}
