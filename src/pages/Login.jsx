export default function Login() {
    return (
        <div className="login">
            <h1>Login</h1>
            <form>
                <input type="text" placeholder="Username" /><br />
                <input type="password" placeholder="Password" /><br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
