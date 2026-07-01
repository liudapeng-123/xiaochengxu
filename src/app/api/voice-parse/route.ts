import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: '缺少文本参数' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一个语音指令解析器。分析用户的语音文本，提取关键信息并返回JSON格式。

返回格式：
{
  "type": "内容类型",
  "params": {
    "grade": "年级(如: 一年级、三年级、五年级)",
    "subject": "科目(如: 数学、语文、英语)",
    "count": 数量(数字),
    "range": "范围(如: 10以内、20以内、100以内)",
    "operation": "运算类型(如: 加减法、乘法、除法)"
  }
}

内容类型(type)只能是以下之一：
- math_arithmetic: 口算题
- math_word: 应用题
- chinese_chars: 生字表
- chinese_practice: 练字帖
- english_words: 英语单词
- custom_text: 其他文本

如果无法明确识别类型，返回 custom_text。`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `解析以下语音指令: "${text}"` },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.1,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Response.json(parsed);
      }
      throw new Error('No JSON');
    } catch {
      return Response.json({
        type: 'custom_text',
        params: { raw: text },
      });
    }
  } catch (error) {
    console.error('Voice parse error:', error);
    return Response.json(
      { error: '语音解析失败' },
      { status: 500 }
    );
  }
}
