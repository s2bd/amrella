"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface HashtagMentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function HashtagMentionInput({ 
  value, 
  onChange, 
  placeholder = "What's on your mind?",
  className,
  rows = 3
}: HashtagMentionInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentMention, setCurrentMention] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Check for mentions (@username)
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = newValue.slice(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const mentionText = mentionMatch[1]
      setCurrentMention(mentionText)
      setShowSuggestions(true)
      // TODO: Fetch user suggestions based on mentionText
      setSuggestions(["john_doe", "jane_smith", "alex_wilson"].filter(user => 
        user.toLowerCase().includes(mentionText.toLowerCase())
      ))
    } else {
      setShowSuggestions(false)
      setCurrentMention("")
    }
  }

  const insertMention = (username: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPosition)
    const textAfterCursor = value.slice(cursorPosition)
    
    // Replace the partial mention with the full username
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index)
      const newValue = `${beforeMention}@${username} ${textAfterCursor}`
      onChange(newValue)
      setShowSuggestions(false)
      
      // Set cursor position after the mention
      setTimeout(() => {
        const newCursorPos = beforeMention.length + username.length + 2
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos)
        textareaRef.current?.focus()
      }, 0)
    }
  }

  const processText = (text: string) => {
    // Process hashtags and mentions for display
    return text
      .replace(/#(\w+)/g, '<span class="text-blue-600 font-medium">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-purple-600 font-medium">@$1</span>')
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn("resize-none", className)}
        rows={rows}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((username) => (
            <button
              key={username}
              onClick={() => insertMention(username)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <span className="text-purple-600">@{username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
