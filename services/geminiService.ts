import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    timeline: {
      type: Type.ARRAY,
      description: "A chronological list of key events extracted from the transcript.",
      items: {
        type: Type.OBJECT,
        properties: {
          timeOrPhase: {
            type: Type.STRING,
            description: "The approximate time, date, or sequential phase of the event.",
          },
          description: {
            type: Type.STRING,
            description: "A concise description of what happened.",
          },
        },
        required: ["timeOrPhase", "description"],
      },
    },
    hooks: {
      type: Type.ARRAY,
      description: "3-5 extremely strong, provocative opening lines designed to stop the scroll.",
      items: { type: Type.STRING },
    },
    scriptStructure: {
      type: Type.ARRAY,
      description: "The proposed script structure optimized for retention (e.g., Hook, Setup, Conflict, Climax, Resolution).",
      items: {
        type: Type.OBJECT,
        properties: {
          sectionName: { type: Type.STRING },
          contentProposal: {
            type: Type.STRING,
            description: "What exactly should be said or shown in this section. Detailed and actionable.",
          },
          psychologicalTrigger: {
            type: Type.STRING,
            description: "The psychological reason why this section engages the viewer (e.g., 'Open Loops', 'Shock Value').",
          },
        },
        required: ["sectionName", "contentProposal", "psychologicalTrigger"],
      },
    },
    viralScore: {
      type: Type.INTEGER,
      description: "An estimated score from 0 to 100 on how likely this story is to go viral based on the content.",
    },
    tips: {
      type: Type.ARRAY,
      description: "General actionable tips to improve the video's performance.",
      items: { type: Type.STRING },
    },
  },
  required: ["timeline", "hooks", "scriptStructure", "viralScore", "tips"],
};

export const analyzeTranscript = async (transcript: string, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error('API 키가 필요합니다.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
              당신은 100만 유튜버들의 대본을 책임지는 최고의 '스토리텔링 컨설턴트'이자 '알고리즘 분석가'입니다.
              아래 제공된 [원본 대본]을 분석하여 유튜브에서 폭발적인 조회수를 기록할 수 있는 구조로 재가공해야 합니다.

              **필수 요구사항:**
              1. **언어:** 모든 결과물은 완벽하고 자연스러운 한국어로 작성하세요.
              2. **타임라인:** 사건의 인과관계를 명확히 파악하여 시간 순서대로 정리하세요.
              3. **후킹(Hooks):** 영상 시작 5초 안에 시청자가 절대 이탈하지 못하도록 자극적이고 궁금증을 유발하는 멘트를 만드세요.
              4. **구조(Structure):** 일반적인 기승전결이 아닌, 유튜브에 최적화된 '떡상 구조' (강력한 후킹 -> 배경 설명 최소화 -> 빠른 전개 -> 반전/위기 -> 해소)를 제안하세요.
              5. **톤앤매너:** 분석적이지만 크리에이터에게 영감을 주는 열정적인 톤을 유지하세요.

              [원본 대본]:
              ${transcript}
              `
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Slightly creative but structured
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};