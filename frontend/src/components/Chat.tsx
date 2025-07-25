import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Bot, User, CheckCircle, Loader2, Terminal } from "lucide-react";
import { sendInitialPrompt } from "../services/api";
import { parseBoltXml, buildFileTree } from "../utils/xmlParser";
import { FileNode, FileData } from "../utils/types";
import axios from "axios";
import { BACKEND_URL } from "../config";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai" | "system";
  timestamp: Date;
  type?: "normal" | "build-steps" | "terminal" | "completion";
  buildSteps?: BuildStep[];
}

interface BuildStep {
  id: string;
  fileName: string;
  status: "pending" | "current" | "completed";
}

interface ChatProps {
  initialPrompt?: string;
  onFileTreeUpdate?: (fileTree: FileNode[]) => void;
}

// External variable to track first session globally
let isGlobalFirstSession = true;

const Chat: React.FC<ChatProps> = ({
  initialPrompt = "",
  onFileTreeUpdate,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [baseFiles, setBaseFiles] = useState<FileData[]>([]);
  const [currentFiles, setCurrentFiles] = useState<FileData[]>([]);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] =
    useState(false);

  // Refs for DOM elements and cleanup
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRefs = useRef<Set<number>>(new Set());
  const isMountedRef = useRef(true);

  // Ref to store baseFiles immediately (fixes the async state update issue)
  const baseFilesRef = useRef<FileData[]>([]);

  // Track if we're in the middle of processing an initial prompt
  const isProcessingInitialRef = useRef(false);

  // Cleanup function for timeouts
  const addTimeout = useCallback((timeoutId: number) => {
    timeoutRefs.current.add(timeoutId);
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Auto-scroll function
  const scrollToBottom = useCallback(() => {
    if (isMountedRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, buildSteps, scrollToBottom]);

  const processXmlAndUpdateFileTree = useCallback(
    async (xmlResponse: string) => {
      if (!isMountedRef.current) return false;

      try {
        const newParsedFiles = parseBoltXml(xmlResponse);
        if (!newParsedFiles || newParsedFiles.length === 0) {
          return false;
        }

        let filesToDisplay: FileData[];

        // Use global variable instead of component state
        if (isGlobalFirstSession && isProcessingInitialRef.current) {
          // First session: store in baseFiles and set as currentFiles
          setBaseFiles(newParsedFiles);
          setCurrentFiles(newParsedFiles);
          baseFilesRef.current = newParsedFiles; // Store immediately in ref
          filesToDisplay = newParsedFiles;
          console.log(
            "GLOBAL FIRST SESSION - Setting base files",
            filesToDisplay
          );
        } else {
          // Subsequent calls: merge files with replacement logic
          setCurrentFiles(newParsedFiles);

          // Create a map of existing files by filePath for quick lookup
          const existingFilesMap = new Map(
            baseFilesRef.current.map((file) => [file.filePath, file])
          );

          // Replace existing files or add new ones
          newParsedFiles.forEach((newFile) => {
            existingFilesMap.set(newFile.filePath, newFile);
          });

          // Convert map back to array
          filesToDisplay = Array.from(existingFilesMap.values());

          // Update baseFiles with the merged result
          setBaseFiles(filesToDisplay);
          baseFilesRef.current = filesToDisplay;

          console.log(
            "SUBSEQUENT CALL - Merged files with replacements",
            filesToDisplay
          );

          const steps: BuildStep[] = filesToDisplay.map((file, index) => ({
            id: `step-${Date.now()}-${index}`,
            fileName: file.filePath,
            status: "pending" as const,
          }));

          if (steps.length > 0) {
            setBuildSteps(steps);

            // Add build steps message
            if (isMountedRef.current) {
              const buildMessage: Message = {
                id: Date.now() + Math.random(),
                text: "",
                sender: "system",
                timestamp: new Date(),
                type: "build-steps",
              };
              setMessages((prev) => [...prev, buildMessage]);
            }

            // Animate build steps
            await animateBuildSteps(steps);
          }
        }

        // Always update file tree
        const fileTree = buildFileTree(filesToDisplay);
        if (onFileTreeUpdate && isMountedRef.current) {
          onFileTreeUpdate(fileTree);
        }

        return true;
      } catch (error) {
        console.error("Error processing XML:", error);
        return false;
      }
    },
    [onFileTreeUpdate] // Removed baseFiles from dependencies since we use ref
  );

  const animateBuildSteps = useCallback(
    async (steps: BuildStep[]) => {
      if (!isMountedRef.current) return;

      for (let i = 0; i < steps.length; i++) {
        if (!isMountedRef.current) break;

        // Set current step
        setBuildSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status:
              index < i ? "completed" : index === i ? "current" : "pending",
          }))
        );

        await new Promise<void>((resolve) => {
          const timeoutId = setTimeout(() => {
            timeoutRefs.current.delete(timeoutId);
            resolve();
          }, 800);
          addTimeout(timeoutId);
        });
      }

      if (!isMountedRef.current) return;

      // Mark all as completed
      setBuildSteps((prev) =>
        prev.map((step) => ({ ...step, status: "completed" as const }))
      );

      // Add terminal command
      if (isMountedRef.current) {
        const terminalMessage: Message = {
          id: Date.now() + Math.random(),
          text: "npm run dev",
          sender: "system",
          timestamp: new Date(),
          type: "terminal",
        };
        setMessages((prev) => [...prev, terminalMessage]);
      }

      // Add completion message after delay
      const completionTimeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          timeoutRefs.current.delete(completionTimeoutId);
          const completionMessage: Message = {
            id: Date.now() + Math.random(),
            text: "🎉 Your application has been successfully created! The development server is now running.",
            sender: "system",
            timestamp: new Date(),
            type: "completion",
          };
          setMessages((prev) => [...prev, completionMessage]);
        }
      }, 1000);
      addTimeout(completionTimeoutId);
    },
    [addTimeout]
  );

  const handleInitialPromptProcessing = useCallback(
    async (prompt: string) => {
      if (!isMountedRef.current || !prompt.trim() || hasProcessedInitialPrompt)
        return;

      setIsProcessing(true);
      setHasProcessedInitialPrompt(true);
      isProcessingInitialRef.current = true; // Mark that we're processing initial prompt

      setBuildSteps([]);

      const userMessage: Message = {
        id: Date.now(),
        text: prompt,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await sendInitialPrompt(prompt);
        setLlmMessages(
          [...response.prompts, prompt].map((content) => ({
            role: "user",
            content,
          }))
        );

        setLlmMessages((x) => [
          ...x,
          { role: "assistant", content: response.finalresponse },
        ]);
        if (!isMountedRef.current) return;

        // Add AI response
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: "I'll help you build that application! Let me create the necessary files and structure.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Process XML responses - first call is treated as "first session", subsequent calls as updates
        if (response?.uiPrompts?.[0]) {
          await processXmlAndUpdateFileTree(response.uiPrompts[0]);
          // After first XML processing, mark global first session as complete
          isGlobalFirstSession = false;
          console.log(
            "First XML processing complete. Global first session set to false."
          );
        }

        if (response?.finalresponse) {
          await processXmlAndUpdateFileTree(response.finalresponse);
        }

        isProcessingInitialRef.current = false;
      } catch (error) {
        console.error("Error processing prompt:", error);

        if (isMountedRef.current) {
          // Add error message
          const errorMessage: Message = {
            id: Date.now() + Math.random(),
            text: "Sorry, I encountered an error while processing your request. Please try again.",
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        if (isMountedRef.current) {
          setIsProcessing(false);
          isProcessingInitialRef.current = false;
        }
      }
    },
    [hasProcessedInitialPrompt, processXmlAndUpdateFileTree]
  );

  useEffect(() => {
    if (initialPrompt && !hasProcessedInitialPrompt) {
      handleInitialPromptProcessing(initialPrompt);
    }
  }, [initialPrompt, hasProcessedInitialPrompt, handleInitialPromptProcessing]);

  useEffect(() => {
    baseFilesRef.current = baseFiles;
  }, [baseFiles]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isProcessing || !isMountedRef.current) return;

    setIsProcessing(true);

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const currentInput = input;
    setInput("");
    const newLLMMessage = {
      role: "user" as "user",
      content: currentInput,
    };
    try {
      // Call API to send message
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newLLMMessage],
      });
      setLlmMessages((x) => [...x, newLLMMessage]);
      setLlmMessages((x) => [
        ...x,
        {
          role: "assistant",
          content: response.data.response,
        },
      ]);

      if (!isMountedRef.current) return;

      // Add AI response
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: "I understand your request. Let me help you with that modification.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Check if response contains XML and process it
      if (response) {
        await processXmlAndUpdateFileTree(response.data.response);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      if (isMountedRef.current) {
        // Add error response
        const errorResponse: Message = {
          id: Date.now() + 1,
          text: "Sorry, I encountered an error while processing your message. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  }, [input, isProcessing, processXmlAndUpdateFileTree]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const renderBuildStepsMessage = useCallback(
    () => (
      <div className="space-y-2">
        {buildSteps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div className="w-4 h-4 flex items-center justify-center">
              {step.status === "completed" && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {step.status === "current" && (
                <Loader2 className="w-4 h-4 text-[#4fc3f7] animate-spin" />
              )}
              {step.status === "pending" && (
                <div className="w-2 h-2 bg-[#6e6e6e] rounded-full" />
              )}
            </div>
            <span className="text-white font-medium">Create</span>
            <span
              className={`font-mono text-sm break-all ${
                step.status === "pending" ? "text-[#6e6e6e]" : "text-[#4fc3f7]"
              }`}
            >
              {step.fileName}
            </span>
          </div>
        ))}
      </div>
    ),
    [buildSteps]
  );

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-gray-400">
              {isProcessing ? "Processing your request..." : "Ready to help"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === "user"
                    ? "bg-blue-600"
                    : message.sender === "ai"
                    ? "bg-green-600"
                    : "bg-gray-600"
                }`}
              >
                {message.sender === "user" && (
                  <User className="w-4 h-4 text-white" />
                )}
                {message.sender === "ai" && (
                  <Bot className="w-4 h-4 text-white" />
                )}
                {message.sender === "system" && message.type === "terminal" && (
                  <Terminal className="w-4 h-4 text-white" />
                )}
                {message.sender === "system" && message.type !== "terminal" && (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-300">
                    {message.sender === "user"
                      ? "You"
                      : message.sender === "ai"
                      ? "AI Assistant"
                      : "System"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {message.type === "build-steps" ? (
                  <div className="bg-gray-800 rounded-lg p-4">
                    {renderBuildStepsMessage()}
                  </div>
                ) : message.type === "terminal" ? (
                  <div className="bg-black rounded-lg p-3 font-mono text-green-400 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">$</span>
                      <span className="break-all">{message.text}</span>
                    </div>
                  </div>
                ) : message.type === "completion" ? (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400">{message.text}</p>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white ml-8"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    <p className="break-words">{message.text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isProcessing}
            className="flex-1 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isProcessing || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
