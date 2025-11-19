import { Link, useLocation } from "react-router-dom";
import Swal from 'sweetalert2'

export default function Sidebar({ isOpen, onLogout }) {
    const location = useLocation();
    const currentPath = location.pathname;

    const confirmLogout = () => {
        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Logout',
            confirmButtonColor: '#E95322',
            showClass: {
                popup:
                    `animate__animated
                    animate__fadeInUp
                    animate__faster `
            },
            hideClass: {
                popup:
                    `animate__animated
                    animate__fadeOutDown
                    animate__faster`
            }
        }).then((result) => {
            if (result.isConfirmed) {
                onLogout();
            }
        });
    }
    return (
        <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
            <div>
                <h2>{isOpen ? "Control" : <ion-icon name="construct-outline"></ion-icon>}</h2>

                <ul>
                    <li>
                        <Link to="/" className={currentPath === "/" ? "bg-[var(--background3)]" : ""}>
                            <ion-icon name="bar-chart-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Dashboard
                            </span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/users" className={currentPath === "/users" ? "bg-[var(--background3)]" : ""}>
                            <ion-icon name="person-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Users
                            </span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/stores" className={currentPath === "/stores" ? "bg-[var(--background3)]" : ""}>
                            <ion-icon name="storefront-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Stores
                            </span>
                        </Link>
                    </li>
                    
                    <li>
                        <Link to="/orders" className={currentPath === "/orders" ? "bg-[var(--background3)]" : ""}>
                            <ion-icon name="podium-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Orders
                            </span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/requests" className={currentPath === "/requests" ? "bg-[var(--background3)]" : ""}>
                            <ion-icon name="chatbubbles-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>
                                Requests
                            </span>
                        </Link>
                    </li>

                    <li>
                        <button onClick={confirmLogout} className="mt-[20px] w-full bg-[var(--textLight)] border-t-1 border-[var(--background4)]">
                            <ion-icon name="log-out-outline"></ion-icon>
                            <span className={isOpen ? "open" : "collapsed"}>Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div >
    );
}
