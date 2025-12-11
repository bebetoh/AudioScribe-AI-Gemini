import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// In-memory "database" for learned corrections
// Key: File Identifier (Name+Size+Date), Value: Corrected Text
const learnedCorrections = new Map<string, string>();

export const learnCorrection = (fileId: string, correctedText: string) => {
    learnedCorrections.set(fileId, correctedText);
    console.log(`Learned correction for file: ${fileId}`);
};

export const getCachedCorrection = (fileId: string): string | undefined => {
    return learnedCorrections.get(fileId);
};

/**
 * Transcribes audio using Gemini 2.5 Flash.
 * @param base64Audio The base64 encoded string of the audio file.
 * @param mimeType The MIME type of the audio file (e.g., 'audio/mp3').
 * @returns The transcription text.
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    // Determine prompt based on context (MIME type can give a hint, but we use a general robust prompt)
    const prompt = `
      Por favor, transcreva o seguinte arquivo de áudio.
      
      Instruções:
      1. Identifique o formato de entrada como: ${mimeType}.
      2. Gere uma transcrição altamente precisa em Português (ou no idioma detectado no áudio).
      3. Se houver múltiplos falantes, identifique-os como "Falante 1", "Falante 2", etc., se seus nomes não forem mencionados.
      4. Adicione pontuação adequada e formatação de parágrafos para tornar o texto legível.
      5. Ignore ruídos de fundo irrelevantes.
      6. Não inclua preâmbulos, apenas forneça a transcrição formatada.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Não foi possível gerar a transcrição. A resposta veio vazia.");
    }

    return text;
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw new Error("Falha na comunicação com a IA. Verifique se o arquivo é válido e tente novamente.");
  }
};