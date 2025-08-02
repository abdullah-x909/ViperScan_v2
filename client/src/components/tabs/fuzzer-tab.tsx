import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Square } from "lucide-react";
import { FuzzerResult } from "@/types/security";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FuzzerTab() {
  const [targetUrl, setTargetUrl] = useState("https://api.example.com/§FUZZ§");
  const [payloadType, setPayloadType] = useState("wordlist");
  const [threads, setThreads] = useState("10");
  const [wordlist, setWordlist] = useState("common.txt");
  const [customPayloads, setCustomPayloads] = useState(`admin
administrator
root
test
user
guest`);
  const [urlEncode, setUrlEncode] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  const { toast } = useToast();

  const { data: results = [] } = useQuery<FuzzerResult[]>({
    queryKey: ['/api/fuzzer/results', sessionId],
    enabled: isRunning,
    refetchInterval: 1000,
  });

  const startFuzzingMutation = useMutation({
    mutationFn: async () => {
      const payloads = customPayloads.split('\n').filter(p => p.trim());
      return apiRequest('POST', '/api/fuzzer/start', {
        url: targetUrl,
        payloads,
        sessionId,
      });
    },
    onSuccess: () => {
      setIsRunning(true);
      toast({
        title: "Fuzzing Started",
        description: "Payload testing has been initiated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start fuzzing",
        variant: "destructive",
      });
    },
  });

  const stopFuzzing = () => {
    setIsRunning(false);
    toast({
      title: "Fuzzing Stopped",
      description: "Payload testing has been stopped",
    });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-600';
    if (status >= 300 && status < 400) return 'bg-blue-600';
    if (status >= 400 && status < 500) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const totalPayloads = customPayloads.split('\n').filter(p => p.trim()).length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Controls */}
      <div className="viper-bg-gray viper-border-gray-light border-b p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="target-url" className="text-sm font-medium mb-2 block">
              Target URL
            </Label>
            <Input
              id="target-url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="viper-bg-gray-light border-gray-600 text-white focus:border-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">Use §FUZZ§ to mark injection points</p>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Payload Type
            </Label>
            <Select value={payloadType} onValueChange={setPayloadType}>
              <SelectTrigger className="viper-bg-gray-light border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="viper-bg-gray-light border-gray-600">
                <SelectItem value="wordlist">Wordlist</SelectItem>
                <SelectItem value="brute">Brute Force</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="numbers">Numbers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="threads" className="text-sm font-medium mb-2 block">
              Threads
            </Label>
            <Input
              id="threads"
              type="number"
              value={threads}
              onChange={(e) => setThreads(e.target.value)}
              className="viper-bg-gray-light border-gray-600 text-white focus:border-green-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => startFuzzingMutation.mutate()}
            disabled={startFuzzingMutation.isPending || isRunning}
            className="viper-bg-green text-black hover:viper-bg-green-dark font-medium"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Fuzzing
          </Button>
          <Button
            onClick={stopFuzzing}
            disabled={!isRunning}
            variant="destructive"
            className="bg-red-600 hover:bg-red-500"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
          {isRunning && (
            <div className="text-sm text-gray-400">
              Progress: {results.length} / {totalPayloads} payloads
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Payload Configuration */}
        <div className="w-80 viper-bg-gray viper-border-gray-light border-r flex flex-col">
          <div className="p-3 viper-border-gray-light border-b">
            <h3 className="font-semibold text-sm">Payload Configuration</h3>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Wordlist
              </Label>
              <Select value={wordlist} onValueChange={setWordlist}>
                <SelectTrigger className="viper-bg-gray-light border-gray-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="viper-bg-gray-light border-gray-600">
                  <SelectItem value="common.txt">common.txt</SelectItem>
                  <SelectItem value="directories.txt">directories.txt</SelectItem>
                  <SelectItem value="files.txt">files.txt</SelectItem>
                  <SelectItem value="sql-injection.txt">sql-injection.txt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="custom-payloads" className="text-sm font-medium mb-2 block">
                Custom Payloads
              </Label>
              <Textarea
                id="custom-payloads"
                value={customPayloads}
                onChange={(e) => setCustomPayloads(e.target.value)}
                className="h-32 viper-bg-gray-light border-gray-600 text-white text-sm resize-none"
                placeholder="Enter payloads (one per line)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="url-encode"
                checked={urlEncode}
                onCheckedChange={(checked) => setUrlEncode(checked as boolean)}
                className="text-green-500"
              />
              <Label htmlFor="url-encode" className="text-sm">
                URL encode payloads
              </Label>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col">
          <div className="p-3 viper-border-gray-light border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Fuzzing Results ({results.length})
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Filter:</span>
              <Select defaultValue="all">
                <SelectTrigger className="viper-bg-gray-light border-gray-600 px-2 py-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="viper-bg-gray-light border-gray-600">
                  <SelectItem value="all">All responses</SelectItem>
                  <SelectItem value="2xx">2xx Success</SelectItem>
                  <SelectItem value="4xx">4xx Client Error</SelectItem>
                  <SelectItem value="5xx">5xx Server Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="flex-1">
            {results.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {isRunning ? "Fuzzing in progress..." : "No results yet"}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="viper-bg-gray-light sticky top-0">
                  <tr>
                    <th className="text-left p-2 viper-border-gray-light border-r">Payload</th>
                    <th className="text-left p-2 viper-border-gray-light border-r">Status</th>
                    <th className="text-left p-2 viper-border-gray-light border-r">Length</th>
                    <th className="text-left p-2 viper-border-gray-light border-r">Time</th>
                    <th className="text-left p-2">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-gray-700 hover:viper-bg-gray-light cursor-pointer"
                    >
                      <td className="p-2 font-mono text-blue-400">{result.payload}</td>
                      <td className="p-2">
                        <Badge className={`text-xs ${getStatusColor(result.statusCode || 0)}`}>
                          {result.statusCode}
                        </Badge>
                      </td>
                      <td className="p-2 text-gray-400">{result.responseLength?.toLocaleString()}</td>
                      <td className="p-2 text-gray-400">{result.responseTime}ms</td>
                      <td className="p-2 text-gray-400 truncate max-w-xs">
                        {result.response}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
