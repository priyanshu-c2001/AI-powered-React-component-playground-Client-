import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateCode, updateSession } from '../redux/slices/sessionSlice';
import { Paperclip, X } from 'lucide-react';

import SessionList from '../components/SessionList';
import PreviewWindow from '../components/PreviewWindow';
import CodeEditor from '../components/CodeEditor';
import Spinner from '../components/Spinner';

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { currentSession, status } = useSelector((state) => state.sessions);
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

    const chatHistory = currentSession?.chatHistory || [];

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleEditPrompt = (text) => {
        setPrompt(text);
    };

    const handleGenerate = async () => {
        if (!prompt || !currentSession) return;

        // FIX: Use 'sender' and 'message' to match the Mongoose schema
        const userMessage = { sender: 'user', message: prompt, hasImage: !!imageFile };

        const genResult = await dispatch(generateCode({ prompt, imageFile }));
        
        if (generateCode.fulfilled.match(genResult)) {
            // FIX: Use 'sender' and 'message' to match the Mongoose schema
            const aiMessage = { sender: 'ai', message: genResult.payload.conversationalText };
            

            const finalChatHistory = [...chatHistory, userMessage, aiMessage];

            dispatch(updateSession({
                id: currentSession._id,
                updates: {
                    chatHistory: finalChatHistory,
                    code: genResult.payload.code
                }
            }));
        } else {
            console.error("Generation failed:", genResult.payload);
        }

        setPrompt('');
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="grid grid-cols-12 grid-rows-6 gap-2 p-2 h-[calc(100vh-4rem)]">
            {/* Session List */}
            <div className="col-span-2 row-span-6 bg-gray-800 rounded-lg p-2 overflow-y-auto">
                <SessionList />
            </div>

            {currentSession ? (
                <>
                    {/* Preview & Chat */}
                    <div className="col-span-10 row-span-4 grid grid-cols-12 gap-2">
                        <div className="col-span-8 bg-gray-800 rounded-lg p-2">
                            <h2 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-1">Preview</h2>
                            <PreviewWindow jsx={currentSession.code?.jsx || ''} css={currentSession.code?.css || ''} />
                        </div>
                        <div className="col-span-4 bg-gray-800 rounded-lg flex flex-col p-2">
                            <h2 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-1">Chat</h2>
                            <div className="flex-grow overflow-y-auto mb-2 space-y-4 pr-2">
                                {chatHistory.map((msg, index) => (
                                    <div
                                        key={index}
                                        // FIX: Check for msg.sender and use msg.message
                                        onClick={() => msg.sender === 'user' && handleEditPrompt(msg.message)}
                                        className={`p-2 rounded-lg max-w-xs text-sm ${msg.sender === 'user'
                                                ? 'bg-indigo-600 ml-auto cursor-pointer hover:bg-indigo-500'
                                                : 'bg-gray-700'
                                            }`}
                                    >
                                        {msg.hasImage && <span className="block text-xs text-indigo-200 mb-1">[Image Attached]</span>}
                                        {/* FIX: Render msg.message */}
                                        <p>{msg.message}</p>
                                    </div>
                                ))}
                                {status === 'loading' && <div className="self-center"><Spinner /></div>}
                            </div>

                            {imageFile && (
                                <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md mb-2 text-xs">
                                    <span>{imageFile.name}</span>
                                    <button onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-gray-400 hover:text-white"><X size={16} /></button>
                                </div>
                            )}

                            <div className="flex">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                                <button onClick={() => fileInputRef.current.click()} className="bg-gray-700 p-2 rounded-l-md hover:bg-gray-600">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your component..."
                                    className="flex-grow bg-gray-700 border-l border-r border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                                />
                                <button onClick={handleGenerate} disabled={status === 'loading'} className="bg-indigo-600 px-4 rounded-r-md hover:bg-indigo-700 disabled:bg-indigo-400">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="col-span-10 row-span-2 bg-gray-800 rounded-lg p-2 mt-1 overflow-hidden flex flex-col">
                        <CodeEditor jsx={currentSession.code?.jsx || ''} css={currentSession.code?.css || ''} />
                    </div>
                </>
            ) : (
                <div className="col-span-10 row-span-6 flex items-center justify-center bg-gray-800 rounded-lg">
                    <p className="text-xl text-gray-400">Select a session or create a new one to start.</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;