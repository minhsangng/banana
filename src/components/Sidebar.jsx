import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="sidebar">
            <h2>Admin</h2>
            <ul>
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/users">Users</Link></li>
                <li><Link to="/products">Products</Link></li>
            </ul>
        </div>
    );
}
