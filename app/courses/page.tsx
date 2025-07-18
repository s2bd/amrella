"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Star, Play, Plus } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
  duration_hours: number
  price: number
  enrollment_count: number
  rating: number
  instructor: {
    full_name: string
    avatar_url: string
  }
}

interface Enrollment {
  progress: number
  course: Course
}

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const supabase = createClientComponentClient()

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", selectedCategory, selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select(`
          *,
          instructor:profiles!courses_instructor_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("is_published", true)
        .order("enrollment_count", { ascending: false })

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory)
      }

      if (selectedLevel !== "all") {
        query = query.eq("level", selectedLevel)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Course[]
    },
  })

  const { data: myEnrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          progress,
          course:courses (
            *,
            instructor:profiles!courses_instructor_id_fkey (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("user_id", user?.id)

      if (error) throw error
      return data as Enrollment[]
    },
  })

  const categories = ["all", "Technology", "Business", "Arts", "Health", "Education"]
  const levels = ["all", "beginner", "intermediate", "advanced"]

  const handleEnrollCourse = async (courseId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("course_enrollments").upsert({
      course_id: courseId,
      user_id: user?.id,
      progress: 0,
    })

    if (!error) {
      // Refetch courses
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center">Category:</span>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center">Level:</span>
              {levels.map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                >
                  {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-600 relative">
                    {course.thumbnail_url && (
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{course.category}</Badge>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full">
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{course.duration_hours}h</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{course.enrollment_count}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={course.instructor.avatar_url || "/placeholder-user.jpg"} />
                            <AvatarFallback>{course.instructor.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{course.instructor.full_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {course.price > 0 ? (
                            <span className="font-semibold text-lg">${course.price}</span>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                          <Button size="sm" onClick={() => handleEnrollCourse(course.id)}>
                            Enroll
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-courses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEnrollments?.map((enrollment) => (
              <Card key={enrollment.course.id} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-600 relative">
                  {enrollment.course.thumbnail_url && (
                    <img
                      src={enrollment.course.thumbnail_url || "/placeholder-user.jpg"}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{enrollment.course.category}</Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{enrollment.course.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{enrollment.course.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
