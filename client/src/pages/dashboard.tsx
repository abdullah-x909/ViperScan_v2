import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ProxyTab from "@/components/tabs/proxy-tab";
import ScannerTab from "@/components/tabs/scanner-tab";
import RepeaterTab from "@/components/tabs/repeater-tab";
import FuzzerTab from "@/components/tabs/fuzzer-tab";
import LoggerTab from "@/components/tabs/logger-tab";
import ToolsTab from "@/components/tabs/tools-tab";
import { DirectoryTab } from "@/components/directory-tab";
import { useWebSocket } from "@/hooks/use-websocket";

type TabType = 'proxy' | 'scanner' | 'repeater' | 'fuzzer' | 'logger' | 'tools' | 'directory';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('proxy');
  const [isIntercepting, setIsIntercepting] = useState(true);
  
  // WebSocket connection for real-time updates
  useWebSocket('/ws');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'proxy':
        return <ProxyTab isIntercepting={isIntercepting} setIsIntercepting={setIsIntercepting} />;
      case 'scanner':
        return <ScannerTab />;
      case 'repeater':
        return <RepeaterTab />;
      case 'fuzzer':
        return <FuzzerTab />;
      case 'logger':
        return <LoggerTab />;
      case 'tools':
        return <ToolsTab />;
      case 'directory':
        return <DirectoryTab />;
      default:
        return <ProxyTab isIntercepting={isIntercepting} setIsIntercepting={setIsIntercepting} />;
    }
  };

  return (
    <div className="h-screen flex flex-col viper-bg-dark text-gray-100">
      <Header isIntercepting={isIntercepting} />
      <div className="flex-1 flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 flex flex-col">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
