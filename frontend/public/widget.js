(function() {
  'use strict';

  // Default configuration values
  const defaultConfig = {
    apiKey: '',
    position: 'bottom-right',
    theme: {
      primaryColor: '#6366f1',
      size: 'medium',
      borderRadius: '12px',
      welcomeMessage: 'Hello! How can I assist you today?'
    }
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.CoolGirlsAIConfig || {});

  // Validate API key
  if (!config.apiKey) {
    console.error('CoolGirls AI Widget: API key is required');
    return;
  }

  // Determine the API base URL based on environment
  const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8000/api' 
    : 'https://coolgirls-ai-backend.com/api';

  // Create the widget container
  function createWidget() {
    // Create main container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'coolgirls-ai-widget-container';
    
    // Determine position classes
    let positionClasses = '';
    switch(config.position) {
      case 'bottom-right':
        positionClasses = 'bottom-4 right-4';
        break;
      case 'bottom-left':
        positionClasses = 'bottom-4 left-4';
        break;
      case 'top-right':
        positionClasses = 'top-4 right-4';
        break;
      case 'top-left':
        positionClasses = 'top-4 left-4';
        break;
      default:
        positionClasses = 'bottom-4 right-4'; // default to bottom-right
    }
    
    // Set initial styles
    widgetContainer.className = `fixed z-[9999] ${positionClasses} transition-all duration-300`;
    
    // Create launcher button
    const launcher = document.createElement('div');
    launcher.id = 'coolgirls-ai-launcher';
    launcher.className = 'flex items-center p-3 rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-opacity';
    launcher.style.backgroundColor = config.theme.primaryColor;
    launcher.style.borderRadius = config.theme.borderRadius;
    
    // Launcher content
    launcher.innerHTML = `
      <span class="text-white font-medium mr-2 hidden md:inline">AI Assistant</span>
      <div class="bg-white rounded-full w-10 h-10 flex items-center justify-center">
        <span class="text-indigo-600 font-bold">CG</span>
      </div>
    `;
    
    // Create chat window (initially hidden)
    const chatWindow = document.createElement('div');
    chatWindow.id = 'coolgirls-ai-chat-window';
    chatWindow.className = 'mt-2 rounded-xl shadow-xl w-80 overflow-hidden transform transition-transform duration-300 scale-0 opacity-0';
    chatWindow.style.display = 'none';
    chatWindow.style.borderRadius = config.theme.borderRadius;
    chatWindow.style.backgroundColor = 'white';
    
    chatWindow.innerHTML = `
      <div class="p-3 text-white" style="background-color: ${config.theme.primaryColor}">
        <div class="flex justify-between items-center">
          <span>CoolGirls AI</span>
          <button id="coolgirls-ai-close-btn" class="text-white text-xl">×</button>
        </div>
      </div>
      <div id="coolgirls-ai-messages" class="p-4 h-64 overflow-y-auto">
        <div class="flex justify-start mb-3">
          <div class="bg-gray-200 rounded-lg p-2 mr-2 max-w-[80%]">
            <span class="text-sm">${config.theme.welcomeMessage}</span>
          </div>
        </div>
      </div>
      <div class="p-3 border-t">
        <div class="flex">
          <input 
            type="text" 
            id="coolgirls-ai-input" 
            placeholder="Type your message..." 
            class="flex-1 px-3 py-2 border rounded-l-md text-sm focus:outline-none"
          />
          <button 
            id="coolgirls-ai-send-btn" 
            class="px-4 bg-gray-200 rounded-r-md text-sm font-medium hover:bg-gray-300"
            style="background-color: ${config.theme.primaryColor}; color: white;"
          >
            Send
          </button>
        </div>
      </div>
      <div id="coolgirls-ai-typing-indicator" class="p-3 hidden">
        <div class="flex justify-start">
          <div class="bg-gray-200 rounded-lg p-2 mr-2">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
              <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Append elements to container
    widgetContainer.appendChild(launcher);
    widgetContainer.appendChild(chatWindow);
    
    // Add to document body
    document.body.appendChild(widgetContainer);
    
    // Toggle chat window visibility
    function toggleChat() {
      const isVisible = chatWindow.style.display !== 'none';
      
      if (isVisible) {
        // Close animation
        chatWindow.classList.remove('scale-100', 'opacity-100');
        chatWindow.classList.add('scale-0', 'opacity-0');
        
        setTimeout(() => {
          chatWindow.style.display = 'none';
        }, 150);
      } else {
        // Open animation
        chatWindow.style.display = 'block';
        setTimeout(() => {
          chatWindow.classList.remove('scale-0', 'opacity-0');
          chatWindow.classList.add('scale-100', 'opacity-100');
        }, 10);
      }
    }
    
    // Close chat window
    function closeChat() {
      chatWindow.classList.remove('scale-100', 'opacity-100');
      chatWindow.classList.add('scale-0', 'opacity-0');
      
      setTimeout(() => {
        chatWindow.style.display = 'none';
      }, 150);
    }
    
    // Show typing indicator
    function showTypingIndicator() {
      document.getElementById('coolgirls-ai-typing-indicator').style.display = 'block';
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
      document.getElementById('coolgirls-ai-typing-indicator').style.display = 'none';
    }
    
    // Send message to API
    async function sendMessage() {
      const input = document.getElementById('coolgirls-ai-input');
      const message = input.value.trim();
      
      if (!message) return;
      
      // Add user message to chat
      addMessage(message, 'user');
      input.value = '';
      
      // Show typing indicator
      showTypingIndicator();
      
      try {
        // Call the actual API
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            message: message
          })
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add AI response to chat
        addMessage(data.response, 'ai');
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add error message to chat
        addMessage("Sorry, I'm having trouble responding right now. Please try again later.", 'ai');
      }
    }
    
    // Add message to chat
    function addMessage(text, sender) {
      const messagesContainer = document.getElementById('coolgirls-ai-messages');
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`;
      
      const messageBubble = document.createElement('div');
      messageBubble.className = `p-2 rounded-lg max-w-[80%] ${
        sender === 'user' 
          ? 'bg-indigo-500 text-white rounded-tr-none' 
          : 'bg-gray-200 text-gray-800 rounded-tl-none'
      }`;
      messageBubble.textContent = text;
      
      messageDiv.appendChild(messageBubble);
      messagesContainer.appendChild(messageDiv);
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Event listeners
    launcher.addEventListener('click', toggleChat);
    
    document.getElementById('coolgirls-ai-close-btn').addEventListener('click', closeChat);
    
    document.getElementById('coolgirls-ai-send-btn').addEventListener('click', sendMessage);
    
    document.getElementById('coolgirls-ai-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Initialize widget when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    // If DOM is already loaded, run immediately
    createWidget();
  }
})();