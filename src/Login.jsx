import { useState } from "react";
import "./style.login.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://172.16.80.164:5001/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const result = await response.json();

            if (result) {
                setIsLogin(true);
                window.location.href = "/App";
            }
        } catch (error) {
            console.error("Lỗi không thể kết nối API ", error);
        }
    }

    return (
        <div className="background">
            <div className="floating-leaf leaf-1"></div>
            <div className="floating-leaf leaf-2"></div>
            <div className="floating-leaf leaf-3"></div>
            <div className="floating-leaf leaf-4"></div>

            <div className="login-container">
                <div className="wellness-card">
                    <div className="organic-border"></div>

                    <div className="mindful-header">
                        <div className="zen-logo">
                            <img src="./main-logo.png" alt="" />
                            <div className="zen-glow"></div>
                        </div>
                        <h1 style={{ fontFamily: "Modak" }}>ADMIN</h1>
                    </div>

                    <form className="harmony-form" id="loginForm" noValidate>
                        <div className="organic-field">
                            <div className="field-nature"></div>
                            <input type="email" id="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label htmlFor="email">Email</label>
                            <span className="gentle-error" id="emailError"></span>
                        </div>

                        <div className="organic-field">
                            <div className="field-nature"></div>
                            <input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <label htmlFor="password">Password</label>

                            <button type="button" className="nature-toggle" id="passwordToggle" aria-label="Toggle password visibility">
                                <svg className="eye-visible" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M10 4c-4 0-7 3-8 6 1 3 4 6 8 6s7-3 8-6c-1-3-4-6-8-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6a2 2 0 100 4 2 2 0 000-4z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <svg className="eye-hidden" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M3 3l14 14M8.5 8.5a2 2 0 002.83 2.83m-.83-4.83a4 4 0 014 4M10 6C6 6 3 9 2 12c.5 1.5 2 3.5 4 4.5M10 14c4 0 7-3 8-6-.5-1.5-2-3.5-4-4.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            <span className="gentle-error" id="passwordError"></span>
                        </div>

                        <button type="button" onClick={handleSubmit} className="harmony-button">
                            <div className="button-earth">{isLogin ? "aaa" : "bbb"}</div>
                            <span className="button-text">ĐĂNG NHẬP</span>

                            <div className="button-growth">
                                <div className="growing-circle circle-1"></div>
                                <div className="growing-circle circle-2"></div>
                                <div className="growing-circle circle-3"></div>
                            </div>

                            <div className="button-aura"></div>
                        </button>
                    </form>

                    <div className="balance-divider">
                        <div className="divider-branch"></div>
                        <div className="divider-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 2L8 8h8l-4-6zM12 22l4-6H8l4 6zM2 12l6-4v8l-6-4zM22 12l-6 4V8l6 4z"
                                    fill="currentColor"
                                    opacity="0.6"
                                />
                            </svg>
                        </div>
                        <div className="divider-branch"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
