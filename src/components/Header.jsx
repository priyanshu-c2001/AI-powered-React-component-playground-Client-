import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../redux/slices/authSlice';

const Header = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <header className="bg-gray-800 text-white shadow-md">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">AI Playground</Link>
                <div>
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span>{user?.emailId}</span>
                            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">Logout</button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="hover:text-indigo-400">Login</Link>
                            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded">Sign Up</Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;