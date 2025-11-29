'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface ImageData {
  url: string;
  source: string;
  page: number;
  description: string;
  pdfFile: string;
  score?: number;
}

interface SourceData {
  title: string;
  page: number;
  pdfFile: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: ImageData[];
  sources?: SourceData[];
}

// ============================================
// PAPER LINKS CONFIGURATION
// Add your Google Drive links here
// ============================================
const PAPER_LINKS: Record<string, string> = {
  // 1-s2.0-S0048969723033569-main...
  "1-s20-S0048969723033569-main.pdf": "https://drive.google.com/file/d/1_S06TbyM4DOmkOP8np7hJiJLrxcBObjl/view?usp=sharing",

  // 1-s2.0-S0048969724003875-main...
  "1-s20-S0048969724003875-main.pdf": "https://drive.google.com/file/d/1MJwfb74p1Qw9ZWTa82q3DjbzcCT3zOud/view?usp=sharing",

  // 1-s2.0-S1470160X21003551-main...
  "1-s20-S1470160X21003551-main.pdf": "https://drive.google.com/file/d/15mO3CYNOqNmIU5xi9xQujQxQFCqqClrZ/view?usp=sharing",

  // Analysing climatic variability and extremes events in the Hi...
  "Analysing_climatic_variability_and_extremes_events_in_the_Himalayan_regions_focu.pdf": "https://drive.google.com/file/d/1Z9ko1qg1mZ2zNVb0jq8J5-0YeNvtxOMy/view?usp=sharing",

  // Assessing climate trends in the Northwestern Himalayas  a co...
  "Assessing_climate_trends_in_the_Northwestern_Himalayas__a_comprehensive_analysis.pdf": "https://drive.google.com/file/d/1J1a4hWXUkqnNV-y77CjtpsvsQMuNu2TP/view?usp=sharing",

  // Glacial lake changes and the identification of potentially d...
  "Glacial_lake_changes_and_the_identification_of_potentially_dangerous_glacial_lak.pdf": "https://drive.google.com/file/d/1F_bPGuhroc9Y_7rA4SmUqm_zkMgEILxo/view?usp=sharing",

  // PIIS2405844024168284...
  "PIIS2405844024168284.pdf": "https://drive.google.com/file/d/1VsLTVQggfZMYYtmVaG-FHxJ9LoSWy64p/view?usp=sharing",

  // SeasonalSpatio-TemporalVariabilityinTemperatureoverNorthKash...
  "SeasonalSpatio-TemporalVariabilityinTemperatureoverNorthKashmirHimalayasUsingSen.pdf": "https://drive.google.com/file/d/1OFBdesd2fTDlxGO4r1HsveTQs6ow_XKj/view?usp=sharing",

  // Water Resources Research - 2023 - Swarnkar - Increasing Floo...
  "Water_Resources_Research_-_2023_-_Swarnkar_-_Increasing_Flood_Frequencies_Under_.pdf": "https://drive.google.com/file/d/1OX3ya6lB12MeLNb54jyyVH45_rH4Slle/view?usp=sharing",

  // atmosphere-12-01683-v2...
  "atmosphere-12-01683-v2.pdf": "https://drive.google.com/file/d/1qBJppBPGeTz3Y9Ctk8e6S8qkOBLy3YOX/view?usp=sharing",

  // atmosphere-13-00764-v2...
  "atmosphere-13-00764-v2.pdf": "https://drive.google.com/file/d/1eyat2fCuIdahgdEsFCR71dECjUTo94Pc/view?usp=sharing",

  // atmosphere-13-01866...
  "atmosphere-13-01866.pdf": "https://drive.google.com/file/d/1Rm3BoZvVolUdO1-HMpJc_73BrkQToJeM/view?usp=sharing",

  // atmosphere-13-02069-v2...
  "atmosphere-13-02069-v2.pdf": "https://drive.google.com/file/d/1lU1xsTU_m18DaGuvWRfJ5WTPZuG2zoSO/view?usp=sharing",

  // atmosphere-14-00454...
  "atmosphere-14-00454.pdf": "https://drive.google.com/file/d/1YOYHg0i_fXMDlchBAnFHAYvvfr154XXb/view?usp=sharing",

  // atmosphere-14-00454 (1)...
  "atmosphere-14-00454_1.pdf": "https://drive.google.com/file/d/1xGlh6a73KXU2rNq0r_kyoTs7aMMFqvM5/view?usp=sharing",

  // fclim-05-1069994...
  "fclim-05-1069994.pdf": "https://drive.google.com/file/d/10cw5APHAgHVx-f_8nGV43iPw0m1zRKiB/view?usp=sharing",

  // fenvs-10-1006399...
  "fenvs-10-1006399.pdf": "https://drive.google.com/file/d/1h-2MqxpytZV6Y8Jd_EWfNDjOewqr8N91/view?usp=sharing",

  // j.atmosres.2021.105481...
  "jatmosres2021105481.pdf": "https://drive.google.com/file/d/1NB1NNBZU2vLXjCz4kYZRZnyJwQGi78FT/view?usp=sharing",

  // jwc0142342...
  "jwc0142342.pdf": "https://drive.google.com/file/d/1ONln40D8Lj-BTRNM_6XoD7tHvepOIu0v/view?usp=sharing",

  // jwc2024141...
  "jwc2024141.pdf": "https://drive.google.com/file/d/1gtsqycutBTKbYO4_q51yZ1Yrpj4402CO/view?usp=sharing",

  // s00382-021-05984-6...
  "s00382-021-05984-6.pdf": "https://drive.google.com/file/d/1ArNErYheXH6Oyoy9Q3wqTU0JZxY-rBjf/view?usp=sharing",

  // s00382-021-06113-z...
  "s00382-021-06113-z.pdf": "https://drive.google.com/file/d/1jLfEqC9lAwZSBMBBMssUrwaPeHrmQcj7/view?usp=sharing",

  // s00704-022-04280-5...
  "s00704-022-04280-5.pdf": "https://drive.google.com/file/d/14DCB82FA4scZ8d6JE9WSIT01rQtFN4m8/view?usp=sharing",

  // s00704-023-04661-4...
  "s00704-023-04661-4.pdf": "https://drive.google.com/file/d/1WegEmM539_ImQEOpF18y73S0pVFPOPp4/view?usp=sharing",

  // s10113-023-02142-y...
  "s10113-023-02142-y.pdf": "https://drive.google.com/file/d/1mWW6nItJZHBPonlWI_XFUpNti0qHaqCd/view?usp=sharing",

  // s10661-021-09418-y...
  "s10661-021-09418-y.pdf": "https://drive.google.com/file/d/1mM8nyye7XkvCvBHzTXnWvqehzSO_ewSe/view?usp=sharing",

  // s10661-021-09689-5...
  "s10661-021-09689-5.pdf": "https://drive.google.com/file/d/10tNDtREVx1iDi8-QGL-qrM-_TEhDNATW/view?usp=sharing",

  // s10661-024-12693-0...
  "s10661-024-12693-0.pdf": "https://drive.google.com/file/d/1kkXyEONkaTnVBo1eeJGhEeKaSifcw46q/view?usp=sharing",

  // s10668-023-03476-7...
  "s10668-023-03476-7.pdf": "https://drive.google.com/file/d/1iNHUDX-bNl9iLOfWJCct4vpbErlyzTyf/view?usp=sharing",

  // s11069-022-05616-0...
  "s11069-022-05616-0.pdf": "https://drive.google.com/file/d/1d-yNfV877d3OA1-G1Yv3ftLCpWs_rKox/view?usp=sharing",

  // s11356-023-28263-9...
  "s11356-023-28263-9.pdf": "https://drive.google.com/file/d/1BHa22X1_e8Us_zYTIRtpZt1zQrSUYpro/view?usp=sharing",

  // s41477-024-01855-0...
  "s41477-024-01855-0.pdf": "https://drive.google.com/file/d/1-_7O8EGuzjUDl7gp0Qf5650VFOJEHsUc/view?usp=sharing",

  // s41561-022-01076-0...
  "s41561-022-01076-0.pdf": "https://drive.google.com/file/d/1RqmGpFRIYO-pireHkqXJeaexwiSzvYNN/view?usp=sharing",

  // s41561-023-01331-y...
  "s41561-023-01331-y.pdf": "https://drive.google.com/file/d/1kt1nrJpBAOuCFyZ7PF_CC-JumB_aznMA/view?usp=sharing",

};

// Helper function to get paper URL
function getPaperUrl(pdfFilename: string, page: number): string | null {
  const driveLink = PAPER_LINKS[pdfFilename];
  if (driveLink) {
    // Convert Google Drive view link to direct preview
    // From: https://drive.google.com/file/d/FILE_ID/view
    // To: https://drive.google.com/file/d/FILE_ID/preview
    return driveLink.replace('/view', '/preview');
  }
  return null;
}

// ============================================

// Image Modal Component
function ImageModal({ 
  image, 
  onClose 
}: { 
  image: ImageData | null; 
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-3 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-himalayan-800">{image.source}</h3>
            <p className="text-sm text-gray-500">Page {image.page}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <img
            src={image.url}
            alt={`Figure from ${image.source}`}
            className="w-full h-auto"
          />
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-himalayan-700 mb-2">Figure Description:</p>
            <p className="text-sm text-gray-700">{image.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Source Button Component
function SourceButton({ source }: { source: SourceData }) {
  const paperUrl = getPaperUrl(source.pdfFile, source.page);
  const hasLink = !!paperUrl;
  
  const handleClick = () => {
    if (paperUrl) {
      window.open(paperUrl, '_blank');
    }
  };

  // Truncate long titles
  const displayTitle = source.title.length > 50 
    ? source.title.substring(0, 47) + '...' 
    : source.title;

  return (
    <div
      onClick={hasLink ? handleClick : undefined}
      className={`group flex items-center gap-2 px-3 py-2 bg-white 
                 border border-himalayan-200 rounded-lg shadow-sm text-left
                 ${hasLink 
                   ? 'hover:bg-himalayan-50 hover:border-himalayan-400 hover:shadow cursor-pointer' 
                   : 'opacity-90'
                 } transition-all`}
      title={`${source.title} - Page ${source.page}`}
    >
      <span className={`${hasLink ? 'text-red-500 group-hover:scale-110' : 'text-gray-400'} transition-transform`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.05,14.72 16.76,14.38 16.76,15.5C16.76,16.63 14.4,16.23 14.4,16.23C14.4,16.23 13.35,15.18 12.77,15.33C12.2,15.47 9.3,18.22 8.45,17.46C7.6,16.7 10.91,13.67 10.91,13.67C10.91,13.67 11.16,13.08 10.92,12.31Z"/>
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{displayTitle}</p>
        <p className="text-xs text-gray-500">Page {source.page}</p>
      </div>
      {hasLink ? (
        <span className="text-gray-400 group-hover:text-himalayan-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </span>
      ) : (
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
          Reference
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: messages.slice(-6),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          images: data.images,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestedQuestions = [
    "What are the main impacts of climate change on Himalayan glaciers?",
    "How has temperature changed in the Himalayan region over the past decades?",
    "What are the environmental variables affecting Himalayan ecosystems?",
    "Show me data about precipitation patterns in the Himalayas",
    "What causes glacier lake outburst floods in the Himalayas?",
    "How does climate change affect biodiversity in the Himalayan region?",
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-himalayan-700 via-himalayan-800 to-himalayan-900 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl filter drop-shadow-lg">🏔️</div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Himalayan Climate Research Assistant
                </h1>
                <p className="text-himalayan-200 text-sm mt-0.5">
                  AI-powered insights from 35 peer-reviewed research papers • 3,439 knowledge vectors
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg 
                         text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                New Chat
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="relative mb-6">
                <div className="text-8xl filter drop-shadow-xl">🏔️</div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs 
                              px-2 py-1 rounded-full font-medium shadow-lg">
                  AI Powered
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-himalayan-800 mb-3">
                Welcome to Your Research Assistant
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl text-lg">
                Ask me anything about Himalayan climate, glaciology, environmental variables, 
                and atmospheric science. I'll search through 35 research papers and show you 
                relevant figures and citations.
              </p>

              <div className="w-full max-w-4xl">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  💡 Try asking one of these questions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(question)}
                      className="p-4 text-left bg-white hover:bg-himalayan-50 
                               border border-gray-200 hover:border-himalayan-400 rounded-xl 
                               shadow-sm hover:shadow-md transition-all group"
                    >
                      <span className="text-himalayan-500 group-hover:text-himalayan-600 mr-2">
                        →
                      </span>
                      <span className="text-gray-700">{question}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  <span>35 Papers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <span>292 Figures</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <span>3,147 Text Chunks</span>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div
                key={idx}
                className={`message-enter flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-himalayan-600 to-himalayan-700 text-white p-4 shadow-lg'
                      : 'bg-white shadow-lg border border-gray-100 p-5'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div>
                      {/* Main Response */}
                      <div className="prose prose-sm max-w-none prose-headings:text-himalayan-800 
                                    prose-strong:text-himalayan-700 prose-a:text-himalayan-600">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      
                      {/* Related Images Section */}
                      {message.images && message.images.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">📊</span>
                            <h4 className="font-semibold text-himalayan-800">
                              Related Figures & Charts
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {message.images.map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="group border border-gray-200 rounded-xl overflow-hidden 
                                         bg-gray-50 hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => setSelectedImage(img)}
                              >
                                <div className="relative h-48 bg-white">
                                  <img
                                    src={img.url}
                                    alt={`Figure from ${img.source}`}
                                    className="w-full h-full object-contain p-2"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 
                                                transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 bg-white 
                                                   px-3 py-1.5 rounded-full text-sm font-medium 
                                                   shadow-lg transition-opacity flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                      </svg>
                                      Click to expand
                                    </span>
                                  </div>
                                </div>
                                <div className="p-3 border-t border-gray-200">
                                  <p className="font-medium text-sm text-himalayan-700 truncate">
                                    {img.source}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Page {img.page}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                    {img.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Sources Section */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">📚</span>
                            <h4 className="font-semibold text-himalayan-800">
                              Source Papers
                            </h4>
                            <span className="text-xs text-gray-500">
                              (Click to view if available)
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {message.sources
                              .filter((s, i, arr) => 
                                arr.findIndex(x => x.title === s.title) === i
                              )
                              .map((source, sIdx) => (
                                <SourceButton key={sIdx} source={source} />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="loading-dot w-2.5 h-2.5 bg-himalayan-500 rounded-full"></div>
                    <div className="loading-dot w-2.5 h-2.5 bg-himalayan-500 rounded-full"></div>
                    <div className="loading-dot w-2.5 h-2.5 bg-himalayan-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-500">
                    Searching through research papers...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Himalayan climate, glaciers, environmental data..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12
                         focus:outline-none focus:ring-2 focus:ring-himalayan-500 
                         focus:border-transparent shadow-sm"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                Press Enter ↵
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-himalayan-600 to-himalayan-700 
                       text-white rounded-xl font-medium shadow-md
                       hover:from-himalayan-700 hover:to-himalayan-800 
                       disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                       transition-all hover:shadow-lg disabled:shadow-none
                       flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3 text-center">
            🏔️ Powered by RAG + GPT-4 • Searching across 35 research papers • 
            Images from Cloudinary • Vectors stored in Pinecone
          </p>
        </div>
      </footer>

      {/* Image Modal */}
      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
