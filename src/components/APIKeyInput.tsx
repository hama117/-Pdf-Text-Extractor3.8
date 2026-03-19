import React, { useState } from 'react';
import { Key, Eye, EyeOff, Trash2 } from 'lucide-react';

interface APIKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({ apiKey, onApiKeyChange }) => {
  const [showKey, setShowKey] = useState(false);
  const isFromEnv = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  const handleClearKey = () => {
    if (!isFromEnv) {
      onApiKeyChange('');
      localStorage.removeItem('gemini-api-key');
    }
  };

  return (
    <div className="w-full max-w-md">
      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
        Gemini API キー
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Key className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showKey ? 'text' : 'password'}
          id="api-key"
          value={isFromEnv ? '環境変数から取得済み' : apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Gemini API キーを入力してください"
          disabled={isFromEnv}
          className={`block w-full pl-10 pr-20 py-3 border rounded-lg shadow-sm transition-colors ${
            isFromEnv 
              ? 'border-green-300 bg-green-50 text-green-800'
              : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {apiKey && !isFromEnv && (
            <button
              type="button"
              onClick={handleClearKey}
              className="mr-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="APIキーをクリア"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showKey ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      {isFromEnv ? (
        <p className="text-xs text-green-600 mt-1">
          環境変数からAPIキーが読み込まれました
        </p>
      ) : apiKey ? (
        <p className="text-xs text-green-600 mt-1">
          APIキーが保存されました
        </p>
      ) : null}
    </div>
  );
};