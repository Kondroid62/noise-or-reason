import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// プロンプトテンプレート
const prompts = {
  noise: `くだらなくて面白い、日常の些細な観察や妄想を1つ書いてください。
要件:
- 1-2文程度の短い文章
- ユーモアがあり、クスッと笑えるような内容
- 日常的で親しみやすい話題
- 例: 「靴下を片方だけ洗濯機に食べられる現象には、きっと物理法則を超えた何かが関わっている。」`,

  reason: `人生や社会について深く考えさせられる哲学的な洞察を1つ書いてください。
要件:
- 1-2文程度の短い文章  
- 深い思索を促す内容
- 普遍的で本質的なテーマ
- 例: 「人は自分が理解できないものを恐れる。しかし、理解しようとする意志こそが人間を人間たらしめるのではないだろうか。」`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // typeの検証
    if (!type || !['noise', 'reason'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "noise" or "reason"' },
        { status: 400 }
      );
    }

    // OpenAI API呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは創造的で面白いコンテンツを生成するアシスタントです。指定された要件に従って、簡潔で魅力的な文章を作成してください。"
        },
        {
          role: "user",
          content: prompts[type as keyof typeof prompts]
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content generated');
    }

    // レスポンスデータ
    const cardData = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      content: content,
      type: type,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, card: cardData });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // エラータイプに応じた適切なレスポンス
    const errorObj = error as Record<string, unknown>;
    if (errorObj?.error && 
        typeof errorObj.error === 'object' && 
        errorObj.error !== null &&
        'type' in errorObj.error && 
        (errorObj.error as Record<string, unknown>).type === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API quota exceeded. Please check your OpenAI billing.' },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate card content' },
      { status: 500 }
    );
  }
}

// ランダムなタイプを生成するGET endpoint
export async function GET() {
  try {
    // ランダムにnoiseかreasonを選択
    const randomType = Math.random() < 0.5 ? 'noise' : 'reason';
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "あなたは創造的で面白いコンテンツを生成するアシスタントです。指定された要件に従って、簡潔で魅力的な文章を作成してください。"
        },
        {
          role: "user",
          content: prompts[randomType]
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content generated');
    }

    const cardData = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      content: content,
      type: randomType,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, card: cardData });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate card content' },
      { status: 500 }
    );
  }
}
