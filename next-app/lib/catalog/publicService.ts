export function withoutServiceSecrets<T extends {
  system_prompt?: string | null;
  upstream_bearer?: string | null;
}>(
  row: T,
): Omit<T, "system_prompt" | "upstream_bearer"> {
  const { system_prompt: _a, upstream_bearer: _b, ...rest } = row;
  return rest;
}

export function withoutServiceSecretsList<T extends {
  system_prompt?: string | null;
  upstream_bearer?: string | null;
}>(
  rows: T[],
): Omit<T, "system_prompt" | "upstream_bearer">[] {
  return rows.map(withoutServiceSecrets);
}

/** @deprecated use withoutServiceSecrets */
export function withoutSystemPrompt<T extends { system_prompt?: string }>(
  row: T,
): Omit<T, "system_prompt"> {
  const { system_prompt: _drop, ...rest } = row;
  return rest;
}

export function withoutSystemPrompts<T extends { system_prompt?: string }>(
  rows: T[],
): Omit<T, "system_prompt">[] {
  return rows.map(withoutSystemPrompt);
}
