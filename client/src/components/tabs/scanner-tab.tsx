import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play } from "lucide-react";
import { ScanSession, Vulnerability } from "@/types/security";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ScannerTab() {
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [scanProfile, setScanProfile] = useState("quick");
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scanSessions = [] } = useQuery<ScanSession[]>({
    queryKey: ['/api/scans'],
    refetchInterval: 2000,
  });

  const { data: vulnerabilities = [] } = useQuery<Vulnerability[]>({
    queryKey: ['/api/vulnerabilities'],
    refetchInterval: 2000,
  });

  const startScanMutation = useMutation({
    mutationFn: async (data: { targetUrl: string; profile: string }) => {
      return apiRequest('POST', '/api/scans', {
        targetUrl: data.targetUrl,
        profile: data.profile,
        status: 'running',
        progress: 0,
      });
    },
    onSuccess: () => {
      toast({
        title: "Scan Started",
        description: "Vulnerability scan has been initiated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scans'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start scan",
        variant: "destructive",
      });
    },
  });

  const activeScan = scanSessions.find(session => session.status === 'running');

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
      info: 'bg-gray-500',
    };
    return colors[severity.toLowerCase()] || 'bg-gray-500';
  };

  const getSeverityTextColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-400',
      high: 'text-orange-400',
      medium: 'text-yellow-400',
      low: 'text-blue-400',
      info: 'text-gray-400',
    };
    return colors[severity.toLowerCase()] || 'text-gray-400';
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Scanner Controls */}
      <div className="viper-bg-gray viper-border-gray-light border-b p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="target-url" className="text-sm font-medium mb-2 block">
              Target URL
            </Label>
            <Input
              id="target-url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="viper-bg-gray-light border-gray-600 text-white focus:border-green-500"
            />
          </div>
          <div className="w-48">
            <Label className="text-sm font-medium mb-2 block">
              Scan Profile
            </Label>
            <Select value={scanProfile} onValueChange={setScanProfile}>
              <SelectTrigger className="viper-bg-gray-light border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="viper-bg-gray-light border-gray-600">
                <SelectItem value="quick">Quick Scan</SelectItem>
                <SelectItem value="deep">Deep Scan</SelectItem>
                <SelectItem value="owasp">OWASP Top 10</SelectItem>
                <SelectItem value="custom">Custom Profile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-6">
            <Button
              onClick={() => startScanMutation.mutate({ targetUrl, profile: scanProfile })}
              disabled={startScanMutation.isPending || !!activeScan}
              className="viper-bg-green text-black hover:viper-bg-green-dark font-medium"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Scan
            </Button>
          </div>
        </div>

        {/* Scan Progress */}
        {activeScan && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Scan Progress</span>
              <span className="text-sm viper-text-green">{activeScan.progress}% Complete</span>
            </div>
            <Progress value={activeScan.progress} className="w-full h-2" />
          </div>
        )}
      </div>

      {/* Scanner Results */}
      <div className="flex-1 flex">
        {/* Vulnerability List */}
        <div className="w-96 viper-bg-gray viper-border-gray-light border-r flex flex-col">
          <div className="p-3 viper-border-gray-light border-b">
            <h3 className="font-semibold text-sm">
              Vulnerabilities Found ({vulnerabilities.length})
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-1">
              {vulnerabilities.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No vulnerabilities found
                </div>
              ) : (
                vulnerabilities.map((vulnerability) => (
                  <Card
                    key={vulnerability.id}
                    className={`p-3 cursor-pointer border-gray-700 hover:viper-bg-gray-light transition-colors ${
                      selectedVulnerability?.id === vulnerability.id ? 'viper-bg-gray-light' : 'viper-bg-gray'
                    }`}
                    onClick={() => setSelectedVulnerability(vulnerability)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(vulnerability.severity)}`}></div>
                      <span className={`text-sm font-medium ${getSeverityTextColor(vulnerability.severity)}`}>
                        {vulnerability.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-1">{vulnerability.title}</div>
                    <div className="text-xs text-gray-400">
                      {vulnerability.method} {new URL(vulnerability.url).pathname}
                    </div>
                    {vulnerability.owaspCategory && (
                      <div className="text-xs text-gray-500 mt-1">
                        {vulnerability.owaspCategory}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Vulnerability Details */}
        <div className="flex-1 flex flex-col">
          {selectedVulnerability ? (
            <>
              <div className="p-4 viper-border-gray-light border-b">
                <h3 className={`text-lg font-semibold mb-2 ${getSeverityTextColor(selectedVulnerability.severity)}`}>
                  {selectedVulnerability.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge className={`${getSeverityColor(selectedVulnerability.severity)} text-white`}>
                    {selectedVulnerability.severity.toUpperCase()}
                  </Badge>
                  {selectedVulnerability.owaspCategory && (
                    <span className="text-gray-400">{selectedVulnerability.owaspCategory}</span>
                  )}
                  {selectedVulnerability.cvssScore && (
                    <span className="text-gray-400">CVSS Score: {selectedVulnerability.cvssScore}</span>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-300 text-sm">{selectedVulnerability.description}</p>
                  </div>
                  {selectedVulnerability.payload && (
                    <div>
                      <h4 className="font-semibold mb-2">Proof of Concept</h4>
                      <div className="viper-bg-darker p-3 rounded font-mono text-sm">
                        <div className="text-orange-400">{selectedVulnerability.method}</div>
                        <div className="text-blue-400">URL: {selectedVulnerability.url}</div>
                        {selectedVulnerability.parameter && (
                          <div className="text-purple-400">Parameter: {selectedVulnerability.parameter}</div>
                        )}
                        <div className="mt-2 text-gray-300">{selectedVulnerability.payload}</div>
                      </div>
                    </div>
                  )}
                  {selectedVulnerability.evidence && (
                    <div>
                      <h4 className="font-semibold mb-2">Evidence</h4>
                      <div className="viper-bg-darker p-3 rounded font-mono text-sm text-gray-300">
                        {selectedVulnerability.evidence}
                      </div>
                    </div>
                  )}
                  {selectedVulnerability.remediation && (
                    <div>
                      <h4 className="font-semibold mb-2">Remediation</h4>
                      <div className="text-gray-300 text-sm whitespace-pre-line">
                        {selectedVulnerability.remediation}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a vulnerability to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
