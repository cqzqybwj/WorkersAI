// Version: 1.0.6 - Unified Cloudflare Workers AI Chat App with single file deployment.
// Handles login, chat, and API routes within one Worker.
// All shorthand property initializers explicitly converted to key: value pairs for maximum compatibility.
// Implemented multilingual support (English and Chinese) with URL-based language routing.
// Chat UI: Logout button simplified to icon, positioned top-right with dark mode toggle and language selector to its left.
// Implemented persistent chat history by not clearing localStorage on logout.
// Added "Delete Current Chat" functionality with confirmation modal.
/** @type {ExportedHandler} */
export default (() => {

    // --- HTML Templates (English Versions) ---

    const frontendHtmlTemplate_en = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare Workers AI Chat</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            height: 100vh;
            overflow: hidden;
            transition: background-color 0.3s ease;
        }
        #app-container {
            display: flex;
            height: 100%;
            width: 100%;
        }
        #sidebar {
            width: 280px;
            background-color: #2d3748;
            color: #e2e8f0;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
            z-index: 20;
            flex-shrink: 0;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        #new-chat-button {
            background-color: #4f46e5;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: background-color 0.3s ease;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        #new-chat-button:hover {
            background-color: #4338ca;
        }
        #model-select-container-main {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            z-index: 25;
            background-color: #ffffff;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
        }
        #model-select-label-main {
            display: block;
            font-size: 0.85rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }
        #model-select-main {
            width: 200px;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            color: #374151;
            font-size: 0.95rem;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1.2em;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        #model-select-main:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
        }
        #history-list {
            flex-grow: 1;
            overflow-y: auto;
            padding-right: 0.5rem;
        }
        .history-item {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 0.5rem;
            transition: background-color 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .history-item:hover {
            background-color: #4a5568;
        }
        .history-item.active {
            background-color: #6366f1;
            color: white;
            font-weight: 600;
        }
        .history-summary {
            font-size: 0.95rem;
            font-weight: 500;
            color: inherit;
            margin-bottom: 0.2rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }
        .history-timestamp {
            font-size: 0.75rem;
            color: #a0aec0;
            opacity: 0.8;
        }
        body.dark-mode .history-timestamp {
            color: #a0aec0;
        }
        #main-content {
            flex-grow: 1;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            position: relative;
            transition: background-color 0.3s ease;
            padding-top: 5rem;
        }
        .chat-messages {
            flex-grow: 1;
            padding: 1.5rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            scroll-behavior: smooth;
        }
        .message-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        .message-wrapper.user {
            justify-content: flex-end;
        }
        .message-wrapper.ai {
            justify-content: flex-start;
        }
        .message-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.9rem;
            font-weight: 600;
            color: white;
            flex-shrink: 0;
        }
        .message-icon.user {
            background-color: #6366f1;
        }
        .message-icon.ai {
            background-color: #10b981;
        }
        .message-content {
            max-width: 75%;
            padding: 0.9rem 1.2rem;
            border-radius: 18px;
            word-wrap: break-word;
            line-height: 1.5;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .message-wrapper.user .message-content {
            background-color: #e0e7ff;
            border-bottom-right-radius: 6px;
            color: #374151;
        }
        .message-wrapper.ai .message-content {
            background-color: #f1f5f9;
            border-bottom-left-radius: 6px;
            color: #374151;
        }
        .message-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-top: 0.5rem;
            display: block;
        }
        .chat-input-area {
            padding: 1.5rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 0.75rem;
            align-items: center;
            background-color: #ffffff;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
            z-index: 10;
            transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .chat-input {
            flex-grow: 1;
            padding: 0.9rem 1.2rem;
            border: 1px solid #cbd5e1;
            border-radius: 25px;
            outline: none;
            font-size: 1rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, color 0.3s ease;
        }
        .chat-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        .chat-button {
            background-color: #6366f1;
            color: white;
            padding: 0.9rem 1.75rem;
            border-radius: 25px;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: background-color 0.3s ease, transform 0.1s ease;
            box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }
        .chat-button:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
        }
        .chat-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
        }
        .loading-indicator {
            position: absolute;
            bottom: 110px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(255, 255, 255, 0.9);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            color: #6b7280;
            font-size: 0.9rem;
            z-index: 20;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: pulse 1.5s infinite;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .loading-indicator::before {
            content: '';
            width: 12px;
            height: 12px;
            border: 2px solid #6366f1;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0% { transform: translateX(-50%) scale(1); opacity: 1; }
            50% { transform: translateX(-50%) scale(1.02); opacity: 0.9; }
            100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .error-message {
            position: absolute;
            bottom: 110px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #fee2e2;
            color: #dc2626;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            font-size: 0.9rem;
            z-index: 20;
            display: none;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .ai-thought-process {
            font-size: 0.85em;
            color: #a0aec0;
            font-style: italic;
            opacity: 0.7;
            display: block;
            margin-top: 0.5em;
        }

        body.dark-mode {
            background-color: #1a202c;
            color: #e2e8f0;
        }
        body.dark-mode #sidebar {
            background-color: #1a202c;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
        }
        body.dark-mode #main-content {
            background-color: #2d3748;
        }
        body.dark-mode .history-item:hover {
            background-color: #4a5568;
        }
        body.dark-mode .message-wrapper.user .message-content {
            background-color: #4c51bf;
            color: #e2e8f0;
        }
        body.dark-mode .message-wrapper.ai .message-content {
            background-color: #4a5568;
            color: #e2e8f0;
        }
        body.dark-mode .chat-input-area {
            background-color: #2d3748;
            border-top-color: #4a5568;
        }
        body.dark-mode .chat-input {
            background-color: #4a5568;
            border-color: #6366f1;
            color: #e2e8f0;
        }
        body.dark-mode .chat-input::placeholder {
            color: #a0aec0;
        }
        body.dark-mode #model-select-container-main {
            background-color: #2d3748;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        body.dark-mode #model-select-label-main {
            color: #a0aec0;
        }
        body.dark-mode #model-select-main {
            background-color: #4a5568;
            border-color: #6366f1;
            color: #e2e8f0;
        }
        body.dark-mode #model-select-main option {
            background-color: #2d3748;
            color: #e2e8f0;
        }
        body.dark-mode .loading-indicator {
            background-color: rgba(45, 55, 72, 0.9);
            color: #e2e8f0;
        }
        body.dark-mode .error-message {
            background-color: #ef4444;
            color: white;
        }
        body.dark-mode .ai-thought-process {
            color: #718096;
        }
        #top-right-controls {
            position: absolute;
            top: 1rem;
            right: 1rem;
            z-index: 30;
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        .icon-button {
            background-color: #6366f1;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
            transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
        }
        .icon-button:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
        }
        .icon-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
        }
        body.dark-mode .icon-button {
            background-color: #4a5568;
            box-shadow: 0 4px 10px rgba(0,0,0,.3);
        }
        body.dark-mode .icon-button:hover {
            background-color: #6366f1;
        }
        #language-select-chat {
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            color: #374151;
            font-size: 0.9rem;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        body.dark-mode #language-select-chat {
            background-color: #4a5568;
            border-color: #6366f1;
            color: #e2e8f0;
        }
        body.dark-mode #language-select-chat option {
            background-color: #2d3748;
            color: #e2e8f0;
        }
        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.2rem;
            color: #374151;
            z-index: 100;
            transition: opacity 0.3s ease;
        }
        body.dark-mode #loading-overlay {
            background-color: rgba(26, 32, 44, 0.9);
            color: #e2e8f0;
        }
        /* Confirmation Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .modal-overlay.show {
            opacity: 1;
            visibility: visible;
        }
        .modal-content {
            background-color: #ffffff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            text-align: center;
            width: 90%;
            max-width: 400px;
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        }
        .modal-overlay.show .modal-content {
            transform: translateY(0);
        }
        body.dark-mode .modal-content {
            background-color: #2d3748;
            color: #e2e8f0;
        }
        .modal-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #374151;
        }
        body.dark-mode .modal-content h3 {
            color: #e2e8f0;
        }
        .modal-content p {
            margin-bottom: 1.5rem;
            color: #6b7280;
        }
        body.dark-mode .modal-content p {
            color: #a0aec0;
        }
        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
        }
        .modal-button {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.3s ease, transform 0.1s ease;
        }
        .modal-button.confirm {
            background-color: #ef4444;
            color: white;
        }
        .modal-button.confirm:hover {
            background-color: #dc2626;
        }
        .modal-button.cancel {
            background-color: #e2e8f0;
            color: #374151;
        }
        body.dark-mode .modal-button.cancel {
            background-color: #4a5568;
            color: #e2e8f0;
        }
        .modal-button.cancel:hover {
            background-color: #cbd5e1;
        }
        body.dark-mode .modal-button.cancel:hover {
            background-color: #6366f1;
        }
    </style>
</head>
<body>
    <div id="loading-overlay">Loading...</div>
    <div id="app-container" style="display: none;">
        <div id="sidebar">
            <button id="new-chat-button">➕ New Chat</button>
            <div id="history-list">
                <div style="font-size: 0.85rem; color: #a0aec0; margin-bottom: 0.75rem;">History</div>
            </div>
            <button id="delete-current-chat-button" class="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                🗑️ Delete Current Chat
            </button>
        </div>
        <div id="main-content">
            <div id="model-select-container-main">
                <label for="model-select-main" id="model-select-label-main">Select AI Model:</label>
                <select id="model-select-main"></select>
            </div>

            <div class="chat-messages" id="chat-messages">
            </div>
            <div class="loading-indicator" id="loading-indicator" style="display: none;">
                <span>AI is thinking...</span>
            </div>
            <div class="error-message" id="error-message" style="display: none;"></div>
            <div class="chat-input-area">
                <input type="text" id="user-input" class="chat-input" placeholder="Enter your question..." autocomplete="off">
                <button id="send-button" class="chat-button">Send</button>
            </div>
        </div>
    </div>
    <div id="top-right-controls">
        <select id="language-select-chat">
            <option value="en">English</option>
            <option value="cn">中文</option>
        </select>
        <button id="dark-mode-toggle" class="icon-button">🌙</button>
        <button id="logout-button" class="icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5h-6ZM12 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>

    <!-- Confirmation Modal -->
    <div id="delete-confirmation-modal" class="modal-overlay">
        <div class="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the current chat session? This action cannot be undone.</p>
            <div class="modal-buttons">
                <button id="confirm-delete" class="modal-button confirm">Delete</button>
                <button id="cancel-delete" class="modal-button cancel">Cancel</button>
            </div>
        </div>
    </div>

    <script type="module">
        console.log("Current page path:", window.location.pathname);

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        let userId = localStorage.getItem('anonymousUserId');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('anonymousUserId', userId);
        }
        console.log("Using anonymous user ID:", userId);

        const loadingOverlay = document.getElementById('loading-overlay');
        const appContainer = document.getElementById('app-container');

        const pathSegments = window.location.pathname.split('/');
        let currentLang = 'en';
        if (pathSegments.length > 1 && (pathSegments[1] === 'cn' || pathSegments[1] === 'en')) {
            currentLang = pathSegments[1];
        }

        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            appContainer.style.display = 'flex';
            populateModelSelect();
            loadChatSession(localStorage.getItem('chatSessionId') || crypto.randomUUID());
            fetchAllSessionMetadata();
            document.getElementById('language-select-chat').value = currentLang;
        }, 100);

        const chatMessages = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const loadingIndicator = document.getElementById('loading-indicator');
        const errorMessage = document.getElementById('error-message');
        const newChatButton = document.getElementById('new-chat-button');
        const historyList = document.getElementById('history-list');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const modelSelect = document.getElementById('model-select-main');
        const logoutButton = document.getElementById('logout-button');
        const languageSelectChat = document.getElementById('language-select-chat');
        const deleteCurrentChatButton = document.getElementById('delete-current-chat-button');
        const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
        const confirmDeleteButton = document.getElementById('confirm-delete');
        const cancelDeleteButton = document.getElementById('cancel-delete');

        let currentSessionId = localStorage.getItem('chatSessionId');
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
            localStorage.setItem('chatSessionId', currentSessionId);
        }

        let allSessionMetadata = [];

        const availableModels = [
            { id: "@cf/meta/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", name: "Llama 3.3 70B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-8b-instruct-fast", name: "Llama 3.1 8B Instruct Fast (Meta)", type: "text" },
            { id: "@cf/google/gemma-3-12b-it", name: "Gemma 3 12B Instruct (Google)", type: "text" },
            { id: "@cf/qwen/qwq-32b", name: "Qwen QWQ 32B (Qwen)", type: "text" },
            { id: "@cf/qwen/qwen2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B Instruct (Qwen)", type: "text" },
            { id: "@cf/meta/llama-guard-3-8b", name: "Llama Guard 3 8B (Meta)", type: "text" },
            { id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", name: "DeepSeek R1 Distill Qwen 32B", type: "text" },
            { id: "@cf/meta/llama-3.2-1b-instruct", name: "Llama 3.2 1B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.2-3b-instruct", name: "Llama 3.2 3B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-8b-instruct-awq", name: "Llama 3.1 8B Instruct AWQ (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-8b-instruct-fp8", name: "Llama 3.1 8B Instruct FP8 (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3-8b-instruct", name: "Llama 3 8B Instruct (Meta)", type: "text" },
            { id: "@cf/google/gemma-7b-it-lora", name: "Gemma 7B Instruct LoRA (Google)", type: "text" },
            { id: "@cf/google/gemma-2b-it-lora", name: "Gemma 2B Instruct LoRA (Google)", type: "text" },
            { id: "@cf/meta/llama-2-7b-chat-hf-lora", name: "Llama 2 7B Chat HF LoRA (Meta)", type: "text" },
            { id: "@cf/google/gemma-7b-it", name: "Gemma 7B Instruct (Google)", type: "text" },
            { id: "@cf/nousresearch/starling-lm-7b-beta", name: "Starling LM 7B Beta (NousResearch)", type: "text" },
            { id: "@cf/nousresearch/hermes-2-pro-mistral-7b", name: "Hermes 2 Pro Mistral 7B (NousResearch)", type: "text" },
            { id: "@cf/qwen/qwen1.5-1.8b-chat", name: "Qwen 1.5 1.8B Chat (Qwen)", type: "text" },
            { id: "@cf/microsoft/phi-2", name: "Phi-2 (Microsoft)", type: "text" },
            { id: "@cf/tinyllama/tinyllama-1.1b-chat-v1.0", name: "TinyLlama 1.1B Chat v1.0", type: "text" },
            { id: "@cf/qwen/qwen1.5-14b-chat-awq", name: "Qwen 1.5 14B Chat AWQ (Qwen)", type: "text" },
            { id: "@cf/qwen/qwen1.5-7b-chat-awq", name: "Qwen 1.5 7B Chat AWQ (Qwen)", type: "text" },
            { id: "@cf/qwen/qwen1.5-0.5b-chat", name: "Qwen 1.5 0.5B Chat (Qwen)", type: "text" },
            { id: "@cf/huggingface/discolm-german-7b-v1-awq", name: "Discolm German 7B v1 AWQ (HuggingFace)", type: "text" },
            { id: "@cf/tiiuae/falcon-7b-instruct", name: "Falcon 7B Instruct (TII)", type: "text" },
            { id: "@cf/openchat/openchat-3.5-0106", name: "OpenChat 3.5", type: "text" },
            { id: "@cf/defog/sqlcoder-7b-2", name: "SQLCoder 7B (Defog)", type: "text" },
            { id: "@cf/deepseek-ai/deepseek-math-7b-instruct", name: "Deepseek Math 7B Instruct", type: "text" },
            { id: "@hf/thebloke/deepseek-coder-6.7b-instruct-awq", name: "Deepseek Coder 6.7B Instruct AWQ", type: "text" },
            { id: "@hf/thebloke/deepseek-coder-6.7b-base-awq", name: "Deepseek Coder 6.7B Base AWQ", type: "text" },
            { id: "@cf/meta/llamaguard-7b-awq", name: "LlamaGuard 7B AWQ (Meta)", type: "text" },
            { id: "@hf/thebloke/neural-chat-7b-v3-1-awq", name: "Neural Chat 7B v3.1 AWQ", type: "text" },
            { id: "@hf/thebloke/openhermes-2.5-mistral-7b-awq", name: "OpenHermes 2.5 Mistral 7B AWQ", type: "text" },
            { id: "@hf/thebloke/llama-2-13b-chat-awq", name: "Llama 2 13B Chat AWQ", type: "text" },
            { id: "@hf/thebloke/mistral-7b-instruct-v0.1-awq", name: "Mistral 7B Instruct v0.1 AWQ", type: "text" },
            { id: "@hf/thebloke/zephyr-7b-beta-awq", name: "Zephyr 7B Beta AWQ", type: "text" },
            { id: "@cf/meta/llama-2-7b-chat-fp16", name: "Llama 2 7B Chat FP16 (Meta)", type: "text" },
            { id: "@cf/mistral/mistral-7b-instruct-v0.1", name: "Mistral 7B Instruct v0.1 (MistralAI)", type: "text" },
            { id: "@cf/meta/llama-2-7b-chat-int8", name: "Llama 2 7B Chat INT8 (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B Instruct (Meta)", type: "text" }
        ];

        function populateModelSelect() {
            modelSelect.innerHTML = '';
            availableModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                modelSelect.appendChild(option);
            });

            const savedModelId = localStorage.getItem('selectedModelId');
            if (savedModelId && availableModels.some(model => model.id === savedModelId)) {
                modelSelect.value = savedModelId;
            } else {
                modelSelect.value = availableModels[0].id;
                localStorage.setItem('selectedModelId', availableModels[0].id);
            }
        }

        function displayMessage(content, role, type = 'text') {
            const messageWrapper = document.createElement('div');
            messageWrapper.classList.add('message-wrapper', role);

            const iconDiv = document.createElement('div');
            iconDiv.classList.add('message-icon', role);
            iconDiv.textContent = role === 'user' ? 'You' : 'AI';

            const messageContentDiv = document.createElement('div');
            messageContentDiv.classList.add('message-content');

            if (type === 'image') {
                const img = document.createElement('img');
                img.src = content;
                img.alt = "Generated Image";
                messageContentDiv.appendChild(img);
            } else {
                let processedContent = content;
                processedContent = processedContent.replace(/^(Thought:|Thinking:)\s*(.*)$/gim, '<span class="ai-thought-process">$1 $2</span>');
                messageContentDiv.innerHTML = processedContent;
            }
            
            if (role === 'user') {
                messageWrapper.appendChild(messageContentDiv);
                messageWrapper.appendChild(iconDiv);
            } else {
                messageWrapper.appendChild(iconDiv);
                messageWrapper.appendChild(messageContentDiv);
            }
            
            chatMessages.appendChild(messageWrapper);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function clearChatDisplay() {
            chatMessages.innerHTML = '';
            errorMessage.style.display = 'none';
            loadingIndicator.style.display = 'none';
        }

        function activateHistoryItem(sessionIdToActivate) {
            document.querySelectorAll('.history-item').forEach(item => {
                item.classList.remove('active');
            });
            const activeItem = document.querySelector(".history-item[data-session-id='" + sessionIdToActivate + "']");
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }

        async function loadChatSession(sessionIdToLoad) {
            if (currentSessionId === sessionIdToLoad) return;

            currentSessionId = sessionIdToLoad;
            localStorage.setItem('chatSessionId', currentSessionId);
            clearChatDisplay();
            activateHistoryItem(currentSessionId);

            try {
                const response = await fetch('/api/history?sessionId=' + currentSessionId + '&userId=' + userId);
                if (!response.ok) {
                    throw new Error('Failed to fetch chat history');
                }
                const history = await response.json();
                history.forEach(msg => displayMessage(msg.content, msg.role, msg.type || 'text'));
            } catch (error) {
                console.error('Error loading session history:', error);
                errorMessage.textContent = 'Failed to load session history. Please refresh the page.';
                errorMessage.style.display = 'block';
            }
        }

        async function fetchAllSessionMetadata() {
            try {
                const response = await fetch('/api/session_list?userId=' + userId);
                if (!response.ok) {
                    throw new Error('Failed to fetch session list');
                }
                allSessionMetadata = await response.json();
                renderHistoryList();
            } catch (error) {
                console.error('Error fetching all session metadata:', error);
            }
        }

        function renderHistoryList() {
            historyList.innerHTML = '<div style="font-size: 0.85rem; color: #a0aec0; margin-bottom: 0.75rem;">History</div>';
            
            allSessionMetadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            allSessionMetadata.forEach(session => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                historyItem.dataset.sessionId = session.id;

                const summaryDiv = document.createElement('div');
                summaryDiv.classList.add('history-summary');
                summaryDiv.textContent = session.summary || ("Chat: " + session.id.substring(0, 8) + "...");
                
                const timestampDiv = document.createElement('div');
                timestampDiv.classList.add('history-timestamp');
                timestampDiv.textContent = new Date(session.timestamp).toLocaleString();

                historyItem.appendChild(summaryDiv);
                historyItem.appendChild(timestampDiv);

                if (session.id === currentSessionId) {
                    historyItem.classList.add('active');
                }
                historyItem.addEventListener('click', () => loadChatSession(session.id));
                historyList.appendChild(historyItem);
            });
        }

        function startNewChat() {
            currentSessionId = crypto.randomUUID();
            localStorage.setItem('chatSessionId', currentSessionId);
            clearChatDisplay();
            fetchAllSessionMetadata();
        }

        async function sendMessage() {
            const question = userInput.value.trim();
            if (!question) return;

            const selectedModelId = modelSelect.value;
            const selectedModel = availableModels.find(m => m.id === selectedModelId);

            displayMessage(question, 'user');
            userInput.value = '';
            sendButton.disabled = true;
            loadingIndicator.style.display = 'flex';
            errorMessage.style.display = 'none';

            try {
                const requestBody = {
                    'question': question,
                    'sessionId': currentSessionId,
                    'model': selectedModelId,
                    'type': selectedModel.type,
                    'userId': userId
                };

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'AI response failed');
                }

                const data = await response.json();

                if (selectedModel.type === 'image' && data.imageUrl) {
                    displayMessage(data.imageUrl, 'ai', 'image');
                } else {
                    displayMessage(data.answer, 'ai', 'text');
                }
                
                fetchAllSessionMetadata();
            } catch (error) {
                console.error('Error sending message:', error);
                errorMessage.textContent = 'Failed to send message: ' + error.message;
                errorMessage.style.display = 'block';
            } finally {
                sendButton.disabled = false;
                loadingIndicator.style.display = 'none';
            }
        }

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙'; 
        }

        // Function to show the modal
        function showModal(message, confirmText, cancelText, onConfirm) {
            document.querySelector('#delete-confirmation-modal h3').textContent = message.title;
            document.querySelector('#delete-confirmation-modal p').textContent = message.body;
            confirmDeleteButton.textContent = confirmText;
            cancelDeleteButton.textContent = cancelText;
            confirmDeleteButton.onclick = () => {
                onConfirm();
                deleteConfirmationModal.classList.remove('show');
            };
            cancelDeleteButton.onclick = () => {
                deleteConfirmationModal.classList.remove('show');
            };
            deleteConfirmationModal.classList.add('show');
        }

        // Function to handle chat session deletion
        async function deleteChatSession() {
            try {
                const response = await fetch('/api/delete_session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 'sessionId': currentSessionId, 'userId': userId }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to delete chat session');
                }

                startNewChat(); // Start a new chat after deletion
                fetchAllSessionMetadata(); // Refresh history list
            } catch (error) {
                console.error('Error deleting chat session:', error);
                errorMessage.textContent = 'Failed to delete chat session: ' + error.message;
                errorMessage.style.display = 'block';
            }
        }

        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        newChatButton.addEventListener('click', startNewChat);
        darkModeToggle.addEventListener('click', toggleDarkMode);
        modelSelect.addEventListener('change', () => {
            localStorage.setItem('selectedModelId', modelSelect.value);
        });

        languageSelectChat.addEventListener('change', (event) => {
            const newLang = event.target.value;
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            if (pathParts.length >= 3 && (pathParts[1] === 'en' || pathParts[1] === 'cn')) {
                pathParts[1] = newLang;
                window.location.href = pathParts.join('/');
            } else {
                window.location.href = '/' + newLang + currentPath;
            }
        });

        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', { method: 'POST' });
                if (response.ok) {
                    // Do NOT clear localStorage items for persistence
                    window.location.href = '/' + currentLang + '/login';
                } else {
                    console.error('Logout failed:', await response.text());
                    showModal(
                        { title: 'Logout Failed', body: 'Failed to log out. Please try again.' },
                        'OK', '', () => {}
                    );
                }
            } catch (error) {
                console.error('Error during logout:', error);
                showModal(
                    { title: 'Network Error', body: 'Network error during logout.' },
                    'OK', '', () => {}
                );
            }
        });

        deleteCurrentChatButton.addEventListener('click', () => {
            showModal(
                { title: 'Confirm Deletion', body: 'Are you sure you want to delete the current chat session? This action cannot be undone.' },
                'Delete', 'Cancel',
                deleteChatSession
            );
        });

        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        } else {
            darkModeToggle.textContent = '🌙';
        }
    </script>
</body>
</html>
`;

    const passwordPromptHtmlTemplate_en = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enter Password</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f2f5;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 1rem;
            box-sizing: border-box;
            color: #374151;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .container {
            background-color: #ffffff;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            width: 450px;
            height: 380px;
            max-width: 450px;
            max-height: 380px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            flex-shrink: 0;
            box-sizing: border-box;
            margin: auto;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .logo-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1rem;
        }
        .logo-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #6366f1;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2rem;
            font-weight: bold;
            color: white;
            margin-bottom: 0.5rem;
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
        }
        .logo-text {
            font-size: 1.8rem;
            font-weight: 700;
            color: #374151;
        }
        h2 {
            font-size: 1.1rem;
            font-weight: 400;
            color: #6b7280;
            margin-bottom: 1.5rem;
        }
        .input-group {
            width: 280px;
            margin-bottom: 1rem;
            text-align: left;
            box-sizing: border-box;
        }
        label {
            display: none;
        }
        input {
            width: 100%;
            padding: 0.85rem 1.2rem;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 1rem;
            outline: none;
            background-color: #f8fafc;
            color: #374151;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
            box-sizing: border-box;
        }
        input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        input::placeholder {
            color: #9ca3af;
            opacity: 0.7;
        }
        button {
            width: 280px;
            padding: 0.85rem 1.5rem;
            border-radius: 8px;
            border: none;
            background-color: #6366f1;
            color: white;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.1s ease;
            margin-top: 0.5rem;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            box-sizing: border-box;
        }
        button:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
        }
        button:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
        #message {
            font-size: 0.85rem;
            margin-top: 1rem;
            display: none;
            padding: 0.5rem;
            border-radius: 5px;
            text-align: center;
            color: #dc2626;
            background-color: #fee2e2;
        }
        .copyright {
            margin-top: 3rem;
            font-size: 0.8rem;
            color: #6b7280;
            text-align: center;
        }
        .copyright a {
            color: #6366f1;
            text-decoration: none;
        }
        .copyright a:hover {
            text-decoration: underline;
        }
        #top-right-controls-login {
            position: absolute;
            top: 1rem;
            right: 1rem;
            z-index: 30;
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        .icon-button {
            background-color: #6366f1;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
            transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
        }
        .icon-button:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
        }
        .icon-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
        }

        body.dark-mode {
            background-color: #1a1a2e;
            color: #e2e8f0;
        }
        body.dark-mode .container {
            background-color: #2d2d44;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        body.dark-mode .logo-text {
            color: #e2e8f0;
        }
        body.dark-mode h2 {
            color: #a0aec0;
        }
        body.dark-mode input {
            border-color: #4a4a6e;
            background-color: #3f3f5a;
            color: #e2e8f0;
        }
        body.dark-mode input::placeholder {
            color: #a0aec0;
        }
        body.dark-mode #message {
            background-color: #ef4444;
            color: white;
        }
        body.dark-mode .copyright {
            color: #a0aec0;
        }
        body.dark-mode .icon-button {
            background-color: #4a5568;
            box-shadow: 0 4px 10px rgba(0,0,0,.3);
        }
        body.dark-mode .icon-button:hover {
            background-color: #6366f1;
        }
        #language-select-login {
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            color: #374151;
            font-size: 0.9rem;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        body.dark-mode #language-select-login {
            background-color: #4a5568;
            border-color: #6366f1;
            color: #e2e8f0;
        }
        body.dark-mode #language-select-login option {
            background-color: #2d3748;
            color: #e2e8f0;
        }
    </style>
</head>
<body>
    <div id="top-right-controls-login">
        <select id="language-select-login">
            <option value="en">English</option>
            <option value="cn">中文</option>
        </select>
        <button id="dark-mode-toggle" class="icon-button">🌙</button>
    </div>
    <div class="container">
        <div class="logo-section">
            <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd" d="M11.078 2.25a.75.75 0 0 0-.727-.631A6.002 6.002 0 0 0 6 1.5H3.75a.75.75 0 0 0-.727.631C2.25 4.323 1.5 6.746 1.5 9.375v.75c0 2.629.75 5.052 2.023 7.294a.75.75 0 0 0 .727.631h2.25a6.002 6.002 0 0 0 4.351 1.354.75.75 0 0 0 .727-.631c.52-2.197.777-4.665.777-7.294v-.75c0-2.629-.257-5.052-.777-7.294ZM12 12.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .75.75ZM15.75 1.5a.75.75 0 0 0-.727-.631A6.002 6.002 0 0 0 12 1.5h-.75a.75.75 0 0 0-.727.631C9.75 4.323 9 6.746 9 9.375v.75c0 2.629.75 5.052 2.023 7.294a.75.75 0 0 0 .727.631h.75a6.002 6.002 0 0 0 4.351 1.354.75.75 0 0 0 .727-.631c.52-2.197.777-4.665.777-7.294v-.75c0-2.629-.257-5.052-.777-7.294Z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="logo-text">Workers AI</div>
        </div>
        <h2>Please enter admin password</h2>
        <div class="input-group">
            <label for="password-input">Password:</label>
            <input type="password" id="password-input" placeholder="Enter password">
        </div>
        <button id="submit-password">Submit Access</button>
        <p id="message"></p>
    </div>
    <div class="copyright">
        Copyright © 2025 <a href="#">Workers AI</a> All Rights Reserved.
    </div>
    <script>
        const passwordInput = document.getElementById('password-input');
        const submitButton = document.getElementById('submit-password');
        const messageDisplay = document.getElementById('message');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const languageSelectLogin = document.getElementById('language-select-login');

        const pathSegments = window.location.pathname.split('/');
        let currentLang = 'en';
        if (pathSegments.length > 1 && (pathSegments[1] === 'cn' || pathSegments[1] === 'en')) {
            currentLang = pathSegments[1];
        }
        languageSelectLogin.value = currentLang;

        submitButton.addEventListener('click', async () => {
            const password = passwordInput.value;
            messageDisplay.style.display = 'none';

            try {
                const response = await fetch('/authenticate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 'password': password })
                });

                if (response.ok) {
                    window.location.href = '/' + currentLang + '/chat';
                } else {
                    const errorText = await response.text();
                    messageDisplay.textContent = errorText || 'Incorrect password.';
                    messageDisplay.style.display = 'block';
                }
            } catch (error) {
                console.error('Authentication error:', error);
                messageDisplay.textContent = 'Network error during authentication.';
                messageDisplay.style.display = 'block';
            }
        });

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙'; 
        }
        darkModeToggle.addEventListener('click', toggleDarkMode);

        languageSelectLogin.addEventListener('change', (event) => {
            const newLang = event.target.value;
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            if (pathParts.length >= 3 && (pathParts[1] === 'en' || pathParts[1] === 'cn')) {
                pathParts[1] = newLang;
                window.location.href = pathParts.join('/');
            } else {
                window.location.href = '/' + newLang + currentPath;
            }
        });

        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        } else {
            darkModeToggle.textContent = '🌙';
        }
    </script>
</body>
</html>
`;

    // --- HTML Templates (Chinese Versions) ---

    const frontendHtmlTemplate_cn = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare Workers AI 聊天</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            height: 100vh;
            overflow: hidden;
            transition: background-color 0.3s ease;
        }
        #app-container {
            display: flex;
            height: 100%;
            width: 100%;
        }
        #sidebar {
            width: 280px;
            background-color: #2d3748;
            color: #e2e8f0;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
            z-index: 20;
            flex-shrink: 0;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        #new-chat-button {
            background-color: #4f46e5;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: background-color 0.3s ease;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        #new-chat-button:hover {
            background-color: #4338ca;
        }
        #model-select-container-main {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            z-index: 25;
            background-color: #ffffff;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
        }
        #model-select-label-main {
            display: block;
            font-size: 0.85rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }
        #model-select-main {
            width: 200px;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            color: #374151;
            font-size: 0.95rem;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1.2em;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        #model-select-main:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
        }
        #history-list {
            flex-grow: 1;
            overflow-y: auto;
            padding-right: 0.5rem;
        }
        .history-item {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 0.5rem;
            transition: background-color 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .history-item:hover {
            background-color: #4a5568;
        }
        .history-item.active {
            background-color: #6366f1;
            color: white;
            font-weight: 600;
        }
        .history-summary {
            font-size: 0.95rem;
            font-weight: 500;
            color: inherit;
            margin-bottom: 0.2rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }
        .history-timestamp {
            font-size: 0.75rem;
            color: #a0aec0;
            opacity: 0.8;
        }
        body.dark-mode .history-timestamp {
            color: #a0aec0;
        }
        #main-content {
            flex-grow: 1;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            position: relative;
            transition: background-color 0.3s ease;
            padding-top: 5rem;
        }
        .chat-messages {
            flex-grow: 1;
            padding: 1.5rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            scroll-behavior: smooth;
        }
        .message-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        .message-wrapper.user {
            justify-content: flex-end;
        }
        .message-wrapper.ai {
            justify-content: flex-start;
        }
        .message-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.9rem;
            font-weight: 600;
            color: white;
            flex-shrink: 0;
        }
        .message-icon.user {
            background-color: #6366f1;
        }
        .message-icon.ai {
            background-color: #10b981;
        }
        .message-content {
            max-width: 75%;
            padding: 0.9rem 1.2rem;
            border-radius: 18px;
            word-wrap: break-word;
            line-height: 1.5;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .message-wrapper.user .message-content {
            background-color: #e0e7ff;
            border-bottom-right-radius: 6px;
            color: #374151;
        }
        .message-wrapper.ai .message-content {
            background-color: #f1f5f9;
            border-bottom-left-radius: 6px;
            color: #374151;
        }
        .message-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-top: 0.5rem;
            display: block;
        }
        .chat-input-area {
            padding: 1.5rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 0.75rem;
            align-items: center;
            background-color: #ffffff;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
            z-index: 10;
            transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .chat-input {
            flex-grow: 1;
            padding: 0.9rem 1.2rem;
            border: 1px solid #cbd5e1;
            border-radius: 25px;
            outline: none;
            font-size: 1rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, color 0.3s ease;
        }
        .chat-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        .chat-button {
            background-color: #6366f1;
            color: white;
            padding: 0.9rem 1.75rem;
            border-radius: 25px;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: background-color 0.3s ease, transform 0.1s ease;
            box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }
        .chat-button:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
        }
        .chat-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
        }
        .loading-indicator {
            position: absolute;
            bottom: 110px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(255, 255, 255, 0.9);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            color: #6b7280;
            font-size: 0.9rem;
            z-index: 20;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: pulse 1.5s infinite;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .loading-indicator::before {
            content: '';
            width: 12px;
            height: 12px;
            border: 2px solid #6366f1;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0% { transform: translateX(-50%) scale(1); opacity: 1; }
            50% { transform: translateX(-50%) scale(1.02); opacity: 0.9; }
            100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .error-message {
            position: absolute;
            bottom: 110px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #fee2e2;
            color: #dc2626;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            font-size: 0.9rem;
            z-index: 20;
            display: none;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .ai-thought-process {
            font-size: 0.85em;
            color: #a0aec0;
            font-style: italic;
            opacity: 0.7;
            display: block;
            margin-top: 0.5em;
        }

        body.dark-mode {
            background-color: #1a202c;
            color: #e2e8f0;
        }
        body.dark-mode #sidebar {
            background-color: #1a202c;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
        }
        body.dark-mode #main-content {
            background-color: #2d3748;
        }
        body.dark-mode .history-item:hover {
            background-color: #4a5568;
        }
        body.dark-mode .message-wrapper.user .message-content {
            background-color: #4c51bf;
            color: #e2e8f0;
        }
        body.dark-mode .message-wrapper.ai .message-content {
            background-color: #4a5568;
            color: #e2e8f0;
        }
        body.dark-mode .chat-input-area {
            background-color: #2d3748;
            border-top-color: #4a5568;
        }
        body.dark-mode .chat-input {
            background-color: #4a5568;
            border-color: #6366f1;
            color: #e2e8f0;
        }
        body.dark-mode .chat-input::placeholder {
            color: #a0aec0;
        }
        body.dark-mode #model-select-container-main {
            background-color: #2d3748;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        body.dark-mode #model-select-label-main {
            color: #a0aec0;
        }
        body.dark-mode #model-select-main {
            background-color: #4a5568;
            border-color: #6366f1;
            color: #e2e8f0;
        }
        body.dark-mode #model-select-main option {
            background-color: #2d3748;
            color: #e2e8f0;
        }
        body.dark-mode .loading-indicator {
            background-color: rgba(45, 55, 72, 0.9);
            color: #e2e8f0;
        }
        body.dark-mode .error-message {
            background-color: #ef4444;
            color: white;
        }
        body.dark-mode .ai-thought-process {
            color: #718096;
        }
        #top-right-controls {
            position: absolute;
            top: 1rem;
            right: 1rem;
            z-index: 30;
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        .icon-button {
            background-color: #6366f1;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
            transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
        }
        .icon-button:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
        }
        .icon-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
        }
        body.dark-mode .icon-button {
            background-color: #4a5568;
            box-shadow: 0 4px 10px rgba(0,0,0,.3);
        }
        body.dark-mode .icon-button:hover {
            background-color: #6366f1;
        }
        #language-select-chat {
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            color: #374151;
            font-size: 0.9rem;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        body.dark-mode #language-select-chat {
            background-color: #4a5568;
            border-color: #6366f1;
            color: #e2e8f0;
        }
        body.dark-mode #language-select-chat option {
            background-color: #2d3748;
            color: #e2e8f0;
        }
        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.2rem;
            color: #374151;
            z-index: 100;
            transition: opacity 0.3s ease;
        }
        body.dark-mode #loading-overlay {
            background-color: rgba(26, 32, 44, 0.9);
            color: #e2e8f0;
        }
        /* Confirmation Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .modal-overlay.show {
            opacity: 1;
            visibility: visible;
        }
        .modal-content {
            background-color: #ffffff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            text-align: center;
            width: 90%;
            max-width: 400px;
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        }
        .modal-overlay.show .modal-content {
            transform: translateY(0);
        }
        body.dark-mode .modal-content {
            background-color: #2d3748;
            color: #e2e8f0;
        }
        .modal-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #374151;
        }
        body.dark-mode .modal-content h3 {
            color: #e2e8f0;
        }
        .modal-content p {
            margin-bottom: 1.5rem;
            color: #6b7280;
        }
        body.dark-mode .modal-content p {
            color: #a0aec0;
        }
        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
        }
        .modal-button {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.3s ease, transform 0.1s ease;
        }
        .modal-button.confirm {
            background-color: #ef4444;
            color: white;
        }
        .modal-button.confirm:hover {
            background-color: #dc2626;
        }
        .modal-button.cancel {
            background-color: #e2e8f0;
            color: #374151;
        }
        body.dark-mode .modal-button.cancel {
            background-color: #4a5568;
            color: #e2e8f0;
        }
        .modal-button.cancel:hover {
            background-color: #cbd5e1;
        }
        body.dark-mode .modal-button.cancel:hover {
            background-color: #6366f1;
        }
    </style>
</head>
<body>
    <div id="loading-overlay">加载中...</div>
    <div id="app-container" style="display: none;">
        <div id="sidebar">
            <button id="new-chat-button">➕ 新建聊天</button>
            <div id="history-list">
                <div style="font-size: 0.85rem; color: #a0aec0; margin-bottom: 0.75rem;">历史记录</div>
            </div>
            <button id="delete-current-chat-button" class="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                🗑️ 删除当前聊天
            </button>
        </div>
        <div id="main-content">
            <div id="model-select-container-main">
                <label for="model-select-main" id="model-select-label-main">选择 AI 模型：</label>
                <select id="model-select-main"></select>
            </div>

            <div class="chat-messages" id="chat-messages">
            </div>
            <div class="loading-indicator" id="loading-indicator" style="display: none;">
                <span>AI 正在思考...</span>
            </div>
            <div class="error-message" id="error-message" style="display: none;"></div>
            <div class="chat-input-area">
                <input type="text" id="user-input" class="chat-input" placeholder="输入您的问题..." autocomplete="off">
                <button id="send-button" class="chat-button">发送</button>
            </div>
        </div>
    </div>
    <div id="top-right-controls">
        <select id="language-select-chat">
            <option value="en">English</option>
            <option value="cn">中文</option>
        </select>
        <button id="dark-mode-toggle" class="icon-button">🌙</button>
        <button id="logout-button" class="icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5h-6ZM12 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>

    <!-- Confirmation Modal -->
    <div id="delete-confirmation-modal" class="modal-overlay">
        <div class="modal-content">
            <h3>确认删除</h3>
            <p>您确定要删除当前聊天会话吗？此操作无法撤销。</p>
            <div class="modal-buttons">
                <button id="confirm-delete" class="modal-button confirm">删除</button>
                <button id="cancel-delete" class="modal-button cancel">取消</button>
            </div>
        </div>
    </div>

    <script type="module">
        console.log("当前页面路径:", window.location.pathname);

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        let userId = localStorage.getItem('anonymousUserId');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('anonymousUserId', userId);
        }
        console.log("使用匿名用户 ID:", userId);

        const loadingOverlay = document.getElementById('loading-overlay');
        const appContainer = document.getElementById('app-container');

        const pathSegments = window.location.pathname.split('/');
        let currentLang = 'cn';
        if (pathSegments.length > 1 && (pathSegments[1] === 'cn' || pathSegments[1] === 'en')) {
            currentLang = pathSegments[1];
        }

        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            appContainer.style.display = 'flex';
            populateModelSelect();
            loadChatSession(localStorage.getItem('chatSessionId') || crypto.randomUUID());
            fetchAllSessionMetadata();
            document.getElementById('language-select-chat').value = currentLang;
        }, 100);

        const chatMessages = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const loadingIndicator = document.getElementById('loading-indicator');
        const errorMessage = document.getElementById('error-message');
        const newChatButton = document.getElementById('new-chat-button');
        const historyList = document.getElementById('history-list');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const modelSelect = document.getElementById('model-select-main');
        const logoutButton = document.getElementById('logout-button');
        const languageSelectChat = document.getElementById('language-select-chat');
        const deleteCurrentChatButton = document.getElementById('delete-current-chat-button');
        const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
        const confirmDeleteButton = document.getElementById('confirm-delete');
        const cancelDeleteButton = document.getElementById('cancel-delete');

        let currentSessionId = localStorage.getItem('chatSessionId');
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
            localStorage.setItem('chatSessionId', currentSessionId);
        }

        let allSessionMetadata = [];

        const availableModels = [
            { id: "@cf/meta/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", name: "Llama 3.3 70B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-8b-instruct-fast", name: "Llama 3.1 8B Instruct Fast (Meta)", type: "text" },
            { id: "@cf/google/gemma-3-12b-it", name: "Gemma 3 12B Instruct (Google)", type: "text" },
            { id: "@cf/qwen/qwq-32b", name: "Qwen QWQ 32B (Qwen)", type: "text" },
            { id: "@cf/qwen/qwen2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B Instruct (Qwen)", type: "text" },
            { id: "@cf/meta/llama-guard-3-8b", name: "Llama Guard 3 8B (Meta)", type: "text" },
            { id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", name: "DeepSeek R1 Distill Qwen 32B", type: "text" },
            { id: "@cf/meta/llama-3.2-1b-instruct", name: "Llama 3.2 1B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.2-3b-instruct", name: "Llama 3.2 3B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-8b-instruct-awq", name: "Llama 3.1 8B Instruct AWQ (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-8b-instruct-fp8", name: "Llama 3.1 8B Instruct FP8 (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct (Meta)", type: "text" },
            { id: "@cf/meta/llama-3-8b-instruct", name: "Llama 3 8B Instruct (Meta)", type: "text" },
            { id: "@cf/google/gemma-7b-it-lora", name: "Gemma 7B Instruct LoRA (Google)", type: "text" },
            { id: "@cf/google/gemma-2b-it-lora", name: "Gemma 2B Instruct LoRA (Google)", type: "text" },
            { id: "@cf/meta/llama-2-7b-chat-hf-lora", name: "Llama 2 7B Chat HF LoRA (Meta)", type: "text" },
            { id: "@cf/google/gemma-7b-it", name: "Gemma 7B Instruct (Google)", type: "text" },
            { id: "@cf/nousresearch/starling-lm-7b-beta", name: "Starling LM 7B Beta (NousResearch)", type: "text" },
            { id: "@cf/nousresearch/hermes-2-pro-mistral-7b", name: "Hermes 2 Pro Mistral 7B (NousResearch)", type: "text" },
            { id: "@cf/qwen/qwen1.5-1.8b-chat", name: "Qwen 1.5 1.8B Chat (Qwen)", type: "text" },
            { id: "@cf/microsoft/phi-2", name: "Phi-2 (Microsoft)", type: "text" },
            { id: "@cf/tinyllama/tinyllama-1.1b-chat-v1.0", name: "TinyLlama 1.1B Chat v1.0", type: "text" },
            { id: "@cf/qwen/qwen1.5-14b-chat-awq", name: "Qwen 1.5 14B Chat AWQ (Qwen)", type: "text" },
            { id: "@cf/qwen/qwen1.5-7b-chat-awq", name: "Qwen 1.5 7B Chat AWQ (Qwen)", type: "text" },
            { id: "@cf/qwen/qwen1.5-0.5b-chat", name: "Qwen 1.5 0.5B Chat (Qwen)", type: "text" },
            { id: "@cf/huggingface/discolm-german-7b-v1-awq", name: "Discolm German 7B v1 AWQ (HuggingFace)", type: "text" },
            { id: "@cf/tiiuae/falcon-7b-instruct", name: "Falcon 7B Instruct (TII)", type: "text" },
            { id: "@cf/openchat/openchat-3.5-0106", name: "OpenChat 3.5", type: "text" },
            { id: "@cf/defog/sqlcoder-7b-2", name: "SQLCoder 7B (Defog)", type: "text" },
            { id: "@cf/deepseek-ai/deepseek-math-7b-instruct", name: "Deepseek Math 7B Instruct", type: "text" },
            { id: "@hf/thebloke/deepseek-coder-6.7b-instruct-awq", name: "Deepseek Coder 6.7B Instruct AWQ", type: "text" },
            { id: "@hf/thebloke/deepseek-coder-6.7b-base-awq", name: "Deepseek Coder 6.7B Base AWQ", type: "text" },
            { id: "@cf/meta/llamaguard-7b-awq", name: "LlamaGuard 7B AWQ (Meta)", type: "text" },
            { id: "@hf/thebloke/neural-chat-7b-v3-1-awq", name: "Neural Chat 7B v3.1 AWQ", type: "text" },
            { id: "@hf/thebloke/openhermes-2.5-mistral-7b-awq", name: "OpenHermes 2.5 Mistral 7B AWQ", type: "text" },
            { id: "@hf/thebloke/llama-2-13b-chat-awq", name: "Llama 2 13B Chat AWQ", type: "text" },
            { id: "@hf/thebloke/mistral-7b-instruct-v0.1-awq", name: "Mistral 7B Instruct v0.1 AWQ", type: "text" },
            { id: "@hf/thebloke/zephyr-7b-beta-awq", name: "Zephyr 7B Beta AWQ", type: "text" },
            { id: "@cf/meta/llama-2-7b-chat-fp16", name: "Llama 2 7B Chat FP16 (Meta)", type: "text" },
            { id: "@cf/mistral/mistral-7b-instruct-v0.1", name: "Mistral 7B Instruct v0.1 (MistralAI)", type: "text" },
            { id: "@cf/meta/llama-2-7b-chat-int8", name: "Llama 2 7B Chat INT8 (Meta)", type: "text" },
            { id: "@cf/meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B Instruct (Meta)", type: "text" }
        ];

        function populateModelSelect() {
            modelSelect.innerHTML = '';
            availableModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                modelSelect.appendChild(option);
            });

            const savedModelId = localStorage.getItem('selectedModelId');
            if (savedModelId && availableModels.some(model => model.id === savedModelId)) {
                modelSelect.value = savedModelId;
            } else {
                modelSelect.value = availableModels[0].id;
                localStorage.setItem('selectedModelId', availableModels[0].id);
            }
        }

        function displayMessage(content, role, type = 'text') {
            const messageWrapper = document.createElement('div');
            messageWrapper.classList.add('message-wrapper', role);

            const iconDiv = document.createElement('div');
            iconDiv.classList.add('message-icon', role);
            iconDiv.textContent = role === 'user' ? '您' : 'AI'; // Translated text

            const messageContentDiv = document.createElement('div');
            messageContentDiv.classList.add('message-content');

            if (type === 'image') {
                const img = document.createElement('img');
                img.src = content;
                img.alt = "生成的图片"; // Translated text
                messageContentDiv.appendChild(img);
            } else {
                let processedContent = content;
                processedContent = processedContent.replace(/^(Thought:|Thinking:)\s*(.*)$/gim, '<span class="ai-thought-process">$1 $2</span>');
                messageContentDiv.innerHTML = processedContent;
            }
            
            if (role === 'user') {
                messageWrapper.appendChild(messageContentDiv);
                messageWrapper.appendChild(iconDiv);
            } else {
                messageWrapper.appendChild(iconDiv);
                messageWrapper.appendChild(messageContentDiv);
            }
            
            chatMessages.appendChild(messageWrapper);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function clearChatDisplay() {
            chatMessages.innerHTML = '';
            errorMessage.style.display = 'none';
            loadingIndicator.style.display = 'none';
        }

        function activateHistoryItem(sessionIdToActivate) {
            document.querySelectorAll('.history-item').forEach(item => {
                item.classList.remove('active');
            });
            const activeItem = document.querySelector(".history-item[data-session-id='" + sessionIdToActivate + "']");
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }

        async function loadChatSession(sessionIdToLoad) {
            if (currentSessionId === sessionIdToLoad) return;

            currentSessionId = sessionIdToLoad;
            localStorage.setItem('chatSessionId', currentSessionId);
            clearChatDisplay();
            activateHistoryItem(currentSessionId);

            try {
                const response = await fetch('/api/history?sessionId=' + currentSessionId + '&userId=' + userId);
                if (!response.ok) {
                    throw new Error('加载聊天历史失败'); // Translated text
                }
                const history = await response.json();
                history.forEach(msg => displayMessage(msg.content, msg.role, msg.type || 'text'));
            } catch (error) {
                console.error('加载会话历史错误:', error); // Translated text
                errorMessage.textContent = '加载聊天历史失败。请刷新页面。'; // Translated text
                errorMessage.style.display = 'block';
            }
        }

        async function fetchAllSessionMetadata() {
            try {
                const response = await fetch('/api/session_list?userId=' + userId);
                if (!response.ok) {
                    throw new Error('获取会话列表失败'); // Translated text
                }
                allSessionMetadata = await response.json();
                renderHistoryList();
            }
            catch (error) {
                console.error('获取所有会话元数据错误:', error); // Translated text
            }
        }

        function renderHistoryList() {
            historyList.innerHTML = '<div style="font-size: 0.85rem; color: #a0aec0; margin-bottom: 0.75rem;">历史记录</div>'; // Translated text
            
            allSessionMetadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            allSessionMetadata.forEach(session => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                historyItem.dataset.sessionId = session.id;

                const summaryDiv = document.createElement('div');
                summaryDiv.classList.add('history-summary');
                summaryDiv.textContent = session.summary || ("聊天: " + session.id.substring(0, 8) + "..."); // Translated text
                
                const timestampDiv = document.createElement('div');
                timestampDiv.classList.add('history-timestamp');
                timestampDiv.textContent = new Date(session.timestamp).toLocaleString();

                historyItem.appendChild(summaryDiv);
                historyItem.appendChild(timestampDiv);

                if (session.id === currentSessionId) {
                    historyItem.classList.add('active');
                }
                historyItem.addEventListener('click', () => loadChatSession(session.id));
                historyList.appendChild(historyItem);
            });
        }

        function startNewChat() {
            currentSessionId = crypto.randomUUID();
            localStorage.setItem('chatSessionId', currentSessionId);
            clearChatDisplay();
            fetchAllSessionMetadata();
        }

        async function sendMessage() {
            const question = userInput.value.trim();
            if (!question) return;

            const selectedModelId = modelSelect.value;
            const selectedModel = availableModels.find(m => m.id === selectedModelId);

            displayMessage(question, 'user');
            userInput.value = '';
            sendButton.disabled = true;
            loadingIndicator.style.display = 'flex';
            errorMessage.style.display = 'none';

            try {
                const requestBody = {
                    'question': question,
                    'sessionId': currentSessionId,
                    'model': selectedModelId,
                    'type': selectedModel.type,
                    'userId': userId
                };

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'AI 响应失败'); // Translated text
                }

                const data = await response.json();

                if (selectedModel.type === 'image' && data.imageUrl) {
                    displayMessage(data.imageUrl, 'ai', 'image');
                } else {
                    displayMessage(data.answer, 'ai', 'text');
                }
                
                fetchAllSessionMetadata();
            } catch (error) {
                console.error('发送消息错误:', error); // Translated text
                errorMessage.textContent = '发送消息失败: ' + error.message; // Translated text
                errorMessage.style.display = 'block';
            } finally {
                sendButton.disabled = false;
                loadingIndicator.style.display = 'none';
            }
        }

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙'; 
        }

        // Function to show the modal
        function showModal(message, confirmText, cancelText, onConfirm) {
            document.querySelector('#delete-confirmation-modal h3').textContent = message.title;
            document.querySelector('#delete-confirmation-modal p').textContent = message.body;
            confirmDeleteButton.textContent = confirmText;
            cancelDeleteButton.textContent = cancelText;
            confirmDeleteButton.onclick = () => {
                onConfirm();
                deleteConfirmationModal.classList.remove('show');
            };
            cancelDeleteButton.onclick = () => {
                deleteConfirmationModal.classList.remove('show');
            };
            deleteConfirmationModal.classList.add('show');
        }

        // Function to handle chat session deletion
        async function deleteChatSession() {
            try {
                const response = await fetch('/api/delete_session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 'sessionId': currentSessionId, 'userId': userId }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || '删除聊天会话失败'); // Translated text
                }

                startNewChat(); // Start a new chat after deletion
                fetchAllSessionMetadata(); // Refresh history list
            } catch (error) {
                console.error('删除聊天会话错误:', error); // Translated text
                errorMessage.textContent = '删除聊天会话失败: ' + error.message; // Translated text
                errorMessage.style.display = 'block';
            }
        }

        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        newChatButton.addEventListener('click', startNewChat);
        darkModeToggle.addEventListener('click', toggleDarkMode);
        modelSelect.addEventListener('change', () => {
            localStorage.setItem('selectedModelId', modelSelect.value);
        });

        languageSelectChat.addEventListener('change', (event) => {
            const newLang = event.target.value;
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            if (pathParts.length >= 3 && (pathParts[1] === 'en' || pathParts[1] === 'cn')) {
                pathParts[1] = newLang;
                window.location.href = pathParts.join('/');
            } else {
                window.location.href = '/' + newLang + currentPath;
            }
        });

        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', { method: 'POST' });
                if (response.ok) {
                    // Do NOT clear localStorage items for persistence
                    window.location.href = '/' + currentLang + '/login';
                } else {
                    console.error('退出登录失败:', await response.text()); // Translated text
                    showModal(
                        { title: '退出登录失败', body: '退出登录失败。请重试。' }, // Translated text
                        '确定', '', () => {} // Translated text
                    );
                }
            } catch (error) {
                console.error('退出登录时发生网络错误:', error); // Translated text
                showModal(
                    { title: '网络错误', body: '退出登录时发生网络错误。' }, // Translated text
                    '确定', '', () => {} // Translated text
                );
            }
        });

        deleteCurrentChatButton.addEventListener('click', () => {
            showModal(
                { title: '确认删除', body: '您确定要删除当前聊天会话吗？此操作无法撤销。' }, // Translated text
                '删除', '取消', // Translated text
                deleteChatSession
            );
        });

        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        } else {
            darkModeToggle.textContent = '🌙';
        }
    </script>
</body>
</html>
`;

    const passwordPromptHtmlTemplate_cn = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>输入密码</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f2f5;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 1rem;
            box-sizing: border-box;
            color: #374151;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .container {
            background-color: #ffffff;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            width: 450px;
            height: 380px;
            max-width: 450px;
            max-height: 380px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            flex-shrink: 0;
            box-sizing: border-box;
            margin: auto;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .logo-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1rem;
        }
        .logo-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #6366f1;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2rem;
            font-weight: bold;
            color: white;
            margin-bottom: 0.5rem;
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
        }
        .logo-text {
            font-size: 1.8rem;
            font-weight: 700;
            color: #374151;
        }
        h2 {
            font-size: 1.1rem;
            font-weight: 400;
            color: #6b7280;
            margin-bottom: 1.5rem;
        }
        .input-group {
            width: 280px;
            margin-bottom: 1rem;
            text-align: left;
            box-sizing: border-box;
        }
        label {
            display: none;
        }
        input {
            width: 100%;
            padding: 0.85rem 1.2rem;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 1rem;
            outline: none;
            background-color: #f8fafc;
            color: #374151;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
            box-sizing: border-box;
        }
        input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        input::placeholder {
            color: #9ca3af;
            opacity: 0.7;
        }
        button {
            width: 280px;
            padding: 0.85rem 1.5rem;
            border-radius: 8px;
            border: none;
            background-color: #6366f1;
            color: white;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.1s ease;
            margin-top: 0.5rem;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            box-sizing: border-box;
        }
        button:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
        }
        button:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
        #message {
            font-size: 0.85rem;
            margin-top: 1rem;
            display: none;
            padding: 0.5rem;
            border-radius: 5px;
            text-align: center;
            color: #dc2626;
            background-color: #fee2e2;
        }
        .copyright {
            margin-top: 3rem;
            font-size: 0.8rem;
            color: #6b7280;
            text-align: center;
        }
        .copyright a {
            color: #6366f1;
            text-decoration: none;
        }
        .copyright a:hover {
            text-decoration: underline;
        }
        #top-right-controls-login {
            position: absolute;
            top: 1rem;
            right: 1rem;
            z-index: 30;
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        .icon-button {
            background-color: #6366f1;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
            transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
        }
        .icon-button:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
        }
        .icon-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
        }

        body.dark-mode {
            background-color: #1a1a2e;
            color: #e2e8f0;
        }
        body.dark-mode .container {
            background-color: #2d2d44;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        body.dark-mode .logo-text {
            color: #e2e8f0;
        }
        body.dark-mode h2 {
            color: #a0aec0;
        }
        body.dark-mode input {
            border-color: #4a4a6e;
            background-color: #3f3f5a;
            color: #e2e8f0;
        }
        body.dark-mode input::placeholder {
            color: #a0aec0;
        }
        body.dark-mode #message {
            background-color: #ef4444;
            color: white;
        }
        body.dark-mode .copyright {
            color: #a0aec0;
        }
        body.dark-mode .icon-button {
            background-color: #4a5568;
            box-shadow: 0 4px 10px rgba(0,0,0,.3);
        }
        body.dark-mode .icon-button:hover {
            background-color: #6366f1;
        }
        #language-select-login {
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            color: #374151;
            font-size: 0.9rem;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        body.dark-mode #language-select-login {
            background-color: #4a5568;
            border-color: #6366f1;
            color: #e2e8f0;
        }
        body.dark-mode #language-select-login option {
            background-color: #2d3748;
            color: #e2e8f0;
        }
    </style>
</head>
<body>
    <div id="top-right-controls-login">
        <select id="language-select-login">
            <option value="en">English</option>
            <option value="cn">中文</option>
        </select>
        <button id="dark-mode-toggle" class="icon-button">🌙</button>
    </div>
    <div class="container">
        <div class="logo-section">
            <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd" d="M11.078 2.25a.75.75 0 0 0-.727-.631A6.002 6.002 0 0 0 6 1.5H3.75a.75.75 0 0 0-.727.631C2.25 4.323 1.5 6.746 1.5 9.375v.75c0 2.629.75 5.052 2.023 7.294a.75.75 0 0 0 .727.631h2.25a6.002 6.002 0 0 0 4.351 1.354.75.75 0 0 0 .727-.631c.52-2.197.777-4.665.777-7.294v-.75c0-2.629-.257-5.052-.777-7.294ZM12 12.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .75.75ZM15.75 1.5a.75.75 0 0 0-.727-.631A6.002 6.002 0 0 0 12 1.5h-.75a.75.75 0 0 0-.727.631C9.75 4.323 9 6.746 9 9.375v.75c0 2.629.75 5.052 2.023 7.294a.75.75 0 0 0 .727.631h.75a6.002 6.002 0 0 0 4.351 1.354.75.75 0 0 0 .727-.631c.52-2.197.777-4.665.777-7.294v-.75c0-2.629-.257-5.052-.777-7.294Z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="logo-text">Workers AI</div>
        </div>
        <h2>请输入管理员密码</h2>
        <div class="input-group">
            <label for="password-input">密码:</label>
            <input type="password" id="password-input" placeholder="请输入密码">
        </div>
        <button id="submit-password">提交访问</button>
        <p id="message"></p>
    </div>
    <div class="copyright">
        版权所有 © 2025 <a href="#">Workers AI</a> 保留所有权利。
    </div>
    <script>
        const passwordInput = document.getElementById('password-input');
        const submitButton = document.getElementById('submit-password');
        const messageDisplay = document.getElementById('message');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const languageSelectLogin = document.getElementById('language-select-login');

        const pathSegments = window.location.pathname.split('/');
        let currentLang = 'cn';
        if (pathSegments.length > 1 && (pathSegments[1] === 'cn' || pathSegments[1] === 'en')) {
            currentLang = pathSegments[1];
        }
        languageSelectLogin.value = currentLang;

        submitButton.addEventListener('click', async () => {
            const password = passwordInput.value;
            messageDisplay.style.display = 'none';

            try {
                const response = await fetch('/authenticate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 'password': password })
                });

                if (response.ok) {
                    window.location.href = '/' + currentLang + '/chat';
                } else {
                    const errorText = await response.text();
                    messageDisplay.textContent = errorText || '密码不正确。';
                    messageDisplay.style.display = 'block';
                }
            } catch (error) {
                console.error('认证错误:', error);
                messageDisplay.textContent = '认证时发生网络错误。';
                messageDisplay.style.display = 'block';
            }
        });

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙'; 
        }
        darkModeToggle.addEventListener('click', toggleDarkMode);

        languageSelectLogin.addEventListener('change', (event) => {
            const newLang = event.target.value;
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            if (pathParts.length >= 3 && (pathParts[1] === 'en' || pathParts[1] === 'cn')) {
                pathParts[1] = newLang;
                window.location.href = pathParts.join('/');
            } else {
                window.location.href = '/' + newLang + currentPath;
            }
        });

        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        } else {
            darkModeToggle.textContent = '🌙';
        }
    </script>
</body>
</html>
`;

    // --- Worker Logic ---

    const SESSION_COOKIE_NAME = 'app_session_valid';

    return {
        async fetch(request, env) {
            const url = new URL(request.url);
            const DEFAULT_AI_MODEL = env.AI_MODEL || "@cf/meta/llama-2-7b-chat-int8";
            const CHAT_HISTORY_KV = env.CHAT_HISTORY_KV;
            const SUMMARY_MODEL = "@cf/meta/llama-2-7b-chat-int8";
            const APP_PASSWORD = env.PASSWORD;

            if (!CHAT_HISTORY_KV) {
                return new Response("KV namespace CHAT_HISTORY_KV is not bound. Please bind it in your Workers settings.", { status: 500 });
            }

            // Determine language from URL path
            let currentLang = 'en'; // Default to English
            const pathSegments = url.pathname.split('/');
            if (pathSegments.length > 1 && (pathSegments[1] === 'cn' || pathSegments[1] === 'en')) {
                currentLang = pathSegments[1];
            }

            // Check for the session cookie
            const hasValidSession = request.headers.get('Cookie')?.includes(`${SESSION_COOKIE_NAME}=true`);

            // Handle authentication POST request
            if (url.pathname === '/authenticate' && request.method === 'POST') {
                try {
                    const parsedBody = await request.json();
                    const password = parsedBody.password;

                    if (password === APP_PASSWORD) {
                        const headers = new Headers();
                        headers.append('Set-Cookie', `${SESSION_COOKIE_NAME}=true; Path=/; HttpOnly; Max-Age=3600`);
                        return new Response('Authentication successful', { status: 200, headers });
                    } else {
                        return new Response('Incorrect password', { status: 401 });
                    }
                } catch (e) {
                    return new Response('Invalid request body', { status: 400 });
                }
            }

            // Handle logout request
            if (url.pathname === '/logout' && request.method === 'POST') {
                const headers = new Headers();
                headers.append('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
                return new Response('Logged out', { status: 200, headers });
            }

            // Route handling for login pages
            if (url.pathname === '/en/login' || url.pathname === '/cn/login' || url.pathname === '/login') {
                if (currentLang === 'cn') {
                    return new Response(passwordPromptHtmlTemplate_cn, {
                        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
                    });
                } else {
                    return new Response(passwordPromptHtmlTemplate_en, {
                        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
                    });
                }
            }

            // If not authenticated, redirect to language-specific login
            if (!hasValidSession) {
                return Response.redirect(new URL(`/${currentLang}/login`, url), 302);
            }

            // Route handling for chat pages
            if (url.pathname === `/${currentLang}/chat` || (currentLang === 'en' && url.pathname === '/chat') || (currentLang === 'en' && url.pathname === '/')) {
                if (currentLang === 'cn') {
                    return new Response(frontendHtmlTemplate_cn, {
                        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
                    });
                } else {
                    return new Response(frontendHtmlTemplate_en, {
                        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
                    });
                }
            }

            // Determine userId (anonymous for this simplified setup)
            let userId = 'anonymous_user';

            // Construct user-specific KV paths
            const getUserChatHistoryKey = (sessionId) => `users:${userId}:chat_history:${sessionId}`;
            const getAllSessionMetadataKey = () => `users:${userId}:all_session_metadata`;

            // API endpoint for fetching chat history
            if (url.pathname === '/api/history') {
                const sessionId = url.searchParams.get('sessionId');
                const requestedUserId = url.searchParams.get('userId'); 
                if (!sessionId || !requestedUserId) {
                    return new Response("Missing sessionId or userId", { status: 400 });
                }
                userId = requestedUserId; 

                try {
                    const historyStr = await CHAT_HISTORY_KV.get(getUserChatHistoryKey(sessionId));
                    const history = historyStr ? JSON.parse(historyStr) : [];
                    return new Response(JSON.stringify(history), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                } catch (error) {
                    console.error("Error fetching history from KV:", error);
                    return new Response("Failed to retrieve chat history", { status: 500 });
                }
            }

            // API endpoint for fetching session list
            if (url.pathname === '/api/session_list') {
                const requestedUserId = url.searchParams.get('userId');
                if (!requestedUserId) {
                    return new Response("Missing userId", { status: 400 });
                }
                userId = requestedUserId;

                try {
                    const metadataStr = await CHAT_HISTORY_KV.get(getAllSessionMetadataKey());
                    const metadata = metadataStr ? JSON.parse(metadataStr) : [];
                    return new Response(JSON.stringify(metadata), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                } catch (error) {
                    console.error("Error fetching session list from KV:", error);
                    return new Response("Failed to retrieve session list", { status: 500 });
                }
            }

            // API endpoint for sending chat messages
            if (url.pathname === '/api/chat' && request.method === 'POST') {
                try {
                    const requestBody = await request.json();
                    const question = requestBody.question;
                    const sessionId = requestBody.sessionId;
                    const selectedModelIdFromClient = requestBody.model;
                    const modelTypeFromClient = requestBody.type;

                    if (!question || !sessionId) {
                        return new Response("Missing question or sessionId", { status: 400 });
                    }
                    const requestedUserId = requestBody.userId;
                    if (!requestedUserId) {
                        return new Response("Missing userId in request body", { status: 400 });
                    }
                    userId = requestedUserId;

                    const modelToUse = selectedModelIdFromClient || DEFAULT_AI_MODEL;

                    const validModels = [
                        { 'id': "@cf/meta/llama-4-scout-17b-16e-instruct", 'name': "Llama 4 Scout 17B Instruct (Meta)", 'type': "text" },
                        { 'id': "@cf/meta/llama-3.3-70b-instruct-fp8-fast", 'name': "Llama 3.3 70B Instruct (Meta)", 'type': "text" },
                        { 'id': "@cf/meta/llama-3.1-8b-instruct-fast", 'name': "Llama 3.1 8B Instruct Fast (Meta)", 'type': "text" },
                        { 'id': "@cf/google/gemma-3-12b-it", 'name': "Gemma 3 12B Instruct (Google)", 'type': "text" },
                        { 'id': "@cf/qwen/qwq-32b", 'type': "text" },
                        { 'id': "@cf/qwen/qwen2.5-coder-32b-instruct", 'type': "text" },
                        { 'id': "@cf/meta/llama-guard-3-8b", 'type': "text" },
                        { 'id': "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", 'type': "text" },
                        { 'id': "@cf/meta/llama-3.2-1b-instruct", 'name': "Llama 3.2 1B Instruct (Meta)", 'type': "text" },
                        { 'id': "@cf/meta/llama-3.2-3b-instruct", 'name': "Llama 3.2 3B Instruct (Meta)", 'type': "text" },
                        { 'id': "@cf/meta/llama-3.1-8b-instruct-awq", 'name': "Llama 3.1 8B Instruct AWQ (Meta)", 'type': "text" },
                        { 'id': "@cf/meta/llama-3.1-8b-instruct-fp8", 'name': "Llama 3.1 8B Instruct FP8 (Meta)", 'type': "text" },
                        { 'id': "@cf/meta/llama-3.1-8b-instruct", 'name': "Llama 3.1 8B Instruct (Meta)", 'type': "text" },
                        { 'id': "@cf/meta/llama-3-8b-instruct", 'name': "Llama 3 8B Instruct (Meta)", 'type': "text" },
                        { 'id': "@cf/meta/llama-3-8b-instruct-awq", 'type': "text" },
                        { 'id': "@cf/google/gemma-7b-it-lora", 'name': "Gemma 7B Instruct LoRA (Google)", 'type': "text" },
                        { 'id': "@cf/google/gemma-2b-it-lora", 'name': "Gemma 2B Instruct LoRA (Google)", 'type': "text" },
                        { 'id': "@cf/meta/llama-2-7b-chat-hf-lora", 'name': "Llama 2 7B Chat HF LoRA (Meta)", 'type': "text" },
                        { 'id': "@cf/google/gemma-7b-it", 'name': "Gemma 7B Instruct (Google)", 'type': "text" },
                        { 'id': "@cf/nousresearch/starling-lm-7b-beta", 'name': "Starling LM 7B Beta (NousResearch)", 'type': "text" },
                        { 'id': "@cf/nousresearch/hermes-2-pro-mistral-7b", 'type': "text" },
                        { 'id': "@cf/qwen/qwen1.5-1.8b-chat", 'type': "text" },
                        { 'id': "@cf/microsoft/phi-2", 'type': "text" },
                        { 'id': "@cf/tinyllama/tinyllama-1.1b-chat-v1.0", 'type': "text" },
                        { 'id': "@cf/qwen/qwen1.5-14b-chat-awq", 'type': "text" },
                        { 'id': "@cf/qwen/qwen1.5-7b-chat-awq", 'type': "text" },
                        { 'id': "@cf/qwen/qwen1.5-0.5b-chat", 'type': "text" },
                        { 'id': "@cf/huggingface/discolm-german-7b-v1-awq", 'type': "text" },
                        { 'id': "@cf/tiiuae/falcon-7b-instruct", 'type': "text" },
                        { 'id': "@cf/openchat/openchat-3.5-0106", 'type': "text" },
                        { 'id': "@cf/defog/sqlcoder-7b-2", 'type': "text" },
                        { 'id': "@cf/deepseek-ai/deepseek-math-7b-instruct", 'type': "text" },
                        { 'id': "@hf/thebloke/deepseek-coder-6.7b-instruct-awq", 'type': "text" },
                        { 'id': "@hf/thebloke/deepseek-coder-6.7b-base-awq", 'type': "text" },
                        { 'id': "@cf/meta/llamaguard-7b-awq", 'type': "text" },
                        { 'id': "@hf/thebloke/neural-chat-7b-v3-1-awq", 'type': "text" },
                        { 'id': "@hf/thebloke/openhermes-2.5-mistral-7b-awq", 'type': "text" },
                        { 'id': "@hf/thebloke/llama-2-13b-chat-awq", 'type': "text" },
                        { 'id': "@hf/thebloke/mistral-7b-instruct-v0.1-awq", 'type': "text" },
                        { 'id': "@hf/thebloke/zephyr-7b-beta-awq", 'type': "text" },
                        { 'id': "@cf/meta/llama-2-7b-chat-fp16", 'type': "text" },
                        { 'id': "@cf/mistral/mistral-7b-instruct-v0.1", 'type': "text" },
                        { 'id': "@cf/meta/llama-2-7b-chat-int8", 'type': "text" },
                        { 'id': "@cf/meta/llama-3.1-70b-instruct", 'type': "text" }
                    ];

                    const modelConfig = validModels.find(m => m.id === modelToUse);

                    if (!modelConfig) {
                        return new Response(`Invalid model selected or model not supported: ${modelToUse}. Please choose a valid model.`, { status: 400 });
                    }

                    const historyStr = await CHAT_HISTORY_KV.get(getUserChatHistoryKey(sessionId));
                    let chatHistory = historyStr ? JSON.parse(historyStr) : [];

                    chatHistory.push({ 'role': "user", 'content': question, 'type': "text" });

                    let aiResponseContent;
                    let aiResponseType;

                    if (modelConfig.type === "image") {
                        const imageResponse = await env.AI.run(
                            modelToUse,
                            { 'prompt': question }
                        );
                        const imageUrl = `data:image/png;base64,${imageResponse.image_b64}`;
                        aiResponseContent = imageUrl;
                        aiResponseType = "image";
                    } else {
                        const messagesForAI = chatHistory.slice(-5);
                        const textResponse = await env.AI.run(
                            modelToUse,
                            { 'messages': messagesForAI }
                        );
                        aiResponseContent = textResponse.response;
                        aiResponseType = "text";
                    }

                    chatHistory.push({ 'role': "assistant", 'content': aiResponseContent, 'type': aiResponseType });

                    await CHAT_HISTORY_KV.put(getUserChatHistoryKey(sessionId), JSON.stringify(chatHistory));

                    const summaryPrompt = `Summarize the following conversation concisely in English, maximum 10 words. If the conversation is very short, just use the first user message.
                    Conversation:
                    ${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;

                    const summaryResponse = await env.AI.run(
                        SUMMARY_MODEL,
                        { 'prompt': summaryPrompt }
                    );
                    const summary = summaryResponse.response.trim();

                    const currentTimestamp = new Date().toISOString();

                    const metadataStr = await CHAT_HISTORY_KV.get(getAllSessionMetadataKey());
                    let allSessionMetadata = metadataStr ? JSON.parse(metadataStr) : [];

                    let sessionIndex = allSessionMetadata.findIndex(s => s.id === sessionId);
                    if (sessionIndex !== -1) {
                        allSessionMetadata[sessionIndex] = { 'id': sessionId, 'summary': summary, 'timestamp': currentTimestamp };
                    } else {
                        allSessionMetadata.push({ 'id': sessionId, 'summary': summary, 'timestamp': currentTimestamp });
                    }
                    await CHAT_HISTORY_KV.put(getAllSessionMetadataKey(), JSON.stringify(allSessionMetadata));

                    return new Response(JSON.stringify({ 'answer': aiResponseContent, 'type': aiResponseType }), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                } catch (error) {
                    console.error("Error processing chat:", error);
                    return new Response(`Error: ${error.message}`, { status: 500 });
                }
            }

            // API endpoint for deleting a chat session
            if (url.pathname === '/api/delete_session' && request.method === 'POST') {
                try {
                    const requestBody = await request.json();
                    const sessionIdToDelete = requestBody.sessionId;
                    const requestedUserId = requestBody.userId;

                    if (!sessionIdToDelete || !requestedUserId) {
                        return new Response("Missing sessionId or userId for deletion", { status: 400 });
                    }
                    userId = requestedUserId;

                    // Delete the chat history for the specified session
                    await CHAT_HISTORY_KV.delete(getUserChatHistoryKey(sessionIdToDelete));

                    // Update the session metadata list
                    const metadataStr = await CHAT_HISTORY_KV.get(getAllSessionMetadataKey());
                    let allSessionMetadata = metadataStr ? JSON.parse(metadataStr) : [];
                    allSessionMetadata = allSessionMetadata.filter(s => s.id !== sessionIdToDelete);
                    await CHAT_HISTORY_KV.put(getAllSessionMetadataKey(), JSON.stringify(allSessionMetadata));

                    return new Response("Session deleted successfully", { status: 200 });
                } catch (error) {
                    console.error("Error deleting session:", error);
                    return new Response(`Failed to delete session: ${error.message}`, { status: 500 });
                }
            }

            return new Response('Not Found', { status: 404 });
        },
    };
})();
