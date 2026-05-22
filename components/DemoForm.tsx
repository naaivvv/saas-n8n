"use client";

import { useState } from "react";
import { z } from "zod";

const LeadSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof LeadSubmissionSchema>;

export default function DemoForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrors({});

    try {
      // Validate with Zod
      const validatedData = LeadSubmissionSchema.parse(formData);
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check for field-specific validation errors from API
        if (errorData.fields) {
           setErrors(errorData.fields);
           setIsSubmitting(false);
           return;
        }
        throw new Error(errorData.error || 'Submission failed');
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Submission error:", error);
        setSubmitStatus("error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="demo" className="w-full max-w-xl mx-auto px-4 py-24 scroll-mt-16">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Request a Demo</h2>
          <p className="text-neutral text-sm">
            See how LeadIntel can automate your inbound pipeline.
          </p>
        </div>

        {submitStatus === "success" && (
          <div className="mb-6 p-4 bg-accent/20 border border-accent/50 text-accent rounded-xl text-center">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium">Request received successfully!</p>
            <p className="text-sm opacity-80 mt-1">We&apos;ll be in touch shortly.</p>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="mb-6 p-4 bg-danger/20 border border-danger/50 text-danger rounded-xl text-center text-sm font-medium">
            Something went wrong. Please try again later.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-black/20 border ${
                errors.name ? "border-danger focus:ring-danger/50" : "border-white/10 focus:ring-primary/50"
              } rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`}
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Work Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-black/20 border ${
                errors.email ? "border-danger focus:ring-danger/50" : "border-white/10 focus:ring-primary/50"
              } rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all`}
              placeholder="jane@company.com"
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              How can we help?
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={`w-full bg-black/20 border ${
                errors.message ? "border-danger focus:ring-danger/50" : "border-white/10 focus:ring-primary/50"
              } rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all resize-none`}
              placeholder="Tell us about your lead generation volume and current tooling..."
            />
            {errors.message && <p className="text-danger text-xs mt-1">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-12"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
