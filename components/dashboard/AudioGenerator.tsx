
import React, { useState } from 'react';
import { generateAudio } from '../../services/geminiService';
import Button from '../shared/Button';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { PLANS } from '../../constants';

// Fix: Add audio decoding functions as per Gemini API guidelines for raw PCM data.
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AudioGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  // Fix: Use AudioBuffer state to handle raw PCM audio data instead of a data URL.
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { credits, useCredit } = useUser();

  const playAudio = () => {
    if (!audioBuffer) return;
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading || !user) return;
    if (!useCredit('audio')) {
        setError("Você não tem créditos de áudio suficientes. Melhore seu plano para obter mais.");
        return;
    }
    
    setIsLoading(true);
    setError('');
    setAudioBuffer(null);

    try {
      // Fix: Handle raw base64 audio data from the service.
      const base64Audio = await generateAudio(prompt, user.plan);
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const buffer = await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000,
        1,
      );
      setAudioBuffer(buffer);
      
      // Auto-play the audio upon generation
      const source = outputAudioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(outputAudioContext.destination);
      source.start();
    } catch (err) {
      console.error("Audio generation failed:", err);
      setError("Falha ao gerar o áudio. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const remainingCredits = user && credits ? (PLANS[user.plan].isUnlimited ? 'Ilimitado' : credits.audio) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-yellow-400">Gerador de Áudios (TTS)</h2>
        <div className="bg-gray-800 text-yellow-300 px-4 py-2 rounded-lg font-bold">Créditos de Áudio: {remainingCredits}</div>
      </div>
      <div className="space-y-4">
        <label htmlFor="audio-prompt" className="block text-sm font-medium text-yellow-200 mb-1">
            Texto para converter em áudio
        </label>
        <textarea
          id="audio-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Alegremente: Tenha um dia maravilhoso!"
          disabled={isLoading}
          rows={4}
          className="w-full bg-gray-800/50 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors duration-200"
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Gerando...' : 'Gerar Áudio'}
        </Button>
      </div>

      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      
      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center items-center h-40 bg-gray-800/50 rounded-lg border-2 border-dashed border-yellow-500/50">
            <div className="text-center">
              <p className="mt-4 text-yellow-200">Sintetizando a voz...</p>
            </div>
          </div>
        )}
        {/* Fix: Replace <audio> element with a button to play the decoded audio buffer. */}
        {audioBuffer && !isLoading && (
          <div className="text-center">
            <Button onClick={playAudio}>
              Tocar Áudio Gerado Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioGenerator;