import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../redux/slices/authSlice';

const SignupPage = () => {
    const [emailId, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const resultAction = await dispatch(signupUser({ emailId, password }));
        if (signupUser.fulfilled.match(resultAction)) {
            setMessage('Signup successful! Please login.');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(resultAction.payload || 'Signup failed.');
        }
    };

    return (
        <div className="flex items-center justify-center mt-20">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Sign Up</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={emailId}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Sign Up
                    </button>
                    {message && <p className="text-sm text-center text-green-400">{message}</p>}
                    {error && <p className="text-sm text-center text-red-400">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default SignupPage;