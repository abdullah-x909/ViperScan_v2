import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Trash2, Download } from "lucide-react";
import { HttpRequest } from "@/types/security";
import { useToast } from "@/hooks/use-toast";

export default function LoggerTab() {
  const [isLogging, setIsLogging] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const { toast } = useToast();

  const { data: requests = [] } = useQuery<HttpRequest[]>({
    queryKey: ['/api/requests'],
    refetchInterval: 2000,
  });

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.url.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         request.method.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesMethod = methodFilter === "all" || request.method === methodFilter;
    
    return matchesSearch && matchesMethod;
  });

  const toggleLogging = () => {
    setIsLogging(!isLogging);
    toast({
      title: isLogging ? "Logging Stopped" : "Logging Started",
      description: `Request logging has been ${isLogging ? 'stopped' : 'started'}`,
    });
  };

  const clearLogs = () => {
    toast({
      title: "Logs Cleared",
      description: "All request logs have been cleared",
    });
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredRequests, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `viperscan_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Logs Exported",
      description: "Request logs have been exported to file",
    });
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-green-600';
    if (status >= 300 && status < 400) return 'bg-blue-600';
    if (status >= 400 && status < 500) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-orange-600',
      POST: 'bg-blue-600',
      PUT: 'bg-purple-600',
      DELETE: 'bg-red-600',
      PATCH: 'bg-yellow-600',
    };
    return colors[method] || 'bg-gray-600';
  };

  const formatSize = (size?: number) => {
    if (!size) return 'N/A';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getNotes = (request: HttpRequest) => {
    if (!request.statusCode) return "Pending";
    if (request.statusCode >= 400) return "Error response";
    if (request.statusCode >= 300) return "Redirect";
    return "Success";
  };

  const getNotesColor = (request: HttpRequest) => {
    if (!request.statusCode) return "text-gray-400";
    if (request.statusCode >= 400) return "text-red-400";
    if (request.statusCode >= 300) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Controls */}
      <div className="viper-bg-gray viper-border-gray-light border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleLogging}
              className={`${isLogging ? 'viper-bg-green text-black hover:viper-bg-green-dark' : 'bg-gray-600 hover:bg-gray-500'} font-medium`}
            >
              <Play className="w-4 h-4 mr-2" />
              {isLogging ? 'Stop' : 'Start'} Logging
            </Button>
            <Button
              onClick={clearLogs}
              variant="secondary"
              className="bg-gray-600 hover:bg-gray-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={exportLogs}
              variant="secondary"
              className="bg-blue-600 hover:bg-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Filter:</span>
              <Input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search requests..."
                className="viper-bg-gray-light border-gray-600 w-48"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="viper-bg-gray-light border-gray-600 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="viper-bg-gray-light border-gray-600">
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <ScrollArea className="flex-1">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {requests.length === 0 ? "No requests logged yet" : "No requests match your filter"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="viper-bg-gray-light sticky top-0">
              <tr>
                <th className="text-left p-3 viper-border-gray-light border-r">Time</th>
                <th className="text-left p-3 viper-border-gray-light border-r">Method</th>
                <th className="text-left p-3 viper-border-gray-light border-r">URL</th>
                <th className="text-left p-3 viper-border-gray-light border-r">Status</th>
                <th className="text-left p-3 viper-border-gray-light border-r">Size</th>
                <th className="text-left p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-gray-700 hover:viper-bg-gray-light cursor-pointer"
                >
                  <td className="p-3 text-gray-400">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3">
                    <Badge className={`text-xs font-mono ${getMethodColor(request.method)}`}>
                      {request.method}
                    </Badge>
                  </td>
                  <td className="p-3 text-blue-400 truncate max-w-md">
                    {request.url}
                  </td>
                  <td className="p-3">
                    {request.statusCode ? (
                      <Badge className={`text-xs ${getStatusColor(request.statusCode)}`}>
                        {request.statusCode}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-400">
                    {formatSize(request.size)}
                  </td>
                  <td className={`p-3 ${getNotesColor(request)}`}>
                    {getNotes(request)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ScrollArea>
    </div>
  );
}
