import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Copy, Download } from 'lucide-react';

const CodeEditor = ({ jsx, css }) => {
    const [activeTab, setActiveTab] = useState('jsx');

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleDownload = () => {
        const zip = new JSZip();
        zip.file("Component.jsx", jsx);
        zip.file("styles.css", css);
        zip.generateAsync({ type: "blob" }).then(content => {
            saveAs(content, "component.zip");
        });
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-700 flex-shrink-0">
                <div className="flex space-x-1">
                    <button onClick={() => setActiveTab('jsx')} className={`px-4 py-2 text-sm rounded-t-md ${activeTab === 'jsx' ? 'bg-gray-700' : 'bg-transparent'}`}>JSX</button>
                    <button onClick={() => setActiveTab('css')} className={`px-4 py-2 text-sm rounded-t-md ${activeTab === 'css' ? 'bg-gray-700' : 'bg-transparent'}`}>CSS</button>
                </div>
                <button onClick={handleDownload} className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">
                    <Download size={16} />
                    <span>Download .zip</span>
                </button>
            </div>
            <div className="relative flex-grow overflow-hidden w-full">
                {activeTab === 'jsx' && (
                    <>
                        <button onClick={() => handleCopy(jsx)} className="absolute top-2 right-2 z-10 p-1 bg-gray-600 rounded hover:bg-gray-500"><Copy size={16} /></button>
                        <CodeMirror
                            value={jsx}
                            height="100%"
                            extensions={[javascript({ jsx: true })]}
                            theme="dark"
                            className="h-full"
                        />
                    </>
                )}
                {activeTab === 'css' && (
                    <>
                        <button onClick={() => handleCopy(css)} className="absolute top-2 right-2 z-10 p-1 bg-gray-600 rounded hover:bg-gray-500"><Copy size={16} /></button>
                        <CodeMirror
                            value={css}
                            height="100%"
                            extensions={[javascript({ jsx: false })]} // Using js for css highlighting for simplicity
                            theme="dark"
                            className="h-full"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;