import { ScrollArea } from "@/components/ui/scroll-area";

interface SyntaxHighlightProps {
  code: string;
  language?: string;
  className?: string;
}

export default function SyntaxHighlight({ code, language = 'text', className = '' }: SyntaxHighlightProps) {
  const highlightCode = (text: string) => {
    if (language === 'http') {
      return text.split('\n').map((line, index) => {
        let highlightedLine = line;
        
        // HTTP methods
        highlightedLine = highlightedLine.replace(
          /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s/,
          '<span class="method">$1</span> '
        );
        
        // URLs
        highlightedLine = highlightedLine.replace(
          /(https?:\/\/[^\s]+|\/[^\s]*)/g,
          '<span class="url">$1</span>'
        );
        
        // HTTP headers
        highlightedLine = highlightedLine.replace(
          /^([A-Za-z-]+):\s*(.+)$/,
          '<span class="header">$1:</span> <span class="value">$2</span>'
        );
        
        // Status codes
        highlightedLine = highlightedLine.replace(
          /HTTP\/[\d.]+\s+(\d+)/,
          'HTTP/1.1 <span class="status">$1</span>'
        );
        
        return (
          <div key={index} dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
        );
      });
    }
    
    // JSON highlighting
    if (language === 'json') {
      return text.split('\n').map((line, index) => {
        let highlightedLine = line;
        
        // Keys
        highlightedLine = highlightedLine.replace(
          /"([^"]+)":/g,
          '<span class="header">"$1"</span>:'
        );
        
        // String values
        highlightedLine = highlightedLine.replace(
          /:\s*"([^"]*)"/g,
          ': <span class="value">"$1"</span>'
        );
        
        // Numbers
        highlightedLine = highlightedLine.replace(
          /:\s*(\d+)/g,
          ': <span class="status">$1</span>'
        );
        
        return (
          <div key={index} dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
        );
      });
    }
    
    // Default: no highlighting
    return text.split('\n').map((line, index) => (
      <div key={index}>{line || '\u00A0'}</div>
    ));
  };

  return (
    <ScrollArea className={`h-full ${className}`}>
      <div className="p-3 font-mono text-sm syntax-highlight text-gray-100 viper-bg-darker rounded">
        {highlightCode(code)}
      </div>
    </ScrollArea>
  );
}
