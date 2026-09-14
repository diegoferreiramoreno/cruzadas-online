import { getChallengeByDate } from "./generated/challenge-registry";
import { getBrasiliaCycleId, isValidCivilDate } from "../src/services/timeService";

export interface Env {
  DB?: D1Database;
}

// Supported telemetry event types
const ALLOWED_EVENT_TYPES = new Set([
  "page_view",
  "game_started",
  "game_completed",
  "cohort_started",
  "cohort_milestone",
  "share_clicked",
  "interest_expressed"
]);

const ALLOWED_MILESTONES = new Set(["D1", "D7", "D14"]);
const ALLOWED_SHARE_CHANNELS = new Set(["web_share", "clipboard"]);

// ISO 8601 UTC timestamp regex
const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route: GET /api/challenge/today
    if (request.method === "GET" && url.pathname === "/api/challenge/today") {
      const todayCycleId = getBrasiliaCycleId();
      const requestedDate = url.searchParams.get("date");

      if (requestedDate !== null) {
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
          return new Response(
            JSON.stringify({ error: "Formato de data inválido. Use YYYY-MM-DD." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Validate civil date validity (reject impossible calendar dates)
        if (!isValidCivilDate(requestedDate)) {
          return new Response(
            JSON.stringify({ error: "Data de calendário impossível ou inválida." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Future dates are forbidden (returns 404)
        if (requestedDate > todayCycleId) {
          return new Response(
            JSON.stringify({ error: "Desafios futuros não estão disponíveis." }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        const challenge = getChallengeByDate(requestedDate);
        if (!challenge) {
          return new Response(
            JSON.stringify({ error: "Desafio não encontrado para a data solicitada." }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify(challenge), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Default: active challenge for today
      const challenge = getChallengeByDate(todayCycleId);
      if (!challenge) {
        return new Response(
          JSON.stringify({ error: "Desafio de hoje ainda não publicado." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(challenge), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Route: POST /api/telemetry (Phase 7 Telemetry Ingestion)
    if (request.method === "POST" && url.pathname === "/api/telemetry") {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Corpo JSON inválido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (!body || typeof body !== "object") {
        return new Response(JSON.stringify({ error: "Payload inválido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { eventType, cycleId, timestamp, properties } = body;

      // Validate eventType
      if (!eventType || typeof eventType !== "string" || !ALLOWED_EVENT_TYPES.has(eventType)) {
        return new Response(JSON.stringify({ error: "Tipo de evento inválido ou não suportado" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Validate cycleId format and civil date validity
      if (!cycleId || typeof cycleId !== "string" || !isValidCivilDate(cycleId)) {
        return new Response(JSON.stringify({ error: "cycleId inválido (esperado YYYY-MM-DD com calendário válido)" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Validate timestamp as strict ISO 8601
      if (
        !timestamp ||
        typeof timestamp !== "string" ||
        !ISO_TIMESTAMP_REGEX.test(timestamp) ||
        isNaN(Date.parse(timestamp))
      ) {
        return new Response(JSON.stringify({ error: "Timestamp ISO 8601 inválido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Event-specific validation & metric derivation
      let query = "";
      let params: any[] = [];

      switch (eventType) {
        case "page_view": {
          query =
            "INSERT INTO daily_metrics (cycle_date, metric_name, dimension, count) VALUES (?, 'page_view', 'total', 1) ON CONFLICT(cycle_date, metric_name, dimension) DO UPDATE SET count = count + 1";
          params = [cycleId];
          break;
        }

        case "game_started": {
          query =
            "INSERT INTO daily_metrics (cycle_date, metric_name, dimension, count) VALUES (?, 'game_started', 'total', 1) ON CONFLICT(cycle_date, metric_name, dimension) DO UPDATE SET count = count + 1";
          params = [cycleId];
          break;
        }

        case "game_completed": {
          const outcome = properties?.outcome;
          const attemptsUsed = properties?.attemptsUsed;

          if (outcome !== "won" && outcome !== "lost") {
            return new Response(JSON.stringify({ error: "outcome deve ser 'won' ou 'lost'" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          if (
            typeof attemptsUsed !== "number" ||
            !Number.isInteger(attemptsUsed) ||
            attemptsUsed < 1 ||
            attemptsUsed > 6
          ) {
            return new Response(
              JSON.stringify({ error: "attemptsUsed deve ser um inteiro entre 1 e 6" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const dimension = outcome === "won" ? `won_attempt_${attemptsUsed}` : "lost";
          query =
            "INSERT INTO daily_metrics (cycle_date, metric_name, dimension, count) VALUES (?, 'game_completed', ?, 1) ON CONFLICT(cycle_date, metric_name, dimension) DO UPDATE SET count = count + 1";
          params = [cycleId, dimension];
          break;
        }

        case "cohort_started": {
          const cohortCycleId = properties?.cohortCycleId;
          if (!cohortCycleId || typeof cohortCycleId !== "string" || !isValidCivilDate(cohortCycleId)) {
            return new Response(JSON.stringify({ error: "cohortCycleId inválido (esperado YYYY-MM-DD com calendário válido)" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          query =
            "INSERT INTO cohort_metrics (cohort_cycle_id, milestone, count) VALUES (?, 'started', 1) ON CONFLICT(cohort_cycle_id, milestone) DO UPDATE SET count = count + 1";
          params = [cohortCycleId];
          break;
        }

        case "cohort_milestone": {
          const cohortCycleId = properties?.cohortCycleId;
          const milestone = properties?.milestone;

          if (!cohortCycleId || typeof cohortCycleId !== "string" || !isValidCivilDate(cohortCycleId)) {
            return new Response(JSON.stringify({ error: "cohortCycleId inválido (esperado YYYY-MM-DD com calendário válido)" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          if (!milestone || typeof milestone !== "string" || !ALLOWED_MILESTONES.has(milestone)) {
            return new Response(JSON.stringify({ error: "milestone deve ser estritamente D1, D7 ou D14" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          query =
            "INSERT INTO cohort_metrics (cohort_cycle_id, milestone, count) VALUES (?, ?, 1) ON CONFLICT(cohort_cycle_id, milestone) DO UPDATE SET count = count + 1";
          params = [cohortCycleId, milestone];
          break;
        }

        case "share_clicked": {
          const shareChannel = properties?.shareChannel;
          if (!shareChannel || typeof shareChannel !== "string" || !ALLOWED_SHARE_CHANNELS.has(shareChannel)) {
            return new Response(JSON.stringify({ error: "shareChannel deve ser estritamente 'web_share' ou 'clipboard'" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          const dimension = shareChannel;
          query =
            "INSERT INTO daily_metrics (cycle_date, metric_name, dimension, count) VALUES (?, 'share_clicked', ?, 1) ON CONFLICT(cycle_date, metric_name, dimension) DO UPDATE SET count = count + 1";
          params = [cycleId, dimension];
          break;
        }

        case "interest_expressed": {
          const interestTopic = properties?.interestTopic;
          if (interestTopic !== "general_support") {
            return new Response(JSON.stringify({ error: "interestTopic deve ser estritamente 'general_support'" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          query =
            "INSERT INTO daily_metrics (cycle_date, metric_name, dimension, count) VALUES (?, 'interest_expressed', 'general_support', 1) ON CONFLICT(cycle_date, metric_name, dimension) DO UPDATE SET count = count + 1";
          params = [cycleId];
          break;
        }
      }

      // Execute D1 atomic UPSERT if DB binding exists
      if (env.DB && query) {
        try {
          await env.DB.prepare(query).bind(...params).run();
        } catch (dbErr) {
          // Gracefully swallow D1 quota or execution errors, returning 204
          console.warn("D1 telemetry UPSERT failed gracefully:", dbErr);
        }
      }

      return new Response(null, { status: 204 });
    }

    return new Response("Not Found", { status: 404 });
  },
};
