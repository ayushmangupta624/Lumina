"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LessonSidebar from '@/components/LessonSidebar';
import { useUser } from "@civic/auth/react";
import { ethers } from "ethers";
import { getContract } from "@/lib/contract";

// Add TypeScript declarations for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Define interfaces for the lesson page
interface Question {
  id: string;
  type: "written" | "mcq" | "flashcard";
  question: string;
  options?: string[];
  answer?: string;
}

interface LessonVideo {
  videoId: string;
  title: string;
  videoFilePath?: string;
  mainContentUrl?: string;
}

interface Lesson {
  lessonId: string;
  lessonName: string;
  courseId: string;
  video?: LessonVideo;
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

export default function LessonPage() {
  const params = useParams();
  const { user } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("main");
  const [mainContent, setMainContent] = useState<MainContent | null>(null);
  const [mainContentLoading, setMainContentLoading] = useState(false);
  const [mainContentError, setMainContentError] = useState<string | null>(null);
  const [questionStates, setQuestionStates] = useState<Record<string, any>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<Record<string, boolean>>({});
  const [feedbackError, setFeedbackError] = useState<Record<string, string | null>>({});

  // Dynamic progress state
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [isCourseComplete, setIsCourseComplete] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);

  // State for AI Tutor
  const [tutorMessages, setTutorMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Tutor. Ask me anything about the content of this lesson.' }
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const tutorChatContainerRef = useRef<HTMLDivElement>(null);

  // State for Flashcards
  const [flashcards, setFlashcards] = useState<Question[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [mintStatus, setMintStatus] = useState("");

  // Hardcoded sample data
  const sampleMainContent: MainContent = {
    summary: lesson?.lessonName?.includes("Derivatives") 
      ? "This lesson introduces the concept of derivatives, which represent the instantaneous rate of change of a function. You'll learn about the power rule, chain rule, and how derivatives are used to find slopes of tangent lines and solve optimization problems."
      : lesson?.lessonName?.includes("Integrals")
      ? "This lesson covers integrals, which are the reverse operation of differentiation. You'll learn about definite and indefinite integrals, the Fundamental Theorem of Calculus, and how to calculate areas under curves and solve accumulation problems."
      : lesson?.lessonName?.includes("Differential")
      ? "This lesson explores differential equations, which relate functions to their derivatives. You'll learn about first-order and second-order differential equations, separation of variables, and how these equations model real-world phenomena like population growth and motion."
      : "This lesson covers the fundamental concepts of machine learning, including supervised and unsupervised learning, neural networks, and practical applications. You'll learn about different algorithms and their use cases in real-world scenarios.",
    questions: lesson?.lessonName?.includes("Derivatives") ? [
      {
        id: "q1",
        type: "written",
        question: "Explain what a derivative represents and how it relates to the rate of change of a function.",
        answer: "A derivative represents the instantaneous rate of change of a function at a specific point. It measures how quickly the function's output changes as the input changes. Geometrically, it's the slope of the tangent line to the function's graph at that point. The derivative f'(x) tells us how fast f(x) is changing with respect to x.",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q2",
        type: "mcq",
        question: "What is the derivative of f(x) = x²?",
        options: [
          "x",
          "2x",
          "x²",
          "2x²"
        ],
        answer: "2x",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q3",
        type: "flashcard",
        question: "What is the power rule for derivatives?",
        answer: "The power rule states that the derivative of xⁿ is nxⁿ⁻¹. For example, the derivative of x³ is 3x²."
      },
      {
        id: "q4",
        type: "flashcard", 
        question: "What is the chain rule?",
        answer: "The chain rule is used to find the derivative of composite functions. If y = f(g(x)), then dy/dx = f'(g(x)) × g'(x)."
      },
      {
        id: "q5",
        type: "mcq",
        question: "What is the derivative of f(x) = sin(x)?",
        options: [
          "cos(x)",
          "-cos(x)",
          "sin(x)",
          "-sin(x)"
        ],
        answer: "cos(x)",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q6",
        type: "written",
        question: "Explain how derivatives are used in optimization problems and provide an example.",
        answer: "Derivatives are used in optimization to find maximum and minimum values of functions. At critical points (where f'(x) = 0 or f'(x) is undefined), the function may have local extrema. The second derivative test helps determine if these points are maxima or minima. For example, in business, derivatives help find the price that maximizes profit or the production level that minimizes cost.",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      }
    ] : lesson?.lessonName?.includes("Integrals") ? [
      {
        id: "q1",
        type: "written",
        question: "Explain the difference between definite and indefinite integrals and their geometric interpretations.",
        answer: "An indefinite integral ∫f(x)dx represents the family of all antiderivatives of f(x), giving us F(x) + C. A definite integral ∫ₐᵇf(x)dx represents the net area between the curve f(x) and the x-axis from x=a to x=b. The Fundamental Theorem of Calculus connects them: ∫ₐᵇf(x)dx = F(b) - F(a).",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q2",
        type: "mcq",
        question: "What is the integral of f(x) = 2x?",
        options: [
          "x²",
          "x² + C",
          "2x²",
          "2x² + C"
        ],
        answer: "x² + C",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q3",
        type: "flashcard",
        question: "What is the Fundamental Theorem of Calculus?",
        answer: "The Fundamental Theorem of Calculus connects differentiation and integration. It states that if F(x) is the antiderivative of f(x), then F'(x) = f(x) and ∫ₐᵇf(x)dx = F(b) - F(a)."
      },
      {
        id: "q4",
        type: "flashcard", 
        question: "What is integration by parts?",
        answer: "Integration by parts is a technique used to integrate products of functions. The formula is ∫u dv = uv - ∫v du, where u and v are differentiable functions."
      },
      {
        id: "q5",
        type: "mcq",
        question: "What is the integral of f(x) = 1/x?",
        options: [
          "ln(x)",
          "ln(x) + C",
          "1/x²",
          "1/x² + C"
        ],
        answer: "ln(x) + C",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q6",
        type: "written",
        question: "Explain how integrals are used to calculate areas and volumes, providing specific examples.",
        answer: "Integrals calculate areas by summing infinitesimal rectangles under curves. For example, ∫ₐᵇf(x)dx gives the area between f(x) and the x-axis from a to b. For volumes, we use methods like disk/washer integration: V = π∫ₐᵇ[f(x)]²dx for rotation around the x-axis. This applies to real-world problems like finding the volume of a water tank or the area of irregular shapes.",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      }
    ] : lesson?.lessonName?.includes("Differential") ? [
      {
        id: "q1",
        type: "written",
        question: "Explain what a differential equation is and provide examples of first-order and second-order equations.",
        answer: "A differential equation is an equation that relates a function to its derivatives. A first-order equation involves only the first derivative, like dy/dx = 2x. A second-order equation involves the second derivative, like d²y/dx² + dy/dx + y = 0. These equations model real-world phenomena like population growth (first-order) and harmonic motion (second-order).",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q2",
        type: "mcq",
        question: "What is the general solution to dy/dx = 2x?",
        options: [
          "y = x²",
          "y = x² + C",
          "y = 2x²",
          "y = 2x² + C"
        ],
        answer: "y = x² + C",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q3",
        type: "flashcard",
        question: "What is separation of variables?",
        answer: "Separation of variables is a method for solving first-order differential equations by separating the variables and integrating both sides. For dy/dx = f(x)g(y), we rewrite it as dy/g(y) = f(x)dx and integrate."
      },
      {
        id: "q4",
        type: "flashcard", 
        question: "What is an initial value problem?",
        answer: "An initial value problem is a differential equation with specified initial conditions. For example, dy/dx = 2x with y(0) = 1. The initial condition helps determine the specific solution from the general solution."
      },
      {
        id: "q5",
        type: "mcq",
        question: "What type of differential equation is d²y/dx² + 4y = 0?",
        options: [
          "First-order linear",
          "Second-order linear",
          "First-order nonlinear",
          "Second-order nonlinear"
        ],
        answer: "Second-order linear",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q6",
        type: "written",
        question: "Explain how differential equations model real-world phenomena and provide specific examples.",
        answer: "Differential equations model how quantities change over time. Population growth follows dy/dt = ky (exponential growth). Newton's law of cooling follows dT/dt = -k(T - T₀). Harmonic motion follows d²x/dt² + ω²x = 0. These equations help predict behavior in physics, biology, economics, and engineering.",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      }
    ] : [
      {
        id: "q1",
        type: "written",
        question: "Explain the difference between supervised and unsupervised learning. Provide examples of each.",
        answer: "Supervised learning uses labeled training data to learn a mapping from inputs to outputs. Examples include classification (spam detection) and regression (house price prediction). Unsupervised learning finds patterns in unlabeled data. Examples include clustering (customer segmentation) and dimensionality reduction (PCA).",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q2",
        type: "mcq",
        question: "Which of the following is NOT a type of machine learning?",
        options: [
          "Supervised Learning",
          "Unsupervised Learning", 
          "Reinforcement Learning",
          "Deterministic Learning"
        ],
        answer: "Deterministic Learning",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q3",
        type: "flashcard",
        question: "What is overfitting in machine learning?",
        answer: "Overfitting occurs when a model learns the training data too well, including noise and irrelevant patterns, leading to poor performance on new, unseen data."
      },
      {
        id: "q4",
        type: "flashcard", 
        question: "What is the purpose of cross-validation?",
        answer: "Cross-validation is a technique to assess how well a model will generalize to new data by training and testing on different subsets of the available data."
      },
      {
        id: "q5",
        type: "mcq",
        question: "Which algorithm is commonly used for classification problems?",
        options: [
          "Linear Regression",
          "Logistic Regression",
          "K-Means Clustering",
          "Principal Component Analysis"
        ],
        answer: "Logistic Regression",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      },
      {
        id: "q6",
        type: "written",
        question: "Describe the concept of feature engineering and why it's important in machine learning.",
        answer: "Feature engineering is the process of creating new features or modifying existing ones to improve model performance. It's important because the quality and relevance of features directly impact the model's ability to learn patterns and make accurate predictions. Good features can make even simple models perform well, while poor features can make complex models fail.",
        feedback: "",
        userAnswer: "",
        showSolution: false,
        showFeedback: false,
      }
    ]
  };

  const sampleFlashcards: Question[] = lesson?.lessonName?.includes("Derivatives") ? [
    {
      id: "fc1",
      type: "flashcard",
      question: "What is a derivative?",
      answer: "A derivative is the instantaneous rate of change of a function at a specific point. It measures how quickly the function's output changes as the input changes."
    },
    {
      id: "fc2", 
      type: "flashcard",
      question: "What is the power rule for derivatives?",
      answer: "The power rule states that the derivative of xⁿ is nxⁿ⁻¹. For example, the derivative of x³ is 3x²."
    },
    {
      id: "fc3",
      type: "flashcard", 
      question: "What is the chain rule?",
      answer: "The chain rule is used to find the derivative of composite functions. If y = f(g(x)), then dy/dx = f'(g(x)) × g'(x)."
    },
    {
      id: "fc4",
      type: "flashcard",
      question: "What is the derivative of sin(x)?",
      answer: "The derivative of sin(x) is cos(x)."
    },
    {
      id: "fc5",
      type: "flashcard",
      question: "What is the derivative of e^x?",
      answer: "The derivative of e^x is e^x. The exponential function is its own derivative."
    }
  ] : lesson?.lessonName?.includes("Integrals") ? [
    {
      id: "fc1",
      type: "flashcard",
      question: "What is an integral?",
      answer: "An integral is the reverse operation of differentiation. It represents the area under a curve and is used to find antiderivatives."
    },
    {
      id: "fc2", 
      type: "flashcard",
      question: "What is the Fundamental Theorem of Calculus?",
      answer: "The Fundamental Theorem of Calculus connects differentiation and integration. It states that if F(x) is the antiderivative of f(x), then F'(x) = f(x) and ∫ₐᵇf(x)dx = F(b) - F(a)."
    },
    {
      id: "fc3",
      type: "flashcard", 
      question: "What is integration by parts?",
      answer: "Integration by parts is a technique used to integrate products of functions. The formula is ∫u dv = uv - ∫v du."
    },
    {
      id: "fc4",
      type: "flashcard",
      question: "What is the integral of 1/x?",
      answer: "The integral of 1/x is ln|x| + C, where C is the constant of integration."
    },
    {
      id: "fc5",
      type: "flashcard",
      question: "What is a definite integral?",
      answer: "A definite integral ∫ₐᵇf(x)dx represents the net area between the curve f(x) and the x-axis from x=a to x=b."
    }
  ] : lesson?.lessonName?.includes("Differential") ? [
    {
      id: "fc1",
      type: "flashcard",
      question: "What is a differential equation?",
      answer: "A differential equation is an equation that relates a function to its derivatives. It describes how a quantity changes over time or space."
    },
    {
      id: "fc2", 
      type: "flashcard",
      question: "What is separation of variables?",
      answer: "Separation of variables is a method for solving first-order differential equations by separating the variables and integrating both sides."
    },
    {
      id: "fc3",
      type: "flashcard", 
      question: "What is an initial value problem?",
      answer: "An initial value problem is a differential equation with specified initial conditions that help determine the specific solution."
    },
    {
      id: "fc4",
      type: "flashcard",
      question: "What is a first-order differential equation?",
      answer: "A first-order differential equation involves only the first derivative of the unknown function, like dy/dx = f(x,y)."
    },
    {
      id: "fc5",
      type: "flashcard",
      question: "What is a second-order differential equation?",
      answer: "A second-order differential equation involves the second derivative of the unknown function, like d²y/dx² + dy/dx + y = 0."
    }
  ] : [
    {
      id: "fc1",
      type: "flashcard",
      question: "What is Machine Learning?",
      answer: "Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed."
    },
    {
      id: "fc2", 
      type: "flashcard",
      question: "What is the difference between training and testing data?",
      answer: "Training data is used to teach the model patterns and relationships, while testing data is used to evaluate how well the model generalizes to new, unseen data."
    },
    {
      id: "fc3",
      type: "flashcard", 
      question: "What is a neural network?",
      answer: "A neural network is a computational model inspired by biological neurons, consisting of interconnected nodes (neurons) that process information and learn patterns through training."
    },
    {
      id: "fc4",
      type: "flashcard",
      question: "What is the bias-variance tradeoff?",
      answer: "The bias-variance tradeoff describes the relationship between a model's ability to capture complex patterns (variance) and its ability to generalize to new data (bias). High bias leads to underfitting, while high variance leads to overfitting."
    },
    {
      id: "fc5",
      type: "flashcard",
      question: "What is gradient descent?",
      answer: "Gradient descent is an optimization algorithm used to minimize the loss function by iteratively adjusting model parameters in the direction of steepest descent of the gradient."
    }
  ];

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/courses/${params.courseId}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Failed to fetch course");
          return;
        }
        
        if (data.course) {
          const foundLesson = data.course.lessons.find((l: Lesson) => l.lessonId === params.lessionId);
          if (foundLesson) {
            setLesson(foundLesson);
          } else {
            // Fallback: create a sample lesson if not found in database
            const fallbackLesson: Lesson = {
              lessonId: params.lessionId as string,
              lessonName: params.courseId === "course-2" 
                ? (params.lessionId === "lesson-1" ? "Derivatives" 
                   : params.lessionId === "lesson-2" ? "Integrals" 
                   : params.lessionId === "lesson-3" ? "Differential Equations"
                   : "Introduction to Calculus")
                : "Introduction to Machine Learning",
              courseId: params.courseId as string,
              video: {
                videoId: "sample-video",
                title: params.courseId === "course-2" ? "Calculus Basics" : "Machine Learning Basics",
                videoFilePath: "https://miyagilabs.ai/landingvid.mp4",
                mainContentUrl: undefined
              }
            };
            setLesson(fallbackLesson);
          }
        } else {
          setError("Course not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [params.courseId, params.lessionId]);

  useEffect(() => {
    // Use hardcoded data instead of fetching from external URL
    setMainContent(sampleMainContent);
    setMainContentError(null);
    setMainContentLoading(false);

    // Set flashcards from the sample data
    const filteredFlashcards = sampleMainContent.questions.filter((q: Question) => q.type === 'flashcard');
    setFlashcards(filteredFlashcards);

    // Reset flashcard state when lesson changes
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);

    // Check if this lesson is completed
    const isCompleted = completedLessons.includes(params.lessionId as string);
    setLessonCompleted(isCompleted);

    // Check if course is completed (all 3 lessons completed)
    const totalLessons = 3;
    const completedCount = completedLessons.length;
    if (completedCount >= totalLessons && !showCompletionScreen) {
      setShowCompletionScreen(true);
    }
  }, [lesson, completedLessons, params.lessionId, showCompletionScreen]);

  useEffect(() => {
    // Reset tutor chat when lesson changes
    setTutorMessages([{ role: 'assistant', content: 'Hello! I am your AI Tutor. Ask me anything about the content of this lesson.' }]);
    setTutorInput('');
    setIsTutorLoading(false);
  }, [lesson]);

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
      // Sample responses for common questions
      const sampleResponses = lesson?.lessonName?.includes("Derivatives") ? [
        "A derivative represents the instantaneous rate of change of a function at a specific point. It measures how quickly the function's output changes as the input changes.",
        "The power rule states that the derivative of xⁿ is nxⁿ⁻¹. For example, the derivative of x³ is 3x².",
        "The chain rule is used to find the derivative of composite functions. If y = f(g(x)), then dy/dx = f'(g(x)) × g'(x).",
        "The derivative of sin(x) is cos(x), and the derivative of cos(x) is -sin(x).",
        "The derivative of e^x is e^x. The exponential function is its own derivative.",
        "Derivatives are used in optimization to find maximum and minimum values of functions. At critical points (where f'(x) = 0), the function may have local extrema."
      ] : lesson?.lessonName?.includes("Integrals") ? [
        "An integral is the reverse operation of differentiation. It represents the area under a curve and is used to find antiderivatives.",
        "The Fundamental Theorem of Calculus connects differentiation and integration. It states that if F(x) is the antiderivative of f(x), then F'(x) = f(x) and ∫ₐᵇf(x)dx = F(b) - F(a).",
        "Integration by parts is a technique used to integrate products of functions. The formula is ∫u dv = uv - ∫v du.",
        "The integral of 1/x is ln|x| + C, where C is the constant of integration.",
        "A definite integral ∫ₐᵇf(x)dx represents the net area between the curve f(x) and the x-axis from x=a to x=b.",
        "Integrals calculate areas by summing infinitesimal rectangles under curves and can be used to find volumes through methods like disk/washer integration."
      ] : lesson?.lessonName?.includes("Differential") ? [
        "A differential equation is an equation that relates a function to its derivatives. It describes how a quantity changes over time or space.",
        "Separation of variables is a method for solving first-order differential equations by separating the variables and integrating both sides.",
        "An initial value problem is a differential equation with specified initial conditions that help determine the specific solution.",
        "A first-order differential equation involves only the first derivative of the unknown function, like dy/dx = f(x,y).",
        "A second-order differential equation involves the second derivative of the unknown function, like d²y/dx² + dy/dx + y = 0.",
        "Differential equations model real-world phenomena like population growth (dy/dt = ky), Newton's law of cooling (dT/dt = -k(T - T₀)), and harmonic motion (d²x/dt² + ω²x = 0)."
      ] : [
        "Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed. It uses algorithms to identify patterns in data and make predictions or decisions.",
        "Supervised learning uses labeled training data to learn a mapping from inputs to outputs. Examples include classification (spam detection) and regression (house price prediction).",
        "Unsupervised learning finds patterns in unlabeled data. Examples include clustering (customer segmentation) and dimensionality reduction (PCA).",
        "Overfitting occurs when a model learns the training data too well, including noise and irrelevant patterns, leading to poor performance on new, unseen data.",
        "Cross-validation is a technique to assess how well a model will generalize to new data by training and testing on different subsets of the available data.",
        "Feature engineering is the process of creating new features or modifying existing ones to improve model performance. It's crucial because the quality of features directly impacts model accuracy.",
        "Neural networks are computational models inspired by biological neurons, consisting of interconnected nodes that process information and learn patterns through training.",
        "The bias-variance tradeoff describes the relationship between a model's ability to capture complex patterns (variance) and its ability to generalize to new data (bias)."
      ];

      // Simple keyword matching for responses
      const input = tutorInput.toLowerCase();
      let response = lesson?.lessonName?.includes("Derivatives") 
        ? "I'm here to help you with derivatives! Ask me about the power rule, chain rule, or any derivative concepts."
        : lesson?.lessonName?.includes("Integrals")
        ? "I'm here to help you with integrals! Ask me about the Fundamental Theorem of Calculus, integration by parts, or area calculations."
        : lesson?.lessonName?.includes("Differential")
        ? "I'm here to help you with differential equations! Ask me about separation of variables, initial value problems, or modeling real-world phenomena."
        : "I'm here to help you with machine learning concepts! Could you please ask a more specific question about the lesson content?";
      
      if (lesson?.lessonName?.includes("Derivatives")) {
        if (input.includes('derivative') || input.includes('rate of change')) {
          response = sampleResponses[0];
        } else if (input.includes('power rule') || input.includes('power')) {
          response = sampleResponses[1];
        } else if (input.includes('chain rule') || input.includes('chain')) {
          response = sampleResponses[2];
        } else if (input.includes('sin') || input.includes('cos') || input.includes('trig')) {
          response = sampleResponses[3];
        } else if (input.includes('e^x') || input.includes('exponential')) {
          response = sampleResponses[4];
        } else if (input.includes('optimization') || input.includes('max') || input.includes('min')) {
          response = sampleResponses[5];
        }
      } else if (lesson?.lessonName?.includes("Integrals")) {
        if (input.includes('integral') || input.includes('antiderivative')) {
          response = sampleResponses[0];
        } else if (input.includes('fundamental theorem') || input.includes('ftc')) {
          response = sampleResponses[1];
        } else if (input.includes('integration by parts') || input.includes('parts')) {
          response = sampleResponses[2];
        } else if (input.includes('1/x') || input.includes('ln')) {
          response = sampleResponses[3];
        } else if (input.includes('definite') || input.includes('area')) {
          response = sampleResponses[4];
        } else if (input.includes('volume') || input.includes('disk')) {
          response = sampleResponses[5];
        }
      } else if (lesson?.lessonName?.includes("Differential")) {
        if (input.includes('differential equation') || input.includes('diff eq')) {
          response = sampleResponses[0];
        } else if (input.includes('separation') || input.includes('separate')) {
          response = sampleResponses[1];
        } else if (input.includes('initial value') || input.includes('initial condition')) {
          response = sampleResponses[2];
        } else if (input.includes('first order') || input.includes('first-order')) {
          response = sampleResponses[3];
        } else if (input.includes('second order') || input.includes('second-order')) {
          response = sampleResponses[4];
        } else if (input.includes('model') || input.includes('real world') || input.includes('phenomena')) {
          response = sampleResponses[5];
        }
      } else {
        if (input.includes('machine learning') || input.includes('what is ml')) {
          response = sampleResponses[0];
        } else if (input.includes('supervised') || input.includes('supervised learning')) {
          response = sampleResponses[1];
        } else if (input.includes('unsupervised') || input.includes('unsupervised learning')) {
          response = sampleResponses[2];
        } else if (input.includes('overfitting') || input.includes('overfit')) {
          response = sampleResponses[3];
        } else if (input.includes('cross validation') || input.includes('cross-validation')) {
          response = sampleResponses[4];
        } else if (input.includes('feature') || input.includes('engineering')) {
          response = sampleResponses[5];
        } else if (input.includes('neural') || input.includes('network')) {
          response = sampleResponses[6];
        } else if (input.includes('bias') || input.includes('variance')) {
          response = sampleResponses[7];
        }
      }

      // Simulate typing effect
      const words = response.split(' ');
      let currentResponse = '';
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        currentResponse += (i > 0 ? ' ' : '') + words[i];
        setTutorMessages(currentMessages => {
          const allButLast = currentMessages.slice(0, -1);
          const lastMessage = currentMessages[currentMessages.length - 1];
          const updatedLastMessage = {
            ...lastMessage,
            content: currentResponse,
          };
          return [...allButLast, updatedLastMessage];
        });
      }

    } catch (error) {
      console.error("Error calling AI Tutor:", error);
      setTutorMessages(currentMessages => {
          const latestMessages = [...currentMessages];
          const lastMessage = latestMessages[latestMessages.length - 1];
          if (lastMessage.role === 'assistant' && lastMessage.content === '') {
            lastMessage.content = "I'm sorry, I'm having trouble responding right now. Please try asking a question about machine learning concepts!";
          } else {
              latestMessages.push({ role: 'assistant', content: "I'm sorry, I'm having trouble responding right now. Please try asking a question about machine learning concepts!" });
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

  const markLessonAsCompleted = async () => {
    if (!lessonCompleted) {
      try {
        console.log("Marking lesson as completed:", params.lessionId);
        const response = await fetch(`/api/courses/${params.courseId}/lessons/${params.lessionId}/complete`, { 
          method: 'POST' 
        });
        const data = await response.json();
        console.log("Lesson completion response:", data);
        
        if (response.ok) {
          console.log("Lesson marked as completed successfully");
          // Refresh progress immediately
          await fetchProgress();
        } else {
          console.error("Failed to mark lesson as completed:", data.error);
        }
      } catch (error) {
        console.error("Error marking lesson as completed:", error);
      }
    }
  };

  const handleGetCourseCredit = async () => {
    if (!(window as any).ethereum) {
      alert("MetaMask is required!");
      return;
    }

    try {
      setMintStatus("Connecting to MetaMask...");
      
      // Request MetaMask connection
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      try {
        const contract = getContract(signer);
        
        // Create a unique token URI for this course completion
        const courseName = params.courseId === "course-2" ? "Intro to Calculus" : "Machine Learning Fundamentals";
        const tokenURI = `https://yourdomain.com/metadata/${params.courseId}-${params.lessionId}.json`;

        setMintStatus("Minting your course completion NFT...");
        
        const tx = await contract.awardItem(address, tokenURI);
        setMintStatus("Transaction submitted! Waiting for confirmation...");

        await tx.wait(); // Wait for transaction confirmation

        setMintStatus("🎉 Course Credit NFT Minted Successfully!");
        
        // Optional: Show success message for a few seconds
        setTimeout(() => {
          setMintStatus("");
        }, 5000);
        
      } catch (contractError: any) {
        console.error("Contract error:", contractError);
        if (contractError.message && contractError.message.includes("Invalid contract address")) {
          setMintStatus("❌ Contract not deployed. Please deploy your smart contract first and set NEXT_PUBLIC_CONTRACT_ADDRESS.");
        } else {
          setMintStatus("❌ Smart contract error. Please check your contract deployment and configuration.");
        }
        
        // Clear error message after 8 seconds
        setTimeout(() => {
          setMintStatus("");
        }, 8000);
      }
      
    } catch (err) {
      console.error(err);
      setMintStatus("❌ Error minting NFT. Please try again.");
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setMintStatus("");
      }, 5000);
    }
  };

  // Fetch progress from backend
  const fetchProgress = async () => {
    setProgressLoading(true);
    try {
      console.log("Fetching progress for course:", params.courseId);
      const res = await fetch(`/api/courses/${params.courseId}/progress`);
      const data = await res.json();
      
      console.log("Progress API response:", data);
      
      if (res.ok) {
        setCompletedLessons(data.completedLessons || []);
        setTotalLessons(data.totalLessons || 0);
        setIsCourseComplete(data.isCourseComplete || false);
        setLessonCompleted((data.completedLessons || []).includes(params.lessionId as string));
        setShowCompletionScreen(data.isCourseComplete || false);
        
        console.log("Progress updated:", {
          completedLessons: data.completedLessons,
          totalLessons: data.totalLessons,
          isCourseComplete: data.isCourseComplete,
          currentLessonCompleted: (data.completedLessons || []).includes(params.lessionId as string)
        });
      } else {
        console.error("Failed to fetch progress:", data.error);
        // fallback: treat as no progress
        setCompletedLessons([]);
        setTotalLessons(0);
        setIsCourseComplete(false);
        setLessonCompleted(false);
        setShowCompletionScreen(false);
      }
    } catch (e) {
      console.error("Error fetching progress:", e);
      // fallback: treat as no progress
      setCompletedLessons([]);
      setTotalLessons(0);
      setIsCourseComplete(false);
      setLessonCompleted(false);
      setShowCompletionScreen(false);
    } finally {
      setProgressLoading(false);
    }
  };

  // Fetch course data for dynamic lesson names
  const fetchCourseData = async () => {
    try {
      const res = await fetch(`/api/courses/${params.courseId}`);
      const data = await res.json();
      
      if (res.ok && data.course) {
        setCourseData(data.course);
      }
    } catch (e) {
      console.error("Error fetching course data:", e);
    }
  };

  useEffect(() => {
    fetchProgress();
    fetchCourseData();
  }, [params.courseId, params.lessionId, user?.email]);

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

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white">Lesson Not Found</h2>
          <p className="mt-2 text-white/80">The requested lesson could not be found.</p>
        </div>
      </div>
    );
  }

  // Course completion screen
  if (showCompletionScreen) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 shadow-2xl">
            {/* Celebration Animation */}
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-4xl mb-2">🎓</div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Congratulations!
            </h1>
            
            <p className="text-xl text-white/80 mb-6">
              You have successfully completed{" "}
              <span className="text-[#22c55e] font-semibold">
                {courseData?.courseName || "the course"}
              </span>
            </p>
            
            <div className="bg-white/5 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Course Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#22c55e]">{totalLessons}</div>
                  <div className="text-white/60">Lessons Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#22c55e]">100%</div>
                  <div className="text-white/60">Course Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#22c55e]">✓</div>
                  <div className="text-white/60">Certificate Ready</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleGetCourseCredit}
                disabled={mintStatus.includes("Connecting") || mintStatus.includes("Minting") || mintStatus.includes("Transaction submitted")}
                className={`w-full font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  mintStatus.includes("Connecting") || mintStatus.includes("Minting") || mintStatus.includes("Transaction submitted")
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#1f7d48] to-[#22c55e] text-white hover:from-[#1b6d3f] hover:to-[#1f7d48]"
                }`}
              >
                {mintStatus.includes("Connecting") || mintStatus.includes("Minting") || mintStatus.includes("Transaction submitted")
                  ? "⏳ Processing..."
                  : "Get Course Credit"
                }
              </button>
              
              {mintStatus && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  mintStatus.includes("🎉") 
                    ? "bg-green-500/20 border border-green-500/30 text-green-400"
                    : mintStatus.includes("❌")
                    ? "bg-red-500/20 border border-red-500/30 text-red-400"
                    : "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                }`}>
                  {mintStatus}
                </div>
              )}
              
              <button
                onClick={() => window.location.href = '/courses'}
                className="w-full bg-white/10 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Continue Learning
              </button>
            </div>
            
            <div className="mt-8 text-sm text-white/40">
              <p>You can now access your course materials anytime and continue your learning journey!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Lesson Sidebar */}
      <LessonSidebar currentLessonId={params.lessionId as string} />
      
      {/* Main Content */}
      <div className="flex-1 px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          {/* Course Progress Bar */}
          <div className="mb-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1f7d48] flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {courseData?.courseName?.charAt(0) || "C"}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {courseData?.courseName || "Course"}
                  </h2>
                  <p className="text-sm text-white/60">Course Progress</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0}%
                </div>
                <div className="text-sm text-white/60">
                  {completedLessons.length} of {totalLessons} lessons
                </div>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-[#1f7d48] to-[#22c55e] h-3 rounded-full transition-all duration-500 ease-out" 
                style={{ 
                  width: `${totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-white/60">
              {courseData?.lessons?.slice(0, 3).map((lesson: any, index: number) => (
                <span 
                  key={lesson.lessonId}
                  className={completedLessons.includes(lesson.lessonId) ? "text-[#22c55e] font-medium" : ""}
                >
                  Lesson {index + 1}: {lesson.lessonName}
                  {completedLessons.includes(lesson.lessonId) && " ✓"}
                </span>
              ))}
            </div>
          </div>
          
          {/* Mark as Complete Button and NFT Minting */}
          <div className="mb-6 flex justify-center gap-4">
            {!lessonCompleted && (
              <button
                onClick={markLessonAsCompleted}
                className="bg-gradient-to-r from-[#1f7d48] to-[#22c55e] text-white font-semibold py-3 px-8 rounded-xl hover:from-[#1b6d3f] hover:to-[#1f7d48] transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <span>✓</span>
                Mark Lesson as Complete
              </button>
            )}
            
            {lessonCompleted && (
              <div className="bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] font-semibold py-3 px-8 rounded-xl flex items-center gap-2">
                <span>✓</span>
                Lesson Completed
              </div>
            )}
            
            {/* NFT Minting Button - Only show when course is complete */}
            {isCourseComplete && (
              <button
                onClick={handleGetCourseCredit}
                disabled={mintStatus.includes("Connecting") || mintStatus.includes("Minting") || mintStatus.includes("Transaction submitted")}
                className={`font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 ${
                  mintStatus.includes("Connecting") || mintStatus.includes("Minting") || mintStatus.includes("Transaction submitted")
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                }`}
              >
                <span>🪙</span>
                {mintStatus.includes("Connecting") || mintStatus.includes("Minting") || mintStatus.includes("Transaction submitted")
                  ? "⏳ Minting..."
                  : "Mint Course NFT"
                }
              </button>
            )}
          </div>
          
          {/* NFT Minting Status */}
          {mintStatus && (
            <div className="mb-6 flex justify-center">
              <div className={`p-3 rounded-lg text-sm font-medium max-w-md text-center ${
                mintStatus.includes("🎉") 
                  ? "bg-green-500/20 border border-green-500/30 text-green-400"
                  : mintStatus.includes("❌")
                  ? "bg-red-500/20 border border-red-500/30 text-red-400"
                  : "bg-blue-500/20 border border-blue-500/30 text-blue-400"
              }`}>
                {mintStatus}
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Video and lesson info */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden">
                {lesson.video?.videoFilePath ? (
                  <div className="aspect-video bg-black">
                    <video
                      className="w-full h-full object-contain"
                      controls
                      src={lesson.video.videoFilePath}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <div className="text-white/60 text-center">
                      <div className="text-4xl mb-4">📚</div>
                      <div className="text-lg">No video available for this lesson</div>
                      <div className="text-sm mt-2">Check the content below for lesson materials</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 text-lg text-white/90 font-medium">{lesson.lessonName}</div>
            </div>
            
            {/* Notes panel */}
            <div className="w-full md:w-[380px] flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg h-full flex flex-col">
                <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-white/10">
                  <span className="font-semibold text-white/80">Lesson Notes</span>
                </div>
                <div className="px-4 py-2 border-b border-white/10">
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/60 transition-all"
                    placeholder="Search notes..."
                  />
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2 text-white/70 text-sm">
                  <div className="space-y-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Key Points</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Lesson content will appear here</li>
                        <li>• Take notes as you learn</li>
                        <li>• Review important concepts</li>
                      </ul>
                    </div>
                  </div>
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
                    <div className="text-white/60">No main content available for this lesson.</div>
                  )}
                  {mainContent && (
                    <div className="space-y-8">
                      {/* Summary */}
                      <div className="bg-white/5 rounded-lg p-4 mb-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg mb-1 text-white">Lesson Summary</div>
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
                        placeholder="Ask a question about this lesson..."
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
                    <div className="text-white/70">No flashcards available for this lesson.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}