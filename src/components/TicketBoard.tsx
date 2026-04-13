"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Program, Team, Ticket, TicketPriority, TicketStatus, TicketVisibility } from "../types/models";
import GoogleExportPanel from "./GoogleExportPanel";
import DocumentationGeneratorPanel from "./DocumentationGeneratorPanel";

const statusOptions: Array<{ label: string; value: TicketStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Blocked", value: "blocked" },
  { label: "Review", value: "review" },
  { label: "Done", value: "done" },
];

const priorityOptions: Array<{ label: string; value: TicketPriority | "all" }> = [
  { label: "All priorities", value: "all" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const visibilityOptions: TicketVisibility[] = ["private", "team", "public"];

type Props = {
  tickets: Ticket[];
  teams: Team[];
  programs: Program[];
  viewerId: string;
  viewerRole: "admin" | "lead" | "member";
  canUseAssistant: boolean;
  title: string;
  subtitle: string;
};

type TicketFormState = {
  title: string;
  description: string;
  initiativeId: string;
  teamId: string;
  assigneeId: string;
  status: TicketStatus;
  priority: TicketPriority;
  visibility: TicketVisibility;
  points: string;
  labels: string;
  goalTitle: string;
  goalTargetPoints: string;
};

const TicketBoard = ({ tickets, teams, programs, viewerId, viewerRole, canUseAssistant, title, subtitle }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filterState, setFilterState] = useState({
    search: "",
    status: "all" as TicketStatus | "all",
    priority: "all" as TicketPriority | "all",
    teamId: "all",
    initiativeId: "all",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [assistantOutput, setAssistantOutput] = useState<string>("");
  const [assistantPrompt, setAssistantPrompt] = useState<string>("");
  const [taskJson, setTaskJson] = useState<string>(
    JSON.stringify(
      {
        action: "generate_docs",
        payload: { ticketId: tickets[0]?.id || "" },
      },
      null,
      2,
    ),
  );
  const [formState, setFormState] = useState<TicketFormState>({
    title: "",
    description: "",
    initiativeId: "",
    teamId: "",
    assigneeId: "",
    status: "todo",
    priority: "medium",
    visibility: "team",
    points: "3",
    labels: "",
    goalTitle: "",
    goalTargetPoints: "5",
  });

  const programNameById = useMemo(() => new Map(programs.map((program) => [program.id, program.name])), [programs]);
  const teamNameById = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);

  const filteredTickets = useMemo(() => {
    const search = filterState.search.toLowerCase();

    return (tickets || []).filter((ticket) => {
      if (!ticket) return false;
      const matchesSearch =
        !search ||
        [ticket.title, ticket.description, ticket.goal?.title, (ticket.labels || []).join(" "), (ticket.docs || []).map((doc) => doc.body).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesStatus = filterState.status === "all" || (ticket.ticketStatus || "todo") === filterState.status;
      const matchesPriority = filterState.priority === "all" || (ticket.priority || "medium") === filterState.priority;
      const matchesTeam = filterState.teamId === "all" || ticket.teamId === filterState.teamId;
      const matchesInitiative = filterState.initiativeId === "all" || ticket.initiativeId === filterState.initiativeId;

      return matchesSearch && matchesStatus && matchesPriority && matchesTeam && matchesInitiative;
    });
  }, [tickets, filterState]);

  const stats = useMemo(() => {
    const totalPoints = filteredTickets.reduce((sum, ticket) => sum + ticket.points, 0);
    return {
      count: filteredTickets.length,
      blocked: filteredTickets.filter((ticket) => ticket.ticketStatus === "blocked").length,
      critical: filteredTickets.filter((ticket) => ticket.priority === "critical").length,
      totalPoints,
    };
  }, [filteredTickets]);

  const updateField = (key: keyof TicketFormState, value: string) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const createTicket = async () => {
    setMessage(null);
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formState,
        createdBy: viewerId,
        labels: formState.labels
          .split(",")
          .map((label) => label.trim())
          .filter(Boolean),
        points: Number(formState.points),
        goalTargetPoints: Number(formState.goalTargetPoints),
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Unable to create ticket.");
    }

    setMessage(`Created ticket ${payload.ticket.title}.`);
    setFormState({
      title: "",
      description: "",
      initiativeId: "",
      teamId: "",
      assigneeId: "",
      status: "todo",
      priority: "medium",
      visibility: "team",
      points: "3",
      labels: "",
      goalTitle: "",
      goalTargetPoints: "5",
    });
    router.refresh();
  };

  const handleSubmitTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      createTicket().catch((error: Error) => setMessage(error.message));
    });
  };

  const handleAssistantSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAssistantMessage(null);
    startTransition(async () => {
      try {
        const parsedTask = taskJson.trim() ? JSON.parse(taskJson) : undefined;
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: assistantPrompt.trim(),
            task: parsedTask,
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Assistant task failed.");
        }
        setAssistantOutput(JSON.stringify(payload, null, 2));
        setAssistantMessage("Automation task completed.");
        router.refresh();
      } catch (error) {
        setAssistantMessage(error instanceof Error ? error.message : "Invalid JSON task.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Visible tickets", value: stats.count },
          { label: "Blocked", value: stats.blocked },
          { label: "Critical", value: stats.critical },
          { label: "Points", value: stats.totalPoints },
        ].map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-[0_12px_30px_rgba(16,32,15,0.08)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--ink-2)]">{stat.label}</p>
            <p className="mt-2 font-['Bricolage_Grotesque'] text-3xl tracking-[-0.02em]">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-[0_18px_55px_rgba(16,32,15,0.08)] md:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-2 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">
                  {viewerRole === "admin" ? "Enterprise view" : viewerRole === "lead" ? "Team lead view" : "Personal view"}
                </p>
                <h2 className="font-['Bricolage_Grotesque'] text-2xl tracking-[-0.02em] md:text-3xl">{title}</h2>
                <p className="mt-2 text-sm text-[var(--ink-2)]">{subtitle}</p>
              </div>
              <div className="text-sm text-[var(--ink-2)]">Signed in: {viewerId}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <input
                className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
                placeholder="Search title, docs, labels"
                value={filterState.search}
                onChange={(event) => setFilterState((current) => ({ ...current, search: event.target.value }))}
              />
              <select
                className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
                value={filterState.status}
                onChange={(event) => setFilterState((current) => ({ ...current, status: event.target.value as TicketStatus | "all" }))}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
                value={filterState.priority}
                onChange={(event) => setFilterState((current) => ({ ...current, priority: event.target.value as TicketPriority | "all" }))}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
                value={filterState.teamId}
                onChange={(event) => setFilterState((current) => ({ ...current, teamId: event.target.value }))}
              >
                <option value="all">All teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] md:col-span-2"
                value={filterState.initiativeId}
                onChange={(event) => setFilterState((current) => ({ ...current, initiativeId: event.target.value }))}
              >
                <option value="all">All initiatives</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="grid gap-4">
            {filteredTickets.length === 0 ? (
              <div className="rounded-3xl border border-black/10 bg-white/85 p-6 text-sm text-[var(--ink-2)] shadow-[0_18px_55px_rgba(16,32,15,0.08)]">
                No tickets match the current filters.
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <article key={ticket.id} className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-[0_18px_55px_rgba(16,32,15,0.08)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">{ticket.ticketStatus}</span>
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">{ticket.priority}</span>
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">{ticket.points} points</span>
                      </div>
                      <h3 className="font-['Bricolage_Grotesque'] text-xl tracking-[-0.015em]">{ticket.title}</h3>
                      <p className="mt-2 max-w-3xl text-sm text-[var(--ink-2)]">{ticket.description}</p>
                    </div>
                    <div className="text-right text-xs text-[var(--ink-2)]">
                      <p>Team: {ticket.teamId ? teamNameById.get(ticket.teamId) || ticket.teamId : "Unassigned"}</p>
                      <p>Initiative: {ticket.initiativeId ? programNameById.get(ticket.initiativeId) || ticket.initiativeId : "Unassigned"}</p>
                      <p>Goal: {ticket.goal.title}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(ticket.labels || []).map((label) => (
                      <span key={label} className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/75 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-[var(--ink-2)]">Docs</p>
                      {ticket.docs.slice(0, 2).map((doc) => (
                        <div key={doc.id} className="mt-3 border-t border-black/10 pt-3 text-sm">
                          <p className="font-semibold">{doc.title}</p>
                          <p className="mt-1 line-clamp-3 text-[var(--ink-2)]">{doc.body}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl bg-white/75 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-[var(--ink-2)]">Tracking</p>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--ink-2)]">
                        <p>Created by: {ticket.author}</p>
                        <p>Assignee: {ticket.assigneeId || "Unassigned"}</p>
                        <p>Goal points: {ticket.goal?.achievedPoints ?? 0}/{ticket.goal?.targetPoints ?? 0}</p>
                        <p>Comments: {ticket.comments?.length ?? 0}</p>
                        <p>Watchers: {ticket.watchers?.length ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <GoogleExportPanel compact />
          <DocumentationGeneratorPanel tickets={tickets} />

          <section className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-[0_18px_55px_rgba(16,32,15,0.08)] md:p-6">
            <div className="mb-4">
              <p className="mb-2 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">Create ticket</p>
              <h3 className="font-['Bricolage_Grotesque'] text-2xl tracking-[-0.02em]">New Work Item</h3>
              <p className="mt-2 text-sm text-[var(--ink-2)]">Capture initiative work, point it, and keep docs attached from the start.</p>
            </div>

            <form className="space-y-3" onSubmit={handleSubmitTicket}>
              <input className="w-full rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" placeholder="Ticket title" value={formState.title} onChange={(event) => updateField("title", event.target.value)} />
              <textarea className="min-h-32 w-full rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" placeholder="Describe the work, acceptance criteria, and context" value={formState.description} onChange={(event) => updateField("description", event.target.value)} />
              <div className="grid gap-3 md:grid-cols-2">
                <select className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" value={formState.teamId} onChange={(event) => updateField("teamId", event.target.value)}>
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <select className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" value={formState.initiativeId} onChange={(event) => updateField("initiativeId", event.target.value)}>
                  <option value="">Select initiative</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </select>
                <select className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" value={formState.status} onChange={(event) => updateField("status", event.target.value)}>
                  {statusOptions.filter((option) => option.value !== "all").map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" value={formState.priority} onChange={(event) => updateField("priority", event.target.value)}>
                  {priorityOptions.filter((option) => option.value !== "all").map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" value={formState.visibility} onChange={(event) => updateField("visibility", event.target.value)}>
                  {visibilityOptions.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                <input className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" placeholder="Points" type="number" min="0" max="100" value={formState.points} onChange={(event) => updateField("points", event.target.value)} />
              </div>
              <input className="w-full rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" placeholder="Goal title" value={formState.goalTitle} onChange={(event) => updateField("goalTitle", event.target.value)} />
              <input className="w-full rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" placeholder="Goal target points" type="number" min="0" max="1000" value={formState.goalTargetPoints} onChange={(event) => updateField("goalTargetPoints", event.target.value)} />
              <input className="w-full rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" placeholder="Labels comma separated" value={formState.labels} onChange={(event) => updateField("labels", event.target.value)} />
              <button className="w-full rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] disabled:opacity-70" type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create ticket"}
              </button>
              {message ? <p className="text-sm text-[var(--brand-strong)]">{message}</p> : null}
            </form>
          </section>

          {canUseAssistant ? (
            <section className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-[0_18px_55px_rgba(16,32,15,0.08)] md:p-6">
              <div className="mb-4">
                <p className="mb-2 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">AI automation</p>
                <h3 className="font-['Bricolage_Grotesque'] text-2xl tracking-[-0.02em]">JSON Task Runner</h3>
                <p className="mt-2 text-sm text-[var(--ink-2)]">
                    Use a Gemini prompt for natural language planning, or run JSON tasks directly like an RPA flow.
                </p>
              </div>
              <form className="space-y-3" onSubmit={handleAssistantSubmit}>
                  <textarea className="min-h-36 w-full rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" placeholder="Natural language request for Gemini, e.g. create a high priority ticket for onboarding docs" value={assistantPrompt} onChange={(event) => setAssistantPrompt(event.target.value)} />
                <textarea className="min-h-64 w-full rounded-xl border border-black/10 bg-[#0f1710] px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" value={taskJson} onChange={(event) => setTaskJson(event.target.value)} />
                <button className="w-full rounded-xl border border-black/10 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" type="submit" disabled={isPending}>
                    Run Gemini / JSON Task
                </button>
                {assistantMessage ? <p className="text-sm text-[var(--brand-strong)]">{assistantMessage}</p> : null}
                {assistantOutput ? (
                  <pre className="overflow-x-auto rounded-xl bg-[#0f1710] p-4 text-xs text-white/80">{assistantOutput}</pre>
                ) : null}
              </form>
            </section>
          ) : null}
        </aside>
      </section>
    </div>
  );
};

export default TicketBoard;
