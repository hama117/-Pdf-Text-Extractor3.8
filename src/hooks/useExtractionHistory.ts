import { useState, useEffect, useCallback } from 'react';
import { ExtractionHistory } from '../types';

const STORAGE_KEY = 'pdf-extraction-history';

export const useExtractionHistory = () => {
  const [history, setHistory] = useState<ExtractionHistory[]>([]);

  // ローカルストレージから履歴を読み込み
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          extractedAt: new Date(item.extractedAt)
        }));
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load extraction history:', error);
    }
  }, []);

  // 履歴をローカルストレージに保存
  const saveHistory = useCallback((updatedHistory: ExtractionHistory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to save extraction history:', error);
    }
  }, []);

  // 新しい抽出結果を履歴に追加
  const addToHistory = useCallback((fileName: string, fileSize: number, extractedTexts: any[]) => {
    const newEntry: ExtractionHistory = {
      id: Date.now().toString(),
      fileName,
      fileSize,
      extractedAt: new Date(),
      extractedTexts
    };

    const updatedHistory = [newEntry, ...history].slice(0, 20); // 最新20件まで保存
    saveHistory(updatedHistory);
  }, [history, saveHistory]);

  // 履歴アイテムを削除
  const deleteFromHistory = useCallback((id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    saveHistory(updatedHistory);
  }, [history, saveHistory]);

  // 履歴を全削除
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  return {
    history,
    addToHistory,
    deleteFromHistory,
    clearHistory
  };
};