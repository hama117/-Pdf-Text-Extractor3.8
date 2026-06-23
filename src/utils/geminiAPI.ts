import { GeminiResponse } from '../types';

export class GeminiAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractTextFromImage(imageBase64: string): Promise<string> {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

    const response = await fetch(`${url}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `与えられた勤怠帳票の画像からデータを抽出し、CSV形式で出力してください。

【出力ルール】
1. 1行目は必ず以下の固定ヘッダー行を出力する：
   氏名,日付,開始時間,退勤時間,休憩入り,休憩出,休憩時間,実働,時間外,交通費,その他

2. 帳票タイトル（例：「勤怠帳票（2月 星川智子）」）から氏名を取得し、全データ行の氏名列に付与する

3. 実働時間または開始時間が記録されている日のみ出力する（完全に空欄の行・合計行・説明文は出力しない）

4. 数値はそのまま出力する（¥マーク・単位は除去）

5. 時間はHH:MM形式のまま出力する

6. 出力はCSVデータのみとする。説明文・注釈・謝罪文・マークダウン記号は一切含めない

7. 【重要】データが何行あっても必ず最後の行まで出力を完了すること。途中で切らずに全件出力すること

8. 【重要】出力を省略したり「以下同様」などと書かずに、全ての勤務日を1行ずつ必ず出力すること

【出力例】
氏名,日付,開始時間,退勤時間,休憩入り,休憩出,休憩時間,実働,時間外,交通費,その他
星川智子,2,11:01,21:52,15:01,16:50,1.75,9,,,
星川智子,3,10:40,21:45,16:00,16:55,0.75,10.25,,,
星川智子,5,16:33,21:43,,,,4.75,,,`,
              },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: imageBase64.split(',')[1],
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }
}
