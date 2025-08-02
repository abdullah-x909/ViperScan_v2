import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Copy } from "lucide-react";
import SyntaxHighlight from "@/components/ui/syntax-highlight";
import { useToast } from "@/hooks/use-toast";

export default function RepeaterTab() {
  const [targetUrl, setTargetUrl] = useState("https://api.example.com");
  const [requestData, setRequestData] = useState(`POST /api/login HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User-Agent: ViperScan/1.0

{
  "username": "admin",
  "password": "password123"
}`);
  
  const [response, setResponse] = useState(`HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 156
Server: nginx/1.20.1
Set-Cookie: session=abc123; HttpOnly; Secure

{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "username": "admin",
    "role": "administrator"
  }
}`);

  const [responseTime, setResponseTime] = useState("1.2s");
  const [responseSize, setResponseSize] = useState("2.1 KB");
  const [statusCode, setStatusCode] = useState(200);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const sendRequest = async () => {
    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Request Sent",
        description: "HTTP request completed successfully",
      });
    }, 1000);
  };

  const cloneTab = () => {
    toast({
      title: "Tab Cloned",
      description: "New repeater tab created with current request",
    });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-600';
    if (status >= 300 && status < 400) return 'bg-blue-600';
    if (status >= 400 && status < 500) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Controls */}
      <div className="viper-bg-gray viper-border-gray-light border-b p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={sendRequest}
            disabled={isLoading}
            className="viper-bg-green text-black hover:viper-bg-green-dark font-medium"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
          <Button
            onClick={cloneTab}
            variant="secondary"
            className="bg-gray-600 hover:bg-gray-500"
          >
            <Copy className="w-4 h-4 mr-2" />
            Clone Tab
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Label htmlFor="target-url" className="text-gray-400">
            Target:
          </Label>
          <Input
            id="target-url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="viper-bg-gray-light border-gray-600 text-sm w-64"
          />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Request Editor */}
        <div className="w-1/2 flex flex-col viper-border-gray-light border-r">
          <div className="viper-bg-gray viper-border-gray-light border-b px-4 py-2">
            <h3 className="font-semibold text-sm">Request</h3>
          </div>
          <div className="flex-1 p-4">
            <Textarea
              value={requestData}
              onChange={(e) => setRequestData(e.target.value)}
              className="w-full h-full viper-bg-darker border-gray-600 font-mono text-sm text-gray-100 resize-none focus:border-green-500"
              placeholder="Enter HTTP request..."
            />
          </div>
        </div>

        {/* Response Viewer */}
        <div className="w-1/2 flex flex-col">
          <div className="viper-bg-gray viper-border-gray-light border-b px-4 py-2 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Response</h3>
            <div className="flex items-center space-x-2 text-xs">
              <Badge className={getStatusColor(statusCode)}>
                {statusCode} OK
              </Badge>
              <span className="text-gray-400">{responseTime}</span>
              <span className="text-gray-400">{responseSize}</span>
            </div>
          </div>
          <div className="flex-1 p-4">
            <SyntaxHighlight
              code={response}
              language="http"
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
