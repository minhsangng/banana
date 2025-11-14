import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, isActive }) {
    const linkClass = ({ isActive: active }) =>
        `sidebar-item ${active ? "active" : ""}`;

    const linkStyle = {
        pointerEvents: isActive ? "auto" : "none",
        cursor: isActive ? "pointer" : "not-allowed",
        opacity: isActive ? 1 : 0.5,
    };

    const itemLayout = {
        justifyContent: isOpen ? "flex-start" : "center",
        paddingLeft: isOpen ? "10px" : "0",
        paddingRight: isOpen ? "10px" : "0",
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
            <div>
                <h2>{isOpen ? "Admin" : "A"}</h2>

                <ul>
                    <li>
                        <NavLink
                            to="/"
                            className={linkClass}
                            style={{ ...linkStyle, ...itemLayout }}
                        >
                            <ion-icon name="speedometer-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Dashboard
                            </span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/users"
                            className={linkClass}
                            style={{ ...linkStyle, ...itemLayout }}
                        >
                            <ion-icon name="person-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Users
                            </span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/stores"
                            className={linkClass}
                            style={{ ...linkStyle, ...itemLayout }}
                        >
                            <ion-icon name="storefront-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Stores
                            </span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    );
}
