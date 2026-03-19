import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { APIKeyInput } from './components/APIKeyInput';
import { PDFUploader } from './components/PDFUploader';
import { ProcessingStatus } from './components/ProcessingStatus';
import { TextResult } from './components/TextResult';
import { ExtractionHistory } from './components/ExtractionHistory';
import { usePDFTextExtractor } from './hooks/usePDFTextExtractor';
import { useExtractionHistory } from './hooks/useExtractionHistory';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { extractedTexts, status, extractText, reset } = usePDFTextExtractor();
  const { history, addToHistory, deleteFromHistory, clearHistory } = useExtractionHistory();

  // ローカルストレージからAPIキーを読み込み
  useEffect(() => {
    // 1. 環境変数から取得を試行
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
    } else {
      // 2. 環境変数がない場合はローカルストレージから取得
      const savedApiKey = localStorage.getItem('gemini-api-key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    }
  }, []);

  // APIキーが変更されたらローカルストレージに保存
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    // 環境変数が設定されていない場合のみローカルストレージに保存
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      if (key.trim()) {
        localStorage.setItem('gemini-api-key', key.trim());
      } else {
        localStorage.removeItem('gemini-api-key');
      }
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    reset();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    reset();
  };

  const handleExtract = async () => {
    if (!selectedFile || !apiKey.trim()) return;
    
    const results = await extractText(selectedFile, apiKey.trim());
    
    // 抽出が成功した場合、履歴に追加して現在の状態をクリア
    if (results && results.length > 0) {
      addToHistory(selectedFile.name, selectedFile.size, results);
      setSelectedFile(null); // ファイル選択状態をクリア
      reset(); // 抽出結果表示をクリア
    }
  };

  const canExtract = selectedFile && apiKey.trim() && !status.isProcessing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF テキスト抽出ツール
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gemini 2.5 Flash を使用してPDFファイルから画像を抽出し、テキストに変換します
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* API Key Input */}
          <div className="flex justify-center">
            <APIKeyInput 
              apiKey={apiKey} 
              onApiKeyChange={handleApiKeyChange} 
            />
          </div>

          {/* PDF Uploader */}
          <div className="flex justify-center">
            <PDFUploader
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClearFile={handleClearFile}
              disabled={status.isProcessing}
            />
          </div>

          {/* Extract Button */}
          {selectedFile && (
            <div className="flex justify-center">
              <button
                onClick={handleExtract}
                disabled={!canExtract}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                テキストを抽出
              </button>
            </div>
          )}

          {/* Processing Status */}
          <div className="flex justify-center">
            <ProcessingStatus status={status} />
          </div>

          {/* Results */}
          <TextResult extractedTexts={extractedTexts} />

          {/* Extraction History */}
          <ExtractionHistory 
            history={history}
            onDelete={deleteFromHistory}
            onClearAll={clearHistory}
          />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>Gemini 2.5 Flash を使用したOCR機能付きPDF処理ツール</p>
        </footer>
      </div>
    </div>
  );
}

export default App;