from math import log
from models import AnalyzeResponse
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import os
import fitz  # PyMuPDF
import json
from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    tone: str = Form(...)
):
    contents = await resume.read()
    
    try:
        pdf_document = fitz.open(stream=contents, filetype="pdf")
        resume_text = ""
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            resume_text += page.get_text("text")
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise HTTPException(status_code=500, detail="Error processing the PDF file.")

    openai_api_key = os.getenv("OPENAI_API_KEY")
    openai_model = os.getenv("OPENAI_MODEL", "gpt-4.1-nano-2025-04-14")
    openai_base_url = os.getenv("OPENAI_BASE_URL")
    if not openai_api_key:
        logger.error("OpenAI API key not found.")
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")

    try:
        # Prepare client with/without base_url
        client_parameters = {"api_key": openai_api_key}
        if openai_base_url:
            client_parameters["base_url"] = openai_base_url
        client = OpenAI(**client_parameters)

        prompt = f"""
            You will be comparing a resume to a job description and providing detailed feedback and areas for improvement. Your response should be in markdown format.

            First, carefully read the following resume:

            <resume>
            {resume_text}
            </resume>

            Now, carefully read the job description:

            <job_description>
            {job_description}
            </job_description>

            Your tone should be: {tone}

            Compare the resume content with respect to the job description. Consider the following aspects:

            1. Skills match: How well do the candidate's skills align with the job requirements?
            2. Experience relevance: Is the candidate's experience relevant to the position?
            3. Education: Does the candidate's education meet the job requirements?
            4. Achievements: Are there notable achievements that are relevant to the role?
            5. Overall fit: How well does the candidate's profile match the job description?

            Provide a detailed analysis of these aspects, highlighting both strengths and weaknesses. Then, suggest specific areas for improvement that would make the resume more competitive for this particular job.

            Format your response in markdown, using appropriate headers, bullet points, and emphasis where necessary. Your response should include the following sections:

            1. ## Overall Assessment
            2. ## Strengths
            3. ## Areas for Improvement
            4. ## Specific Recommendations

            Begin your response with:

            <answer>

            [Your markdown-formatted response here]

            </answer>

            Ensure that your feedback is constructive, specific, and actionable. Provide examples from both the resume and job description to support your analysis.
            """

        chat_response = client.chat.completions.create(
                    model=openai_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    max_tokens=1500,
                )

        content = chat_response.choices[0].message.content.strip()

        # import json
        # try:
        #     parsed = json.loads(content)
        # except json.JSONDecodeError:
        #     logging.error("Failed to parse OpenAI response as JSON.")
        #     return JSONResponse(status_code=500, content={"detail": "Failed to parse OpenAI response."})

        return content

    except json.JSONDecodeError:
        logger.error("Failed to parse OpenAI response as JSON.")
        raise HTTPException(status_code=500, detail="Invalid response format from AI.")
    except Exception as e:
        logger.exception("Unexpected error during resume analysis.")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
