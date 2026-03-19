export class CSVExporter {
  // Geminiの応答からCSVデータ部分だけを抽出するクリーニング
  static cleanGeminiResponse(text: string): string {
    const lines = text.split('\n');
    const cleaned: string[] = [];
    let headerFound = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // ヘッダー行を検出
      if (!headerFound && trimmed.startsWith('氏名,')) {
        headerFound = true;
        cleaned.push(trimmed);
        continue;
      }

      // ヘッダー発見後はデータ行のみ収集
      // 説明文・注釈・マークダウンを除外
      if (headerFound) {
        const isDataLine =
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('//') &&
          !trimmed.startsWith('注') &&
          !trimmed.startsWith('※') &&
          !trimmed.startsWith('申し訳') &&
          !trimmed.startsWith('ご') &&
          !trimmed.startsWith('与え') &&
          trimmed.includes(',');

        if (isDataLine) {
          cleaned.push(trimmed);
        }
      }
    }

    return cleaned.join('\n');
  }

  static convertToCSV(rawText: string): string {
    // 複数ページ分のテキストを結合する際、ヘッダーは最初の1行だけにする
    const pages = rawText.split('\n');
    const allLines: string[] = [];
    let headerWritten = false;

    for (const line of pages) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('氏名,')) {
        if (!headerWritten) {
          allLines.push(trimmed);
          headerWritten = true;
        }
        // 2ページ目以降のヘッダーはスキップ
        continue;
      }

      // データ行のみ追加（クリーニング済み想定）
      if (headerWritten && trimmed.includes(',')) {
        allLines.push(trimmed);
      }
    }

    return allLines.join('\n');
  }

  static downloadCSV(csvContent: string, filename: string): void {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // クリップボードコピー用（タブ区切りに変換）
  static copyAsTabDelimited(text: string): string {
    return text
      .split('\n')
      .map(line => line.split(',').join('\t'))
      .join('\n');
  }

  // 表示用整形
  static normalizeTabDelimitedText(text: string): string {
    return text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.split(',').join('\t'))
      .join('\n');
  }
}