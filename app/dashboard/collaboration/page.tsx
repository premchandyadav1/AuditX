"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, CheckSquare, Activity, Plus } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function CollaborationPage() {
  const [loading, setLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    loadCollaborationData()
  }, [])

  async function loadCollaborationData() {
    try {
      // Load mock data for demonstration
      setWorkspaces([
        {
          id: "1",
          name: "Ministry of Finance Investigation",
          description: "Ongoing investigation into procurement irregularities",
          members: 5,
          cases: 3,
        },
        {
          id: "2",
          name: "Defence Contract Audit",
          description: "Review of defence procurement contracts",
          members: 8,
          cases: 7,
        },
      ])

      setTasks([
        {
          id: "1",
          title: "Review vendor background checks",
          status: "in_progress",
          priority: "high",
          assigned_to: "Rajesh Kumar",
          due_date: "2024-01-15",
        },
        {
          id: "2",
          title: "Analyze transaction patterns",
          status: "todo",
          priority: "medium",
          assigned_to: "Priya Sharma",
          due_date: "2024-01-18",
        },
      ])

      setActivities([
        {
          id: "1",
          user: "Rajesh Kumar",
          action: "updated case",
          entity: "Case #FR-2024-001",
          time: "2 hours ago",
        },
        {
          id: "2",
          user: "Priya Sharma",
          action: "added comment",
          entity: "Defence Contract Review",
          time: "4 hours ago",
        },
      ])

      setComments([
        {
          id: "1",
          user: "Rajesh Kumar",
          comment: "Found suspicious pattern in vendor payments",
          time: "3 hours ago",
          case: "FR-2024-001",
        },
      ])
    } catch (error) {
      console.error("Error loading collaboration data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading collaboration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Collaboration</h1>
          <p className="text-muted-foreground">Workspaces, tasks, and real-time team activity</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Workspace
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Active Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspaces.length}</div>
            <p className="text-xs text-muted-foreground">Team investigations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              Open Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">Assigned to team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
            <p className="text-xs text-muted-foreground">Recent discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">Today's updates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workspaces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="workspaces" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((workspace) => (
              <Card key={workspace.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{workspace.name}</CardTitle>
                  <CardDescription>{workspace.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{workspace.members} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="w-4 h-4 text-muted-foreground" />
                      <span>{workspace.cases} cases</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Open Workspace
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Assign and track investigation tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Status: {task.status}</span>
                      <span>Assigned: {task.assigned_to}</span>
                      <span>Due: {task.due_date}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add New Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity Feed</CardTitle>
              <CardDescription>Real-time updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {activity.user
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
                        <span className="font-medium">{activity.entity}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Comments</CardTitle>
              <CardDescription>Team discussions and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {comment.user
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.user}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.case}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.time}</p>
                      </div>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                ))}
                <div className="space-y-2">
                  <Textarea placeholder="Add a comment..." className="min-h-[100px]" />
                  <Button>Post Comment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
