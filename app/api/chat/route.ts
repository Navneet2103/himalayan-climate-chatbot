import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(
  process.env.PINECONE_INDEX_NAME || 'himalayan-climate-kb'
);

// Types
interface PineconeMatch {
  id: string;
  score?: number;
  metadata?: {
    content_type: string;
    paper_title: string;
    page_number: number;
    content: string;
    image_url?: string;
    paper_id?: string;
  };
}

interface ContextItem {
  type: 'text' | 'image';
  content: string;
  source: string;
  page: number;
  imageUrl?: string;
  score: number;
}

// Helper to create a clean filename for PDF links
function createPdfFilename(paperTitle: string): string {
  return (
    paperTitle
      // remove special chars
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      // spaces -> underscores
      .replace(/\s+/g, '_')
      // truncate
      .substring(0, 80) + '.pdf'
  );
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Step 1: Create embedding for the user's query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
      dimensions: 1536,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 2: Search Pinecone for relevant context (get more results for better coverage)
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 12,
      includeMetadata: true,
    });

    // Step 3: Process search results
    const matches = (searchResults.matches || []) as PineconeMatch[];

    const contextItems: ContextItem[] = matches
      .filter((match) => match.metadata && (match.score || 0) > 0.3)
      .map((match) => ({
        type: match.metadata!.content_type as 'text' | 'image',
        content: match.metadata!.content,
        source: match.metadata!.paper_title,
        page: match.metadata!.page_number,
        imageUrl: match.metadata!.image_url,
        score: match.score || 0,
      }));

    // Separate text and image results
    const textResults = contextItems.filter((item) => item.type === 'text');
    const imageResults = contextItems.filter(
      (item) => item.type === 'image' && item.imageUrl
    );

    // Get unique papers for reference (ES5-friendly, no Set)
    const uniquePapers: string[] = [];
    contextItems.forEach((item) => {
      if (uniquePapers.indexOf(item.source) === -1) {
        uniquePapers.push(item.source);
      }
    });

    const paperMapping: Record<string, string> = {};
    uniquePapers.forEach((paper) => {
      // In case you want to change display names later
      paperMapping[paper] = paper; // Full paper name
    });

    // Build context string for GPT with FULL paper names
    let contextString = '';

    if (textResults.length > 0) {
      contextString += '### Relevant Text from Research Papers:\n\n';
      textResults.forEach((item) => {
        contextString += `[Paper: \"${item.source}\", Page ${item.page}]\n${item.content}\n\n`;
      });
    }

    if (imageResults.length > 0) {
      contextString += '### Relevant Figures/Charts Available:\n\n';
      imageResults.forEach((item) => {
        contextString += `[Figure from: \"${item.source}\", Page ${item.page}]\nFigure Description: ${item.content}\n\n`;
      });
    }

    // Step 4: Generate response with GPT-4
    const systemPrompt = `You are an expert research assistant specializing in Himalayan climate, glaciology, hydrology, and environmental science. You answer questions using a comprehensive knowledge base of peer-reviewed research papers.

IMPORTANT INSTRUCTIONS FOR CITATIONS:
1. When citing information, ALWAYS use the EXACT full paper title provided in the context.
2. Format citations as: (Paper: "Full Paper Title", Page X).
3. NEVER use generic references like "Source 1" or "Source 8" - always use the actual paper name.
4. Be specific about which paper each piece of information comes from.

IMPORTANT INSTRUCTIONS FOR FIGURES:
1. When figures/charts are relevant to the answer, MENTION them explicitly.
2. Say something like "A relevant figure from [Paper Name] on page X illustrates this...".
3. Describe what the figure shows if the description is helpful.

Your role:
- Answer questions accurately using ONLY the provided context.
- Cite specific papers by their FULL TITLE and page numbers.
- Explain complex concepts clearly while maintaining scientific accuracy.
- If the context doesn't contain enough information, acknowledge this honestly.
- When relevant figures exist, reference them to support your answer.

Remember: Users will see the actual images, so describe what they show and why they're relevant.`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      // keep last few turns of chat history
      ...chatHistory.slice(-6).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: `Research Context:\n${contextString}\n\nUser Question: ${message}\n\nAnswer the user's question using only the research context above. If relevant figures are available, mention them in your response.`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const assistantMessage = completion.choices[0].message.content || '';

    // Prepare sources with PDF filenames for linking (ES5-friendly, no Map)
    const sourceMap: {
      [key: string]: { title: string; page: number; pdfFile: string };
    } = {};

    textResults.forEach((t) => {
      if (!sourceMap[t.source]) {
        sourceMap[t.source] = {
          title: t.source,
          page: t.page,
          pdfFile: createPdfFilename(t.source),
        };
      }
    });

    const sources: { title: string; page: number; pdfFile: string }[] = [];
    Object.keys(sourceMap).forEach((key) => {
      sources.push(sourceMap[key]);
    });

    // Return response with images and proper sources
    return NextResponse.json({
      message: assistantMessage,
      images: imageResults.slice(0, 4).map((img) => ({
        url: img.imageUrl,
        source: img.source,
        page: img.page,
        description: img.content,
        pdfFile: createPdfFilename(img.source),
        score: img.score,
      })),
      sources: sources.slice(0, 6),
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
