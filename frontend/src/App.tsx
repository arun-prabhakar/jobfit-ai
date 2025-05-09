import { useState } from 'react';
import './App.css';
import ResumeForm from '@/components/ResumeForm';
import ResultViewer from '@/components/ResultViewer';
import { ThemeProvider } from '@/components/ThemeProvider';

function App() {
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ThemeProvider defaultTheme="light" storageKey="resume-analyzer-theme">
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container flex h-16 items-center">
            <h1 className="text-2xl font-bold">JobFit AI</h1>
          </div>
        </header>
        <main className="container py-12">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3">
              <ResumeForm 
                onAnalysisComplete={setMarkdownResult} 
                setIsLoading={setIsLoading}
                setError={setError}
              />
            </div>
            <div className="w-full lg:w-2/3">
              <ResultViewer 
                markdownContent={markdownResult} 
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;