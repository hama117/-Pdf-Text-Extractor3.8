import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  disabled?: boolean;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ 
  onFileSelect, 
  selectedFile, 
  onClearFile,
  disabled 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileSelect(pdfFile);
    }
  }, [onFileSelect, disabled]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  if (selectedFile) {
    return (
      <div className="w-full max-w-md bg-white border-2 border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onClearFile}
            disabled={disabled}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-md border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver && !disabled
          ? 'border-blue-400 bg-blue-50'
          : disabled
          ? 'border-gray-200 bg-gray-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className={`h-12 w-12 mx-auto mb-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
      <p className={`text-lg font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
        PDFファイルをアップロード
      </p>
      <p className={`text-sm mb-4 ${disabled ? 'text-gray-300' : 'text-gray-600'}`}>
        ファイルをドラッグ&ドロップするか、クリックして選択
      </p>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        id="pdf-upload"
      />
      <label
        htmlFor="pdf-upload"
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
        }`}
      >
        ファイルを選択
      </label>
    </div>
  );
};