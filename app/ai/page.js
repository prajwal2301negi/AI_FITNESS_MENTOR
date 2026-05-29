'use client'
import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '@/lib/api'
import { useFetch, useMutation } from '@/hooks/useApi'
import { getErrorMessage } from '@/lib/utils'
import { Send, Plus, Trash2, Bot, User, Sparkles } from 'lucide-react'

const CONTEXT_TYPES = [
  { value: 'general', label: '💬 General' },
  { value: 'workout_plan', label: '💪 Workout Plan' },
  { value: 'meal_plan', label: '🥗 Meal Plan' },
  { value: 'nutrition_advice', label: '🥦 Nutrition' },
  { value: 'body_analysis', label: '📊 Body Analysis' },
  { value: 'motivation', label: '🔥 Motivation' },
]

export default function AIPage() {
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [contextType, setContextType] = useState('general')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const { data: conversations, refetch: refetchConversations } = useFetch(aiAPI.getConversations)
  const { mutate: deleteConv } = useMutation(
    (id) => aiAPI.deleteConversation(id),
    { successMessage: 'Deleted', onSuccess: () => { setActiveConversation(null); setMessages([]); refetchConversations() } }
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversation = async (conv) => {
    try {
      const res = await aiAPI.getConversation(conv._id)
      setActiveConversation(conv._id)
      setMessages(res.data.data.messages || [])
      setContextType(res.data.data.context?.type || 'general')
    } catch (_) {}
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userMsg = input.trim()
    setInput('')
    setSending(true)

    setMessages(prev => [...prev, { role: 'user', content: userMsg }])

    try {
      const res = await aiAPI.chat({
        message: userMsg,
        conversationId: activeConversation,
        contextType,
      })
      const data = res.data.data
      if (!activeConversation) {
        setActiveConversation(data.conversationId)
        refetchConversations()
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${getErrorMessage(err)}` }])
    } finally {
      setSending(false)
    }
  }

  const newChat = () => {
    setActiveConversation(null)
    setMessages([])
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">

      {/* Sidebar - Conversations */}
      <div className="w-64 flex flex-col border rounded-lg bg-card overflow-hidden shrink-0">
        <div className="p-3 border-b">
          <button onClick={newChat}
            className="w-full flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium">
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {!conversations?.length && (
            <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
          )}
          {conversations?.map((conv) => (
            <div key={conv._id}
              className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm hover:bg-accent ${activeConversation === conv._id ? 'bg-accent' : ''}`}
              onClick={() => loadConversation(conv)}
            >
              <div className="truncate flex-1">
                <p className="truncate font-medium text-xs">{conv.title || 'New conversation'}</p>
                <p className="text-xs text-muted-foreground capitalize">{conv.context?.type?.replace(/_/g, ' ')}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteConv(conv._id) }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col border rounded-lg bg-card overflow-hidden">

        {/* Header */}
        <div className="p-3 border-b flex items-center gap-3">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">FitMentor AI</span>
          <select value={contextType} onChange={(e) => setContextType(e.target.value)}
            className="ml-auto border rounded-md px-2 py-1 text-xs bg-background">
            {CONTEXT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!messages.length && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-muted-foreground">
              <Sparkles className="h-12 w-12 opacity-20" />
              <div>
                <p className="font-medium">Start a conversation</p>
                <p className="text-sm">Ask about workouts, nutrition, or get a personalized plan</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {[
                  'Give me a 7-day workout plan',
                  'What should I eat for muscle gain?',
                  'How do I lose weight fast?',
                  'Motivate me to work out today',
                ].map(suggestion => (
                  <button key={suggestion} onClick={() => setInput(suggestion)}
                    className="border rounded-full px-3 py-1 text-xs hover:bg-accent">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask your AI fitness mentor..."
            className="flex-1 border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="bg-primary text-primary-foreground p-2 rounded-md disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
