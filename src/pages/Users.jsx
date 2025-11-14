import { useEffect } from "react";

export default function Users ({ isLogin }) {
    useEffect(() => {
        if (!isLogin) window.location.href = "/login";
    }, []);
    
    return (
        <div>
            <h1>Users</h1>
            <p>Manage users here</p>
        </div>
    );
}
