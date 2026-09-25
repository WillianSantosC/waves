import type { TemplateDefinition } from "./types";

export const PR_TEMPLATE: TemplateDefinition = {
  sections: [
    {
      id: "summary",
      title: "Summary",
      placeholders: ["- [ ] <One checklist item for each meaningful change>"],
    },
    {
      id: "type-of-change",
      title: "Type of Change",
      placeholders: [],
    },
    {
      id: "related-issues",
      title: "Related Issues",
      placeholders: ["Closes #"],
    },
    {
      id: "success-criteria",
      title: "Success Criteria",
      placeholders: ["-"],
    },
    {
      id: "how-to-validate",
      title: "How to Validate",
      placeholders: ["1."],
    },
    {
      id: "reviewer-notes",
      title: "Reviewer Notes",
      placeholders: [],
      optionalNaAllowed: true,
    },
    {
      id: "additional-context",
      title: "Additional Context",
      placeholders: [],
      optionalNaAllowed: true,
    },
  ],
};

export function getSectionTitles(template: TemplateDefinition = PR_TEMPLATE): string[] {
  return template.sections.map((section) => section.title);
}
