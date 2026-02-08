'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Trash2, Upload, FileIcon, ExternalLink } from 'lucide-react';

type UploadedFile = {
  id: number;
  title: string;
  categoryId: string;
  categoryName: string;
  fileName: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
};

type Category = {
  id: string;
  name: string;
};

export default function ViewUploads() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceTitle, setReplaceTitle] = useState('');
  const [replaceCategoryId, setReplaceCategoryId] = useState('');
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);

  // Fetch uploaded files
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filesRes, categoriesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/uploaded-files'),
          fetch('http://127.0.0.1:8000/api/categories')
        ]);

        if (!filesRes.ok) throw new Error('Failed to fetch files');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');

        const filesData = await filesRes.json();
        const categoriesData = await categoriesRes.json();

        setFiles(filesData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/uploaded-files/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(files.filter(file => file.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to delete file');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReplaceFileChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.files && e.target.files[0]) {
      setReplaceFile(e.target.files[0]);
    }
  };

  const handleReplaceSubmit = async (e: FormEvent, id: number) => {
    e.preventDefault();
    if (!replaceFile) return;

    setReplaceLoading(true);
    setReplaceError(null);

    const formData = new FormData();
    formData.append('file', replaceFile);
    formData.append('title', replaceTitle);
    formData.append('categoryId', replaceCategoryId);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/uploaded-files/${id}/replace`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        // Refresh the files list
        const res = await fetch('http://127.0.0.1:8000/api/uploaded-files');
        const updatedFiles = await res.json();
        setFiles(updatedFiles);
        
        // Reset replacement form
        setReplaceFile(null);
        setReplaceTitle('');
        setReplaceCategoryId('');
        setReplacingId(null);
      } else {
        const errorData = await response.json();
        setReplaceError(errorData.detail || 'Failed to replace file');
      }
    } catch (err) {
      setReplaceError('Network error. Please try again.');
    } finally {
      setReplaceLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Uploaded Files</h1>
      
      {files.length === 0 ? (
        <div className="text-center py-12">
          <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No files uploaded</h3>
          <p className="mt-1 text-gray-500">Get started by uploading a file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 truncate max-w-[200px]">{file.title}</h3>
                  <p className="text-sm text-gray-500">{file.categoryName}</p>
                  <p className="text-xs text-gray-400 mt-1">{file.fileName}</p>
                  <p className="text-xs text-gray-400">{formatDate(file.createdAt)}</p>
                </div>
                
                <div className="flex space-x-2">
                  <a 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 text-blue-500 hover:text-blue-700"
                    title="View file"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                  
                  <button
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingId === file.id}
                    className={`p-1 ${deletingId === file.id ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`}
                    title="Delete file"
                  >
                    {deletingId === file.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {replacingId === file.id ? (
                <form 
                  onSubmit={(e) => handleReplaceSubmit(e, file.id)}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New File
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleReplaceFileChange(e, file.id)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={replaceTitle}
                      onChange={(e) => setReplaceTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={replaceCategoryId}
                      onChange={(e) => setReplaceCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {replaceError && (
                    <p className="text-red-500 text-xs mb-2">{replaceError}</p>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={replaceLoading}
                      className={`flex-1 px-3 py-1.5 text-sm rounded-md ${
                        replaceLoading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {replaceLoading ? 'Replacing...' : 'Replace'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingId(null);
                        setReplaceFile(null);
                        setReplaceTitle('');
                        setReplaceCategoryId('');
                      }}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setReplacingId(file.id);
                    setReplaceTitle(file.title);
                    setReplaceCategoryId(file.categoryId);
                  }}
                  className="mt-4 w-full flex items-center justify-center px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Replace File
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}