const messagesDiv = document.getElementById('messages');
const statusDiv = document.getElementById('status');
const loginForm = document.getElementById('loginForm');
const disconnectBtn = document.getElementById('disconnectBtn');
const questionPopup = document.getElementById('questionPopup');
const selectedTextDiv = document.getElementById('selectedText');
const questionInput = document.getElementById('questionInput');
const aiContainer = document.getElementById('aiContainer');
const aiMessages = document.getElementById('aiMessages');

let ws;
let currentUserId;
let currentSelectedText = '';

function connectToChat() {
    const meetingId = document.getElementById('meetingId').value;
    currentUserId = document.getElementById('userId').value;

    if (!meetingId || !currentUserId) {
        alert('Please enter both Meeting ID and User ID');
        return;
    }

    ws = new WebSocket(`ws://localhost:6065/v1/ws?meeting_id=${meetingId}`);
    
    ws.onopen = () => {
        statusDiv.textContent = 'Connected';
        statusDiv.style.backgroundColor = '#e8f5e9';
        statusDiv.style.color = '#2e7d32';
        loginForm.style.display = 'none';
        disconnectBtn.style.display = 'block';
    };

    ws.onclose = () => {
        statusDiv.textContent = 'Disconnected';
        statusDiv.style.backgroundColor = '#ffebee';
        statusDiv.style.color = '#c62828';
        loginForm.style.display = 'block';
        disconnectBtn.style.display = 'none';
        messagesDiv.innerHTML = '';
    };

    ws.onmessage = (event) => {
        const record = JSON.parse(event.data);
        console.log('Message received:', record);
        console.log('Current user ID:', currentUserId);
        
        // Tạo div cho tin nhắn
        const messageDiv = document.createElement('div');
        
        // So sánh chính xác user_id
        const isCurrentUser = String(record.UserID).trim() === String(currentUserId).trim();
        console.log('Is current user?', isCurrentUser);
        
        // Thêm class dựa vào kết quả so sánh
        messageDiv.className = isCurrentUser ? 'message sent' : 'message received';
        
        // Tạo nội dung tin nhắn
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        messageBubble.textContent = record.Text;
        
        const messageInfo = document.createElement('div');
        messageInfo.className = 'message-info';
        messageInfo.textContent = `${record.UserID} • ${new Date(record.RecordedAt).toLocaleString()}`;
        
        // Ghép các phần lại với nhau
        messageContent.appendChild(messageBubble);
        messageContent.appendChild(messageInfo);
        messageDiv.appendChild(messageContent);
        
        // Thêm vào khung chat
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };
}

function disconnectFromChat() {
    if (ws) {
        ws.close();
        ws = null;
    }
    // Clear chat messages
    messagesDiv.innerHTML = '';
    // Hide AI container and clear its messages
    aiContainer.style.display = 'none';
    aiMessages.innerHTML = '';
    // Clear any input
    document.getElementById('directQuestionInput').value = '';
    // Reset status
    statusDiv.textContent = 'Disconnected';
    statusDiv.className = '';
    // Show login form
    loginForm.style.display = 'block';
}

// Xử lý phím tắt Command + I
document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            showQuestionPopup(selectedText);
        }
    }
});

function showQuestionPopup(text) {
    currentSelectedText = text;
    selectedTextDiv.textContent = text;
    questionInput.value = '';
    questionPopup.style.display = 'flex';
    questionInput.focus();
}

function closeQuestionPopup() {
    questionPopup.style.display = 'none';
    currentSelectedText = '';
}

function sendToAI(question, selectedText = '') {
    if (!question) return;

    // Hiển thị AI container nếu chưa hiển thị
    aiContainer.style.display = 'flex';

    // Thêm câu hỏi vào khung chat AI
    const questionDiv = document.createElement('div');
    questionDiv.className = 'ai-message question';
    
    if (selectedText) {
        questionDiv.innerHTML = `
            <strong>Selected Text:</strong><br>
            ${selectedText}<br><br>
            <strong>Question:</strong><br>
            ${question}
        `;
    } else {
        questionDiv.innerHTML = `<strong>Question:</strong><br>${question}`;
    }
    
    aiMessages.appendChild(questionDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    // Gửi request đến OpenAI API
    fetch('http://localhost:6065/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: selectedText,
            question: question
        })
    })
    .then(response => response.json())
    .then(data => {
        // Thêm câu trả lời từ AI
        const answerDiv = document.createElement('div');
        answerDiv.className = 'ai-message answer';
        answerDiv.textContent = data.answer;
        aiMessages.appendChild(answerDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'ai-message answer';
        errorDiv.textContent = 'Sorry, there was an error processing your request.';
        aiMessages.appendChild(errorDiv);
    });
}

function handleSelectedTextQuestion() {
    const question = questionInput.value.trim();
    if (!question) return;
    
    sendToAI(question, currentSelectedText);
    closeQuestionPopup();
}

function sendDirectQuestion() {
    const input = document.getElementById('directQuestionInput');
    const question = input.value.trim();
    if (!question) return;
    
    sendToAI(question);
    input.value = '';
}
