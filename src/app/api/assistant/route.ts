import { assertRole } from "../../../lib/auth/serverAuth";
import { getTicketAutomationPreview, runAutomationTask } from "../../../modules/ticket/ticketService";
import { normalizeAssistantRequest } from "../../../lib/validation/assistantValidation";
import { getAssistantProviderName, planAssistantTask } from "../../../modules/assistant/assistantService";

export const POST = async (request: Request) => {
  try {
    const { userId } = await assertRole(["admin", "lead"]);
    const body = await request.json();
    const assistantRequest = normalizeAssistantRequest(body);
    const plan = await planAssistantTask(assistantRequest);
    const preview = await getTicketAutomationPreview(plan.task);
    const result = await runAutomationTask(plan.task, userId);
    return Response.json({ provider: plan.provider, source: plan.source, assistantProvider: getAssistantProviderName(), preview, result }, { status: 200 });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "UNAUTHENTICATED") {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    if (message === "FORBIDDEN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return Response.json({ error: message || "Assistant task failed." }, { status: 400 });
  }
};
