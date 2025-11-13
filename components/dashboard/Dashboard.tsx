
import React, { useState } from 'react';
import Header from '../shared/Header';
import Sidebar from '../shared/Sidebar';
import Chat from './Chat';
import ImageGenerator from './ImageGenerator';
import VideoGenerator from './VideoGenerator';
import AudioGenerator from './AudioGenerator';
import StudyHelper from './StudyHelper';
import CreatorTool from './CreatorTool';
import SubscriptionManager from './SubscriptionManager';
import { Tool } from '../../types';


const Dashboard: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('chat');

  const renderTool = () => {
    switch (activeTool) {
      case 'chat':
        return <Chat />;
      case 'image':
        return <ImageGenerator />;
      case 'video':
        return <VideoGenerator />;
      case 'audio':
        return <AudioGenerator />;
      case 'study':
        return <StudyHelper />;
      case 'creator':
        return <CreatorTool />;
      case 'planos':
        return <SubscriptionManager />;
      default:
        return <Chat />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-yellow-50">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto animated-gradient p-4 sm:p-6 md:p-8">
          {renderTool()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;