export interface ExtractedText {
  pageNumber: number;
  text: string;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  currentPage?: number;
  totalPages?: number;
  error?: string;
}

export interface ExtractionHistory {
  id: string;
  fileName: string;
  fileSize: number;
  extractedAt: Date;
  extractedTexts: ExtractedText[];
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}