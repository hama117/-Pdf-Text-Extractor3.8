import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { ProcessingStatus as StatusType } from '../types';

interface ProcessingStatusProps {
  status: StatusType;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status }) => {
  if (!status.isProcessing && !status.error) {
    return null;
  }

  if (status.error) {
    return (
      <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">エラーが発生しました</h3>
            <p className="text-sm text-red-700 mt-1">{status.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <div>
          <h3 className="font-medium text-blue-800">処理中...</h3>
          {status.currentPage && status.totalPages && (
            <div className="mt-2">
              <p className="text-sm text-blue-700">
                ページ {status.currentPage} / {status.totalPages} を処理中
              </p>
              <div className="w-64 bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(status.currentPage / status.totalPages) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};