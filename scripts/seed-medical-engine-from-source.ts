import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const txt = fs.readFileSync(envPath, 'utf8');
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i <= 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[k] = v;
  }
}

function need(key: string): string {
  const v = process.env[key]?.trim();
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

function extractExpression(source: string, startToken: string, openChar: '{' | '['): string {
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`Token not found: ${startToken}`);
  const open = source.indexOf(openChar, start);
  let i = open;
  let depth = 0;
  let inStr = false;
  let quote = '';
  while (i < source.length) {
    const ch = source[i];
    const prev = source[i - 1];
    if (!inStr && (ch === '"' || ch === "'" || ch === '`')) {
      inStr = true;
      quote = ch;
    } else if (inStr && ch === quote && prev !== '\\') {
      inStr = false;
      quote = '';
    } else if (!inStr) {
      if (ch === (openChar === '{' ? '{' : '[')) depth += 1;
      if (ch === (openChar === '{' ? '}' : ']')) {
        depth -= 1;
        if (depth === 0) return source.slice(open, i + 1);
      }
    }
    i += 1;
  }
  throw new Error(`Failed to parse expression for ${startToken}`);
}

function evaluate<T>(expr: string): T {
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${expr});`)() as T;
}

async function main() {
  loadEnv();
  const url = need('EXPO_PUBLIC_SUPABASE_URL');
  const serviceKey = need('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const src = fs.readFileSync(path.join(process.cwd(), 'data', 'medicalEngine.ts'), 'utf8');
  const conditionsExpr = extractExpression(src, 'export let MEDICAL_CONDITIONS', '{');
  const labsExpr = extractExpression(src, 'export let LAB_TESTS_DATABASE', '{');
  const feedbackExpr = extractExpression(src, 'export let FEEDBACK_QUESTIONS', '[');

  const medicalConditions = evaluate<Record<string, unknown>>(conditionsExpr);
  const labs = evaluate<Record<string, unknown>>(labsExpr);
  const feedback = evaluate<unknown[]>(feedbackExpr);

  await supabase.from('local_medical_engine_data').delete().neq('key', '__none__');
  const { error } = await supabase.from('local_medical_engine_data').upsert(
    [
      { key: 'medical_conditions', payload: medicalConditions },
      { key: 'lab_tests_database', payload: labs },
      { key: 'feedback_questions', payload: feedback },
    ],
    { onConflict: 'key' },
  );
  if (error) throw error;
  console.log('seeded local_medical_engine_data');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

