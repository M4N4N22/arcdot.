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
