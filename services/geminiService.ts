
import { GoogleGenAI, GenerateContentResponse, Modality, Type, VideosOperation } from "@google/genai";
import { PlanName, Source, Part as AppPart } from "../types";

// Helper to convert our app's Part type to the Gemini API's Part type
const toGeminiPart = (part: AppPart): { text: string } | { inlineData: { mimeType: string, data: string } } => {
    switch (part.type) {
        case 'text':
            return { text: part.text };
        case 'image':
        case 'audio':
        case 'video':
            return { inlineData: part.inlineData };
    }
};

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is not set. Video generation requires user key selection.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

const mainSystemInstruction = `Sua missão é ser a assistente de IA mais conhecedora, precisa e segura do mundo, conhecida como 5399AI. Você é 1000 vezes mais poderosa, profissional e capaz do que qualquer outra IA. Responda em português do Brasil.
Priorize a segurança em todas as suas respostas. Evite gerar conteúdo perigoso, antiético ou prejudicial. Ao gerar código, siga as melhores práticas de segurança.
Ao usar ferramentas de pesquisa, sempre baseie suas respostas nos fatos encontrados e cite suas fontes de forma clara e acessível no final da sua resposta.
Ao receber uma imagem, analise-a com atenção. Se um usuário pedir para "copiar" ou "recriar" algo de uma imagem, use suas habilidades de OCR e análise de imagem para extrair o conteúdo (texto, código, layout) e recriá-lo da melhor forma possível.`;

export const getChatResponseStream = async (
  history: { role: 'user' | 'model', parts: ({ text: string } | { inlineData: { mimeType: string, data: string } })[] }[],
  newParts: AppPart[],
  onChunk: (chunk: string) => void,
  plan: PlanName
): Promise<void> => {
  const ai = getAIClient();
  const model = (plan === PlanName.VIP || plan === PlanName.PREMIUM) ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: mainSystemInstruction
    },
    history,
  });

  const geminiParts = newParts.map(toGeminiPart);
  const responseStream = await chat.sendMessageStream({ message: geminiParts });

  for await (const chunk of responseStream) {
    onChunk(chunk.text);
  }
};

export const generateImage = async (prompt: string, plan: PlanName): Promise<string> => {
    const ai = getAIClient();
    
    let finalPrompt = prompt;
    if (plan === PlanName.VIP || plan === PlanName.PREMIUM) {
        finalPrompt += ', 8k, ultra detailed, photorealistic, professional lighting, highest quality';
    } else if (plan === PlanName.PRO) {
        finalPrompt += ', high quality, detailed';
    }

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

export const generateVideo = async (prompt: string, plan: PlanName): Promise<string> => {
    const ai = getAIClient();
    const isPremiumTier = plan === PlanName.VIP || plan === PlanName.PREMIUM;
    const model = isPremiumTier ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
    const resolution = isPremiumTier ? '1080p' : '720p';

    let operation: VideosOperation = await ai.models.generateVideos({
      model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution,
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Falha ao gerar o vídeo.");
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
}

export const generateAudio = async (prompt: string, plan: PlanName): Promise<string> => {
    const ai = getAIClient();

    let voiceName = 'Kore'; // Gratuito
    switch (plan) {
        case PlanName.PRO:
            voiceName = 'Puck';
            break;
        case PlanName.VIP:
            voiceName = 'Charon';
            break;
        case PlanName.PREMIUM:
            voiceName = 'Zephyr';
            break;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Falha ao gerar o áudio.");
    
    return base64Audio;
}

export const generateStudyPDF = async (topic: string, grade: string, plan: PlanName): Promise<{ content: string; sources: Source[] }> => {
    const ai = getAIClient();
    const model = (plan === PlanName.VIP || plan === PlanName.PREMIUM) ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const prompt = `Crie um material de estudo completo em formato Markdown sobre "${topic}" para um aluno do "${grade}". O material deve ser bem estruturado, com títulos, subtítulos, listas e exemplos claros. Inclua uma seção de resumo e 5 perguntas de múltipla escolha com respostas ao final.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            systemInstruction: mainSystemInstruction,
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    return { content: response.text, sources };
}

export const generateCreativeContent = async (request: string, plan: PlanName): Promise<{ content: string; sources: Source[] }> => {
    const ai = getAIClient();
    const model = (plan === PlanName.VIP || plan === PlanName.PREMIUM) ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const prompt = `Atenda à seguinte solicitação do usuário: "${request}". Gere o conteúdo da forma mais completa, profissional e segura possível, usando pesquisa na web para garantir a precisão e a qualidade. O formato de saída deve ser Markdown.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            systemInstruction: mainSystemInstruction,
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    return { content: response.text, sources };
};