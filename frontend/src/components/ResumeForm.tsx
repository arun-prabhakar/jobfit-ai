import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";
import { useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResumeFormProps {
  onAnalysisComplete: (result: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const formSchema = z.object({
  jobDescription: z.string().min(10, {
    message: "Job description must be at least 10 characters.",
  }),
  tone: z.enum(["professional", "friendly", "critical"], {
    required_error: "Please select a tone for the analysis.",
  }),
});

export default function ResumeForm({ onAnalysisComplete, setIsLoading, setError }: ResumeFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
      tone: "professional",
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setResumeFile(file);
      } else {
        setError("Please upload a PDF file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setResumeFile(file);
        setError(null);
      } else {
        setError("Please upload a PDF file");
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!resumeFile) {
      setError("Please upload a resume PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", values.jobDescription);
      formData.append("tone", values.tone);

      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.text();
      onAnalysisComplete(result);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload & Analyze Your Resume</CardTitle>
        <CardDescription>
          Compare your resume against a job description to see how well it matches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">Upload your resume</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PDF files only (max 10MB)
              </p>
              {resumeFile && (
                <div className="mt-4 p-2 bg-secondary rounded flex items-center justify-center">
                  <span className="text-sm font-medium">{resumeFile.name}</span>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Paste the job description here..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The analyzer will compare your resume with this job description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

<FormField
  control={form.control}
  name="tone"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Analysis Tone</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="professional">Professional</SelectItem>
          <SelectItem value="friendly">Friendly</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>
      <FormDescription>
        Select how direct the feedback should be.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

            <Button type="submit" className="w-full">
              Analyze Resume
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}