import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchSessions = createAsyncThunk('sessions/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/session');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.msg);
    }
});

export const createNewSession = createAsyncThunk('sessions/create', async (_, { rejectWithValue }) => {
    try {
        const response = await api.post('/session', { chatHistory: [], code: {} });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.msg);
    }
});

export const updateSession = createAsyncThunk('sessions/update', async ({ id, updates }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/session/${id}`, updates);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.msg);
    }
});

// src/redux/slices/sessionSlice.js

export const generateCode = createAsyncThunk('sessions/generateCode', async ({ prompt, imageFile }, { rejectWithValue }) => {
    try {
        // FIX: Added a stronger instruction for the AI to generate valid code.
        const fullPrompt = `
You are an expert React developer. Your task is to do two things in order:
1. First, provide a brief, friendly, and conversational response to the user's request.
2. After your response, on a new line, provide a single, raw JSON object with two keys: "jsx" and "css".

Crucially, the code inside the "jsx" and "css" values must be syntactically correct and valid.

The user's request is: "${prompt}"
`;

        const formData = new FormData();
        formData.append('prompt', fullPrompt);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await api.post('/generate', formData);

        // ... The rest of the function remains the same ...
        const aiResponseText = response.data.data;

        const jsonStartIndex = aiResponseText.indexOf('{');
        const jsonEndIndex = aiResponseText.lastIndexOf('}') + 1;

        if (jsonStartIndex === -1 || jsonEndIndex === 0) {
            throw new Error("A valid code object was not found in the AI's response.");
        }

        const jsonString = aiResponseText.substring(jsonStartIndex, jsonEndIndex);
        const code = new Function('return ' + jsonString)();

        // Ensure jsx has a valid component definition
        if (code.jsx && !code.jsx.match(/(?:function|const)\s+[A-Z][a-zA-Z0-9_]*\s*(?:\(|=)/)) {
            // Wrap in a default component if no component definition found
            code.jsx = `const GeneratedComponent = () => (\n${code.jsx}\n);`;
        }

        let conversationalText = aiResponseText.substring(0, jsonStartIndex).trim();
        conversationalText = conversationalText.replace(/```(json)?/g, '').trim();

        if (!conversationalText) {
            conversationalText = "Here is the component you requested.";
        }

        return { code, conversationalText };

    } catch (error) {
        console.error("AI Response Parsing Error:", error);
        return rejectWithValue(error.message || "Failed to parse AI response.");
    }
});

const sessionSlice = createSlice({
    name: 'sessions',
    initialState: {
        sessionList: [],
        currentSession: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        setCurrentSession: (state, action) => {
            state.currentSession = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSessions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sessionList = action.payload;
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createNewSession.fulfilled, (state, action) => {
                state.sessionList.push(action.payload);
                state.currentSession = action.payload;
            })
            .addCase(updateSession.fulfilled, (state, action) => {
                state.currentSession = action.payload;
                const index = state.sessionList.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.sessionList[index] = action.payload;
                }
            })
            .addCase(generateCode.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(generateCode.fulfilled, (state, action) => {
                if (state.currentSession) {
                    state.currentSession.code = action.payload.code;
                }
                state.status = 'succeeded';
            })
            .addCase(generateCode.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { setCurrentSession } = sessionSlice.actions;
export default sessionSlice.reducer;