import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertHttpRequestSchema, insertVulnerabilitySchema, insertScanSessionSchema, insertFuzzerResultSchema, insertDirectoryResultSchema, insertDorkingSessionSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws'  // Use specific path to avoid conflict with Vite WebSocket
  });

  // WebSocket for real-time updates
  wss.on('connection', (ws) => {
    console.log('ViperScan WebSocket client connected');
    
    ws.on('close', () => {
      console.log('ViperScan WebSocket client disconnected');
    });
  });

  // Broadcast to all connected clients
  function broadcast(data: any) {
    wss.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // HTTP Requests endpoints
  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await storage.getAllHttpRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.get("/api/requests/:id", async (req, res) => {
    try {
      const request = await storage.getHttpRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch request" });
    }
  });

  app.post("/api/requests", async (req, res) => {
    try {
      const validatedRequest = insertHttpRequestSchema.parse(req.body);
      const request = await storage.createHttpRequest(validatedRequest);
      
      // Broadcast new request to all clients
      broadcast({ type: 'new_request', data: request });
      
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.patch("/api/requests/:id", async (req, res) => {
    try {
      const updates = req.body;
      const request = await storage.updateHttpRequest(req.params.id, updates);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  app.delete("/api/requests/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteHttpRequest(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete request" });
    }
  });

  // Vulnerabilities endpoints
  app.get("/api/vulnerabilities", async (req, res) => {
    try {
      const vulnerabilities = await storage.getAllVulnerabilities();
      res.json(vulnerabilities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vulnerabilities" });
    }
  });

  app.post("/api/vulnerabilities", async (req, res) => {
    try {
      const validatedVulnerability = insertVulnerabilitySchema.parse(req.body);
      const vulnerability = await storage.createVulnerability(validatedVulnerability);
      
      // Broadcast new vulnerability to all clients
      broadcast({ type: 'new_vulnerability', data: vulnerability });
      
      res.status(201).json(vulnerability);
    } catch (error) {
      res.status(400).json({ message: "Invalid vulnerability data" });
    }
  });

  // Scan sessions endpoints
  app.get("/api/scans", async (req, res) => {
    try {
      const sessions = await storage.getAllScanSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scan sessions" });
    }
  });

  app.post("/api/scans", async (req, res) => {
    try {
      const validatedSession = insertScanSessionSchema.parse(req.body);
      const session = await storage.createScanSession(validatedSession);
      
      // Simulate scan progress
      setTimeout(async () => {
        for (let progress = 0; progress <= 100; progress += 10) {
          await storage.updateScanSession(session.id, { progress });
          broadcast({ type: 'scan_progress', data: { sessionId: session.id, progress } });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        await storage.updateScanSession(session.id, { 
          status: 'completed', 
          endTime: new Date(),
          vulnerabilitiesFound: Math.floor(Math.random() * 10) + 1
        });
        
        broadcast({ type: 'scan_completed', data: { sessionId: session.id } });
      }, 1000);
      
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid scan session data" });
    }
  });

  // Fuzzer results endpoints
  app.get("/api/fuzzer/results", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      const results = await storage.getFuzzerResults(sessionId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fuzzer results" });
    }
  });

  app.post("/api/fuzzer/start", async (req, res) => {
    try {
      const { url, payloads, sessionId } = req.body;
      
      // Simulate fuzzing process
      setTimeout(async () => {
        for (let i = 0; i < payloads.length; i++) {
          const payload = payloads[i];
          const statusCode = Math.random() > 0.7 ? 200 : Math.random() > 0.5 ? 404 : 403;
          const responseTime = Math.floor(Math.random() * 500) + 50;
          const responseLength = Math.floor(Math.random() * 5000) + 100;
          
          const result = await storage.createFuzzerResult({
            sessionId,
            payload,
            url: url.replace('§FUZZ§', payload),
            statusCode,
            responseTime,
            responseLength,
            response: `{"message": "Response for ${payload}"}`,
          });
          
          broadcast({ type: 'fuzzer_result', data: result });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }, 1000);
      
      res.json({ message: "Fuzzing started", sessionId });
    } catch (error) {
      res.status(500).json({ message: "Failed to start fuzzing" });
    }
  });

  // Tools endpoints
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getAllTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.post("/api/tools/:id/run", async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }

      // Update last used timestamp
      await storage.updateTool(req.params.id, { lastUsed: new Date() });

      // Simulate tool execution
      setTimeout(() => {
        const output = generateMockToolOutput(tool.name);
        broadcast({ type: 'tool_output', data: { toolName: tool.name, output } });
      }, 1000);

      res.json({ message: `Started ${tool.name}` });
    } catch (error) {
      res.status(500).json({ message: "Failed to run tool" });
    }
  });

  // Mock proxy intercept endpoint
  app.post("/api/proxy/intercept", async (req, res) => {
    try {
      const { enabled } = req.body;
      broadcast({ type: 'proxy_intercept', data: { enabled } });
      res.json({ message: `Proxy intercept ${enabled ? 'enabled' : 'disabled'}` });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle proxy intercept" });
    }
  });

  // Directory enumeration endpoints
  app.get("/api/directory/results", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      const results = await storage.getDirectoryResults(sessionId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch directory results" });
    }
  });

  app.post("/api/directory/scan", async (req, res) => {
    try {
      const { targetUrl, tool, wordlist } = req.body;
      const sessionId = randomUUID();
      
      // Mock directory enumeration results
      setTimeout(async () => {
        const mockPaths = ["/admin", "/backup", "/config", "/test", "/uploads", "/api", "/dev", "/robots.txt", "/.htaccess"];
        
        for (const path of mockPaths) {
          const statusCode = Math.random() > 0.7 ? 200 : 404;
          if (statusCode === 200) {
            const result = await storage.createDirectoryResult({
              sessionId,
              targetUrl,
              foundPath: path,
              statusCode,
              contentLength: Math.floor(Math.random() * 5000) + 100,
              contentType: "text/html",
              responseTime: Math.floor(Math.random() * 200) + 50,
              source: tool || "dirb",
            });
            broadcast({ type: 'directory_result', data: result });
          }
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }, 1000);
      
      res.json({ message: "Directory scan started", sessionId });
    } catch (error) {
      res.status(500).json({ message: "Failed to start directory scan" });
    }
  });

  // Google dorking endpoints
  app.get("/api/dorking/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllDorkingSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dorking sessions" });
    }
  });

  app.post("/api/dorking/scan", async (req, res) => {
    try {
      const { targetDomain, dorkType, customQuery } = req.body;
      
      // Predefined Google dorks for different categories
      const dorkQueries = {
        files: `site:${targetDomain} filetype:pdf OR filetype:doc OR filetype:xls`,
        directories: `site:${targetDomain} intitle:"index of"`,
        subdomains: `site:*.${targetDomain}`,
        sensitive: `site:${targetDomain} intext:"password" OR intext:"username" OR intext:"login"`,
        custom: customQuery || ""
      };
      
      const query = dorkQueries[dorkType as keyof typeof dorkQueries] || customQuery;
      
      const session = await storage.createDorkingSession({
        targetDomain,
        dorkType,
        query,
        status: "running",
      });
      
      // Mock results generation
      setTimeout(async () => {
        const mockResults = generateMockDorkResults(dorkType, targetDomain);
        
        for (const result of mockResults) {
          await storage.createDirectoryResult({
            sessionId: session.id,
            targetUrl: result.url,
            foundPath: result.path,
            statusCode: 200,
            contentType: result.type,
            source: "google_dork",
          });
        }
        
        await storage.updateDorkingSession(session.id, {
          status: "completed",
          resultsFound: mockResults.length,
        });
        
        broadcast({ type: 'dorking_complete', data: { sessionId: session.id, resultsFound: mockResults.length } });
      }, 2000);
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to start Google dorking" });
    }
  });

  return httpServer;
}

function generateMockToolOutput(toolName: string): string[] {
  const outputs: Record<string, string[]> = {
    "SQLMap": [
      "[*] Starting SQLMap scan...",
      "[INFO] testing connection to the target URL",
      "[INFO] checking if the target is protected by some kind of WAF/IPS",
      "[WARNING] heuristic (basic) test shows that GET parameter 'id' might be injectable",
      "[CRITICAL] SQL injection vulnerability detected!",
      "[INFO] the back-end DBMS is MySQL",
      "[*] Scan completed successfully"
    ],
    "Nmap": [
      "Starting Nmap 7.94 scan...",
      "Scanning 192.168.1.1",
      "Host is up (0.0021s latency).",
      "22/tcp   open  ssh",
      "80/tcp   open  http",
      "443/tcp  open  https",
      "Scan completed in 2.34 seconds"
    ],
    "Nikto": [
      "- Nikto v2.5.0 starting...",
      "+ Target IP: 192.168.1.1",
      "+ Target Hostname: example.com",
      "+ Start Time: 2024-01-15 14:32:15",
      "+ Server: nginx/1.20.1",
      "+ OSVDB-3092: /admin/: This might be interesting...",
      "+ OSVDB-3268: /config/: Directory indexing found.",
      "+ Scan completed."
    ],
    "DirSearch": [
      "Extensions: php, html, js | HTTP method: GET",
      "Threads: 30 | Wordlist size: 8918",
      "Target: https://example.com/",
      "[14:32:15] 200 -    1KB - /admin",
      "[14:32:16] 200 -    2KB - /config",
      "[14:32:17] 403 -  567B  - /backup",
      "[14:32:18] 200 -    3KB - /dashboard",
      "Task Completed"
    ],
    "FFUF": [
      "        /'___\\  /'___\\           /'___\\",
      "       /\\ \\__/ /\\ \\__/  __  __  /\\ \\__/",
      "       \\ \\ ,__\\\\ \\ ,__\\/\\ \\/\\ \\ \\ \\ ,__\\",
      "        \\ \\ \\_/ \\ \\ \\_/\\ \\ \\_\\ \\ \\ \\ \\_/",
      "         \\ \\_\\   \\ \\_\\  \\ \\____/  \\ \\_\\",
      "          \\/_/    \\/_/   \\/___/    \\/_/",
      "admin                   [Status: 200, Size: 1234, Words: 89, Lines: 45]",
      "config                  [Status: 200, Size: 2345, Words: 123, Lines: 67]",
      ":: Progress: [4612/4612] :: Job [1/1] :: 892 req/sec :: Duration: [0:00:05] :: Errors: 0 ::"
    ]
  };

  return outputs[toolName] || [`[*] Running ${toolName}...`, "[*] Process completed"];
}

function generateMockDorkResults(dorkType: string, domain: string) {
  const baseUrl = `https://${domain}`;
  
  switch (dorkType) {
    case 'files':
      return [
        { url: `${baseUrl}/documents/manual.pdf`, path: '/documents/manual.pdf', type: 'application/pdf' },
        { url: `${baseUrl}/reports/2024-annual-report.doc`, path: '/reports/2024-annual-report.doc', type: 'application/msword' },
        { url: `${baseUrl}/data/customer-list.xls`, path: '/data/customer-list.xls', type: 'application/vnd.ms-excel' },
        { url: `${baseUrl}/backup/database-backup.sql`, path: '/backup/database-backup.sql', type: 'text/plain' }
      ];
    
    case 'directories':
      return [
        { url: `${baseUrl}/uploads/`, path: '/uploads/', type: 'text/html' },
        { url: `${baseUrl}/temp/`, path: '/temp/', type: 'text/html' },
        { url: `${baseUrl}/cache/`, path: '/cache/', type: 'text/html' },
        { url: `${baseUrl}/logs/`, path: '/logs/', type: 'text/html' }
      ];
    
    case 'subdomains':
      return [
        { url: `https://api.${domain}`, path: '/', type: 'application/json' },
        { url: `https://admin.${domain}`, path: '/', type: 'text/html' },
        { url: `https://dev.${domain}`, path: '/', type: 'text/html' },
        { url: `https://staging.${domain}`, path: '/', type: 'text/html' }
      ];
    
    case 'sensitive':
      return [
        { url: `${baseUrl}/config/database.php`, path: '/config/database.php', type: 'text/plain' },
        { url: `${baseUrl}/admin/login.php`, path: '/admin/login.php', type: 'text/html' },
        { url: `${baseUrl}/.env`, path: '/.env', type: 'text/plain' },
        { url: `${baseUrl}/backup/credentials.txt`, path: '/backup/credentials.txt', type: 'text/plain' }
      ];
    
    default:
      return [
        { url: `${baseUrl}/info`, path: '/info', type: 'text/html' },
        { url: `${baseUrl}/status`, path: '/status', type: 'text/html' }
      ];
  }
}
