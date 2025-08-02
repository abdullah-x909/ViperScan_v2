import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pause, Play, Forward, Trash2 } from "lucide-react";
import SyntaxHighlight from "@/components/ui/syntax-highlight";
import { HttpRequest } from "@/types/security";
import { apiRequest } from "@/lib/queryClient";

interface ProxyTabProps {
  isIntercepting: boolean;
  setIsIntercepting: (value: boolean) => void;
}

export default function ProxyTab({ isIntercepting, setIsIntercepting }: ProxyTabProps) {
  const [selectedRequest, setSelectedRequest] = useState<HttpRequest | null>(null);
  const [filter, setFilter] = useState("all");

  const { data: requests = [], isLoading } = useQuery<HttpRequest[]>({
    queryKey: ['/api/requests'],
    refetchInterval: 2000,
  });

  const toggleIntercept = async () => {
    try {
      await apiRequest('POST', '/api/proxy/intercept', { enabled: !isIntercepting });
      setIsIntercepting(!isIntercepting);
    } catch (error) {
      console.error('Failed to toggle intercept:', error);
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'gray';
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'blue';
    if (status >= 400 && status < 500) return 'orange';
    return 'red';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'text-orange-400',
      POST: 'text-blue-400',
      PUT: 'text-purple-400',
      DELETE: 'text-red-400',
      PATCH: 'text-yellow-400',
    };
    return colors[method] || 'text-gray-400';
  };

  const formatRequest = (request: HttpRequest) => {
    const headers = Object.entries(request.headers || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return `${request.method} ${new URL(request.url).pathname}${new URL(request.url).search} HTTP/1.1\n${headers}${request.body ? '\n\n' + request.body : ''}`;
  };

  const formatResponse = (request: HttpRequest) => {
    if (!request.statusCode) return 'No response received';
    
    const headers = Object.entries(request.responseHeaders || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return `HTTP/1.1 ${request.statusCode}\n${headers}${request.responseBody ? '\n\n' + request.responseBody : ''}`;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Controls */}
      <div className="viper-bg-gray viper-border-gray-light border-b p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={toggleIntercept}
            className={`${isIntercepting ? 'viper-bg-green text-black hover:viper-bg-green-dark' : 'bg-gray-600 hover:bg-gray-500'} font-medium`}
          >
            {isIntercepting ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Intercept {isIntercepting ? 'ON' : 'OFF'}
          </Button>
          <Button variant="secondary" className="bg-gray-600 hover:bg-gray-500">
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </Button>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-500">
            <Trash2 className="w-4 h-4 mr-2" />
            Drop
          </Button>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-gray-400">Filter:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 viper-bg-gray-light border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="viper-bg-gray-light border-gray-600">
              <SelectItem value="all">All requests</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="css-js">CSS/JS</SelectItem>
              <SelectItem value="json">XML/JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Request List */}
        <div className="w-80 viper-bg-gray viper-border-gray-light border-r flex flex-col">
          <div className="p-3 viper-border-gray-light border-b">
            <h3 className="font-semibold text-sm">HTTP History</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-1">
              {isLoading ? (
                <div className="p-4 text-center text-gray-400">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No requests captured</div>
              ) : (
                requests.map((request) => (
                  <Card
                    key={request.id}
                    className={`p-2 cursor-pointer border-gray-700 hover:viper-bg-gray-light transition-colors ${
                      selectedRequest?.id === request.id ? 'viper-bg-gray-light' : 'viper-bg-gray'
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-sm font-medium ${getMethodColor(request.method)}`}>
                        {request.method}
                      </span>
                      {request.statusCode && (
                        <Badge variant="outline" className={`text-${getStatusColor(request.statusCode)}-400 border-${getStatusColor(request.statusCode)}-400`}>
                          {request.statusCode}
                        </Badge>
                      )}
                    </div>
                    <div className="text-blue-400 text-sm truncate">
                      {request.url}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {new Date(request.timestamp).toLocaleTimeString()}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Request/Response View */}
        <div className="flex-1 flex flex-col">
          {selectedRequest ? (
            <Tabs defaultValue="request" className="flex-1 flex flex-col">
              <TabsList className="viper-bg-gray viper-border-gray-light border-b rounded-none">
                <TabsTrigger value="request" className="data-[state=active]:viper-bg-gray-light data-[state=active]:viper-text-green">
                  Request
                </TabsTrigger>
                <TabsTrigger value="response" className="data-[state=active]:viper-bg-gray-light data-[state=active]:viper-text-green">
                  Response
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="request" className="flex-1 p-4 m-0">
                <SyntaxHighlight
                  code={formatRequest(selectedRequest)}
                  language="http"
                  className="h-full"
                />
              </TabsContent>
              
              <TabsContent value="response" className="flex-1 p-4 m-0">
                <SyntaxHighlight
                  code={formatResponse(selectedRequest)}
                  language="http"
                  className="h-full"
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a request to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
