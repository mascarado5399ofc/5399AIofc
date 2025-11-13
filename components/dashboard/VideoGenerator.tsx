
import React, { useState, useEffect } from 'react';
import { generateVideo } from '../../services/geminiService';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { PLANS } from '../../constants';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const { user } = useAuth();
  const { credits, useCredit } = useUser();

  const checkApiKey = async () => {
      try {
          if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
              setApiKeySelected(true);
          } else {
              setApiKeySelected(false);
          }
      } catch (e) {
          console.error("aistudio check failed", e);
          setApiKeySelected(false);
      }
  };

  useEffect(() => {
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            // Assume success to avoid race condition and allow immediate generation attempt
            setApiKeySelected(true);
        } catch(e) {
            console.error("Failed to open API key selection:", e);
            setError("Não foi possível abrir o seletor de chave de API.");
        }
    } else {
        setError("A funcionalidade de seleção de chave de API não está disponível.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading || !user) return;
    if (!useCredit('video')) {
        setError("Você não tem créditos de vídeo suficientes. Melhore seu plano para obter mais.");
        return;
    }

    setIsLoading(true);
    setError('');
    setVideoUrl('');
    
    const messages = [
        "Inicializando o motor de renderização de vídeo...",
        "Analisando o prompt com redes neurais avançadas...",
        "Gerando os quadros iniciais da cena...",
        "Renderizando sequências de alta fidelidade...",
        "Aplicando efeitos de pós-processamento...",
        "Compilando o vídeo final. Isso pode levar alguns minutos...",
    ];

    let messageIndex = 0;
    setStatusMessage(messages[messageIndex]);
    const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setStatusMessage(messages[messageIndex]);
    }, 8000);

    try {
      const url = await generateVideo(prompt, user.plan);
      setVideoUrl(url);
    } catch (err: any) {
      console.error("Video generation failed:", err);
      let errorMessage = "Falha ao gerar o vídeo. Tente novamente.";

      // Verificação de erro mais robusta para lidar com problemas de chave de API corretamente.
      const errorString = String(err.message || err);
      if (errorString.includes("Requested entity was not found")) {
          errorMessage = "A chave de API não foi encontrada ou é inválida. Por favor, selecione sua chave novamente.";
          setApiKeySelected(false);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      clearInterval(interval);
      setStatusMessage('');
    }
  };

  if (!apiKeySelected) {
    return (
        <div className="max-w-4xl mx-auto p-4 text-center">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">Chave de API Necessária</h2>
            <p className="text-yellow-100 mb-6">A geração de vídeo requer uma chave de API do Google AI Studio. Por favor, selecione sua chave para continuar. O uso da API será cobrado em sua conta Google.</p>
            <p className="text-sm text-yellow-300 mb-6">Consulte a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">documentação de cobrança</a> para mais detalhes.</p>
            <Button onClick={handleSelectKey}>Selecionar Chave de API</Button>
            {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
        </div>
    );
  }

  const remainingCredits = user && credits ? (PLANS[user.plan].isUnlimited ? 'Ilimitado' : credits.video) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-yellow-400">Gerador de Vídeos</h2>
        <div className="bg-gray-800 text-yellow-300 px-4 py-2 rounded-lg font-bold">Créditos de Vídeo: {remainingCredits}</div>
      </div>
      <div className="space-y-4">
        <Input
          id="video-prompt"
          label="Prompt (descreva o vídeo que você quer criar)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Um carro neon correndo por uma cidade cyberpunk chuvosa"
          disabled={isLoading}
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Gerando...' : 'Gerar Vídeo'}
        </Button>
      </div>

      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      
      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center items-center h-80 bg-gray-800/50 rounded-lg border-2 border-dashed border-yellow-500/50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-yellow-200 font-semibold">{statusMessage}</p>
              <p className="mt-2 text-sm text-yellow-300">A geração de vídeo pode levar vários minutos.</p>
            </div>
          </div>
        )}
        {videoUrl && !isLoading && (
          <div className="border-4 border-yellow-500 rounded-lg overflow-hidden shadow-2xl shadow-red-500/20">
            <video src={videoUrl} controls autoPlay loop className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;