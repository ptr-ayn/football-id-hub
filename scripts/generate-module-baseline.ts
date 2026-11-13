import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MODULE_BLUEPRINTS, WAVES } from "../src/config/module-blueprints.ts";
import { getModule } from "../src/config/modules.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "future-modules-baseline.md");

const roleLabels: Record<string, string> = {
  player: "Player",
  parent: "Parent / Guardian",
  coach: "Coach",
  org_admin: "Organization Admin",
  competition_organizer: "Competition Organizer",
  referee: "Referee",
  scout: "Scout",
};

const maybePath = (id: string) => getModule(id)?.path ?? `/modules/${id}`;

const asBulletList = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

const moduleToMarkdown = (module: (typeof MODULE_BLUEPRINTS)[number]) => {
  const route = maybePath(module.id);
  const docLinks = module.docs?.map((doc) => `- [${doc}](${doc})`).join("\n");

  const roleSection = module.roleJobs
    .map(({ role, job }) => `- **${roleLabels[role] ?? role}** — ${job}`)
    .join("\n");

  const scopeSection = [
    "### Scope",
    "**MVP**",
    ...module.scope.mvp.map((v) => `- ${v}`),
    "",
    "**Next**",
    ...module.scope.next.map((v) => `- ${v}`),
    "",
    "**Later**",
    ...module.scope.later.map((v) => `- ${v}`),
    "",
  ].join("\n");

  const entitiesSection = [
    "### Data it owns",
    "| Entity | Description |",
    "| --- | --- |",
    ...module.entities.map(({ name, description }) => `| ${name} | ${description} |`),
    "",
  ].join("\n");

  const consumesSection = module.consumes.length
    ? ["### Data it reads (never owns)", ...module.consumes.map((item) => `- ${item}`), ""].join("\n")
    : "### Data it reads (never owns)\n_None._";

  const journeySection = module.journeyEvents.length
    ? ["### Football Journey events", ...module.journeyEvents.map((event) => `- ${event}`), ""].join("\n")
    : "### Football Journey events\n_Publishes no journey events._";

  const privacySection = [
    "### Privacy & consent",
    ...module.privacy.map((item) => `- ${item}`),
    "",
  ].join("\n");

  const dependsOnSection = module.dependsOn.length
    ? [
        "### Dependencies",
        ...module.dependsOn.map((dep) => `- [${dep}](#${dep})`),
        "",
      ].join("\n")
    : "### Dependencies\n_None — can start independently._";

  const foundationsSection = [
    "### Builds on (already in the app)",
    ...module.foundations.map((item) => `- ${item}`),
    "",
  ].join("\n");

  const metricsSection = [
    "### Success metrics",
    ...module.metrics.map((item) => `- ${item}`),
    "",
  ].join("\n");

  const outOfScopeSection = [
    "### Out of scope",
    ...module.outOfScope.map((item) => `- ${item}`),
    "",
  ].join("\n");

  const docsSection = docLinks ? ["### Further documents", docLinks, ""].join("\n") : "";

  return [
    `## ${module.id === "development" ? "Player Development" : module.id === "finance" ? "Finance & Payments" : module.id === "coach" ? "Coach Platform" : module.id === "referee" ? "Referee Platform" : module.id === "opportunities" ? "Opportunities" : module.id === "scouting" ? "Scouting" : module.id === "analytics" ? "Analytics" : module.id === "association" ? "Association" : module.id === "federation" ? "Federation" : module.id === "ai" ? "AI Assistant" : module.id.charAt(0).toUpperCase() + module.id.slice(1)}`,
    `**${module.summary}** · Route: ${route} · Wave ${module.wave}`,
    "",
    `**Problem.** ${module.problem}`,
    "",
    "### Who it serves",
    roleSection,
    "",
    scopeSection,
    "",
    entitiesSection,
    "",
    consumesSection,
    "",
    journeySection,
    "",
    privacySection,
    "",
    dependsOnSection,
    "",
    foundationsSection,
    "",
    metricsSection,
    "",
    outOfScopeSection,
    "",
    docsSection,
  ].join("\n");
};

const renderDocument = () => {
  const top = [
    "# Future Modules Baseline",
    "",
    "> Project baseline for every \"Coming soon\" module of the Youth Football Ecosystem Platform.",
    "> Generated from `src/config/module-blueprints.ts` — edit that file, then run `bun scripts/generate-module-baseline.ts`.",
    "> The same content is shown in the app at `/modules` and `/modules/<id>`.",
    "",
    "## Guiding principles",
    "",
    "1. **The player owns the journey.** Every module attaches records to a Football ID; organizations only hold relationships.",
    "2. **One person, one account, many roles.** Modules declare which roles can use them in `src/config/modules.ts`.",
    "3. **Single source of truth per record.** Each module owns the entities listed below and only *reads* the data it consumes.",
    "4. **Journey events, not copies.** Modules publish events to the Football Journey timeline instead of duplicating history.",
    "5. **Consent first for minors.** Guardians control visibility; nothing about a child is exposed beyond existing permissions.",
    "",
    "## Rollout overview",
    "",
    "| Wave | Theme | Goal | Modules |",
    "| --- | --- | --- | --- |",
    ...Object.entries(WAVES).map(([wave, config]) => {
      const ids = MODULE_BLUEPRINTS.filter((module) => module.wave === Number(wave)).map((module) => {
        const moduleTitle = module.id === "development"
          ? "Player Development"
          : module.id === "finance"
            ? "Finance & Payments"
            : module.id === "coach"
              ? "Coach Platform"
              : module.id === "referee"
                ? "Referee Platform"
                : module.id === "opportunities"
                  ? "Opportunities"
                  : module.id === "scouting"
                    ? "Scouting"
                    : module.id === "analytics"
                      ? "Analytics"
                      : module.id === "association"
                        ? "Association"
                        : module.id === "federation"
                          ? "Federation"
                          : module.id === "ai"
                            ? "AI Assistant"
                            : module.id.charAt(0).toUpperCase() + module.id.slice(1);
        return `[${moduleTitle}](#${module.id})`;
      }).join(", ");
      return `| ${config.label} | ${config.title} | ${config.goal} | ${ids} |`;
    }),
    "",
    "## Dependency map",
    "",
    "| Module | Wave | Depends on | Primary roles |",
    "| --- | --- | --- | --- |",
    ...MODULE_BLUEPRINTS.map((module) => {
      const dependsOn = module.dependsOn.length ? module.dependsOn.map((dep) => `[${dep}](#${dep})`).join(", ") : "—";
      const primaryRoles = module.roleJobs.map(({ role }) => roleLabels[role] ?? role).join(", ");
      const title = module.id === "development"
        ? "Player Development"
        : module.id === "finance"
          ? "Finance & Payments"
          : module.id === "coach"
            ? "Coach Platform"
            : module.id === "referee"
              ? "Referee Platform"
              : module.id === "opportunities"
                ? "Opportunities"
                : module.id === "scouting"
                  ? "Scouting"
                  : module.id === "analytics"
                    ? "Analytics"
                    : module.id === "association"
                      ? "Association"
                      : module.id === "federation"
                        ? "Federation"
                        : module.id === "ai"
                          ? "AI Assistant"
                          : module.id.charAt(0).toUpperCase() + module.id.slice(1);
      return `| ${title} | ${module.wave} | ${dependsOn} | ${primaryRoles} |`;
    }),
    "",
    "## How to ship a module",
    "",
    "1. Build the route(s) under `src/routes/` and the feature UI under `src/features/<module>/`, reusing `src/components/ds`.",
    "2. In `src/config/modules.ts` set `status: \"live\"` and point `path` at the new route — sidebar, mobile bar and search update automatically.",
    "3. Publish the module's journey events to the Football Journey timeline.",
    "4. Keep the blueprint in sync (or remove it once the module is live) and re-generate this document.",
    "",
    "---",
    "",
    "# Wave 1 — Club operations",
    "",
    "Give SSBs and academies the weekly tools they run on, producing trusted activity data for every Football ID.",
    "",
    ...MODULE_BLUEPRINTS.filter((module) => module.wave === 1).map((module) => moduleToMarkdown(module)),
    "",
    "---",
    "",
    "# Wave 2 — Professional networks",
    "",
    "Bring coaches, referees and scouts onto the same identity layer and open consent-based pathways for players.",
    "",
    ...MODULE_BLUEPRINTS.filter((module) => module.wave === 2).map((module) => moduleToMarkdown(module)),
    "",
    "---",
    "",
    "# Wave 3 — Governance & intelligence",
    "",
    "Turn verified ecosystem data into regional and national infrastructure, reporting and assistance.",
    "",
    ...MODULE_BLUEPRINTS.filter((module) => module.wave === 3).map((module) => moduleToMarkdown(module)),
    "",
  ];

  return top.join("\n");
};

const main = async () => {
  const content = renderDocument();
  await fs.writeFile(outputPath, `${content}\n`, "utf8");
  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
