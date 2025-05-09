import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";

interface MarkdownProps {
  content: string;
}

interface ScoreBreakdown {
  overall_score?: string;
  technical_skills?: string;
  soft_skills?: string;
  experience_alignment?: string;
}

export function Markdown({ content }: MarkdownProps) {
  const lines = content.split("\n").map((line) => line.trim());

  let section_feedback = "";
  const score_breakdown: ScoreBreakdown = {};
  const keyword_gap = { missing: [] as string[], weak: "" };
  const ats_feedback = { compatible: false, issues: "" };

  let currentSection = "";

  for (const line of lines) {
    if (line.startsWith("- section_feedback:")) {
      currentSection = "section_feedback";
      continue;
    }
    if (line.startsWith("- keyword_gap:")) {
      currentSection = "keyword_gap";
      continue;
    }
    if (line.startsWith("- score_breakdown:")) {
      currentSection = "score_breakdown";
      continue;
    }
    if (line.startsWith("- ats_feedback:")) {
      currentSection = "ats_feedback";
      continue;
    }

    if (line.startsWith("- ")) {
      const [rawKey, ...rest] = line.replace("- ", "").split(": ");
      const value = rest.join(": ");

      switch (currentSection) {
        case "score_breakdown":
          score_breakdown[rawKey as keyof ScoreBreakdown] = value;
          break;
        case "keyword_gap":
          if (rawKey === "missing_keywords") {
            keyword_gap.missing = value.replace(/'/g, "").split(", ");
          } else if (rawKey === "weak_keywords") {
            keyword_gap.weak = value.replace(/'/g, "");
          }
          break;
        case "ats_feedback":
          if (rawKey === "ATS_compatible") {
            ats_feedback.compatible = value === "True";
          } else if (rawKey === "issues") {
            ats_feedback.issues = value;
          }
          break;
        default:
          break;
      }
    } else if (currentSection === "section_feedback") {
      section_feedback += line + "\n";
    }
  }

  const getScoreColor = (score?: string) => {
    const value = parseInt(score || "0");
    if (value >= 90) return "bg-green-500";
    if (value >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(score_breakdown).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{key.replace(/_/g, " ")}</span>
                <span className="font-medium">{value}</span>
              </div>
              <Progress value={parseInt(value || "0")} className={getScoreColor(value)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactMarkdown className="prose whitespace-pre-wrap">{section_feedback}</ReactMarkdown>
        </CardContent>
      </Card>

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {keyword_gap.missing.map((keyword) => (
                  <span key={keyword} className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Weak Keywords</h4>
              <p className="text-muted-foreground">{keyword_gap.weak || "None"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ATS Compatibility */}
      <Card>
        <CardHeader>
          <CardTitle>ATS Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                ats_feedback.compatible ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="font-medium">
              {ats_feedback.compatible ? "ATS Compatible" : "Not ATS Compatible"}
            </span>
          </div>
          {ats_feedback.issues !== "None" && (
            <p className="mt-2 text-muted-foreground">{ats_feedback.issues}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
