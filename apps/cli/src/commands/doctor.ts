export interface DoctorReport {
  ok: boolean;
  lines: string[];
}

export function runDoctor(): DoctorReport {
  const lines: string[] = [];
  let ok = true;

  const bunVersion = typeof Bun !== "undefined" ? Bun.version : undefined;
  if (bunVersion) {
    lines.push(`✔ Bun runtime detected (v${bunVersion})`);
  } else {
    lines.push("✘ Bun runtime not detected");
    ok = false;
  }

  lines.push(`✔ Node engine reported as ${process.version}`);

  return { ok, lines };
}
