import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Network, Search, FolderOpen, Rocket, Eye, Settings } from "lucide-react";
import { Tool } from "@/types/security";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";

export default function ToolsTab() {
  const [toolOutput, setToolOutput] = useState<string[]>([]);
  const [currentTool, setCurrentTool] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
  });

  // Listen for tool output via WebSocket
  useWebSocket('/ws', (data) => {
    if (data.type === 'tool_output') {
      setCurrentTool(data.data.toolName);
      setToolOutput(data.data.output);
    }
  });

  const runToolMutation = useMutation({
    mutationFn: async (toolId: string) => {
      return apiRequest('POST', `/api/tools/${toolId}/run`, {});
    },
    onSuccess: (_, toolId) => {
      const tool = tools.find(t => t.id === toolId);
      toast({
        title: "Tool Started",
        description: `${tool?.name} is now running`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to run tool",
        variant: "destructive",
      });
    },
  });

  const getToolIcon = (category: string) => {
    const icons: Record<string, any> = {
      Database: Database,
      Network: Network,
      Web: Search,
      Fuzzing: Rocket,
      Reconnaissance: Eye,
    };
    return icons[category] || Settings;
  };

  const getToolIconColor = (category: string) => {
    const colors: Record<string, string> = {
      Database: 'text-red-400',
      Network: 'text-blue-400',
      Web: 'text-purple-400',
      Fuzzing: 'text-orange-400',
      Reconnaissance: 'text-green-400',
    };
    return colors[category] || 'text-gray-400';
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="viper-bg-gray viper-border-gray-light border-b p-4">
        <h2 className="text-lg font-semibold mb-2">External Tools Integration</h2>
        <p className="text-gray-400 text-sm">Configure and run external security tools</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tools.map((tool) => {
            const Icon = getToolIcon(tool.category);
            const iconColor = getToolIconColor(tool.category);
            
            return (
              <Card
                key={tool.id}
                className="viper-bg-gray border-gray-600 hover:border-green-500 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Icon className={`text-2xl ${iconColor}`} />
                      <div>
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                        <p className="text-xs text-gray-400">{tool.category}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${tool.installed ? 'bg-green-500' : 'bg-yellow-500'}`} 
                         title={tool.installed ? 'Installed' : 'Not Installed'}>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{tool.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => runToolMutation.mutate(tool.id)}
                      disabled={!tool.installed || runToolMutation.isPending}
                      className={`flex-1 text-sm ${
                        tool.installed 
                          ? 'viper-bg-green text-black hover:viper-bg-green-dark' 
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {tool.installed ? 'Run' : 'Install'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 hover:viper-bg-gray-light"
                    >
                      Configure
                    </Button>
                  </div>
                  {tool.version && (
                    <p className="text-xs text-gray-500 mt-2">Version: {tool.version}</p>
                  )}
                  {tool.lastUsed && (
                    <p className="text-xs text-gray-500">
                      Last used: {new Date(tool.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tool Output Section */}
        <Card className="viper-bg-gray border-gray-600">
          <CardHeader className="viper-border-gray-light border-b">
            <CardTitle className="text-base">
              Tool Output {currentTool && `- ${currentTool}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64 viper-bg-darker">
              <div className="p-4 font-mono text-sm">
                {toolOutput.length === 0 ? (
                  <div className="text-gray-500 italic">
                    Tool output will appear here when you run a tool...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {toolOutput.map((line, index) => (
                      <div
                        key={index}
                        className={`${
                          line.includes('[*]') || line.includes('Starting') ? 'viper-text-green' :
                          line.includes('[INFO]') ? 'text-gray-400' :
                          line.includes('[WARNING]') ? 'text-yellow-400' :
                          line.includes('[CRITICAL]') || line.includes('[ERROR]') ? 'text-red-400' :
                          line.includes('completed') || line.includes('finished') ? 'viper-text-green' :
                          'text-gray-300'
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
