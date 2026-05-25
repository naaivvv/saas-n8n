"use server";

import { z } from "zod";

const LeadSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  company_name: z.string().optional(),
  employee_count: z.coerce.number().optional().nullable(),
  industry: z.string().optional(),
});

export type ActionState = {
  success?: boolean;
  error?: string;
  fields?: Record<string, string>;
};

export async function submitTestLead(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    company_name: formData.get("company_name") || undefined,
    employee_count: formData.get("employee_count") || undefined,
    industry: formData.get("industry") || undefined,
  };

  const result = LeadSubmissionSchema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
      if (err.path[0]) {
        fieldErrors[err.path[0] as string] = err.message;
      }
    });
    return { error: "Validation failed", fields: fieldErrors };
  }

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nWebhookUrl) {
    console.error("N8N_WEBHOOK_URL is not defined");
    return { error: "Server configuration error" };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (process.env.N8N_WEBHOOK_SECRET) {
      headers["X-Webhook-Secret"] = process.env.N8N_WEBHOOK_SECRET;
    }

    // We don't await the full n8n execution response, we just fire and forget,
    // or wait for standard response if n8n webhook responds immediately.
    // We'll use an AbortController to not hang the server action if n8n is slow.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    let response;
    try {
      response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(result.data),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        // n8n is processing, but we don't want to wait
        return { success: true };
      }
      throw fetchError;
    }

    if (!response.ok) {
      console.error(`n8n responded with status: ${response.status}`);
      return { error: "Failed to process lead through pipeline" };
    }

    return { success: true };
  } catch (err) {
    console.error("Action error:", err);
    return { error: "Service unavailable. Could not reach pipeline." };
  }
}
