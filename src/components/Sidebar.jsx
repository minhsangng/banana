import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="sidebar">
            <h2>Admin</h2>
            <ul>
                <li><Link to="/"><ion-icon name="speedometer-outline"></ion-icon><span>Dashboard</span></Link></li>
                <li><Link to="/users"><ion-icon name="person-outline"></ion-icon><span>Users</span></Link></li>
                <li><Link to="/stores"><ion-icon name="storefront-outline"></ion-icon><span>Stores</span></Link></li>
            </ul>
        </div>
    );
}
