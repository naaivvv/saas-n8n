import { NextResponse } from "next/server";
import { z } from "zod";

const LeadSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Simple in-memory rate limiting (Note: clears on serverless cold starts)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const now = Date.now();
    const rateRecord = rateLimitMap.get(ip);

    if (rateRecord) {
      if (now > rateRecord.expiresAt) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
      } else {
        if (rateRecord.count >= RATE_LIMIT_MAX) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
          );
        }
        rateRecord.count += 1;
        rateLimitMap.set(ip, rateRecord);
      }
    } else {
      rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    }

    // 2. Parse and Validate Request Body
    const body = await request.json();
    const result = LeadSubmissionSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      return NextResponse.json({ error: "Validation failed", fields: fieldErrors }, { status: 400 });
    }

    // 3. Forward to n8n Webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL is not defined");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      if (!n8nResponse.ok) {
        console.error(`n8n responded with status: ${n8nResponse.status}`);
        return NextResponse.json(
          { error: "Failed to process lead through pipeline" },
          { status: 502 }
        );
      }

      // If n8n returns something we want to pass back, we could, 
      // but usually we just return success to the client
      return NextResponse.json({ success: true }, { status: 200 });

    } catch (fetchError) {
      console.error("n8n webhook fetch error:", fetchError);
      return NextResponse.json(
        { error: "Service unavailable. Could not reach pipeline." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("API Route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
