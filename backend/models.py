from pydantic import BaseModel
from typing import List, Optional

class KeywordGap(BaseModel):
    missing_keywords: List[str]
    weak_keywords: List[str]

class ScoreBreakdown(BaseModel):
    overall_score: int
    technical_skills: int
    soft_skills: int
    experience_alignment: int

class ATSFeedback(BaseModel):
    compatible: bool
    issues: List[str]

class SectionFeedbackItem(BaseModel):
    section: str
    feedback: str

class AnalyzeResponse(BaseModel):
    section_feedback: List[SectionFeedbackItem]
    keyword_gap: KeywordGap
    score_breakdown: ScoreBreakdown
    ats_feedback: ATSFeedback

class AnalyzeRequest(BaseModel):
    resume: str
    job_description: str
    tone: str