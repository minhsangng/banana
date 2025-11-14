import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login({ isLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const submitForm = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            console.log(email, password);
            const data = await response.json();

            if (!data.success) {
                alert("Sai email hoặc mật khẩu");
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));

            isLogin();
            navigate("/");

        } catch (error) {
            console.log("Lỗi", "Không thể kết nối API");
            console.error(error);
        }
    };

    return (
        <div className="login pt-6">
            <h1 className="font-bold text-3xl">Login</h1>
            <form method={"POST"} onSubmit={submitForm}>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <label htmlFor="email">Email</label>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="email" placeholder="example@gmail.com" id="email" value={email}
                                    onChange={(e) => setEmail(e.target.value)} required />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="password">Password</label>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="password" placeholder="********" id="password" value={password}
                                    onChange={(e) => setPassword(e.target.value)} required />
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{ textAlign: "center" }}><button type="submit">Login</button></td>
                        </tr>
                    </tfoot>
                </table>
            </form>
        </div>
    );
}
