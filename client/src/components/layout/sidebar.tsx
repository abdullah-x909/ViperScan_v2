import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeftRight, 
  Search, 
  RotateCcw, 
  Bomb, 
  List, 
  Wrench,
  FileText,
  FolderOpen
} from "lucide-react";

type TabType = 'proxy' | 'scanner' | 'repeater' | 'fuzzer' | 'logger' | 'tools' | 'directory';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'proxy' as TabType, icon: ArrowLeftRight, label: 'Proxy' },
    { id: 'scanner' as TabType, icon: Search, label: 'Scanner' },
    { id: 'repeater' as TabType, icon: RotateCcw, label: 'Repeater' },
    { id: 'fuzzer' as TabType, icon: Bomb, label: 'Fuzzer' },
    { id: 'directory' as TabType, icon: FolderOpen, label: 'Directory' },
    { id: 'logger' as TabType, icon: List, label: 'Logger' },
    { id: 'tools' as TabType, icon: Wrench, label: 'Tools' },
  ];

  return (
    <nav className="w-16 viper-bg-gray viper-border-gray-light border-r flex flex-col">
      <div className="flex-1 py-4">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className={`w-full p-3 text-center transition-colors group flex flex-col gap-1 ${
                      isActive 
                        ? 'viper-bg-gray-light viper-text-green' 
                        : 'hover:viper-bg-gray-light'
                    }`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{tab.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
      <div className="p-2 viper-border-gray-light border-t">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              className="w-full p-2 text-center hover:viper-bg-gray-light transition-colors rounded"
            >
              <FileText className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Reports
          </TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
}
