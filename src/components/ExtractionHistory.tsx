import React, { useState } from 'react';
import { History, Trash2, Download, Copy, Check, FileText, Calendar, HardDrive, ChevronDown, ChevronUp } from 'lucide-react';
import { ExtractionHistory as HistoryType } from '../types';
import { CSVExporter } from '../utils/csvExporter';

interface ExtractionHistoryProps {
  history: HistoryType[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const ExtractionHistory: React.FC<ExtractionHistoryProps> = ({
  history,
  onDelete,
  onClearAll
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return null;
  }

  const handleCopy = async (item: HistoryType) => {
    try {
      const allText = item.extractedTexts
        .map(text => text.text)
        .join('\n');
      
      const tabDelimitedText = CSVExporter.copyAsTabDelimited(allText);
      await navigator.clipboard.writeText(tabDelimitedText);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownloadCSV = (item: HistoryType) => {
    try {
      const allText = item.extractedTexts
        .map(text => text.text)
        .join('\n');
      
      const csvContent = CSVExporter.convertToCSV(allText);
      const filename = `${item.fileName.replace('.pdf', '')}-${item.extractedAt.toISOString().split('T')[0]}.csv`;
      
      CSVExporter.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('CSV download failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <History className="h-6 w-6 mr-2" />
          抽出履歴 ({history.length})
        </h2>
        <button
          onClick={onClearAll}
          className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          全て削除
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* ヘッダー部分 */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{item.fileName}</h3>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(item.extractedAt)}
                      </span>
                      <span className="flex items-center">
                        <HardDrive className="h-3 w-3 mr-1" />
                        {formatFileSize(item.fileSize)}
                      </span>
                      <span>{item.extractedTexts.length} ページ</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleCopy(item)}
                    className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-md hover:bg-purple-200 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        コピー
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDownloadCSV(item)}
                    className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </button>

                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {expandedId === item.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 展開可能なコンテンツ部分 */}
            {expandedId === item.id && (
              <div className="p-4 bg-gray-50">
                <div className="space-y-4">
                  {item.extractedTexts.map((text, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        ページ {text.pageNumber}
                      </div>
                      <div className="text-xs text-gray-500 mb-2 font-mono bg-yellow-50 p-2 rounded border">
                        📋 <strong>使用方法:</strong> 上の「コピー」ボタンでクリップボードにコピーし、ExcelやGoogleスプレッドシートに貼り付けると列に分かれます
                      </div>
                      <pre className="text-xs text-gray-800 whitespace-pre font-mono leading-relaxed bg-gray-50 p-2 rounded border overflow-x-auto">
                        {CSVExporter.normalizeTabDelimitedText(text.text)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};