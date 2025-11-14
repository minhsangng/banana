import { useState } from "react";
import { Link } from "react-router-dom";

export default function Header({ onToggleSidebar, isLogin, onLogout }) {
    const [iconMenu, setIconMenu] = useState("menu-outline");
    const [open, setOpen] = useState(true);
    const [openSearchBar, setOpenSearchBar] = useState(false);

    // menu user
    const [openUserMenu, setOpenUserMenu] = useState(false);

    const toggleIcon = () => {
        setOpen(!open);
        setIconMenu(!open ? "menu-outline" : "filter-outline");
        onToggleSidebar();
    };

    const toggleSearch = () => {
        setOpenSearchBar(!openSearchBar);
    };

    const toggleUserMenu = () => {
        if (!isLogin) return;
        setOpenUserMenu(!openUserMenu);
    };

    return (
        <div className="header">
            <div className="leftHeader">
                <Link to="/"><img src="/main-logo.png" alt="Logo" /></Link>
                <ion-icon name={iconMenu} onClick={toggleIcon} className="menuIcon"></ion-icon>

                <div className={`searchContainer ${openSearchBar ? "openSearch" : ""}`}>
                    <ion-icon name="search-outline" onClick={toggleSearch}></ion-icon>
                    <input
                        type="search"
                        id="search"
                        placeholder="Tìm kiếm..."
                        style={{ display: openSearchBar ? "block" : "none" }}
                    />
                </div>
            </div>

            <div className="rightHeader">
                <div className="notifyIcon">
                    <ion-icon name="notifications-outline"></ion-icon>
                </div>

                <div className="userIcon">

                    {/* Nếu chưa login → link đến login */}
                    {!isLogin && (
                        <Link to="/login" style={{ color: "#000" }}>
                            <ion-icon name="person-circle-outline" className="personIcon"></ion-icon>
                        </Link>
                    )}

                    {/* Nếu đã login → không dùng Link */}
                    {isLogin && (
                        <ion-icon
                            name="person-circle-outline"
                            className="personIcon"
                            onClick={toggleUserMenu}
                            style={{ cursor: "pointer" }}
                        ></ion-icon>
                    )}

                    {/* menu user */}
                    {isLogin && openUserMenu && (
                        <div className="navbar">
                            <h4>Tài khoản</h4>
                            <ul>
                                <li>Cập nhật thông tin</li>
                                <li><p onClick={onLogout}>Đăng xuất</p></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
