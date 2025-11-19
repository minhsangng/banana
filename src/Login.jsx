import { useState } from "react";
import { API_URL } from "./constants/api";
import Swal from "sweetalert2";

export default function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const showMessage = (icon, message) => {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: icon,
            title: message
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem("isLogin", true);
                showMessage("success", "Wecome back!");
                setTimeout(()=>{
                    onLoginSuccess();
                }, 1000);
            } else {
                showMessage("error", "Thông tin đăng nhập chưa chính xác");
            }
        } catch (error) {
            console.error("Lỗi không thể kết nối API ", error);
        }
    };

    return (
        <div className="w-[100vw] h-[100vh] flex items-center">
            <div className="w-[75%] h-[70%] my-[auto] ml-[800px] mr-[200px]">
                <div className="flex justify-between items-center">
                    <div>
                        <img src="../../main-logo.png" alt="Logo" className="w-42 mx-[auto]" />
                    </div>
                    <div>
                        <ion-icon name="flash-outline"></ion-icon>
                    </div>
                    <div>
                        <h1 className="font-['Modak']! text-[3.5rem] text-[var(--heading)] text-center mb-0">LOGIN</h1>
                        <h4 className="font-[1.3rem] text-center text-[var(--paragraph)]">FOR ADMIN</h4>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-[2em]">
                    <table width={"100%"}>
                        <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="email" className="text-[1.3rem]">Email</label>
                                    <input type="email" className="w-full outline-none rounded-[.5em] border-1 border-[var(--border)] px-[1.6rem] py-[.8rem] mb-[1em] text-[1.2rem] text-[var(--paragraph)] bg-[var(--light)] shadow-md shadow-gray-600" name="email" id="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="password" className="text-[1.3rem]">Password</label>
                                    <input type="password" className="w-full outline-none rounded-[.5em] border-1 border-[var(--border)] px-[1.6rem] py-[10px] mb-[1em] text-[1.2rem] text-[var(--paragraph)] bg-[var(--light)] shadow-md shadow-gray-600" name="password" id="password" value={password} required onChange={(e) => setPassword(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td align="center">
                                    <button type="submit" className="text-[1.5rem] bg-[var(--button)] text-[var(--textLight)] pt-[10px] px-[22px] pb-[6px] mt-[1.2em] rounded-[.5em] shadow-md shadow-gray-600">ĐĂNG NHẬP</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
    );
}
