# AuditX Deployment & Best Practices Guide

## Quick Start

### Prerequisites
```bash
Node.js 18+
pnpm (or npm/yarn)
Supabase account
Google Gemini API key
```

### Installation
```bash
pnpm install
pnpm dev
```

### Environment Setup
Create `.env.local`:
```env
# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# OCR.space (already configured)
# Uses free API: K89248956688957
```

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **AI**: Google Gemini 2.5 Flash (via AI SDK 6)
- **OCR**: OCR.space (free API) + Gemini fallback
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (documents)
- **Auth**: Supabase Auth

### Feature Modules

#### 1. News Intelligence
- **Purpose**: Real-time fraud, corruption, and compliance news
- **API**: `/api/news/fetch`
- **External Sources**: NewsAPI, custom audit database
- **Status**: ✅ Production Ready

#### 2. Company Intelligence
- **Purpose**: Risk assessment and background checks
- **API**: `/api/company-intelligence`
- **AI Model**: Gemini 2.5 Flash
- **Status**: ✅ Production Ready

#### 3. Document Processing
- **Purpose**: Invoice/receipt/document extraction
- **Flow**: OCR.space → Gemini → Supabase
- **API**: `/api/ocr/extract`
- **Status**: ✅ Production Ready

#### 4. AI Copilot
- **Purpose**: Conversational audit assistant
- **API**: `/api/ai-copilot/chat`
- **Model**: Gemini 2.5 Flash
- **Status**: ✅ Production Ready

#### 5. Fraud Detection
- **Purpose**: Real-time anomaly and duplicate detection
- **APIs**: 
  - `/api/ocr/duplicate-detection`
  - `/api/fraud` (data analysis)
- **Status**: ✅ Production Ready

## Development Workflow

### Adding a New Feature

1. **Create API Route**
```typescript
// app/api/feature/route.ts
import { NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

const model = google("gemini-2.5-flash")

export async function POST(request: Request) {
  try {
    const { data } = await request.json()
    
    const { text } = await generateText({
      model,
      prompt: "Your prompt here",
      temperature: 0.3,
    })
    
    return NextResponse.json({ success: true, result: text })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

2. **Create UI Component**
```typescript
// app/dashboard/feature/page.tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FeaturePage() {
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "..." }),
      })
      
      const result = await response.json()
      // Handle result
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Button onClick={handleAction} disabled={loading}>
        {loading ? "Processing..." : "Execute"}
      </Button>
    </Card>
  )
}
```

3. **Update Navigation**
Add to `components/dashboard-nav.tsx`:
```typescript
{
  title: "New Feature",
  href: "/dashboard/feature",
  icon: IconName,
}
```

### Best Practices

1. **Error Handling**
   - Always wrap API calls in try-catch
   - Return meaningful error messages
   - Log errors with `console.error("[v0] ...")`
   - Provide user-friendly fallbacks

2. **Type Safety**
   - Use TypeScript interfaces for all data
   - No `any` types without justification
   - Validate user inputs server-side

3. **Performance**
   - Use React Server Components for data fetching
   - Implement proper loading states
   - Cache responses when appropriate
   - Optimize database queries

4. **Security**
   - Never expose API keys in client code
   - Validate all inputs server-side
   - Use Supabase RLS policies
   - Sanitize user content

5. **Testing**
   - Test with various document types for OCR
   - Verify API timeouts and retries
   - Test with large datasets
   - Simulate network failures

## Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Feature: add new capability"
git push origin main
```

2. **Deploy**
- Vercel auto-deploys on push to main
- Preview deploys on pull requests
- Monitor build logs and performance

3. **Environment Variables**
- Add to Vercel project settings
- Never commit `.env.local`

### Database Migrations

```bash
# Backup before migrations
supabase db pull

# Apply migrations
supabase migration new add_new_table
# Edit migration file
supabase db push
```

## Monitoring & Debugging

### Debug Logging
Use console logging pattern:
```typescript
console.log("[v0] Operation description:", data)
console.error("[v0] Error context:", error)
```

### Performance Monitoring
- Check Vercel Analytics dashboard
- Monitor API response times
- Track error rates
- Monitor Supabase usage

### Common Issues

**Issue**: OCR extraction returns empty text
**Solution**: 
- Verify image quality and format
- Check OCR.space rate limiting
- Fallback uses Gemini automatically
- Check browser console for errors

**Issue**: Document upload fails
**Solution**:
- Verify Supabase storage bucket permissions
- Check file size limits (25MB)
- Verify user authentication
- Check network connectivity

**Issue**: Gemini API errors
**Solution**:
- Verify API key is valid and not quota-exceeded
- Check rate limiting (60 requests/minute)
- Implement exponential backoff retry
- Monitor API key usage in Google Cloud Console

## Scaling Considerations

### Current Limits
- File upload: 25MB per document
- OCR.space: Free tier rate limiting
- Gemini: 60 requests/minute (free tier)
- Database: Supabase free tier (500MB)

### Upgrade Path
1. **Increase File Uploads**: Configure Supabase storage limits
2. **OCR**: Upgrade to OCR.space paid or use alternative
3. **AI**: Upgrade Gemini quota or use Gemini Pro
4. **Database**: Upgrade Supabase plan (incremental pricing)

## Feature Request Workflow

1. **Validate Idea**
   - Check if already exists
   - Align with audit/compliance goals
   - Estimate complexity

2. **Implement**
   - Create feature branch
   - Follow architecture patterns
   - Add tests and documentation

3. **Review**
   - Code review for quality
   - Security review
   - Performance testing

4. **Deploy**
   - Staging environment testing
   - Production deployment
   - Monitor for issues

## Support & Troubleshooting

### Logs
- Check browser console: F12 → Console
- Check server logs: Vercel dashboard
- Check database logs: Supabase dashboard

### Resources
- [Gemini API Docs](https://ai.google.dev/)
- [Next.js Docs](https://nextjs.org/)
- [Supabase Docs](https://supabase.io/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Emergency Contacts
- Database issues: Supabase support
- API issues: Google Cloud support
- Deployment issues: Vercel support

## Maintenance Schedule

- **Daily**: Monitor error logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies (pnpm update)
- **Quarterly**: Security audit and penetration testing
- **Annually**: Architecture review and scaling assessment

## Version History

- **v12** (Current): Complete optimization with free OCR.space API + Gemini fallback
- **v6**: Previous stable version (reverted to for fresh start)
- **Production Ready**: All working features tested and validated
