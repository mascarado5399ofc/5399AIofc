
import React from 'react';
import { Tool } from '../../types';

interface SidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const StudyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const CreatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const PlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
  const navItems = [
    { id: 'chat', icon: <ChatIcon />, label: 'Chat' },
    { id: 'image', icon: <ImageIcon />, label: 'Imagens' },
    { id: 'video', icon: <VideoIcon />, label: 'Vídeos' },
    { id: 'audio', icon: <AudioIcon />, label: 'Áudios' },
    { id: 'study', icon: <StudyIcon />, label: 'Estudos' },
    { id: 'creator', icon: <CreatorIcon />, label: 'Criador' },
  ] as const;
  
  const accountItems = [
    { id: 'planos', icon: <PlanIcon />, label: 'Planos' },
  ] as const;

  return (
    <nav className="bg-black bg-opacity-50 border-r border-yellow-500/20 p-2 sm:p-4 flex flex-col items-center sm:items-stretch justify-between">
      <div>
        <div className="text-center mb-10 mt-2">
           <h1 className="hidden sm:block text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200">
              5399AI
          </h1>
           <h1 className="block sm:hidden text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200">
              AI
          </h1>
        </div>
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTool(item.id)}
                className={`w-full flex items-center justify-center sm:justify-start p-3 rounded-lg transition-all duration-200
                            ${activeTool === item.id 
                              ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/30' 
                              : 'text-yellow-200 hover:bg-red-800/50 hover:text-white'}`}
              >
                {item.icon}
                <span className="hidden sm:inline-block ml-4 font-semibold">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
          <div className="w-full border-t border-yellow-500/20 my-4"></div>
          <ul className="space-y-4">
             {accountItems.map((item) => (
                <li key={item.id}>
                    <button
                    onClick={() => setActiveTool(item.id)}
                    className={`w-full flex items-center justify-center sm:justify-start p-3 rounded-lg transition-all duration-200
                                ${activeTool === item.id 
                                ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/30' 
                                : 'text-yellow-200 hover:bg-red-800/50 hover:text-white'}`}
                    >
                    {item.icon}
                    <span className="hidden sm:inline-block ml-4 font-semibold">{item.label}</span>
                    </button>
                </li>
            ))}
          </ul>
      </div>
    </nav>
  );
};

export default Sidebar;