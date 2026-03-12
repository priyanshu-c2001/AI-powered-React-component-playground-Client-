import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSessions, createNewSession, setCurrentSession } from '../redux/slices/sessionSlice';
import { PlusCircle } from 'lucide-react';

const SessionList = () => {
    const dispatch = useDispatch();
    const { sessionList, currentSession, status } = useSelector((state) => state.sessions);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchSessions());
        }
    }, [status, dispatch]);

    const handleSelectSession = (session) => {
        dispatch(setCurrentSession(session));
    };

    const handleCreateNew = () => {
        dispatch(createNewSession());
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                <h2 className="text-lg font-semibold">Sessions</h2>
                <button onClick={handleCreateNew} className="text-gray-300 hover:text-white"><PlusCircle size={20} /></button>
            </div>
            <ul className="space-y-2 overflow-y-auto">
                {sessionList.map((session) => (
                    <li key={session._id}>
                        <button
                            onClick={() => handleSelectSession(session)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm ${currentSession?._id === session._id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            Session - {new Date(session.createdAt).toLocaleDateString()}
                        </button>
                    </li>
                ))}
                {status === 'loading' && <p>Loading...</p>}
            </ul>
        </div>
    );
};

export default SessionList;