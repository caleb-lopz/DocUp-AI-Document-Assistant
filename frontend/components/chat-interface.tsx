"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, ArrowUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  file: File
  initialMessages?: Message[]
  onRemoveFile: () => void
  onMessagesUpdate?: (messages: Message[]) => void
}

export function ChatInterface({
  file,
  initialMessages,
  onRemoveFile,
  onMessagesUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      {
        id: "1",
        role: "assistant",
        content: `I've analyzed "${file.name}". What would you like to know about this document?`,
      },
    ]
  )
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    onMessagesUpdate?.(newMessages)
    setInput("")
    setIsLoading(true)

    const doc_name = file.name.replace(".pdf", "").replace(/ /g, "_").toUpperCase()
    const response = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: input,
        doc_name: doc_name,
        chat_history: newMessages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          content: m.content
        }))
      }),
    })

    const data = await response.json()
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: data.answer,
    }

    const updatedMessages = [...newMessages, assistantMessage]
    setMessages(updatedMessages)
    onMessagesUpdate?.(updatedMessages)
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* File Info Bar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded bg-muted p-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveFile}
          className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-3",
                message.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your PDF..."
          className="pr-12 h-12 bg-muted/30 border-border text-sm"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
        >
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  )
}