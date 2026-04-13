import { normalizeAutomationTask, type CreateTicketInput } from "../../lib/validation/ticketValidation";
import type { AutomationTask } from "../../types/models";
import { sanitizeText } from "../../lib/validation/sanitize";
import type { AssistantRequest } from "../../lib/validation/assistantValidation";

const isAssistantEnabled = () => process.env.AI_ASSISTANT_ENABLED !== "false";
const assistantProvider = () => (process.env.AI_ASSISTANT_PROVIDER || "gemini").toLowerCase();
const geminiApiKey = () => process.env.GEMINI_API_KEY || "";
const geminiModel = () => process.env.GEMINI_MODEL || "gemini-2.0-flash";

type AssistantPlan = {
  task: AutomationTask;
  provider: "gemini" | "local";
  source: "direct-json" | "gemini-prompt" | "local-fallback";
};

const cleanJsonText = (input: string) => input.replace(/```json|```/g, "").trim();

const inferTaskFromPrompt = (prompt: string): AutomationTask => {
  const normalizedPrompt = sanitizeText(prompt, 4000).toLowerCase();
  const ticketIdMatch = normalizedPrompt.match(/ticket\s+([a-z0-9_-]+)/i);

  if (normalizedPrompt.includes("generate") && normalizedPrompt.includes("doc") && ticketIdMatch?.[1]) {
    return normalizeAutomationTask({ action: "generate_docs", payload: { ticketId: ticketIdMatch[1] } });
  }

  if (normalizedPrompt.includes("comment") && ticketIdMatch?.[1]) {
    return normalizeAutomationTask({
      action: "add_comment",
      payload: {
        ticketId: ticketIdMatch[1],
        createdBy: "",
        body: prompt,
      },
    });
  }

  const title = sanitizeText(prompt.split(/[.!?]/)[0] || "New ticket", 120) || "New ticket";
  const description = sanitizeText(prompt, 2000) || title;

  return normalizeAutomationTask({
    action: "create_ticket",
    payload: {
      title,
      description,
      createdBy: "",
      points: 3,
      labels: [],
    },
  });
};

const formatDocumentation = ({
  title,
  context,
  format,
}: {
  title: string;
  context: string;
  format: "markdown" | "html" | "json" | "text";
}) => {
  const safeTitle = sanitizeText(title, 140);
  const safeContext = sanitizeText(context, 6000);

  if (format === "html") {
    return `<article><h1>${safeTitle}</h1><p>${safeContext}</p></article>`;
  }

  if (format === "json") {
    return JSON.stringify(
      {
        title: safeTitle,
        summary: safeContext,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  if (format === "text") {
    return `${safeTitle}\n\n${safeContext}`;
  }

  return `# ${safeTitle}\n\n${safeContext}`;
};

const planWithGemini = async (prompt: string) => {
  const key = geminiApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY is required when AI_ASSISTANT_PROVIDER=gemini.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "You are a resilient RPA-style assistant for a Jira-like ticket system.",
                  "Return only valid JSON with shape { action, payload }.",
                  "Allowed actions: create_ticket, update_ticket, add_comment, generate_docs, generate_documentation, bulk_create.",
                  "Use concise fields and keep payload compatible with the app schema.",
                  `User request: ${prompt}`,
                ].join("\n"),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}.`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) {
    throw new Error("Gemini returned no structured output.");
  }

  const parsedJson = JSON.parse(cleanJsonText(text)) as AutomationTask;
  return normalizeAutomationTask(parsedJson);
};

const generateDocumentationWithGemini = async ({
  title,
  context,
  format,
}: {
  title: string;
  context: string;
  format: "markdown" | "html" | "json" | "text";
}) => {
  const key = geminiApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY is required when AI_ASSISTANT_PROVIDER=gemini.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "You are a technical documentation assistant.",
                  `Return documentation in ${format} format only.`,
                  `Title: ${title}`,
                  `Context: ${context}`,
                ].join("\n"),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}.`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) {
    throw new Error("Gemini returned no documentation output.");
  }

  return text.trim();
};

export const planAssistantTask = async (request: AssistantRequest): Promise<AssistantPlan> => {
  if (!isAssistantEnabled()) {
    if (request.task) {
      return { task: normalizeAutomationTask(request.task), provider: "local", source: "direct-json" };
    }

    if (request.prompt) {
      return { task: inferTaskFromPrompt(request.prompt), provider: "local", source: "local-fallback" };
    }

    throw new Error("Assistant is disabled.");
  }

  if (request.task) {
    return { task: normalizeAutomationTask(request.task), provider: assistantProvider() === "gemini" ? "gemini" : "local", source: "direct-json" };
  }

  if (request.prompt) {
    if (assistantProvider() === "gemini") {
      try {
        return { task: await planWithGemini(request.prompt), provider: "gemini", source: "gemini-prompt" };
      } catch {
        return { task: inferTaskFromPrompt(request.prompt), provider: "local", source: "local-fallback" };
      }
    }

    return { task: inferTaskFromPrompt(request.prompt), provider: "local", source: "local-fallback" };
  }

  throw new Error("Provide either a JSON task or a natural language prompt.");
};

export const getAssistantProviderName = () => assistantProvider();

export const generateDocumentationWithAssistant = async ({
  title,
  context,
  format,
}: {
  title: string;
  context: string;
  format: "markdown" | "html" | "json" | "text";
}) => {
  if (!isAssistantEnabled() || assistantProvider() !== "gemini") {
    return {
      provider: "local" as const,
      source: "local-fallback" as const,
      content: formatDocumentation({ title, context, format }),
    };
  }

  try {
    const content = await generateDocumentationWithGemini({ title, context, format });
    return {
      provider: "gemini" as const,
      source: "gemini-prompt" as const,
      content,
    };
  } catch {
    return {
      provider: "local" as const,
      source: "local-fallback" as const,
      content: formatDocumentation({ title, context, format }),
    };
  }
};
