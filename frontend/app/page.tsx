"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { ChatInterface } from "@/components/chat-interface"
import { ChatHistory, type ChatSession } from "@/components/chat-history"
import { FileText, PanelLeftClose, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatData {
  file: File
  messages: Message[]
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [chatDataMap, setChatDataMap] = useState<Record<string, ChatData>>({})
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeSession = activeSessionId ? chatDataMap[activeSessionId] : null

  const handleFileUpload = (file: File) => {
    setIsProcessing(true)
    setTimeout(() => {
      const sessionId = Date.now().toString()
      const initialMessage: Message = {
        id: "1",
        role: "assistant",
        content: `I've analyzed "${file.name}". What would you like to know about this document?`,
      }

      const newSession: ChatSession = {
        id: sessionId,
        fileName: file.name,
        preview: "Start a conversation...",
        createdAt: new Date(),
      }

      setSessions((prev) => [newSession, ...prev])
      setChatDataMap((prev) => ({
        ...prev,
        [sessionId]: { file, messages: [initialMessage] },
      }))
      setActiveSessionId(sessionId)
      setIsProcessing(false)
    }, 1500)
  }

  const handleRemoveFile = () => {
    setActiveSessionId(null)
  }

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id)
  }

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setChatDataMap((prev) => {
      const newMap = { ...prev }
      delete newMap[id]
      return newMap
    })
    if (activeSessionId === id) {
      setActiveSessionId(null)
    }
  }

  const handleNewChat = () => {
    setActiveSessionId(null)
  }

  const handleMessagesUpdate = (sessionId: string, messages: Message[]) => {
    setChatDataMap((prev) => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], messages },
    }))

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    if (lastUserMessage) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, preview: lastUserMessage.content }
            : s
        )
      )
    }
  }

  return (
    <main className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-200 overflow-hidden shrink-0`}
      >
        <ChatHistory
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border shrink-0">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium text-foreground tracking-tight">
                docup
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-4xl mx-auto px-6 py-8">
            {!activeSession ? (
              <div className="space-y-8">
                {/* Hero */}
                <div className="space-y-3 text-center pt-8">
                  <h1 className="text-3xl font-semibold text-foreground tracking-tight text-balance">
                    Chat with your PDF
                  </h1>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Upload a document and ask questions. Get instant answers from your files.
                  </p>
                </div>

                {/* File Upload */}
                <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Fast Analysis</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Documents are processed in seconds, ready for your questions.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Natural Conversation</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ask questions in plain language. Get clear, contextual answers.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Private & Secure</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your documents are processed locally and never stored.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ChatInterface
                key={activeSessionId}
                file={activeSession.file}
                initialMessages={activeSession.messages}
                onRemoveFile={handleRemoveFile}
                onMessagesUpdate={(messages) =>
                  handleMessagesUpdate(activeSessionId!, messages)
                }
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
