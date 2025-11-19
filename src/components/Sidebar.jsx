import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, onLogout }) {
    return (
        <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
            <div>
                <h2>{isOpen ? "Admin" : "A"}</h2>

                <ul>
                    <li>
                        <Link to="/">
                            <ion-icon name="speedometer-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Dashboard
                            </span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/users">
                            <ion-icon name="person-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Users
                            </span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/stores">
                            <ion-icon name="storefront-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Stores
                            </span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/requests">
                            <ion-icon name="chatbubbles-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Requests
                            </span>
                        </Link>
                    </li>

                    <li>
                        <button onClick={onLogout} style={{ marginTop: 20, width: "100%", backgroundColor: "#F9F9F9", borderTop: 1, borderStyle: "solid", borderTopColor: "#F5CB58" }}>
                            <ion-icon name="log-out-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div >
    );
}
