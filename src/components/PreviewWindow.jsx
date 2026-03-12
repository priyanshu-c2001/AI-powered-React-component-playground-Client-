import { useEffect, useState } from 'react';
import { transform } from '@babel/standalone';

// Helper to extract the component name from the code string
function getComponentName(code) {
    const match = code.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/);
    return match ? match[1] : null;
}

const PreviewWindow = ({ jsx, css }) => {
    const [iframeContent, setIframeContent] = useState('');

    useEffect(() => {
        if (!jsx || !jsx.trim()) {
            setIframeContent('');
            return;
        }

        try {
            // FIX: Remove both 'import' and 'export' statements
            const cleanedJsx = jsx
                .replace(/import\s+.*?\s+from\s+['"].*['"];?/g, '')
                .replace(/export\s+default\s+|export\s+/g, '')
                .trim();

            let componentName = getComponentName(cleanedJsx);

            // If no component found, wrap the JSX in a default component
            let codeToUse = cleanedJsx;
            if (!componentName) {
                componentName = 'DefaultComponent';
                codeToUse = `const ${componentName} = () => (${cleanedJsx});`;
            }

            const codeToTranspile = `
                ${codeToUse}
                ReactDOM.render(React.createElement(${componentName}), document.getElementById('root'));
            `;

            const transpiledCode = transform(codeToTranspile, { presets: ['react'] }).code;

            const html = `
                <html>
                    <head>
                        <style>
                            body { 
                                font-family: sans-serif; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                height: 100vh; 
                                margin: 0; 
                                padding: 1rem; 
                                box-sizing: border-box;
                            }
                            ${css}
                        </style>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
                        <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
                        <script>
                            try {
                                ${transpiledCode}
                            } catch (err) {
                                document.body.innerHTML = '<div style="color: #c0392b; padding: 1em;">' + err + '</div>';
                            }
                        </script>
                    </body>
                </html>
            `;
            setIframeContent(html);

        } catch (e) {
            const errorHtml = `<html><body><div style="color: #c0392b; padding: 1em;"><b>Render Error:</b> ${e.message}</div></body></html>`;
            setIframeContent(errorHtml);
        }
    }, [jsx, css]);

    return (
        // FIX: Reverted to using srcDoc for better security and reliability
        <iframe
            srcDoc={iframeContent}
            sandbox="allow-scripts"
            style={{ width: '100%', height: '100%', border: 'none', background: 'white', borderRadius: '0.5rem' }}
            title="Component Preview"
        />
    );
};

export default PreviewWindow;