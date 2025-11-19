import { useEffect } from "react";

export default function Users({ isLogin }) {
    useEffect(() => {
        if (!isLogin) return;
    }, []);

    return (
        <div className="pt-6">
            <h1 className="font-bold text-3xl">Users</h1>
            <p>Manage users here</p>
        </div>
    );
}
