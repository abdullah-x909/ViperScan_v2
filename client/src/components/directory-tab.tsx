import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Search, Globe, FileText, Shield, Clock, Link, Download } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DirectoryResult {
  id: string;
  sessionId: string;
  targetUrl: string;
  foundPath: string;
  statusCode: number | null;
  contentLength: number | null;
  contentType: string | null;
  responseTime: number | null;
  method: string;
  source: string;
  timestamp: string;
}

interface DorkingSession {
  id: string;
  targetDomain: string;
  dorkType: string;
  query: string;
  status: string;
  resultsFound: number;
  timestamp: string;
}

export function DirectoryTab() {
  const { toast } = useToast();
  const [directoryUrl, setDirectoryUrl] = useState("https://example.com");
  const [directoryTool, setDirectoryTool] = useState("dirb");
  const [wordlist, setWordlist] = useState("common.txt");
  const [dorkDomain, setDorkDomain] = useState("example.com");
  const [dorkType, setDorkType] = useState("files");
  const [customQuery, setCustomQuery] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Directory enumeration queries
  const { data: directoryResults = [], refetch: refetchDirectoryResults } = useQuery<DirectoryResult[]>({
    queryKey: ["/api/directory/results", activeSessionId],
    enabled: !!activeSessionId,
  });

  // Google dorking queries
  const { data: dorkingSessions = [], refetch: refetchDorkingSessions } = useQuery<DorkingSession[]>({
    queryKey: ["/api/dorking/sessions"],
  });

  // Directory scan mutation
  const directoryMutation = useMutation({
    mutationFn: async (data: { targetUrl: string; tool: string; wordlist: string }) => {
      const response = await fetch("/api/directory/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setActiveSessionId(data.sessionId);
      toast({
        title: "Directory Scan Started",
        description: `Scanning ${directoryUrl} with ${directoryTool}`,
      });
      setTimeout(() => {
        refetchDirectoryResults();
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Scan Failed",
        description: "Failed to start directory enumeration",
        variant: "destructive",
      });
    },
  });

  // Google dorking mutation
  const dorkingMutation = useMutation({
    mutationFn: async (data: { targetDomain: string; dorkType: string; customQuery?: string }) => {
      const response = await fetch("/api/dorking/scan", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Google Dorking Started",
        description: `Scanning ${dorkDomain} for ${dorkType}`,
      });
      setTimeout(() => {
        refetchDorkingSessions();
        refetchDirectoryResults();
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Dorking Failed",
        description: "Failed to start Google dorking",
        variant: "destructive",
      });
    },
  });

  const handleDirectoryScan = () => {
    directoryMutation.mutate({
      targetUrl: directoryUrl,
      tool: directoryTool,
      wordlist,
    });
  };

  const handleGoogleDorking = () => {
    dorkingMutation.mutate({
      targetDomain: dorkDomain,
      dorkType,
      customQuery: dorkType === "custom" ? customQuery : undefined,
    });
  };

  const getStatusColor = (statusCode: number | null) => {
    if (!statusCode) return "bg-gray-500";
    if (statusCode >= 200 && statusCode < 300) return "bg-green-500";
    if (statusCode >= 300 && statusCode < 400) return "bg-yellow-500";
    if (statusCode >= 400 && statusCode < 500) return "bg-orange-500";
    return "bg-red-500";
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "google_dork":
        return <Globe className="h-4 w-4" />;
      case "dirb":
      case "dirbuster":
        return <FolderOpen className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="directory">Directory Enumeration</TabsTrigger>
          <TabsTrigger value="dorking">Google Dorking</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Directory Enumeration Tab */}
        <TabsContent value="directory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Directory & File Enumeration
              </CardTitle>
              <CardDescription>
                Discover hidden directories and files using tools like Dirb, DirBuster, and FFUF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-url">Target URL</Label>
                  <Input
                    id="target-url"
                    placeholder="https://example.com"
                    value={directoryUrl}
                    onChange={(e) => setDirectoryUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tool">Tool</Label>
                  <Select value={directoryTool} onValueChange={setDirectoryTool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tool" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dirb">Dirb</SelectItem>
                      <SelectItem value="dirbuster">DirBuster</SelectItem>
                      <SelectItem value="ffuf">FFUF</SelectItem>
                      <SelectItem value="gobuster">GoBuster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wordlist">Wordlist</Label>
                <Select value={wordlist} onValueChange={setWordlist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wordlist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common.txt">Common (1000 entries)</SelectItem>
                    <SelectItem value="medium.txt">Medium (5000 entries)</SelectItem>
                    <SelectItem value="large.txt">Large (20000 entries)</SelectItem>
                    <SelectItem value="raft-medium.txt">Raft Medium</SelectItem>
                    <SelectItem value="dirbuster-medium.txt">DirBuster Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleDirectoryScan} 
                disabled={directoryMutation.isPending}
                className="w-full"
              >
                {directoryMutation.isPending ? "Scanning..." : "Start Directory Scan"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Dorking Tab */}
        <TabsContent value="dorking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Google Advanced Dorking
              </CardTitle>
              <CardDescription>
                Use Google search operators to find sensitive files and directories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-domain">Target Domain</Label>
                  <Input
                    id="target-domain"
                    placeholder="example.com"
                    value={dorkDomain}
                    onChange={(e) => setDorkDomain(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dork-type">Dork Type</Label>
                  <Select value={dorkType} onValueChange={setDorkType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dork type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="files">Files (PDF, DOC, XLS)</SelectItem>
                      <SelectItem value="directories">Directory Listings</SelectItem>
                      <SelectItem value="subdomains">Subdomains</SelectItem>
                      <SelectItem value="sensitive">Sensitive Data</SelectItem>
                      <SelectItem value="custom">Custom Query</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {dorkType === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-query">Custom Google Dork</Label>
                  <Textarea
                    id="custom-query"
                    placeholder="site:example.com filetype:pdf"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Preview Query:</h4>
                <code className="text-sm">
                  {dorkType === "files" && `site:${dorkDomain} filetype:pdf OR filetype:doc OR filetype:xls`}
                  {dorkType === "directories" && `site:${dorkDomain} intitle:"index of"`}
                  {dorkType === "subdomains" && `site:*.${dorkDomain}`}
                  {dorkType === "sensitive" && `site:${dorkDomain} intext:"password" OR intext:"username" OR intext:"login"`}
                  {dorkType === "custom" && customQuery}
                </code>
              </div>

              <Button 
                onClick={handleGoogleDorking} 
                disabled={dorkingMutation.isPending}
                className="w-full"
              >
                {dorkingMutation.isPending ? "Searching..." : "Start Google Dorking"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Directory Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Directory Results
                </CardTitle>
                <CardDescription>
                  Found {directoryResults.length} directories and files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {directoryResults.map((result) => (
                      <div key={result.id} className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          {getSourceIcon(result.source)}
                          <span className="font-mono text-sm font-medium">{result.foundPath}</span>
                          <Badge 
                            className={`text-white ${getStatusColor(result.statusCode)}`}
                          >
                            {result.statusCode || "N/A"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Size: {result.contentLength ? `${result.contentLength} bytes` : "N/A"}</span>
                            <span>Type: {result.contentType || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Response: {result.responseTime}ms</span>
                            <span>Source: {result.source}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Dorking Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Dorking Sessions
                </CardTitle>
                <CardDescription>
                  {dorkingSessions.length} Google dorking sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {dorkingSessions.map((session) => (
                      <div key={session.id} className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{session.targetDomain}</span>
                          <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <FileText className="h-3 w-3" />
                            Type: {session.dorkType}
                          </div>
                          <div className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            Found: {session.resultsFound} results
                          </div>
                        </div>
                        <div className="font-mono text-xs p-2 bg-muted rounded">
                          {session.query}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}