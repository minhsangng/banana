import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login({ isLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const submitForm = (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        isLogin();
        navigate("/");
    };

    return (
        <div className="login">
            <h1>Login</h1>
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
                                    onChange={(e) => setEmail(e.target.value)}required />
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
