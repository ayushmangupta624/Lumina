"use client";
 
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from "next/navigation";
 
// Define a type for a single question
interface Question {
  id: string;
  type: "written" | "mcq" | "flashcard";
  question: string;
  options?: string[];
  answer?: string;
}
 
interface Video {
  videoId: string;
  title: string;
  prompt: string;
  videoFilePath: string;
  createdAt: string;
  spaceId: string;
  mainContentUrl?: string;
}
 
interface MainContent {
  summary: string;
  questions: Array<{
    id: string;
    type: "written" | "mcq" | "flashcard";
    question: string;
    options?: string[];
    answer?: string;
    feedback?: string;
    userAnswer?: string;
    showSolution?: boolean;
    showFeedback?: boolean;
  }>;
}
 
async function getLLMFeedback({ question, referenceAnswer, userAnswer }: { question: string; referenceAnswer: string; userAnswer: string; }) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not set");
  const prompt = `You are a helpful tutor. Here is a question and a reference answer. Here is a student's answer. Give constructive feedback on the student's answer, pointing out what is correct, what is missing, and how it could be improved.\n\nQuestion: ${question}\nReference Answer: ${referenceAnswer}\nStudent Answer: ${userAnswer}\n\nFeedback:`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful tutor." },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "No feedback generated.";
}
 
// Helper functions for quiz logic with proper types
const getCorrectAnswerText = (question: Question): string => {
  if (!question || !question.answer) return "Not available.";
  if (question.options?.includes(question.answer)) {
    return question.answer;
  }
  const correctOption = question.options?.find((opt: string) => 
    opt.trim().split(/[.)]/)[0].trim().toLowerCase() === question.answer!.replace(/[.)]/, '').trim().toLowerCase()
  );
  return correctOption || question.answer;
};
 
const isCorrectMCQ = (question: Question, userAnswer: string | undefined): boolean => {
  if (!question || !userAnswer) return false;
  const correctAnswerText = getCorrectAnswerText(question);
  return userAnswer === correctAnswerText;
};
 
export default function VideoPage() {
  const params = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("main");
  const [mainContent, setMainContent] = useState<MainContent | null>(null);
  const [mainContentLoading, setMainContentLoading] = useState(false);
  const [mainContentError, setMainContentError] = useState<string | null>(null);
  const [questionStates, setQuestionStates] = useState<Record<string, any>>({});
  // Add a new state for feedback loading and error per question
  const [feedbackLoading, setFeedbackLoading] = useState<Record<string, boolean>>({});
  const [feedbackError, setFeedbackError] = useState<Record<string, string | null>>({});
  const [videoUrl, setVideoUrl] = useState(""); 

  const searchParams = useSearchParams(); 
  const videoPath = searchParams.get("videoPath")

  // State for AI Tutor
  const [tutorMessages, setTutorMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Tutor. Ask me anything about the content of this video.' }
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const tutorChatContainerRef = useRef<HTMLDivElement>(null);
 
  // State for Flashcards
  const [flashcards, setFlashcards] = useState<Question[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
 
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/spaces/${params.spaceId}/videos/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch video");
        }
        const data = await response.json();
        setVideo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [params.spaceId, params.id]);
 
  useEffect(() => {
    if (video && video.mainContentUrl) {
      setMainContentLoading(true);
      fetch(video.mainContentUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch main content");
          return res.json();
        })
        .then((data) => {
          setMainContent(data);
          setMainContentError(null);
 
          // Filter and set flashcards when main content loads
          if (data.questions) {
            const filteredFlashcards = data.questions.filter((q: Question) => q.type === 'flashcard');
            setFlashcards(filteredFlashcards);
          }
        })
        .catch((err) => {
          setMainContentError("Could not load main content");
        })
        .finally(() => setMainContentLoading(false));
    } else {
      setMainContent(null);
    }
 
    // Reset flashcard state when video changes
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
  }, [video]);
 
  useEffect(() => {
    // Reset tutor chat when video changes
    setTutorMessages([{ role: 'assistant', content: 'Hello! I am your AI Tutor. Ask me anything about the content of this video.' }]);
    setTutorInput('');
    setIsTutorLoading(false);
  }, [video]);
 
  // Effect to scroll AI Tutor chat to the bottom
  useEffect(() => {
    if (tutorChatContainerRef.current) {
      tutorChatContainerRef.current.scrollTo({
        top: tutorChatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [tutorMessages]);
 
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim() || isTutorLoading) return;
 
    const userMessage = { role: 'user', content: tutorInput };
    const newMessages = [...tutorMessages, userMessage];
    setTutorMessages(newMessages);
 
    // Add an empty assistant message to be populated by the stream
    setTutorMessages(currentMessages => [...currentMessages, { role: 'assistant', content: '' }]);
 
    setTutorInput('');
    setIsTutorLoading(true);
 
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API key not set");
 
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: newMessages,
 
          stream: true, // Enable streaming
        }),
      });
 
      if (!response.body) {
        throw new Error("No response body");
      }
 
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
 
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
 
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data.trim() === '[DONE]') {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setTutorMessages(currentMessages => {
                  const allButLast = currentMessages.slice(0, -1);
                  const lastMessage = currentMessages[currentMessages.length - 1];
                  const updatedLastMessage = {
                    ...lastMessage,
                    content: lastMessage.content + content,
                  };
                  return [...allButLast, updatedLastMessage];
                });
              }
            } catch (error) {
              // Ignore JSON parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Error calling AI Tutor:", error);
      setTutorMessages(currentMessages => {
          const latestMessages = [...currentMessages];
          const lastMessage = latestMessages[latestMessages.length - 1];
          if (lastMessage.role === 'assistant' && lastMessage.content === '') {
            lastMessage.content = "An error occurred. Please try again.";
          } else {
              latestMessages.push({ role: 'assistant', content: "An error occurred. Please try again." });
          }
          return latestMessages;
      });
    } finally {
      setIsTutorLoading(false);
    }
  };
 
  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
      setIsFlipped(false); // Reset to front of card
    }
  };
 
  const handlePrevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(prev => prev - 1);
      setIsFlipped(false); // Reset to front of card
    }
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-red-400">Error</h2>
          <p className="mt-2 text-white/80">{error}</p>
        </div>
      </div>
    );
  }
 
  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white">Video Not Found</h2>
          <p className="mt-2 text-white/80">The requested video could not be found.</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Breadcrumb (optional, can add later) */}
        {/* <div className="mb-4 text-sm text-white/60">MIT 14.01 &gt; Lecture 2: Preferences and Utility Functions</div> */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Video and prompt */}
          <div className="flex-1 min-w-0">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden">
        <div className="aspect-video bg-black">
          <video
            className="w-full h-full object-contain"
            controls
            src={video.videoFilePath}
          
            // src={videoPath ?? ""}
          >
            Your browser does not support the video tag.
          </video>
        </div>
            </div>
            <div className="mt-4 text-lg text-white/90 font-medium">{video.prompt}</div>
          </div>
          {/* Transcript panel */}
          <div className="w-full md:w-[380px] flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-white/10">
                <span className="font-semibold text-white/80">Transcript</span>
 
              </div>
              <div className="px-4 py-2 border-b border-white/10">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/60 transition-all"
                  placeholder="Search transcript..."
                />
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2 text-white/70 text-sm">
                No transcript to this video
              </div>
            </div>
          </div>
        </div>
        {/* Tabs below */}
        <div className="mt-8">
          <div className="flex gap-2 border-b border-white/10">
            <button
              className={`px-4 py-2 font-medium rounded-t cursor-pointer transition-colors focus:outline-none ${activeTab === "main" ? "bg-white/10 text-white border-b-4 border-b-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent" : "text-white/60 hover:bg-white/5"} ${activeTab === "main" ? "border-b-4 border-b-green-400 text-white" : ""}`}
              style={activeTab === "main" ? { borderBottom: '4px solid #22c55e', color: '#fff', background: 'linear-gradient(to right, #60a5fa, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}
              onClick={() => setActiveTab("main")}
            >
              Main Content
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t cursor-pointer transition-colors focus:outline-none ${activeTab === "ai" ? "bg-white/10 text-white border-b-4 border-b-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent" : "text-white/60 hover:bg-white/5"} ${activeTab === "ai" ? "border-b-4 border-b-green-400 text-white" : ""}`}
              style={activeTab === "ai" ? { borderBottom: '4px solid #22c55e', color: '#fff', background: 'linear-gradient(to right, #60a5fa, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}
              onClick={() => setActiveTab("ai")}
            >
              AI Tutor
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-t cursor-pointer transition-colors focus:outline-none ${activeTab === "flashcards" ? "bg-white/10 text-white border-b-4 border-b-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent" : "text-white/60 hover:bg-white/5"} ${activeTab === "flashcards" ? "border-b-4 border-b-green-400 text-white" : ""}`}
              style={activeTab === "flashcards" ? { borderBottom: '4px solid #22c55e', color: '#fff', background: 'linear-gradient(to right, #60a5fa, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}
              onClick={() => setActiveTab("flashcards")}
            >
              Flashcards
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-b-xl shadow-lg p-6 min-h-[120px]">
            {activeTab === "main" && (
              <div>
                {mainContentLoading && <div className="text-white/60">Loading main content...</div>}
                {mainContentError && <div className="text-red-400">{mainContentError}</div>}
                {!mainContentLoading && !mainContentError && !mainContent && (
                  <div className="text-white/60">No main content available for this video.</div>
                )}
                {mainContent && (
                  <div className="space-y-8">
                    {/* Summary */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg mb-1 text-white">Lecture Part 1 Summary</div>
                        <div className="text-white/80 text-base">{mainContent.summary}</div>
                      </div>
 
                    </div>
                    {/* Questions */}
                    {mainContent.questions.map((q, idx) => (
                      <div key={q.id} className={`rounded-lg p-4 mb-6 ${q.type === 'written' ? 'bg-red-100/20' : 'bg-white/5'} border border-white/10`}> 
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-base text-white">Exercise {idx + 1}</span>
                        </div>
                        <div className="mb-3 text-white/90 text-base">{q.question}</div>
                        {q.type === 'written' ? (
                          <>
                            <textarea
                              className="w-full min-h-[60px] rounded-lg border border-white/20 bg-white/10 text-white/90 p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400/60 transition-all"
                              placeholder="Type your answer here..."
                              value={questionStates[q.id]?.userAnswer || ''}
                              onChange={e => setQuestionStates(s => ({ ...s, [q.id]: { ...s[q.id], userAnswer: e.target.value, showFeedback: false, feedback: undefined } }))}
                            />
                            <div className="flex gap-4 mt-2 items-center">
                              <button
                                className="px-4 py-2 bg-[#1f7d48] text-white font-medium rounded-lg hover:bg-[#1b6d3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1f7d48]/50 cursor-pointer"
                                disabled={feedbackLoading[q.id]}
                                onClick={async () => {
                                  const userAnswer = questionStates[q.id]?.userAnswer?.trim();
                                  if (!userAnswer) {
                                    setFeedbackError(e => ({ ...e, [q.id]: "Please enter your answer before submitting." }));
                                    return;
                                  }
                                  setFeedbackError(e => ({ ...e, [q.id]: null }));
                                  setFeedbackLoading(l => ({ ...l, [q.id]: true }));
                                  try {
                                    const feedback = await getLLMFeedback({
                                      question: q.question,
                                      referenceAnswer: q.answer || '',
                                      userAnswer,
                                    });
                                    setQuestionStates(s => ({ ...s, [q.id]: { ...s[q.id], showFeedback: true, feedback } }));
                                  } catch (err) {
                                    setFeedbackError(e => ({ ...e, [q.id]: "Error getting feedback. Please try again." }));
                                  } finally {
                                    setFeedbackLoading(l => ({ ...l, [q.id]: false }));
                                  }
                                }}
                              >
                                {feedbackLoading[q.id] ? "Evaluating..." : "Submit"}
                              </button>
                              <button
                                className="px-3 py-2 text-sm text-blue-300 hover:underline focus:outline-none cursor-pointer"
                                onClick={() => setQuestionStates(s => ({ ...s, [q.id]: { ...s[q.id], showSolution: !s[q.id]?.showSolution } }))}
                              >
                                {questionStates[q.id]?.showSolution ? 'Hide Solution' : 'View Solution'}
                              </button>
                            </div>
                            {feedbackError[q.id] && <div className="mt-2 text-red-400 text-sm">{feedbackError[q.id]}</div>}
                            {questionStates[q.id]?.showFeedback && (
                              <div className="mt-3 bg-white/10 rounded-lg p-3 text-white/80">
                                <div className="font-semibold mb-1">Feedback:</div>
                                <div>{questionStates[q.id]?.feedback}</div>
                              </div>
                            )}
                            {questionStates[q.id]?.showSolution && (
                              <div className="mt-2 bg-green-900/50 rounded-lg p-3 text-green-300 text-sm">
                                <div className="font-semibold mb-1">Solution:</div>
                                <div>{q.answer || 'No solution provided.'}</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-2 mb-2">
                              {q.options?.map((opt, i) => (
                                <label key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 cursor-pointer transition-colors ${questionStates[q.id]?.userAnswer === opt ? 'bg-gradient-to-r from-blue-400 to-green-400 text-black' : 'hover:bg-white/10'}` }>
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    value={opt}
                                    checked={questionStates[q.id]?.userAnswer === opt}
                                    onChange={() => setQuestionStates(s => ({ ...s, [q.id]: { ...s[q.id], userAnswer: opt, showFeedback: false } }))}
                                    className="accent-green-400 cursor-pointer"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex gap-4 mt-2 items-center">
                              <button
                                className="px-4 py-2 bg-[#1f7d48] text-white font-medium rounded-lg hover:bg-[#1b6d3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1f7d48]/50 cursor-pointer"
                                onClick={() => {
                                  const userAnswer = questionStates[q.id]?.userAnswer;
                                  if (!userAnswer) {
                                    setFeedbackError(e => ({ ...e, [q.id]: "Please select an option before submitting." }));
                                    return;
                                  }
                                  setFeedbackError(e => ({ ...e, [q.id]: null }));
                                  setQuestionStates(s => ({ ...s, [q.id]: { ...s[q.id], showFeedback: true } }));
                                }}
                              >
                                Submit
                              </button>
                              <button
                                className="px-3 py-2 text-sm text-blue-300 hover:underline focus:outline-none cursor-pointer"
                                onClick={() => setQuestionStates(s => ({ ...s, [q.id]: { ...s[q.id], showSolution: !s[q.id]?.showSolution } }))}
                              >
                                {questionStates[q.id]?.showSolution ? 'Hide Solution' : 'View Solution'}
                              </button>
                            </div>
                            {feedbackError[q.id] && <div className="mt-2 text-red-400 text-sm">{feedbackError[q.id]}</div>}
                            {questionStates[q.id]?.showFeedback && (
                              <div className="mt-3 bg-white/10 rounded-lg p-3 text-white/80">
                                <div className="font-semibold mb-1">Feedback:</div>
                                <div>{isCorrectMCQ(q, questionStates[q.id]?.userAnswer) ? "Correct!" : `Incorrect. The correct answer is: ${getCorrectAnswerText(q)}`}</div>
                              </div>
                            )}
                            {questionStates[q.id]?.showSolution && (
                              <div className="mt-2 bg-green-900/50 rounded-lg p-3 text-green-300 text-sm">
                                <div className="font-semibold mb-1">Solution:</div>
                                <div>{getCorrectAnswerText(q)}</div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "ai" && (
              <div className="flex flex-col h-[60vh] bg-black text-white rounded-lg -m-6">
                {/* Chat Messages */}
                <div ref={tutorChatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth">
                  {tutorMessages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-4 py-2 rounded-lg max-w-xl ${message.role === 'user' ? 'bg-[#1f7d48] text-white' : 'bg-white/10 text-white/90'}`}>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isTutorLoading && (
                    <div className="flex items-start gap-3 justify-start">
                      <div className="px-4 py-2 rounded-lg bg-white/10 text-white/90">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
 
                {/* Chat Input */}
                <div className="p-4 border-t border-white/20">
                  <form onSubmit={handleTutorSubmit} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={tutorInput}
                      onChange={(e) => setTutorInput(e.target.value)}
                      placeholder="Ask a general question..."
                      className="flex-1 w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white"
                      disabled={isTutorLoading}
                    />
                    <button
                      type="submit"
                      disabled={isTutorLoading || !tutorInput.trim()}
                      className="px-5 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}
            {activeTab === "flashcards" && (
              <div className="flex flex-col items-center justify-center py-8">
                {flashcards.length > 0 ? (
                  <>
                    <div
                      className="relative w-full max-w-2xl h-80 rounded-xl shadow-2xl cursor-pointer [transform-style:preserve-3d] transition-transform duration-700"
                      onClick={() => setIsFlipped(!isFlipped)}
                      style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    >
                      {/* Front of the card */}
                      <div className="absolute w-full h-full bg-white/10 border border-white/20 rounded-xl flex items-center justify-center p-8 [backface-visibility:hidden]">
                        <h2 className="text-3xl font-semibold text-center text-white">
                          {flashcards[currentFlashcardIndex].question}
                        </h2>
                      </div>
                      {/* Back of the card */}
                      <div className="absolute w-full h-full bg-white/20 border border-white/20 rounded-xl flex items-center justify-center p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <p className="text-2xl text-center text-white/90">
                          {flashcards[currentFlashcardIndex].answer}
                        </p>
                      </div>
                    </div>
 
                    {/* Navigation */}
                    <div className="flex items-center gap-6 mt-8">
                      <button
                        onClick={handlePrevFlashcard}
                        disabled={currentFlashcardIndex === 0}
                        className="p-3 bg-white/10 text-white rounded-full hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <span className="text-white/80 font-medium text-lg">
                        {currentFlashcardIndex + 1} / {flashcards.length}
                      </span>
                      <button
                        onClick={handleNextFlashcard}
                        disabled={currentFlashcardIndex === flashcards.length - 1}
                        className="p-3 bg-white/10 text-white rounded-full hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-white/70">No flashcards available for this video.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 

