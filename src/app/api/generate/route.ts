import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { command, parsed: parsedCommand } = await request.json();

    if (!command || typeof command !== 'string') {
      return Response.json({ error: '缺少指令参数' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一个教育内容生成助手，专门为学生生成学习材料和练习题。

根据用户的语音指令，你需要：
1. 识别指令中的关键信息：科目、年级、题目类型、数量、范围等
2. 生成对应的学习内容

输出格式要求（严格遵守JSON格式）：
{
  "type": "内容类型(math_arithmetic/math_word/chinese_chars/chinese_practice/english_words)",
  "title": "内容标题",
  "content": "生成的完整内容文本",
  "metadata": {
    "grade": "年级",
    "subject": "科目",
    "count": 题目数量(数字),
    "range": "范围描述",
    "operation": "运算类型"
  }
}

内容类型说明：
- math_arithmetic: 口算题（加减乘除计算）
- math_word: 应用题（文字题）
- chinese_chars: 语文生字表
- chinese_practice: 练字帖内容
- english_words: 英语单词听写

请确保：
- 口算题格式清晰，每行一题，编号排列
- 应用题符合对应年级难度
- 生字表包含拼音、笔画、组词
- 英语单词包含中文释义
- 内容准确、适合学生使用`;

    const parsedHint = parsedCommand
      ? `\n\n已解析出的结构化信息如下，请优先遵守：\n${JSON.stringify(parsedCommand, null, 2)}`
      : '';

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${command}${parsedHint}` },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.3,
    });

    // Try to parse JSON from response
    let generated: Record<string, unknown>;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generated = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // Fallback: wrap as custom text
      generated = {
        type: 'custom_text',
        title: command.slice(0, 20),
        content: response.content,
        metadata: {},
      };
    }

    return Response.json(generated);
  } catch (error) {
    console.error('Generate API error:', error);
    return Response.json(
      { error: '内容生成失败，请重试' },
      { status: 500 }
    );
  }
}
