
import React, { useState } from 'react';
import { generateCreativeContent } from '../../services/geminiService';
import Button from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Source } from '../../types';

const CreatorTool: React.FC = () => {
  const [request, setRequest] = useState('');
  const [content, setContent] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!request.trim() || isLoading || !user) return;

    setIsLoading(true);
    setError('');
    setContent('');
    setSources([]);

    try {
      const result = await generateCreativeContent(request, user.plan);
      setContent(result.content);
      setSources(result.sources);
    } catch (err) {
      console.error("Creative content generation failed:", err);
      setError("Falha ao gerar o conteúdo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animation-fade-in">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6">Ferramenta de Criação Universal</h2>
      <p className="mb-6 text-yellow-200">
        De roteiros e artigos a código para sites e aplicativos. Descreva o que você precisa e a 5399AI criará para você, pesquisando em fontes confiáveis para garantir a máxima qualidade.
      </p>
      <div className="bg-black bg-opacity-30 p-6 rounded-lg border border-yellow-500/20 space-y-4">
        <label htmlFor="creator-request" className="block text-sm font-medium text-yellow-200 mb-1">
          Sua Solicitação
        </label>
        <textarea
          id="creator-request"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Ex: Crie um roteiro para um vídeo curto sobre a história da computação, ou, Crie um componente React de um card de produto com Tailwind CSS."
          disabled={isLoading}
          rows={5}
          className="w-full bg-gray-800/50 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors duration-200"
        />
        <Button onClick={handleGenerate} disabled={isLoading || !request.trim()}>
          {isLoading ? 'Criando...' : 'Gerar Conteúdo'}
        </Button>
      </div>

      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      
      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center items-center h-80 bg-gray-800/50 rounded-lg border-2 border-dashed border-yellow-500/50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-yellow-200">A IA está pesquisando e criando...</p>
            </div>
          </div>
        )}
        {content && !isLoading && (
            <div className="prose prose-invert max-w-none p-6 bg-gray-800/70 rounded-lg border border-yellow-500/30 text-yellow-50">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold mt-8 mb-4 text-yellow-400" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 border-b border-yellow-500/30 pb-2 text-yellow-300" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-yellow-200" {...props} />,
                        li: ({node, ...props}) => <li className="my-1" {...props} />,
                        code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline ? (
                                <div className="bg-black bg-opacity-50 my-4 rounded-lg overflow-hidden">
                                    <div className="px-4 py-2 bg-gray-900 text-xs text-yellow-300 font-sans">{match ? match[1] : 'código'}</div>
                                    <pre className="p-4 text-sm overflow-x-auto"><code className={className} {...props}>{children}</code></pre>
                                </div>
                            ) : (
                                <code className="bg-yellow-900/50 text-yellow-200 px-1 py-0.5 rounded-sm" {...props}>
                                {children}
                                </code>
                            )
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
                {sources.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-yellow-500/30">
                        <h3 className="text-lg font-bold text-yellow-300 mb-2">Fontes</h3>
                        <ul className="list-disc pl-5">
                            {sources.map((source, index) => source.web && (
                                <li key={index} className="mb-1">
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default CreatorTool;