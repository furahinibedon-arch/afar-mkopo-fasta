'use client';

import { useState, useEffect } from 'react';
import {
  getLoanDocuments,
  uploadLoanDocument,
  updateLoanDocument,
  deleteLoanDocument,
  BorrowerDocument,
} from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { Upload, Search, FileText, Image, Edit, Trash2, Eye, X } from 'lucide-react';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="w-12 h-12 text-red-500" />;
  if (type.includes('image')) return <Image className="w-12 h-12 text-blue-500" />;
  return <FileText className="w-12 h-12 text-gray-500" />;
};

interface DocumentManagementProps {
  loanId: string;
  onClose?: () => void;
}

export default function DocumentManagement({ loanId, onClose }: DocumentManagementProps) {
  const [documents, setDocuments] = useState<BorrowerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editingDocument, setEditingDocument] = useState<BorrowerDocument | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const { t } = useLanguage();

  const fetchDocuments = async () => {
    try {
      const docs = await getLoanDocuments(loanId, search, filterType);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [loanId, search, filterType]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const description = prompt('Enter a description for this document (optional):');
    
    setUploading(true);
    try {
      const newDoc = await uploadLoanDocument(loanId, file, description || '');
      setDocuments(prev => [newDoc, ...prev]);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDocument) return;
    try {
      const updatedDoc = await updateLoanDocument(loanId, editingDocument.id, editDescription);
      setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
      setEditingDocument(null);
      setEditDescription('');
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Failed to update document');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteLoanDocument(loanId, docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-dark-200">
          <div>
            <h2 className="text-xl font-black text-dark-800">Loan Documents</h2>
            <p className="text-dark-500 text-sm">Manage documents for this loan application</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-dark-100 hover:bg-dark-200 flex items-center justify-center text-dark-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="word">Word</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            <label className="btn-primary px-4 py-2 cursor-pointer flex items-center gap-2">
              {uploading ? 'Uploading...' : 'Upload Document'}
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Document List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-dark-500">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-lg font-semibold text-dark-700">No Documents</p>
              <p className="text-sm">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="border border-dark-200 rounded-xl p-4 bg-dark-50 hover:bg-dark-100 transition-colors">
                  {editingDocument?.id === doc.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Document description..."
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingDocument(null)}
                          className="px-4 py-1.5 text-sm btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-1.5 text-sm btn-primary"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      {getFileIcon(doc.fileType)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-dark-800">{doc.fileName}</h4>
                            <p className="text-sm text-dark-500">
                              {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.createdAt).toLocaleDateString()} by {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                            </p>
                            {doc.description && (
                              <p className="text-sm text-dark-600 mt-1">{doc.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-sm btn-secondary flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" /> View
                            </a>
                            <button
                              onClick={() => {
                                setEditingDocument(doc);
                                setEditDescription(doc.description || '');
                              }}
                              className="px-3 py-1.5 text-sm btn-secondary flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
