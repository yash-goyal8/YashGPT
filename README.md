# Career Chatbot - RAG-Powered AI Assistant

A professional chatbot for recruiters and hiring managers to learn about your career through AI-powered conversations.

## Phase 1 - Foundation (COMPLETED)

✅ Project structure created
✅ Landing page with example questions
✅ Chat interface with professional design
✅ Admin dashboard framework
✅ Environment variable placeholders

## Required Environment Variables

Add these in the Vercel project settings or Vars section:

```bash
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Upstash Vector Database
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token

# Already Available (from integrations)
KV_URL=automatically_set
KV_REST_API_TOKEN=automatically_set
KV_REST_API_URL=automatically_set
BLOB_READ_WRITE_TOKEN=automatically_set
```

## How to Get API Keys

### Gemini API Key
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy and save in Vars section

### Upstash Vector
1. Visit https://console.upstash.com
2. Create new Vector Index (free tier)
3. Choose dimension: 768 (for Gemini embeddings)
4. Copy URL and Token to Vars section

## Next Steps - Phase 2

- Document upload functionality
- PDF/Word/Text parsing
- Generate embeddings with Gemini
- Store in Upstash Vector
- Build RAG retrieval system

## Features

- Public chatbot interface
- Example questions for recruiters
- Admin dashboard for story management
- Continuous learning with approval workflow
- Analytics tracking
- Rate limiting and security

## Tech Stack

- Next.js 16 (App Router)
- Google Gemini (LLM & Embeddings)
- Upstash Vector (Story bank)
- Upstash Redis (Analytics)
- Vercel Blob (Document storage)
- Tailwind CSS (Styling)
