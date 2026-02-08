// app/embed/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function EmbedPage() {
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [height, setHeight] = useState('600px');
  const [width, setWidth] = useState('100%');

  useEffect(() => {
    // Set the default URL to your chat interface
    setUrl('http://localhost:3000'); // Adjust to your actual chat URL
  }, []);

  useEffect(() => {
    const generateEmbedCode = () => {
      return `<iframe 
  src="${url}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  allowfullscreen
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`;
    };

    setEmbedCode(generateEmbedCode());
  }, [url, height, width]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Embed Chat Interface</h1>
              <p className="text-gray-600 mb-6">
                Generate an embed code to integrate the CoolGirls AI chat interface into your website.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chat URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width
                    </label>
                    <input
                      type="text"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <input
                      type="text"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Generated Embed Code
                  </label>
                  <button
                    onClick={openInNewTab}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    Preview <ExternalLink className="ml-1 w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap">
                    {embedCode}
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">How to use:</h3>
                <ol className="list-decimal list-inside text-blue-700 space-y-1">
                  <li>Customize the URL, width and height as needed</li>
                  <li>Copy the generated embed code</li>
                  <li>Paste the code into your website's HTML</li>
                  <li>Adjust styling to match your site design</li>
                </ol>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Preview:</h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <iframe 
                    src={url} 
                    width={width} 
                    height={height} 
                    frameBorder="0"
                    title="CoolGirls AI Chat Preview"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}