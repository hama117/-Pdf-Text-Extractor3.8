import { useState, useCallback } from 'react';
import { PDFProcessor } from '../utils/pdfProcessor';
import { GeminiAPI } from '../utils/geminiAPI';
import { ExtractedText, ProcessingStatus } from '../types';

export const usePDFTextExtractor = () => {
  const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false });

  const extractText = useCallback(async (file: File, apiKey: string) => {
    let results: ExtractedText[] = [];
    setStatus({ isProcessing: true });
    setExtractedTexts([]);

    try {
      // PDFを画像に変換
      const images = await PDFProcessor.extractPagesAsImages(file);
      const geminiAPI = new GeminiAPI(apiKey);

      // 各ページを順次処理
      for (let i = 0; i < images.length; i++) {
        setStatus({
          isProcessing: true,
          currentPage: i + 1,
          totalPages: images.length,
        });

        try {
          const text = await geminiAPI.extractTextFromImage(images[i]);
          results.push({
            pageNumber: i + 1,
            text: text,
          });
        } catch (error) {
          console.error(`Error processing page ${i + 1}:`, error);
          results.push({
            pageNumber: i + 1,
            text: `ページ ${i + 1} の処理中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }

        // 短い待機時間を設けてAPI制限を回避
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setExtractedTexts(results);
      setStatus({ isProcessing: false });
      
      return results; // 結果を返す
    } catch (error) {
      setStatus({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      return []; // エラー時は空配列を返す
    }
  }, []);

  const reset = useCallback(() => {
    setExtractedTexts([]);
    setStatus({ isProcessing: false });
  }, []);

  return {
    extractedTexts,
    status,
    extractText,
    reset,
  };
};