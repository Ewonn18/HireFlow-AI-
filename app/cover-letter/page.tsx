"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthGuard from "../components/AuthGuard";
import { useAppData } from "../context/AppDataContext";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-800";

const textareaClass =
  "w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-800";

const primaryButtonClass =
  "w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-slate-700 hover:shadow-[0_14px_26px_rgba(15,23,42,0.23)] dark:bg-sky-500 dark:text-slate-950 dark:shadow-[0_14px_30px_rgba(14,165,233,0.25)] dark:hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:translate-y-0 dark:disabled:bg-slate-700 dark:disabled:text-slate-400";

const secondaryButtonClass =
  "inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800";

type FormErrors = {
  companyName?: string;
  role?: string;
};

export default function CoverLetterPage() {
  const {
    resumeAnalysisResult,
    jobDescription,
    jobMatchResult,
    extractedResumeText,
  } = useAppData();

  const hasResumeData = Boolean(extractedResumeText || resumeAnalysisResult);
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [localJobDescription, setLocalJobDescription] =
    useState(jobDescription);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const companyInputRef = useRef<HTMLInputElement>(null);

  const canGenerate =
    hasResumeData && companyName.trim().length > 0 && role.trim().length > 0;
  const hasInput =
    companyName.trim().length > 0 ||
    role.trim().length > 0 ||
    localJobDescription.trim().length > 0;

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!companyName.trim()) {
      nextErrors.companyName = "Company name is required.";
    }

    if (!role.trim()) {
      nextErrors.role = "Role is required.";
    }

    return nextErrors;
  }

  async function parseApiErrorMessage(response: Response, fallback: string) {
    const rawText = await response.text();
    if (!rawText) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(rawText) as { error?: string };
      if (typeof parsed.error === "string" && parsed.error.trim()) {
        return parsed.error;
      }
    } catch {
      // Response was not JSON; use fallback message.
    }

    return fallback;
  }

  async function parseCoverLetterResponse(response: Response) {
    const rawText = await response.text();
    if (!rawText) {
      throw new Error("The service returned an empty response.");
    }

    try {
      const parsed = JSON.parse(rawText) as { coverLetter?: string };
      if (
        typeof parsed.coverLetter !== "string" ||
        !parsed.coverLetter.trim()
      ) {
        throw new Error("Generated content was empty. Please try again.");
      }
      return parsed.coverLetter;
    } catch {
      throw new Error("Received an unexpected response from the server.");
    }
  }

  async function handleGenerate() {
    const nextErrors = validateForm();
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !canGenerate) {
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccessMessage("");
    setCoverLetter("");

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          role: role.trim(),
          jobDescription: localJobDescription.trim(),
          strengths: resumeAnalysisResult?.strengths ?? [],
          matchedSkills: jobMatchResult?.matchedSkills ?? [],
        }),
      });

      if (!response.ok) {
        const message = await parseApiErrorMessage(
          response,
          "Failed to generate cover letter. Please try again.",
        );
        throw new Error(message);
      }

      const generatedCoverLetter = await parseCoverLetterResponse(response);
      setCoverLetter(generatedCoverLetter);
      setSuccessMessage("Cover letter generated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("failed to fetch") || message.includes("network")) {
        setError(
          "Network issue while generating your letter. Please check your connection and try again.",
        );
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <section className="animate-fade-in mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/95 p-7 shadow-[0_14px_34px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_40px_rgba(2,6,23,0.42)] sm:p-8 lg:p-10">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Cover Letter
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
              Generate a tailored cover letter based on your resume and the role
              you are applying for.
            </p>

            {!hasResumeData ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4h6M9 12h6M9 16h4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                  No resume data found
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Upload and analyse your resume first so we can personalise
                  your cover letter.
                </p>
                <Link
                  href="/resume-upload"
                  className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-[0_14px_26px_rgba(15,23,42,0.23)] dark:bg-sky-500 dark:text-slate-950 dark:shadow-[0_14px_30px_rgba(14,165,233,0.25)] dark:hover:bg-sky-400"
                >
                  Upload Resume
                </Link>
              </div>
            ) : (
              <>
                {!hasInput && !coverLetter && !error ? (
                  <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center dark:border-slate-700 dark:bg-slate-900/70">
                    <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 3v18m9-9H3"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p className="mt-3 text-base font-medium text-slate-700 dark:text-slate-200">
                      Ready to draft your letter
                    </p>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                      Start by entering a company and role, then generate a
                      tailored cover letter in one click.
                    </p>
                    <button
                      type="button"
                      onClick={() => companyInputRef.current?.focus()}
                      className={`mt-5 ${secondaryButtonClass}`}
                    >
                      Start Writing
                    </button>
                  </div>
                ) : null}

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="company-name"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Company Name
                    </label>
                    <input
                      ref={companyInputRef}
                      id="company-name"
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        setFormErrors((prev) => ({
                          ...prev,
                          companyName: undefined,
                        }));
                        setError("");
                        setSuccessMessage("");
                      }}
                      placeholder="e.g. Stripe"
                      disabled={isGenerating}
                      className={`mt-2 ${inputClass}`}
                    />
                    {formErrors.companyName ? (
                      <p className="mt-1.5 text-sm font-medium text-rose-600">
                        {formErrors.companyName}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Role
                    </label>
                    <input
                      id="role"
                      type="text"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        setFormErrors((prev) => ({ ...prev, role: undefined }));
                        setError("");
                        setSuccessMessage("");
                      }}
                      placeholder="e.g. Frontend Engineer"
                      disabled={isGenerating}
                      className={`mt-2 ${inputClass}`}
                    />
                    {formErrors.role ? (
                      <p className="mt-1.5 text-sm font-medium text-rose-600">
                        {formErrors.role}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="cover-jd"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Job Description{" "}
                    <span className="font-normal text-slate-400 dark:text-slate-500">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="cover-jd"
                    value={localJobDescription}
                    onChange={(e) => {
                      setLocalJobDescription(e.target.value);
                      setError("");
                      setSuccessMessage("");
                    }}
                    placeholder="Paste the job description to make your letter more relevant..."
                    rows={5}
                    disabled={isGenerating}
                    className={`mt-2 ${textareaClass}`}
                  />
                </div>

                {jobMatchResult ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    Job match data available —{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {jobMatchResult.matchScore}% fit
                    </span>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className={`mt-6 ${primaryButtonClass}`}
                >
                  {isGenerating ? "Generating..." : "Generate Cover Letter"}
                </button>

                {error ? (
                  <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                  </p>
                ) : null}

                {successMessage ? (
                  <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {successMessage}
                  </p>
                ) : null}

                {coverLetter ? (
                  <article className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-[0_14px_26px_rgba(2,6,23,0.35)]">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      Generated Cover Letter
                    </h2>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_10px_18px_rgba(2,6,23,0.3)]">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                        {coverLetter}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(coverLetter);
                          setSuccessMessage(
                            "Cover letter copied to clipboard.",
                          );
                          setError("");
                        } catch {
                          setError(
                            "Unable to copy automatically. Please copy the text manually.",
                          );
                        }
                      }}
                      className={`mt-4 ${secondaryButtonClass}`}
                    >
                      Copy to Clipboard
                    </button>
                  </article>
                ) : null}
              </>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
