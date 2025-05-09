import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ResultViewerProps {
  markdownContent: any | null;
  isLoading: boolean;
  error: string | null;
}

export default function ResultViewer({ markdownContent, isLoading, error }: ResultViewerProps) {
  
  function extractMarkdownAnswer(raw: string): string {
    const match = raw.match(/<answer>([\s\S]*?)<\/answer>/);
    let markdown = match ? match[1].trim() : raw;
  
    markdown = markdown.replace(/\\n/g, "\n");

    markdown = markdown.replace(/^#{1,6}\s+(.*)$/gm, '\n***$1***\n');
    

    return markdown;
  }
  
  const formattedMarkdown = markdownContent ? extractMarkdownAnswer(markdownContent) : "";

  return (
    <Card className="w-full h-full min-h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>
          Review feedback on how well your resume matches the job description.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 flex-1 overflow-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-[90%] h-6" />
            <Skeleton className="w-[80%] h-6" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-36" />
          </div>
        ) : markdownContent ? (
          <div className="animate-fade-in overflow-auto max-h-[60vh]">
            <ReactMarkdown className="prose max-w-none">{formattedMarkdown}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-center">
              Upload your resume and add a job description to see the analysis results here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
