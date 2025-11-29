# 🏔️ Himalayan Climate Research Assistant

An AI-powered chatbot that answers questions about Himalayan climate, glaciology, and environmental science using a knowledge base of 35 research papers with 292 images.

## Features

- **RAG-powered responses**: Uses Pinecone vector search to find relevant content
- **Multimodal**: Displays relevant figures, charts, and graphs from papers
- **Proper citations**: Shows actual paper names (not "Source 1") with page numbers
- **Clickable PDF links**: Click on sources to open the original paper
- **Image expansion**: Click images to view full-size with descriptions
- **Conversational**: Maintains chat history for follow-up questions

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4o, text-embedding-3-small
- **Vector DB**: Pinecone
- **Image Storage**: Cloudinary
- **Deployment**: Vercel

## Prerequisites

You should have already generated the knowledge base with:
- 3,147 text vectors in Pinecone
- 292 image vectors in Pinecone
- Images uploaded to Cloudinary

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```env
OPENAI_API_KEY=sk-your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=himalayan-climate-kb
```

### 3. Add Your Research Papers (For PDF Links)

Create a `public/papers` folder and add your PDF files:

```bash
mkdir -p public/papers
```

**Important**: The PDF filenames should match the paper titles in your knowledge base. The system converts paper titles to filenames like this:
- Spaces → underscores
- Special characters removed
- Truncated to 80 characters
- `.pdf` extension added

For easiest setup, create a script to copy your papers:

```python
# copy_papers.py - Run this in your kb_generator folder
import os
import shutil
import json

# Load your chunks to get paper titles
with open('output/chunks/all_chunks.json', 'r') as f:
    chunks = json.load(f)

# Get unique paper titles
papers = set(chunk['paper_title'] for chunk in chunks)

# Create filename mapping
for paper in papers:
    # Original PDF path (adjust if your PDFs have different names)
    original = f"papers/{paper}.pdf"
    
    # Target filename (same logic as the chatbot)
    clean_name = ''.join(c if c.isalnum() or c in ' -_' else '_' for c in paper)[:80]
    target = f"../chatbot/public/papers/{clean_name.replace(' ', '_')}.pdf"
    
    if os.path.exists(original):
        shutil.copy(original, target)
        print(f"Copied: {paper}")
```

Or simply copy all your PDFs to `public/papers/` and rename them to match.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import your repository
4. Add Environment Variables:
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME`
5. Click "Deploy"

**Note**: For PDF links to work on Vercel, your PDFs must be in the `public/papers` folder before deployment. Alternatively, you can host PDFs elsewhere and modify the source linking logic.

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## Project Structure

```
chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Chat API - RAG pipeline
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main chat UI with image modal
├── public/
│   └── papers/               # Your PDF research papers go here
│       ├── paper1.pdf
│       ├── paper2.pdf
│       └── ...
├── .env.example              # Environment variables template
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Query    │────▶│  Create Query   │────▶│ Search Pinecone │
│                 │     │   Embedding     │     │   (Top 12)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Display UI    │◀────│   GPT-4o with   │◀────│  Text + Image   │
│  + Images +     │     │  Full Paper     │     │    Context      │
│  PDF Links      │     │    Names        │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Key Improvements in This Version

| Feature | Description |
|---------|-------------|
| **Proper Citations** | Shows actual paper titles like "Climate Change Impact on Himalayan Glaciers" instead of "Source 8" |
| **Clickable PDFs** | Click any source to open the PDF at the specific page |
| **Image Modal** | Click images to view full-size with complete description |
| **Better UI** | Modern design with image gallery, source cards, and clear sections |
| **New Chat** | Button to start a fresh conversation |

## API Reference

### POST /api/chat

Request:
```json
{
  "message": "What are the impacts of climate change on Himalayan glaciers?",
  "chatHistory": []
}
```

Response:
```json
{
  "message": "Based on the research from \"Climate Trends in the Himalayan Region\"...",
  "images": [
    {
      "url": "https://res.cloudinary.com/...",
      "source": "Climate Trends in the Himalayan Region",
      "page": 5,
      "description": "Figure showing glacier retreat over decades...",
      "pdfFile": "Climate_Trends_in_the_Himalayan_Region.pdf"
    }
  ],
  "sources": [
    { 
      "title": "Climate Trends in the Himalayan Region", 
      "page": 5,
      "pdfFile": "Climate_Trends_in_the_Himalayan_Region.pdf"
    }
  ]
}
```

## Customization

### Change the theme colors

Edit `tailwind.config.js` to modify the `himalayan` color palette.

### Adjust number of search results

In `app/api/chat/route.ts`, modify `topK`:
```typescript
const searchResults = await index.query({
  vector: queryEmbedding,
  topK: 12,  // Change this number
  includeMetadata: true,
});
```

### Modify the AI behavior

Edit the `systemPrompt` in `app/api/chat/route.ts`.

### Change PDF hosting location

Modify the `SourceButton` component in `app/page.tsx` to point to your PDF hosting:
```typescript
const handleClick = () => {
  // Change this URL pattern
  window.open(`https://your-storage.com/papers/${source.pdfFile}#page=${source.page}`, '_blank');
};
```

## Troubleshooting

### "Source 8" still appearing
The AI might occasionally fall back to numbered sources. The improved prompt should prevent this, but you can regenerate responses if needed.

### PDF links not working
- Ensure PDFs are in `public/papers/`
- Check that filenames match (underscores, no special chars)
- Use the copy script above to auto-rename

### Images not displaying
- Verify Cloudinary URLs in Pinecone metadata
- Check browser console for CORS errors

### Slow responses
- Pinecone free tier has cold starts
- First query may take longer

## License

MIT
