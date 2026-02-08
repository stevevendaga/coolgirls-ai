// components/upload.tsx
'use client'

import { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { Trash2, Upload, FileIcon, ExternalLink, Eye, Download } from 'lucide-react';
import Swal from 'sweetalert2';

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

export default function UploadData() {
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View uploads state
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [viewLoading, setViewLoading] = useState(true);
  const [viewError, setViewError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceTitle, setReplaceTitle] = useState('');
  const [replaceCategoryId, setReplaceCategoryId] = useState('');
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);

  
// Add this utility function at the top of your component:
const isPreviewable = (filename: string): boolean => {
  const ext = filename.toLowerCase().split('.').pop();
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
};

  // Load categories from API when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback categories
        setCategories([
          { id: '1', name: 'Personal Documents' },
          { id: '2', name: 'Business Reports' },
          { id: '3', name: 'Technical Docs' },
          { id: '4', name: 'Academic Papers' }
        ]);
      }
    };

    fetchCategories();
  }, []);

  // Fetch uploaded files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/uploaded-files');
        if (!response.ok) throw new Error('Failed to fetch files');
        const filesData = await response.json();
        setFiles(filesData);
        setViewLoading(false);
      } catch (err) {
        setViewError('Failed to load files');
        setViewLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        'application/vnd.ms-powerpoint', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setErrors(prev => ({...prev, file: 'Invalid file type. Supported formats: PDF, DOCX, XLS, PPTX'}));
        setFile(null);
      } else {
        setFile(selectedFile);
        setErrors(prev => ({...prev, file: ''}));
      }
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (e.target.value.trim()) {
      setErrors(prev => ({...prev, title: ''}));
    }
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value);
    if (e.target.value) {
      setErrors(prev => ({...prev, category: ''}));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!file) {
      newErrors.file = 'Please select a file';
    }

    if (!title.trim()) {
      newErrors.title = 'Document title is required';
    }

    if (!categoryId) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess('');
    
    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('title', title);
    formData.append('categoryId', categoryId);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess('File uploaded successfully!');
        
        // Refresh the files list
        const res = await fetch('http://127.0.0.1:8000/api/uploaded-files');
        const updatedFiles = await res.json();
        setFiles(updatedFiles);
        
        // Reset form
        setFile(null);
        setTitle('');
        setCategoryId('');
        setErrors({});
        
        // Reset the file input to clear the selected file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.detail || 'Upload failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFile(null);
    setTitle('');
    setCategoryId('');
    setErrors({});
    setSuccess('');
    
    // Also reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // View uploads functions
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will delete the data from the Knowledge base. You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setDeletingId(id);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/uploaded-files/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFiles(files.filter(file => file.id !== id));
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        } else {
          const errorData = await response.json();
          Swal.fire(
            'Error!',
            errorData.detail || 'Failed to delete file',
            'error'
          );
        }
      } catch (err) {
        Swal.fire(
          'Error!',
          'Network error. Please try again.',
          'error'
        );
      } finally {
        setDeletingId(null);
      }
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
        
        Swal.fire(
          'Replaced!',
          'Your file has been replaced.',
          'success'
        );
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-0 max-w-7xl mx-auto">
      {/* Upload Form - Left Column */}
      <div className="lg:w-4/12 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Files</h1>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, DOCX, XLS, PPTX
            </p>
            <div className="mt-2 pt-1 border-b border-gray-200"></div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div className="relative">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors duration-300 hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
              
              {/* Document Title Field */}
              <div className="relative mt-4">
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className={`w-full px-4 py-2 mt-1 text-sm border ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:border-blue-500 transition-colors`}
                  placeholder=" "
                />
                <label
                  className={`absolute left-2 px-1 transition-all duration-200 ${
                    title
                      ? 'top-0 text-xs text-blue-500 font-medium bg-white'
                      : 'top-2.5 text-sm text-gray-500'
                  }`}
                >
                  Document Title
                </label>
              </div>
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              
              {/* Dropdown for Category */}
              <div className="relative mt-4">
                <select
                  value={categoryId}
                  onChange={handleCategoryChange}
                  className={`w-full px-4 py-2 mt-1 text-sm border ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:border-blue-500 appearance-none bg-white`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            
            {errors.submit && <p className="text-red-500 text-sm mb-4">{errors.submit}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
            
            <div className="flex items-center justify-between">
              <button 
                type="submit"
                disabled={loading}
                className={`px-5 py-2.5 font-medium rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md hover:shadow-lg ${
                  loading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
              
              <button 
                type="button"
                onClick={handleResetForm}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 font-medium rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md hover:shadow-lg"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* View Uploads - Right Column */}
      <div className="lg:w-8/12 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">View Uploaded Files</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {files.length} files
            </span>
          </div>
          
          {viewLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : viewError ? (
            <div className="text-center py-12">
              <p className="text-red-500">{viewError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No files uploaded</h3>
              <p className="mt-1 text-gray-500">Get started by uploading a file.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 truncate max-w-[200px]">{file.title}</h3>
                      <p className="text-sm text-gray-500">Category: {file.categoryName}</p>
                     
                     <p className="text-xs text-gray-400 mt-1">
                        <a 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-0 text-blue-500 hover:text-blue-700 break-all"
                          title="View or download file"
                        >
                          {file.fileName}
                        </a>
                      </p>


                      {/* {
                        isPreviewable(file.fileName) ? (
                          <a 
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 text-blue-500 hover:text-blue-700"
                            title="Preview file"
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                        ) : (
                          <a 
                            href={file.fileUrl} 
                            download
                            className="p-1 text-blue-500 hover:text-blue-700"
                            title="Download file"
                          >
                            
                          </a>
                        )
                      } */}


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
                      className="mt-3 pt-3 border-t border-gray-300"
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
                      className="mt-3 w-full flex items-center justify-center px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
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
      </div>
    </div>
  );
}