import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, isActive }) {
    return (
        <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
            <div>
                <h2>{isOpen ? "Admin" : "A"}</h2>
                <ul>
                    <li style={{ cursor: isActive ? "pointer" : "not-allowed" }}><Link to="/" style={{ pointerEvents: isActive ? "auto" : "none", justifyContent: isOpen ? "flex-start" : "center", paddingLeft: isOpen ? "10px" : "0", paddingRight: isOpen ? "10px" : "0" }}><ion-icon name="speedometer-outline"></ion-icon><span className={`${isOpen ? "open" : "collapsed"}`}>Dashboard</span></Link></li>
                    <li style={{ cursor: isActive ? "pointer" : "not-allowed" }}><Link to="/users" style={{ pointerEvents: isActive ? "auto" : "none", justifyContent: isOpen ? "flex-start" : "center", paddingLeft: isOpen ? "10px" : "0", paddingRight: isOpen ? "10px" : "0" }}><ion-icon name="person-outline"></ion-icon><span className={`${isOpen ? "open" : "collapsed"}`}>Users</span></Link></li>
                    <li style={{ cursor: isActive ? "pointer" : "not-allowed" }}><Link to="/stores" style={{ pointerEvents: isActive ? "auto" : "none", justifyContent: isOpen ? "flex-start" : "center", paddingLeft: isOpen ? "10px" : "0", paddingRight: isOpen ? "10px" : "0" }}><ion-icon name="storefront-outline"></ion-icon><span className={`${isOpen ? "open" : "collapsed"}`}>Stores</span></Link></li>
                </ul>
            </div>
        </div>
    );
}
