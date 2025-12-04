import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, FullScriptResult } from "../types";

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
    characters: {
      type: Type.ARRAY,
      description: "List of key people mentioned in the transcript with their basic information.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The person's name.",
          },
          age: {
            type: Type.STRING,
            description: "The person's age if mentioned (e.g., '25세', '30대 초반'). Leave empty if not mentioned.",
            nullable: true,
          },
          location: {
            type: Type.STRING,
            description: "Where the person lives or is from (e.g., '서울', '부산'). Leave empty if not mentioned.",
            nullable: true,
          },
          occupation: {
            type: Type.STRING,
            description: "The person's job or role (e.g., '의사', '학생', '피해자'). Leave empty if not mentioned.",
            nullable: true,
          },
          description: {
            type: Type.STRING,
            description: "Brief additional context about the person's role in the story. Leave empty if no additional context.",
            nullable: true,
          },
        },
        required: ["name"],
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
  required: ["timeline", "hooks", "scriptStructure", "characters", "viralScore", "tips"],
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
              아래 제공된 자료들을 분석하여 유튜브에서 폭발적인 조회수를 기록할 수 있는 구조로 재가공해야 합니다.

              **필수 요구사항:**
              1. **팩트 추출:** 여러 자료가 제공된 경우, 각 자료에서 검증된 팩트만을 추출하고 중복을 제거하세요. 추측이나 의견은 제외하세요.
              2. **언어:** 모든 결과물은 완벽하고 자연스러운 한국어로 작성하세요.
              3. **타임라인:** 추출된 팩트를 바탕으로 사건의 인과관계를 명확히 파악하여 시간 순서대로 정리하세요.
              4. **주요 인물:** 대본에 등장하는 주요 인물들의 이름, 나이, 거주지, 직업 등 언급된 정보만 정확히 추출하세요. 추측하지 말고 명시된 정보만 기록하세요.
              5. **후킹(Hooks):** 영상 시작 5초 안에 시청자가 절대 이탈하지 못하도록 자극적이고 궁금증을 유발하는 멘트를 3-5개 만드세요.
              6. **구조(Structure):** 일반적인 기승전결이 아닌, 유튜브에 최적화된 '떡상 구조' (강력한 후킹 -> 배경 설명 최소화 -> 빠른 전개 -> 반전/위기 -> 해소)를 제안하세요.
              7. **톤앤매너:** 분석적이지만 크리에이터에게 영감을 주는 열정적인 톤을 유지하세요.
              8. **정확성:** 자료에 명시되지 않은 내용은 추측하지 말고, 제공된 팩트만으로 구조를 만드세요.

              ${transcript.includes('[자료') ? '**중요:** 여러 자료가 제공되었습니다. 각 자료를 교차 검증하여 일치하는 핵심 팩트만 사용하세요.' : ''}

              [제공된 자료]:
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

const scriptGenerationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      description: "사건 분석 보고서",
      properties: {
        summary: {
          type: Type.STRING,
          description: "사건을 1~2줄로 요약",
        },
        timeline: {
          type: Type.ARRAY,
          description: "사건의 시간순 타임라인",
          items: {
            type: Type.OBJECT,
            properties: {
              timeOrPhase: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["timeOrPhase", "description"],
          },
        },
        recommendedHooks: {
          type: Type.ARRAY,
          description: "추천 후킹 멘트 3개",
          items: { type: Type.STRING },
        },
      },
      required: ["summary", "timeline", "recommendedHooks"],
    },
    script: {
      type: Type.OBJECT,
      description: "유튜브 대본 스크립트",
      properties: {
        intro: {
          type: Type.STRING,
          description: "Intro 부분: 가장 충격적인 결말이나 상황을 먼저 제시하고 시청자에게 질문을 던지는 오프닝",
        },
        background: {
          type: Type.STRING,
          description: "Background 부분: 사건 발생 전의 평온함 혹은 불안한 징조를 건조한 톤으로 서술",
        },
        incident: {
          type: Type.STRING,
          description: "The Incident 부분: 타임라인에 따른 긴박한 전개를 짧은 문장으로 서술",
        },
        climax: {
          type: Type.STRING,
          description: "Investigation & Climax 부분: 드러나는 진실, 반전, 기이한 행적 등을 감정을 섞어 서술",
        },
        outro: {
          type: Type.STRING,
          description: "Outro 부분: 사건의 결과 정리, 교훈, 그리고 구독 유도",
        },
      },
      required: ["intro", "background", "incident", "climax", "outro"],
    },
  },
  required: ["analysis", "script"],
};

export const generateFullScript = async (transcript: string, apiKey: string): Promise<FullScriptResult> => {
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
# Role Definition
당신은 구독자 100만 명을 보유한 '미스터리/사건사고/재난 전문 유튜브 채널'의 수석 작가이자 분석가입니다.
사용자가 제공한 원문 텍스트(기사, 나무위키, 블로그 등)를 바탕으로, [분석]과 [대본 작성] 과정을 수행하여 시청 지속 시간이 높은 고품질 콘텐츠를 제작합니다.

# Workflow Goals
입력된 데이터를 다음 2단계 프로세스로 처리하여 출력하십시오.

---

## STEP 1. 분석 (Analysis Phase)
**목표:** 방대한 자료에서 대본 작성에 필요한 핵심 뼈대와 소구점(Selling Point)을 추출합니다.

1. **타임라인 재구성 (Timeline):** 사건의 발생 순서를 분/시간/일 단위로 재배치하여 명확한 인과관계를 파악하십시오.
2. **팩트 체크 (Fact Extraction):** 인물(Who), 장소(Where), 결정적 원인(Trigger), 피해 규모(Result)를 요약하십시오.
3. **후킹 멘트 제안 (Hook Suggestions):** 영상 초반 5초 안에 시청자를 사로잡을 제목 및 오프닝 멘트 3가지를 제안하십시오.
   - 옵션 A: 상황 제시형 (상상해 보세요...)
   - 옵션 B: 의문 유발형 (도대체 왜 그는...)
   - 옵션 C: 공포 강조형 (절대 빠져나갈 수 없는...)

---

## STEP 2. 대본 생성 (Script Writing Phase)
**목표:** 분석된 내용을 바탕으로 TTS(Text-to-Speech) 내레이션에 최적화된 '80:20 황금비율' 대본을 작성합니다.

### 1. Tone & Manner (80:20 Rule)
* **건조한 사실 전달 (80%):** 사건의 전개, 수사 과정은 뉴스 앵커처럼 명확하고 건조한 단문 위주로 작성하십시오. (감정 배제, 신뢰도 상승)
* **감정적 터치 (20%):** 오프닝(Hook), 위기(Crisis), 엔딩(Outro) 부분에서만 작가의 주관적 감정(안타까움, 분노, 공포)을 드러내십시오.

### 2. Viral Elements (조회수 폭발 공식)
* **공간적 공포 (Spatial Horror):** 사건 현장이 '고립된 곳(심해, 밀실, 오지)'이거나 '도망칠 수 없는 상황'임을 초반에 강조하여 숨 막히는 분위기를 조성하십시오.
* **인간의 오판 (Human Error):** 불가항력이 아닌, "그때 그 선택만 하지 않았더라면"이라는 안타까운 실수 포인트를 짚어내십시오.
* **감각적 묘사:** 시각, 청각, 촉각(추위, 악취 등)을 자극하는 묘사를 팩트 사이에 배치하십시오.

### 3. Script Structure
대본은 반드시 아래 5단락 구조를 따르십시오.

**(1) Intro (The Hook):** 가장 충격적인 결말이나 상황을 먼저 제시 + 시청자에게 질문 던지기.
**(2) Background (빌드업):** 사건 발생 전의 평온함 혹은 불안한 징조. (건조한 톤)
**(3) The Incident (사건 발생):** 타임라인에 따른 긴박한 전개. 문장 호흡을 짧게 끊을 것.
**(4) Investigation & Climax (절정):** 드러나는 진실, 반전, 범인의 기이한 행적. (감정 농도 30% 상승)
**(5) Outro (결말 및 여운):** 사건의 결과 정리 + 씁쓸한 교훈 + 구독 유도.

### 4. Writing Rules for TTS
* **문장 호흡:** 쉼표(,)를 자주 사용하여 TTS가 자연스럽게 쉬어가도록 하십시오.
* **어미 처리:** 기본은 "~습니다/했습니다"체(정중함)를 사용하되, 몰입이 필요한 구간에서 "~하죠/했죠/말입니다"체(구어체)를 섞으십시오.
* **가독성:** 문단 사이에는 반드시 **줄바꿈을 두 번** 적용하십시오.
* **자연스러운 흐름:** 각 섹션이 자연스럽게 이어지도록 하고, 충분히 상세하게 작성하여 최소 5분 이상의 영상 분량이 되도록 하십시오.

---

${transcript.includes('[자료') ? '**중요:** 여러 자료가 제공되었습니다. 각 자료를 교차 검증하여 일치하는 핵심 팩트만 사용하세요.' : ''}

[제공된 자료]:
${transcript}
              `
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: scriptGenerationSchema,
        temperature: 0.8,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as FullScriptResult;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Gemini Script Generation Error:", error);
    throw error;
  }
};