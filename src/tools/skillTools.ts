import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

// .claude/commands/ sits at the project root, one level above dist/
const COMMANDS_DIR = path.join(__dirname, "..", ".claude", "commands");

interface SkillMeta {
  name: string;
  description: string;
  content: string;
}

function parseSkillFile(filePath: string): SkillMeta | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    // Match YAML front-matter block
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return null;
    const fm = match[1];
    const content = match[2].trim();
    const name = (fm.match(/^name:\s*(.+)$/m)?.[1] ?? path.basename(filePath, ".md")).trim();
    // description may span continuation lines (indented)
    const descRaw = fm.match(/^description:\s*([\s\S]*?)(?=\n\w|\n---|$)/m)?.[1] ?? "";
    const description = descRaw.replace(/\n\s+/g, " ").trim();
    return { name, description, content };
  } catch {
    return null;
  }
}

let skillsCache: SkillMeta[] | null = null;

function getAllSkills(): SkillMeta[] {
  if (skillsCache) return skillsCache;
  if (!fs.existsSync(COMMANDS_DIR)) return [];
  skillsCache = fs
    .readdirSync(COMMANDS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseSkillFile(path.join(COMMANDS_DIR, f)))
    .filter((s): s is SkillMeta => s !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
  return skillsCache;
}

// ── list_component_skills ─────────────────────────────────────────────────────

export const listComponentSkillsSchema = z.object({});

export function toolListComponentSkills(
  _args: z.infer<typeof listComponentSkillsSchema>
): { content: { type: "text"; text: string }[] } {
  const skills = getAllSkills();
  if (!skills.length) {
    return {
      content: [
        {
          type: "text",
          text: `No component skills found. Expected directory: ${COMMANDS_DIR}`,
        },
      ],
    };
  }

  const lines = [
    "# Available HyPerform Component Skills",
    "",
    "IMPORTANT: Before adding any component to a page, call `get_component_skill`",
    "with the matching skillName to load the authoritative patterns for that component.",
    "",
    "| Skill Name | What it covers |",
    "|---|---|",
    ...skills.map((s) => `| ${s.name} | ${s.description} |`),
    "",
    "Usage: get_component_skill({ skillName: \"add-box\" })",
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

// ── get_component_skill ───────────────────────────────────────────────────────

export const getComponentSkillSchema = z.object({
  skillName: z
    .string()
    .describe(
      'Skill name to retrieve, e.g. "add-box", "add-graph", "add-leaderboard", "add-timer". ' +
        "Call list_component_skills first to see all available names."
    ),
});

export function toolGetComponentSkill(
  args: z.infer<typeof getComponentSkillSchema>
): { content: { type: "text"; text: string }[] } {
  const filePath = path.join(COMMANDS_DIR, `${args.skillName}.md`);

  if (!fs.existsSync(filePath)) {
    const available = getAllSkills().map((s) => s.name);
    return {
      content: [
        {
          type: "text",
          text: [
            `Skill "${args.skillName}" not found.`,
            "",
            "Available skills:",
            ...available.map((n) => `  - ${n}`),
          ].join("\n"),
        },
      ],
    };
  }

  const skill = parseSkillFile(filePath);
  if (!skill) {
    return {
      content: [
        {
          type: "text",
          text: `Could not parse skill file for "${args.skillName}".`,
        },
      ],
    };
  }

  return { content: [{ type: "text", text: skill.content }] };
}
