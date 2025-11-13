
import React, { useState } from 'react';
import { generateStudyPDF } from '../../services/geminiService';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { useAuth } from '../../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Source } from '../../types';

const StudyHelper: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [content, setContent] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!topic.trim() || !grade.trim() || isLoading || !user) return;
    
    setIsLoading(true);
    setError('');
    setContent('');
    setSources([]);

    try {
      const result = await generateStudyPDF(topic, grade, user.plan);
      setContent(result.content);
      setSources(result.sources);
    } catch (err) {
      console.error("Study material generation failed:", err);
      setError("Falha ao gerar o material de estudo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printableContent = document.getElementById('printable-content');
    if (printableContent) {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write('<html><head><title>Material de Estudo - 5399AI</title>');
        printWindow?.document.write(`
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
                h1, h2, h3 { color: #000; }
                h1 { font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; margin-bottom: 0.5em;}
                h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; margin-bottom: 0.4em;}
                h3 { font-size: 1.2em; }
                ul, ol { padding-left: 20px; }
                li { margin-bottom: 8px; }
                code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px; }
                strong { font-weight: 600; }
                .sources-section { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; }
                .sources-section h3 { font-size: 1.2em; }
            </style>
        `);
        printWindow?.document.write('</head><body>');
        printWindow?.document.write(printableContent.innerHTML);
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animation-fade-in">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6">Assistente de Estudos</h2>
      <div className="bg-black bg-opacity-30 p-6 rounded-lg border border-yellow-500/20 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                id="study-topic"
                label="Tópico do Estudo"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Revolução Francesa"
                disabled={isLoading}
            />
            <Input
                id="study-grade"
                label="Ano/Série Escolar"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Ex: 8º Ano do Ensino Fundamental"
                disabled={isLoading}
            />
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || !topic.trim() || !grade.trim()}>
          {isLoading ? 'Gerando Material...' : 'Gerar Material de Estudo'}
        </Button>
      </div>

      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      
      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center items-center h-80 bg-gray-800/50 rounded-lg border-2 border-dashed border-yellow-500/50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-yellow-200">A IA está compilando o conhecimento...</p>
            </div>
          </div>
        )}
        {content && !isLoading && (
            <div>
                <div className="flex justify-end mb-4">
                    <Button onClick={handlePrint}>Imprimir / Salvar como PDF</Button>
                </div>
                <div id="printable-content" className="prose prose-invert max-w-none p-6 bg-gray-800/70 rounded-lg border border-yellow-500/30 text-yellow-50">
                   <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold mt-8 mb-4 text-yellow-400" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 border-b border-yellow-500/30 pb-2 text-yellow-300" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-yellow-200" {...props} />,
                            li: ({node, ...props}) => <li className="my-1" {...props} />,
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                    {sources.length > 0 && (
                        <div className="sources-section mt-8 pt-4 border-t border-yellow-500/30">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyHelper;