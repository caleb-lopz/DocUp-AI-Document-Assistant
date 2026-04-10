"use client"

import { useCallback, useState } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

interface FileUploadProps {
  onFileUpload: (file: File) => void
  isProcessing: boolean
}

export function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      const formData = new FormData()
      formData.append("file", file)
      await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      })
      onFileUpload(file)
    }
  }, [onFileUpload])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("file", file)
      await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      })
      onFileUpload(file)
    }
  }, [onFileUpload])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg border border-dashed border-border transition-all duration-200",
        "flex flex-col items-center justify-center gap-4 p-12",
        "cursor-pointer hover:border-muted-foreground/50",
        isDragOver && "border-foreground bg-muted/50",
        isProcessing && "pointer-events-none opacity-60"
      )}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={isProcessing}
      />
      
      {isProcessing ? (
        <>
          <Spinner className="h-8 w-8 text-muted-foreground" />
          <div className="text-center space-y-1">
            <p className="text-sm text-foreground">Processing document...</p>
            <p className="text-xs text-muted-foreground">This may take a moment</p>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-foreground">
              Drop your PDF here or <span className="text-foreground underline underline-offset-4">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              PDF files up to 10MB
            </p>
          </div>
        </>
      )}
    </div>
  )
}