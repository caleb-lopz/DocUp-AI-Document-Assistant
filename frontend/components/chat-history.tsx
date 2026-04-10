"use client"

import { FileText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ChatSession {
  id: string
  fileName: string
  preview: string
  createdAt: Date
}

interface ChatHistoryProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onNewChat: () => void
}

export function ChatHistory({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
}: ChatHistoryProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground">No chat history yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group relative rounded-md cursor-pointer transition-colors",
                  activeSessionId === session.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full text-left px-3 py-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {session.preview}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete chat</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
