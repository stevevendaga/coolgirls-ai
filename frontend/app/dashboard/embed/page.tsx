'use client';

import { useState, useEffect } from 'react';
import { Copy, Code, Palette, Smartphone, Globe, Settings } from 'lucide-react';

export default function DashboardEmbedPage() {
  const [widgetCode, setWidgetCode] = useState('');
  const [activeTab, setActiveTab] = useState('standard');
  const [customization, setCustomization] = useState({
    position: 'bottom-right',
    color: '#6366f1',
    size: 'medium',
    borderRadius: '12',
    welcomeMessage: 'Hello! How can I assist you today?',
  });
  
  // Generate widget code based on customizations
  useEffect(() => {
    // Use localhost URL for local development, production URL otherwise
    const scriptSrc = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/widget.js' 
      : 'https://coolgirls-ai-widgets.com/widget.js';
    
    const code = `
<!-- CoolGirls AI Twin Widget -->
<script>
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (!d.getElementById(id)) {
      js = d.createElement(s);
      js.id = id;
      js.src = "${scriptSrc}";
      fjs.parentNode.insertBefore(js, fjs);
    }
  }(document, 'script', 'coolgirls-ai-widget'));
  
  window.CoolGirlsAIConfig = {
    apiKey: 'YOUR_API_KEY_HERE',
    position: '${customization.position}',
    theme: {
      primaryColor: '${customization.color}',
      size: '${customization.size}',
      borderRadius: '${customization.borderRadius}px',
      welcomeMessage: '${customization.welcomeMessage}'
    }
  };
</script>
<!-- End CoolGirls AI Twin Widget -->
    `.trim();
    
    setWidgetCode(code);
  }, [customization]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(widgetCode);
    // Optional: Show a notification that code was copied
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Embed Your AI Twin</h1>
      <p className="text-gray-600 mb-8">Integrate your personalized AI assistant into your website</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customization Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
            <div className="flex items-center mb-6">
              <Palette className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Customize Appearance</h2>
            </div>
            
            <div className="space-y-6">
              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {['bottom-right', 'bottom-left', 'top-right', 'top-left'].map((pos) => (
                    <button
                      key={pos}
                      className={`py-2 px-3 rounded-md text-sm capitalize ${
                        customization.position === pos
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setCustomization({...customization, position: pos})}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customization.color}
                    onChange={(e) => setCustomization({...customization, color: e.target.value})}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.color}
                    onChange={(e) => setCustomization({...customization, color: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              
              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      className={`py-2 px-3 rounded-md text-sm capitalize ${
                        customization.size === size
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setCustomization({...customization, size})}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Border Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Radius: {customization.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={customization.borderRadius}
                  onChange={(e) => setCustomization({...customization, borderRadius: e.target.value})}
                  className="w-full"
                />
              </div>
              
              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                <textarea
                  value={customization.welcomeMessage}
                  onChange={(e) => setCustomization({...customization, welcomeMessage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Preview & Code Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Preview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <Smartphone className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
              <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Your Website</h3>
                <p className="text-gray-600 mb-6">This is how your site would look with the AI twin widget integrated.</p>
                
                {/* Simulated widget preview */}
                <div className={`absolute ${customization.position.split('-')[0]}-4 ${customization.position.split('-')[1]}-4 flex flex-col items-end`}>
                  <div 
                    className="flex items-center p-3 rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: customization.color,
                      borderRadius: `${parseInt(customization.borderRadius)}px`
                    }}
                  >
                    <span className="text-white font-medium mr-2">AI Assistant</span>
                    <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-indigo-600 font-bold">CG</span>
                    </div>
                  </div>
                  
                  {/* Widget expanded view (simplified) */}
                  <div 
                    className="mt-2 rounded-xl shadow-xl w-80 overflow-hidden"
                    style={{ 
                      backgroundColor: 'white',
                      borderRadius: `${parseInt(customization.borderRadius)}px`
                    }}
                  >
                    <div 
                      className="p-3 text-white"
                      style={{ backgroundColor: customization.color }}
                    >
                      <div className="flex justify-between items-center">
                        <span>CoolGirls AI</span>
                        <button className="text-white">×</button>
                      </div>
                    </div>
                    <div className="p-4 h-40 overflow-y-auto">
                      <div className="flex mb-3">
                        <div className="bg-gray-200 rounded-lg p-2 mr-2">
                          <span className="text-sm">Hello! How can I assist you today?</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t">
                      <input 
                        type="text" 
                        placeholder="Type your message..." 
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Embed Code */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Code className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Embed Code</h2>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy Code
              </button>
            </div>
            
            <div className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <pre>{widgetCode}</pre>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Installation Instructions
              </h3>
              <ol className="list-decimal list-inside mt-2 text-sm text-blue-700 space-y-1">
                <li>Copy the code above</li>
                <li>Paste it before the closing <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> tag in your HTML</li>
                <li>Replace <code className="bg-blue-100 px-1 rounded">YOUR_API_KEY_HERE</code> with your actual API key</li>
                <li>Your AI twin will appear on your website according to your customizations</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}