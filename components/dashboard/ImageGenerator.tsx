
import React, { useState } from 'react';
import { generateImage } from '../../services/geminiService';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { useAuth } from '../../hooks/useAuth';

const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-yellow-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading || !user) return;
    
    setIsLoading(true);
    setError('');
    setImageUrl('');

    try {
      const url = await generateImage(prompt, user.plan);
      setImageUrl(url);
    } catch (err) {
      console.error("Image generation failed:", err);
      setError("Falha ao gerar a imagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6">Gerador de Imagens</h2>
      <div className="space-y-4">
        <Input
          id="image-prompt"
          label="Prompt (descreva a imagem que você quer criar)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Um robô dourado em um campo vermelho sob duas luas"
          disabled={isLoading}
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Gerando...' : 'Gerar Imagem'}
        </Button>
      </div>

      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      
      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center items-center h-80 bg-gray-800/50 rounded-lg border-2 border-dashed border-yellow-500/50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-yellow-200">A IA está criando sua obra-prima...</p>
            </div>
          </div>
        )}
        {!imageUrl && !isLoading && (
            <div className="flex justify-center items-center h-80 bg-gray-800/50 rounded-lg border-2 border-dashed border-yellow-500/50">
                <div className="text-center text-yellow-300">
                    <ImageIcon />
                    <h3 className="mt-4 text-xl font-semibold">Sua tela está em branco</h3>
                    <p className="mt-1 text-sm">Descreva uma imagem no campo acima para que a 5399AI possa criá-la para você.</p>
                </div>
            </div>
        )}
        {imageUrl && !isLoading && (
          <div className="border-4 border-yellow-500 rounded-lg overflow-hidden shadow-2xl shadow-red-500/20">
            <img src={imageUrl} alt={prompt} className="w-full h-auto object-contain" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;