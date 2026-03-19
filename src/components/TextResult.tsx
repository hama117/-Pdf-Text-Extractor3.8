import React, { useState } from 'react';
import { Copy, Download, Check, FileSpreadsheet } from 'lucide-react';
import { ExtractedText } from '../types';
import { CSVExporter } from '../utils/csvExporter';

interface TextResultProps {
  extractedTexts: ExtractedText[];
}

export const TextResult: React.FC<TextResultProps> = ({ extractedTexts }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (extractedTexts.length === 0) {
    return null;
  }

  const handleCopy = async (text: string, index: number) => {
    try {
      const tabDelimitedText = CSVExporter.copyAsTabDelimited(text);
      await navigator.clipboard.writeText(tabDelimitedText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleCopyAllAsTabDelimited = async () => {
    try {
      const allText = extractedTexts
        .map(item => CSVExporter.cleanGeminiResponse(item.text))
        .join('\n');

      const tabDelimitedText = CSVExporter.copyAsTabDelimited(allText);
      await navigator.clipboard.writeText(tabDelimitedText);
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy all text:', error);
    }
  };

  const handleDownloadTxt = () => {
    const allText = extractedTexts
      .map(item => `=== ページ ${item.pageNumber} ===\n\n${item.text}`)
      .join('\n\n');

    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `勤怠テキスト-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    try {
      const allText = extractedTexts
        .map(item => CSVExporter.cleanGeminiResponse(item.text))
        .join('\n');

      const csvContent = CSVExporter.convertToCSV(allText);
      const filename = `勤怠データ-${new Date().toISOString().split('T')[0]}.csv`;

      CSVExporter.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('CSV download failed:', error);
    }
  };

  const formatTextForDisplay = (text: string): string => {
    return CSVExporter.normalizeTabDelimitedText(
      CSVExporter.cleanGeminiResponse(text)
    );
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">抽出された勤怠データ</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleCopyAllAsTabDelimited}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            {copiedIndex === -1 ? (
              <>
                <Check className="h-4 w-4 mr-2 text-white" />
                コピー済み
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                全てコピー
              </>
            )}
          </button>
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV ダウンロード
          </button>
          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            テキスト ダウンロード
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {extractedTexts.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                ページ {item.pageNumber}
              </h3>
              <button
                onClick={() => handleCopy(item.text, index)}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    コピー
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                📋 <strong>使用方法:</strong> 「CSV ダウンロード」でExcel用CSVを保存、または「コピー」でスプレッドシートに直接貼り付けできます
              </div>
              <pre className="text-sm text-gray-800 whitespace-pre font-mono leading-relaxed bg-white p-3 rounded border">
                {formatTextForDisplay(item.text)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};