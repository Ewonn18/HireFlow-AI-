import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobDescription, resumeText } = body;

    // Validate inputs
    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "jobDescription is required and must be a string" },
        { status: 400 },
      );
    }

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "resumeText is required and must be a string" },
        { status: 400 },
      );
    }

    // Trim and validate minimum length
    const trimmedJob = jobDescription.trim();
    const trimmedResume = resumeText.trim();

    if (trimmedJob.length < 10 || trimmedResume.length < 10) {
      return NextResponse.json(
        { error: "Job description and resume must be at least 10 characters" },
        { status: 400 },
      );
    }

    const skills = ["React", "Next.js", "JavaScript", "UI/UX", "API", "SQL"];

    const matchedSkills = skills.filter(
      (skill) =>
        trimmedResume.toLowerCase().includes(skill.toLowerCase()) &&
        trimmedJob.toLowerCase().includes(skill.toLowerCase()),
    );

    const missingSkills = skills.filter(
      (skill) =>
        trimmedJob.toLowerCase().includes(skill.toLowerCase()) &&
        !trimmedResume.toLowerCase().includes(skill.toLowerCase()),
    );

    const matchScore = Math.min(
      100,
      60 + matchedSkills.length * 8 - missingSkills.length * 3,
    );

    return NextResponse.json({
      matchScore,
      matchedSkills,
      missingSkills,
      suggestions: [
        "Highlight relevant skills in your resume",
        "Add measurable achievements",
        "Tailor your resume to the job description",
      ],
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body. Please check your JSON format." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}
