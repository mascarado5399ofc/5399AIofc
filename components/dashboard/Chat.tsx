

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatResponseStream } from '../../services/geminiService';
import Button from '../shared/Button';
import { Message, Part, ImagePart, AudioPart, VideoPart } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MicIcon = ({ isRecording }: { isRecording: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 10v2M12 4v7m0 0a7 7 0 01-7 7m7-7a7 7 0 007 7" />
  </svg>
);
const PaperclipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2h-4a2 2 0 01-2-2z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


const fileToGenerativePart = async (file: File): Promise<ImagePart | VideoPart | null> => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
    
    if (file.type.startsWith('image/')) {
        return {
            type: 'image',
            inlineData: { mimeType: file.type, data: base64 },
            source: 'file'
        };
    }
    if (file.type.startsWith('video/')) {
        const videoUrl = URL.createObjectURL(file);
        return {
            type: 'video',
            inlineData: { mimeType: file.type, data: base64 },
            videoUrl
        };
    }
    return null;
};


const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [stagedMedia, setStagedMedia] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { user } = useAuth();
  
  const chatHistory = useRef<any[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && stagedMedia.length === 0) || isLoading || !user) return;

    const userParts: Part[] = [];
    if (input.trim()) {
        userParts.push({ type: 'text', text: input });
    }
    userParts.push(...stagedMedia);
    
    const userMessage: Message = { sender: 'user', parts: userParts };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');
    setStagedMedia([]);
    
    setMessages(prev => [...prev, { sender: 'bot', parts: [{ type: 'text', text: '' }] }]);

    let fullBotResponse = '';
    
    try {
      await getChatResponseStream(
        chatHistory.current, 
        userParts, 
        (chunk) => {
            fullBotResponse += chunk;
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.sender === 'bot') {
                    lastMessage.parts = [{ type: 'text', text: fullBotResponse }];
                }
                return newMessages;
            });
        }, 
        user.plan
      );
      
      const geminiUserParts = userParts.map(p => {
          if (p.type === 'text') return { text: p.text };
          return { inlineData: p.inlineData };
      });
      
      chatHistory.current.push({ role: 'user', parts: geminiUserParts });
      chatHistory.current.push({ role: 'model', parts: [{ text: fullBotResponse }] });

    } catch (error) {
      console.error("Error fetching chat response:", error);
      const errorMessage: Message = { sender: 'bot', parts: [{ type: 'text', text: "Desculpe, ocorreu um erro ao processar sua solicitação." }] };
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = errorMessage;
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    for (const file of Array.from(event.target.files)) {
        const part = await fileToGenerativePart(file);
        if (part) {
            setStagedMedia(prev => [...prev, part]);
        }
    }
    // Reset file input
    event.target.value = '';
  };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
        if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            if (file) {
                 const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = (error) => reject(error);
                });
                const imagePart: ImagePart = {
                    type: 'image',
                    inlineData: { mimeType: file.type, data: base64 },
                    source: 'clipboard'
                };
                setStagedMedia(prev => [...prev, imagePart]);
            }
        }
    }
  }, []);

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

           const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.onerror = (error) => reject(error);
          });
          
          const audioPart: AudioPart = {
              type: 'audio',
              inlineData: { mimeType: audioBlob.type, data: base64 },
              audioUrl
          };
          setStagedMedia(prev => [...prev, audioPart]);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Não foi possível acessar o microfone. Verifique as permissões do seu navegador.");
      }
    }
  };

  const removeStagedMedia = (index: number) => {
    setStagedMedia(prev => prev.filter((_, i) => i !== index));
  };
  
  useEffect(() => {
    const chatArea = document.getElementById('chat-area');
    chatArea?.addEventListener('paste', handlePaste);
    return () => {
      chatArea?.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);
  
  const renderPart = (part: Part, index: number) => {
    switch(part.type) {
        case 'text':
            return <ReactMarkdown key={index} remarkPlugins={[remarkGfm]} className="prose prose-invert prose-p:my-1">{part.text}</ReactMarkdown>;
        case 'image':
            return <img key={index} src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} className="max-w-xs rounded-lg mt-2" alt="Conteúdo do usuário" />;
        case 'audio':
            return <audio key={index} controls src={part.audioUrl} className="mt-2" />;
        case 'video':
            return <video key={index} controls src={part.videoUrl} className="max-w-xs rounded-lg mt-2" />;
    }
  }

  // Fix: Store the last message and its first part in variables to help TypeScript with type narrowing.
  const lastMessage = messages[messages.length - 1];
  const lastMessageFirstPart = lastMessage?.parts[0];


  return (
    <div id="chat-area" className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-yellow-500 text-gray-900 rounded-br-none' : 'bg-gray-800 text-yellow-50 rounded-bl-none'}`}>
              {msg.parts.map(renderPart)}
            </div>
          </div>
        ))}
         {isLoading && lastMessage?.sender === 'bot' && lastMessageFirstPart?.type === 'text' && lastMessageFirstPart.text === '' && (
            <div className="flex justify-start">
                <div className="max-w-lg p-3 rounded-2xl bg-gray-800 text-yellow-50 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-black bg-opacity-20 border-t border-yellow-500/20">
        {stagedMedia.length > 0 && (
            <div className="mb-2 p-2 bg-gray-800/50 rounded-lg flex flex-wrap gap-2">
                {stagedMedia.map((media, index) => (
                    <div key={index} className="relative">
                        {media.type === 'image' && <img src={`data:${media.inlineData.mimeType};base64,${media.inlineData.data}`} className="h-16 w-16 object-cover rounded" />}
                        {media.type === 'audio' && <div className="h-16 w-16 flex items-center justify-center bg-gray-700 rounded"><MicIcon isRecording={false} /></div>}
                        {media.type === 'video' && <video src={media.videoUrl} className="h-16 w-16 object-cover rounded" />}
                        <button onClick={() => removeStagedMedia(index)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-800"><CloseIcon /></button>
                    </div>
                ))}
            </div>
        )}
        <div className="flex items-end space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2 text-yellow-300">
             <button onClick={handleRecord} title={isRecording ? "Parar Gravação" : "Gravar Áudio"} className="p-2 hover:bg-red-800/50 rounded-full transition-colors"><MicIcon isRecording={isRecording} /></button>
             <button onClick={() => fileInputRef.current?.click()} title="Anexar Arquivo" className="p-2 hover:bg-red-800/50 rounded-full transition-colors"><PaperclipIcon /></button>
             <button title="Cole uma imagem (Ctrl+V) para a IA copiar" className="p-2 hover:bg-red-800/50 rounded-full transition-colors hidden sm:block"><CopyIcon /></button>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" multiple />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-800 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            disabled={isLoading}
            rows={1}
            style={{maxHeight: '200px'}}
            onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <Button onClick={handleSend} disabled={isLoading || (!input.trim() && stagedMedia.length === 0)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;