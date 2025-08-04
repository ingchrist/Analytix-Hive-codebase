
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, Users, Star } from "lucide-react"
import Link from "next/link"

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">Web Development</Badge>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Complete React Developer Course
            </h1>
            <p className="text-muted-foreground text-lg">
              Master React.js from basics to advanced concepts with hands-on projects
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>12 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>1,234 students</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>4.8 (456 reviews)</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Build modern React applications from scratch</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Understand React hooks and state management</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Deploy applications to production</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>8 sections • 45 lectures • 12h 30m total length</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">Introduction to React</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      <span>What is React?</span>
                      <span className="ml-auto">5:30</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      <span>Setting up the environment</span>
                      <span className="ml-auto">8:15</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-4">$99.99</div>
              <Button className="w-full mb-3">Enroll Now</Button>
              <Button variant="outline" className="w-full">Add to Cart</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">Senior React Developer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
