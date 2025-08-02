import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";

interface HeaderProps {
  isIntercepting: boolean;
}

export default function Header({ isIntercepting }: HeaderProps) {
  return (
    <header className="viper-bg-darker viper-border-gray-light border-b p-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🐍</div>
          <h1 className="text-xl font-bold viper-text-green">ViperScan</h1>
          <Badge variant="secondary" className="bg-orange-600 text-white">
            NIHOREX
          </Badge>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isIntercepting ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span>Proxy: 127.0.0.1:8080</span>
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          <span>Intercepting: {isIntercepting ? 'ON' : 'OFF'}</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-600"></div>
        <div className="text-sm text-gray-400">
          <span>abdullah-x909</span>
        </div>
      </div>
    </header>
  );
}
