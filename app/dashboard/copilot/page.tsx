"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Sparkles, TrendingUp, FileSearch, AlertTriangle, User, Bot } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  "Show me all suspicious vendors this month",
  "Why was Vendor XYZ flagged?",
  "Generate a report for Q3 expenditure",
  "Compare department spending year-over-year",
  "Find duplicate invoices in the last 30 days",
  "Show transactions without Purchase Orders",
]

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm AuditX Copilot, your AI-powered audit assistant. I can help you analyze transactions, detect fraud patterns, generate reports, and answer questions about your audit data. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("suspicious") || lowerQuery.includes("fraud")) {
      return "I found 7 suspicious vendors this month:\n\n1. **ABC Construction Ltd** - Risk Score: 85\n   • 3 duplicate invoices detected\n   • Total flagged amount: ₹2,45,000\n\n2. **Tech Solutions Inc** - Risk Score: 78\n   • Price 230% above historical average\n   • Amount: ₹8,92,000\n\n3. **XYZ Enterprises** - Risk Score: 95\n   • GST validation failed\n   • Appears to be a shell company\n\nWould you like me to generate a detailed report on any of these vendors?"
    }

    if (lowerQuery.includes("report") || lowerQuery.includes("expenditure")) {
      return "I'll generate a Q3 expenditure report for you.\n\n**Q3 2024 Summary:**\n• Total Transactions: 1,247\n• Total Amount: ₹45.8 Crore\n• Fraud Detected: ₹2.4 Crore prevented\n• Compliance Rate: 94%\n\n**Top Departments:**\n1. Public Works: ₹12.5Cr\n2. Healthcare: ₹8.9Cr\n3. Education: ₹7.2Cr\n\nGenerating detailed PDF report... The report will be ready in 30 seconds."
    }

    if (lowerQuery.includes("duplicate")) {
      return "I found 8 duplicate invoice cases in the last 30 days:\n\n1. **INV-2024-789** - ABC Construction\n   • Submitted 3 times\n   • Amount: ₹2,45,000 each\n\n2. **INV-2024-445** - Office Supplies Co\n   • Submitted 2 times\n   • Amount: ₹67,000 each\n\nTotal potential fraud: ₹7.12 Lakh\n\nShall I initiate investigation workflows for these cases?"
    }

    return "I've analyzed your query. Based on the audit data, I can provide detailed insights. Here are the key findings:\n\n• 45,892 transactions analyzed this month\n• 28 active fraud alerts\n• ₹12.8Cr in estimated savings from fraud prevention\n• 94% overall compliance score\n\nWould you like me to dive deeper into any specific area?"
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AuditX Copilot</h1>
          <p className="text-muted-foreground">AI-powered audit assistant with natural language understanding</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="flex flex-col h-[calc(100vh-16rem)] bg-card/50 backdrop-blur-sm border-border/50">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" ? "bg-primary/10" : "holographic-gradient glow-blue"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-5 h-5 text-primary" />
                      ) : (
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === "user" ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block p-4 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-background/50 border border-border/50"
                        }`}
                      >
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg holographic-gradient glow-blue flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-4 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <div
                            className="w-2 h-2 rounded-full bg-primary animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-primary animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-3">
                  <Input
                    placeholder="Ask me anything about audit data..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} className="holographic-gradient glow-blue" disabled={!input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Prompts */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Suggested Queries</h3>
              </div>
              <div className="space-y-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </Card>

            {/* Capabilities */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">Copilot Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileSearch className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Data Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Query and analyze transaction data with natural language
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Fraud Detection</h4>
                    <p className="text-sm text-muted-foreground">Identify patterns and anomalies in real-time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-chart-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Report Generation</h4>
                    <p className="text-sm text-muted-foreground">Create comprehensive audit reports instantly</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Multi-Step Reasoning</h4>
                    <p className="text-sm text-muted-foreground">Chain-of-thought analysis for complex queries</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
