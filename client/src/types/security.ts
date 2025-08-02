export interface HttpRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: Date;
  statusCode?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  responseTime?: number;
  size?: number;
  intercepted: boolean;
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  url: string;
  method: string;
  parameter?: string;
  payload?: string;
  evidence?: string;
  remediation?: string;
  cvssScore?: number;
  owaspCategory?: string;
  timestamp: Date;
}

export interface ScanSession {
  id: string;
  targetUrl: string;
  profile: string;
  status: string;
  progress: number;
  startTime: Date;
  endTime?: Date;
  vulnerabilitiesFound: number;
}

export interface FuzzerResult {
  id: string;
  sessionId: string;
  payload: string;
  url: string;
  statusCode?: number;
  responseLength?: number;
  responseTime?: number;
  response?: string;
  timestamp: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  command: string;
  installed: boolean;
  version?: string;
  lastUsed?: Date;
}
