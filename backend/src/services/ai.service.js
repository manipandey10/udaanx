const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// Zod Schema
const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),

    technicalquestion: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    behavioralquestion: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    skillgap: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"])
        })
    ),

    preparationplan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.string()
        })
    ),

    title: z.string().describe("Title of the interview report"),
}).strict();

// JSON Schema for Gemini
const interviewReportJsonSchema = {
    type: "object",
    properties: {
        matchScore: { type: "number" },

        technicalquestion: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
                },
                required: ["question", "intention", "answer"]
            }
        },

        behavioralquestion: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
                },
                required: ["question", "intention", "answer"]
            }
        },

        skillgap: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string" },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"]
                    }
                },
                required: ["skill", "severity"]
            }
        },

        preparationplan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "number" },
                    focus: { type: "string" },
                    tasks: { type: "string" }
                },
                required: ["day", "focus", "tasks"]
            }
        },
        title: { type: "string"}
    },
    required: [
        "matchScore",
        "technicalquestion",
        "behavioralquestion",
        "skillgap",
        "preparationplan",
        "title"
    ]
};

async function generateinterviewreport({
    resume,
    selfdescription,
    jobdescription
}) {
    
const prompt = `
You are an expert Technical Interviewer, Senior Software Engineer,
HR Interviewer, Career Coach, and Recruitment Analyst.

Your task is to generate a highly personalized, professional,
accurate, and actionable Interview Preparation Report for a
candidate using THREE inputs:

1. Candidate Resume
2. Candidate Self Description
3. Target Job Description

You must carefully analyze all three inputs before generating
the interview report.

===============================
CANDIDATE INFORMATION
===============================

RESUME:
${resume}

SELF DESCRIPTION:
${selfdescription}

JOB DESCRIPTION:
${jobdescription}

===============================
YOUR ANALYSIS PROCESS
===============================

STEP 1: UNDERSTAND THE CANDIDATE

Analyze the resume and identify:
- Educational background
- Technical skills
- Programming languages
- Frameworks and technologies
- Projects and practical experience
- Internships and work experience
- Certifications
- Strengths and weaknesses
- Actual experience level

Analyze the self-description to understand:
- Candidate's communication ability
- Career interests
- Technical confidence
- Professional goals
- Personal strengths
- Areas where the candidate needs improvement

Do not assume that a candidate knows a technology simply
because it is mentioned in the resume.

STEP 2: ANALYZE THE JOB DESCRIPTION

Identify:
- Required technical skills
- Preferred technical skills
- Programming languages
- Frameworks and tools
- Core concepts
- Job responsibilities
- Expected experience level
- Important interview topics

Identify which requirements match the candidate's profile
and which requirements are missing or insufficiently demonstrated.

STEP 3: CALCULATE MATCH SCORE

Generate a realistic matchScore between 0 and 100.

Consider:
- Technical skill compatibility
- Relevant project experience
- Educational qualifications
- Required technologies
- Practical experience
- Job responsibilities compatibility

Do not give an artificially high score.

The score must reflect how closely the candidate's actual
profile matches the target job description.

===============================
TECHNICAL INTERVIEW QUESTIONS
===============================

Generate EXACTLY 20 highly relevant technical interview questions.

These questions must be selected based on:
- The candidate's resume
- The target job description
- Required technical skills
- Candidate's projects
- Candidate's experience level

IMPORTANT QUESTION SELECTION RULES:

1. Prioritize the most important concepts asked in real
   technical interviews.

2. Focus on technologies and skills directly related to
   the target job.

3. Include fundamental, intermediate, and advanced questions
   according to the candidate's experience level.

4. Include questions related to the candidate's projects
   whenever relevant.

5. Include practical, scenario-based and problem-solving
   questions wherever appropriate.

6. Avoid irrelevant, repetitive, generic or unnecessarily
   difficult questions.

7. Do not generate questions about technologies that have
   no meaningful connection to the resume or job description.

8. Questions should test actual understanding rather than
   simple memorization.

FOR EACH TECHNICAL QUESTION, PROVIDE:

- question: A clear, realistic interview question.
- intention: Explain what the interviewer wants to evaluate
  by asking this question.
- answer: Provide a technically accurate, detailed but
  easy-to-understand model answer.

ANSWER REQUIREMENTS:

- Answers must be suitable for actual job interviews.
- Explain concepts in simple professional English.
- Include examples wherever useful.
- Include code snippets or practical examples when relevant.
- Answers should demonstrate conceptual understanding.
- Avoid unnecessarily long textbook explanations.
- Never provide incorrect or fabricated technical information.

Generate exactly 20 objects in technicalquestion.


QUESTION PRESENTATION FORMAT:

Every question must be generated as a separate,
well-structured interview preparation item.

For EVERY technical and behavioral question,
use these three clearly distinguishable fields:

1. Question:
   Write the complete interview question.

2. Intention:
   Explain why the interviewer asks this question
   and what knowledge, skill or quality they want
   to evaluate in the candidate.

3. Answer:
   Provide a detailed, accurate, personalized and
   easy-to-understand model answer.

IMPORTANT PRESENTATION RULES:

- Keep Question, Intention and Answer clearly separated.
- Never combine all three into one paragraph.
- Use simple, professional English.
- Make answers readable and well-organized.
- Use examples wherever useful.
- Avoid unnecessary lengthy explanations.
- Every question must have all three fields.
- Maintain this exact order:
  Question → Intention → Answer.

The frontend will display these fields with separate
labels and sections.

Do not change the JSON property names.


===============================
BEHAVIORAL INTERVIEW QUESTIONS
===============================

Generate EXACTLY 20 important behavioral interview questions.

These questions must be personalized using the candidate's
resume, self-description, experience and target job role.

Include relevant questions from areas such as:

- Self introduction
- Career motivation
- Strengths and weaknesses
- Problem-solving ability
- Teamwork and collaboration
- Leadership
- Communication skills
- Handling difficult situations
- Conflict management
- Time management
- Adaptability
- Learning new technologies
- Handling failures
- Project challenges
- Decision-making
- Career goals
- Working under pressure
- Handling feedback
- Professional attitude
- Role-specific behavioral situations

IMPORTANT:

1. Do not generate 20 generic HR questions.
2. Connect questions to the candidate's actual projects,
   internships, education and experiences wherever possible.
3. Questions should resemble those asked by real HR managers
   and hiring managers.
4. Avoid duplicate questions.
5. Make questions appropriate for the candidate's experience.

FOR EACH BEHAVIORAL QUESTION, PROVIDE:

- question: A realistic behavioral interview question.
- intention: Explain what the interviewer wants to understand
  about the candidate.
- answer: Provide a strong, natural and professional sample
  answer that the candidate can use as a preparation reference.

BEHAVIORAL ANSWER REQUIREMENTS:

- Use simple and natural professional English.
- Prefer the STAR method (Situation, Task, Action, Result)
  wherever appropriate.
- Make answers specific to the candidate's background.
- Use real resume information when available.
- Never invent companies, internships, achievements,
  responsibilities, awards or project results.
- If personal information is missing, provide an adaptable
  sample answer without pretending it is a real experience.
- Answers should sound natural, confident and interview-ready.

Generate exactly 20 objects in behavioralquestion.


QUESTION PRESENTATION FORMAT:

Every question must be generated as a separate,
well-structured interview preparation item.

For EVERY technical and behavioral question,
use these three clearly distinguishable fields:

1. Question:
   Write the complete interview question.

2. Intention:
   Explain why the interviewer asks this question
   and what knowledge, skill or quality they want
   to evaluate in the candidate.

3. Answer:
   Provide a detailed, accurate, personalized and
   easy-to-understand model answer.

IMPORTANT PRESENTATION RULES:

- Keep Question, Intention and Answer clearly separated.
- Never combine all three into one paragraph.
- Use simple, professional English.
- Make answers readable and well-organized.
- Use examples wherever useful.
- Avoid unnecessary lengthy explanations.
- Every question must have all three fields.
- Maintain this exact order:
  Question → Intention → Answer.

The frontend will display these fields with separate
labels and sections.

Do not change the JSON property names.


===============================
SKILL GAP ANALYSIS
===============================

Identify the important skills that the candidate needs
to improve to become suitable for the target job.

Compare the candidate's demonstrated skills with the
requirements of the job description.

Identify gaps in:
- Programming languages
- Frameworks and technologies
- Technical fundamentals
- Data structures and algorithms, if relevant
- Database knowledge, if relevant
- Tools and development practices
- Communication and problem-solving, if relevant
- Role-specific technical knowledge

For every skill gap, provide:

- skill: Name of the missing or insufficiently demonstrated skill.
- severity: Assign exactly one of these values:

  high: Essential job requirement that is missing or
  significantly weak.

  medium: Important skill that needs improvement.

  low: Additional skill or minor improvement area.

IMPORTANT:

- Only identify meaningful skill gaps.
- Do not list skills the candidate has already demonstrated
  strong knowledge of as missing.
- Do not invent weaknesses without evidence.
- Prioritize gaps according to job requirements.
- Keep skill names specific and actionable.

===============================
10-DAY PREPARATION PLAN
===============================

Create an EXACTLY 10-day personalized interview preparation plan.

The plan must help the candidate prepare for the target job
and improve the identified skill gaps.

Each day must have:

- day: Integer from 1 to 10.
- focus: The main topic or skill to study that day.
- tasks: Specific and actionable preparation activities.

PREPARATION PLAN REQUIREMENTS:

Day 1:
Understand the job role, analyze important requirements
and revise technical fundamentals.

Days 2-3:
Focus on essential technical concepts and programming
fundamentals required by the job.

Days 4-5:
Practice important technologies, frameworks, databases
or other role-specific skills.

Day 6:
Prepare resume-based questions, projects and practical
technical explanations.

Day 7:
Practice coding, problem-solving or technical scenarios
where relevant to the role.

Day 8:
Prepare behavioral questions, communication and
self-introduction.

Day 9:
Practice a complete technical and HR mock interview.
Revise weak areas.

Day 10:
Final revision, important questions, confidence building
and interview simulation.

IMPORTANT:

- Personalize the plan according to the actual job description.
- Give specific tasks instead of vague instructions.
- Prioritize high-severity skill gaps.
- Make the workload realistic for a student or fresher.
- Include practical exercises wherever relevant.
- Every day must have meaningful preparation activities.
- Do not repeat the same tasks across multiple days.

Generate exactly 10 objects in preparationplan.

===============================
REPORT TITLE
===============================

Generate a short, professional and meaningful title
for the interview report.

The title should reflect the candidate's target job role.

===============================
FINAL OUTPUT RULES
===============================

1. Return ONLY valid JSON.
2. Follow the provided JSON schema EXACTLY.
3. Do not add explanations outside the JSON.
4. Do not use Markdown formatting or code fences.
5. Do not add extra properties.
6. Do not change any property names.
7. All required fields must be present.
8. Use the exact property names:
   - matchScore
   - technicalquestion
   - behavioralquestion
   - skillgap
   - preparationplan
   - title

9. technicalquestion must contain EXACTLY 20 objects.
10. behavioralquestion must contain EXACTLY 20 objects.
11. preparationplan must contain EXACTLY 10 objects.
12. Every question must contain question, intention and answer.
13. Every skill gap must contain skill and severity.
14. Every preparation day must contain day, focus and tasks.
15. matchScore must be a number between 0 and 100.
16. severity must only be "low", "medium" or "high".
17. Never return null or missing values.
18. Ensure all JSON strings are properly escaped.
19. Ensure the output is valid JSON and can be parsed
    directly using JSON.parse().

QUALITY CONTROL BEFORE RESPONDING:

Verify that:
- All three candidate inputs were considered.
- Questions are relevant to the target job.
- No unnecessary duplicate questions exist.
- Technical answers are accurate.
- Behavioral answers do not fabricate candidate experiences.
- Skill gaps are realistic and evidence-based.
- All 10 preparation days are complete.
- All required fields and exact question counts are present.

Return the final JSON object only.
`;


    const response = await ai.interactions.create({
        model: "gemini-3.8-periview",
        input: prompt,
        response_format: {
            type: "text",
            mime_type: "application/json",
            schema: interviewReportJsonSchema
        }
    });

  

    const report = JSON.parse(response.output_text);

    return interviewReportSchema.parse(report);
}

async function generatepdffromhtml(htmlcontent){
    const browser = await puppeteer.launch({
    headless: true,
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
    ]
});
    try {
        const page = await browser.newPage();
        await page.setContent(htmlcontent, { waitUntil: "networkidle0" });
        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                bottom: "20px",
                left: "15mm",
                right: "15mm"
            }
        });
    } finally {
        await browser.close();
    }
}

async function generateinterviewreportpdf({resume, selfdescription, jobdescription}) {
    const resumepdfschema = z.object({
        html: z.string().describe("The HTML extracted from the PDF resume")
    });

    const prompt = `Generate an interview report based on:

Source resume:
${resume}

Candidate description:
${selfdescription}

Target job description:
${jobdescription}

Return a complete, self-contained HTML document in the JSON field "html". Use simple inline CSS suitable for printing on A4 paper. Do not include scripts, remote assets, or unsupported facts.`;
    const response = await ai.interactions.create({
        model: "gemini-3.8-periview",
        input: prompt,
        response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
                type: "object",
                properties: {
                    html: { type: "string" }
                },
                required: ["html"]
            }
        },

    });

    const { html } = resumepdfschema.parse(JSON.parse(response.output_text));
    return generatepdffromhtml(html);

}     

module.exports = {generateinterviewreport,generateinterviewreportpdf};
