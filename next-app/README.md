# arcdot. (web app)

Next.js App Router — landing, service catalog, create, pay UI, activity, and `/api/gateway`.

See the **[root README](../README.md)** for architecture, Supabase setup, and Arc Microgrant checklist.

```bash
cp .env.example .env.local
# optional: run supabase/schema.sql in your Supabase project
npm install
npm run dev
```

Routes: `/` · `/services` · `/services/[slug]` · `/create` · `/activity`
