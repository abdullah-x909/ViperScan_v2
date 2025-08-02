import { 
  type User, 
  type InsertUser, 
  type HttpRequest, 
  type InsertHttpRequest,
  type Vulnerability,
  type InsertVulnerability,
  type ScanSession,
  type InsertScanSession,
  type FuzzerResult,
  type InsertFuzzerResult,
  type Tool,
  type InsertTool,
  type DirectoryResult,
  type InsertDirectoryResult,
  type DorkingSession,
  type InsertDorkingSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // HTTP Requests
  getAllHttpRequests(): Promise<HttpRequest[]>;
  getHttpRequest(id: string): Promise<HttpRequest | undefined>;
  createHttpRequest(request: InsertHttpRequest): Promise<HttpRequest>;
  updateHttpRequest(id: string, updates: Partial<HttpRequest>): Promise<HttpRequest | undefined>;
  deleteHttpRequest(id: string): Promise<boolean>;
  
  // Vulnerabilities
  getAllVulnerabilities(): Promise<Vulnerability[]>;
  getVulnerability(id: string): Promise<Vulnerability | undefined>;
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  
  // Scan Sessions
  getAllScanSessions(): Promise<ScanSession[]>;
  getScanSession(id: string): Promise<ScanSession | undefined>;
  createScanSession(session: InsertScanSession): Promise<ScanSession>;
  updateScanSession(id: string, updates: Partial<ScanSession>): Promise<ScanSession | undefined>;
  
  // Fuzzer Results
  getFuzzerResults(sessionId?: string): Promise<FuzzerResult[]>;
  createFuzzerResult(result: InsertFuzzerResult): Promise<FuzzerResult>;
  
  // Tools
  getAllTools(): Promise<Tool[]>;
  getTool(id: string): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, updates: Partial<Tool>): Promise<Tool | undefined>;
  
  // Directory Results
  getDirectoryResults(sessionId?: string): Promise<DirectoryResult[]>;
  createDirectoryResult(result: InsertDirectoryResult): Promise<DirectoryResult>;
  
  // Dorking Sessions
  getAllDorkingSessions(): Promise<DorkingSession[]>;
  getDorkingSession(id: string): Promise<DorkingSession | undefined>;
  createDorkingSession(session: InsertDorkingSession): Promise<DorkingSession>;
  updateDorkingSession(id: string, updates: Partial<DorkingSession>): Promise<DorkingSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private httpRequests: Map<string, HttpRequest>;
  private vulnerabilities: Map<string, Vulnerability>;
  private scanSessions: Map<string, ScanSession>;
  private fuzzerResults: Map<string, FuzzerResult>;
  private tools: Map<string, Tool>;
  private directoryResults: Map<string, DirectoryResult>;
  private dorkingSessions: Map<string, DorkingSession>;

  constructor() {
    this.users = new Map();
    this.httpRequests = new Map();
    this.vulnerabilities = new Map();
    this.scanSessions = new Map();
    this.fuzzerResults = new Map();
    this.tools = new Map();
    this.directoryResults = new Map();
    this.dorkingSessions = new Map();
    
    // Initialize with default tools and sample data
    this.initializeDefaultTools();
    this.initializeSampleData();
  }

  private initializeDefaultTools() {
    const defaultTools: Tool[] = [
      {
        id: randomUUID(),
        name: "SQLMap",
        description: "Automatic SQL injection and database takeover tool",
        category: "Database",
        command: "sqlmap",
        installed: true,
        version: "1.7.2",
        lastUsed: null,
      },
      {
        id: randomUUID(),
        name: "Nmap",
        description: "Network discovery and security auditing",
        category: "Network",
        command: "nmap",
        installed: true,
        version: "7.94",
        lastUsed: null,
      },
      {
        id: randomUUID(),
        name: "Nikto",
        description: "Web server and application vulnerability scanner",
        category: "Web",
        command: "nikto",
        installed: true,
        version: "2.5.0",
        lastUsed: null,
      },
      {
        id: randomUUID(),
        name: "DirSearch",
        description: "Web path scanner and directory brute forcer",
        category: "Web",
        command: "dirsearch",
        installed: true,
        version: "0.4.3",
        lastUsed: null,
      },
      {
        id: randomUUID(),
        name: "FFUF",
        description: "Fast web fuzzer written in Go",
        category: "Fuzzing",
        command: "ffuf",
        installed: true,
        version: "2.0.0",
        lastUsed: null,
      },
      {
        id: randomUUID(),
        name: "Wappalyzer",
        description: "Identify technologies used on websites",
        category: "Reconnaissance",
        command: "wappalyzer",
        installed: false,
        version: null,
        lastUsed: null,
      },
    ];

    defaultTools.forEach(tool => {
      this.tools.set(tool.id, tool);
    });
  }

  private initializeSampleData() {
    // Add sample HTTP requests
    const sampleRequests: HttpRequest[] = [
      {
        id: randomUUID(),
        method: "GET",
        url: "https://api.example.com/users",
        headers: { "Authorization": "Bearer token123", "Content-Type": "application/json" },
        body: null,
        timestamp: new Date(Date.now() - 60000),
        statusCode: 200,
        responseHeaders: { "Content-Type": "application/json", "Content-Length": "256" },
        responseBody: '{"users": [{"id": 1, "name": "John Doe"}]}',
        responseTime: 120,
        size: 256,
        intercepted: false,
      },
      {
        id: randomUUID(),
        method: "POST",
        url: "https://api.example.com/login",
        headers: { "Content-Type": "application/json" },
        body: '{"username": "admin", "password": "password123"}',
        timestamp: new Date(Date.now() - 30000),
        statusCode: 200,
        responseHeaders: { "Content-Type": "application/json", "Set-Cookie": "session=abc123" },
        responseBody: '{"success": true, "token": "eyJhbGci..."}',
        responseTime: 89,
        size: 145,
        intercepted: true,
      }
    ];

    sampleRequests.forEach(request => {
      this.httpRequests.set(request.id, request);
    });

    // Add sample vulnerabilities
    const sampleVulnerabilities: Vulnerability[] = [
      {
        id: randomUUID(),
        title: "SQL Injection in Login Form",
        description: "The login form is vulnerable to SQL injection attacks. An attacker can bypass authentication by injecting malicious SQL code.",
        severity: "critical",
        category: "Injection",
        url: "https://api.example.com/login",
        method: "POST",
        parameter: "username",
        payload: "' OR '1'='1' --",
        evidence: "HTTP/1.1 200 OK\nAuthentication successful for malicious payload",
        remediation: "Use parameterized queries and input validation. Implement proper authentication mechanisms.",
        cvssScore: 9,
        owaspCategory: "A03:2021 - Injection",
        timestamp: new Date(Date.now() - 120000),
      },
      {
        id: randomUUID(),
        title: "Cross-Site Scripting (XSS)",
        description: "Reflected XSS vulnerability in search parameter allows execution of arbitrary JavaScript code.",
        severity: "high",
        category: "XSS",
        url: "https://api.example.com/search",
        method: "GET",
        parameter: "q",
        payload: "<script>alert('XSS')</script>",
        evidence: "Script payload executed in browser context",
        remediation: "Implement proper input sanitization and output encoding. Use Content Security Policy (CSP).",
        cvssScore: 7,
        owaspCategory: "A03:2021 - Injection",
        timestamp: new Date(Date.now() - 90000),
      }
    ];

    sampleVulnerabilities.forEach(vulnerability => {
      this.vulnerabilities.set(vulnerability.id, vulnerability);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllHttpRequests(): Promise<HttpRequest[]> {
    return Array.from(this.httpRequests.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getHttpRequest(id: string): Promise<HttpRequest | undefined> {
    return this.httpRequests.get(id);
  }

  async createHttpRequest(insertRequest: InsertHttpRequest): Promise<HttpRequest> {
    const id = randomUUID();
    const request: HttpRequest = { 
      ...insertRequest, 
      id, 
      timestamp: new Date(),
      headers: insertRequest.headers || {},
      body: insertRequest.body || null,
      statusCode: insertRequest.statusCode || null,
      responseHeaders: insertRequest.responseHeaders || {},
      responseBody: insertRequest.responseBody || null,
      responseTime: insertRequest.responseTime || null,
      size: insertRequest.size || null,
      intercepted: insertRequest.intercepted || false,
    };
    this.httpRequests.set(id, request);
    return request;
  }

  async updateHttpRequest(id: string, updates: Partial<HttpRequest>): Promise<HttpRequest | undefined> {
    const existing = this.httpRequests.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.httpRequests.set(id, updated);
    return updated;
  }

  async deleteHttpRequest(id: string): Promise<boolean> {
    return this.httpRequests.delete(id);
  }

  async getAllVulnerabilities(): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getVulnerability(id: string): Promise<Vulnerability | undefined> {
    return this.vulnerabilities.get(id);
  }

  async createVulnerability(insertVulnerability: InsertVulnerability): Promise<Vulnerability> {
    const id = randomUUID();
    const vulnerability: Vulnerability = { 
      ...insertVulnerability, 
      id, 
      timestamp: new Date(),
      parameter: insertVulnerability.parameter || null,
      payload: insertVulnerability.payload || null,
      evidence: insertVulnerability.evidence || null,
      remediation: insertVulnerability.remediation || null,
      cvssScore: insertVulnerability.cvssScore || null,
      owaspCategory: insertVulnerability.owaspCategory || null,
    };
    this.vulnerabilities.set(id, vulnerability);
    return vulnerability;
  }

  async getAllScanSessions(): Promise<ScanSession[]> {
    return Array.from(this.scanSessions.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async getScanSession(id: string): Promise<ScanSession | undefined> {
    return this.scanSessions.get(id);
  }

  async createScanSession(insertSession: InsertScanSession): Promise<ScanSession> {
    const id = randomUUID();
    const session: ScanSession = { 
      ...insertSession, 
      id, 
      startTime: new Date(),
      endTime: null,
      status: insertSession.status || 'pending',
      progress: insertSession.progress || 0,
      vulnerabilitiesFound: insertSession.vulnerabilitiesFound || 0,
    };
    this.scanSessions.set(id, session);
    return session;
  }

  async updateScanSession(id: string, updates: Partial<ScanSession>): Promise<ScanSession | undefined> {
    const existing = this.scanSessions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.scanSessions.set(id, updated);
    return updated;
  }

  async getFuzzerResults(sessionId?: string): Promise<FuzzerResult[]> {
    let results = Array.from(this.fuzzerResults.values());
    if (sessionId) {
      results = results.filter(result => result.sessionId === sessionId);
    }
    return results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createFuzzerResult(insertResult: InsertFuzzerResult): Promise<FuzzerResult> {
    const id = randomUUID();
    const result: FuzzerResult = { 
      ...insertResult, 
      id, 
      timestamp: new Date(),
      statusCode: insertResult.statusCode || null,
      responseLength: insertResult.responseLength || null,
      responseTime: insertResult.responseTime || null,
      response: insertResult.response || null,
    };
    this.fuzzerResults.set(id, result);
    return result;
  }

  async getAllTools(): Promise<Tool[]> {
    return Array.from(this.tools.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTool(id: string): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = randomUUID();
    const tool: Tool = { 
      ...insertTool, 
      id,
      installed: insertTool.installed || false,
      version: insertTool.version || null,
      lastUsed: insertTool.lastUsed || null,
    };
    this.tools.set(id, tool);
    return tool;
  }

  async updateTool(id: string, updates: Partial<Tool>): Promise<Tool | undefined> {
    const existing = this.tools.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.tools.set(id, updated);
    return updated;
  }

  // Directory Results methods
  async getDirectoryResults(sessionId?: string): Promise<DirectoryResult[]> {
    let results = Array.from(this.directoryResults.values());
    if (sessionId) {
      results = results.filter(result => result.sessionId === sessionId);
    }
    return results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createDirectoryResult(insertResult: InsertDirectoryResult): Promise<DirectoryResult> {
    const id = randomUUID();
    const result: DirectoryResult = {
      ...insertResult,
      id,
      timestamp: new Date(),
      statusCode: insertResult.statusCode || null,
      contentLength: insertResult.contentLength || null,
      contentType: insertResult.contentType || null,
      responseTime: insertResult.responseTime || null,
      method: insertResult.method || "GET",
    };
    this.directoryResults.set(id, result);
    return result;
  }

  // Dorking Sessions methods
  async getAllDorkingSessions(): Promise<DorkingSession[]> {
    return Array.from(this.dorkingSessions.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getDorkingSession(id: string): Promise<DorkingSession | undefined> {
    return this.dorkingSessions.get(id);
  }

  async createDorkingSession(insertSession: InsertDorkingSession): Promise<DorkingSession> {
    const id = randomUUID();
    const session: DorkingSession = {
      ...insertSession,
      id,
      timestamp: new Date(),
      status: insertSession.status || "pending",
      resultsFound: insertSession.resultsFound || 0,
    };
    this.dorkingSessions.set(id, session);
    return session;
  }

  async updateDorkingSession(id: string, updates: Partial<DorkingSession>): Promise<DorkingSession | undefined> {
    const existing = this.dorkingSessions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.dorkingSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
