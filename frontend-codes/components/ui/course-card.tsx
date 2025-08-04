
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CourseCardProps {
  id: string
  title: string
  description: string
  image: string
  price: number
  rating: number
  students: number
  duration: string
  category: string
  instructor: string
}

export function CourseCard({ 
  id, 
  title, 
  description, 
  image, 
  price, 
  rating, 
  students, 
  duration, 
  category, 
  instructor 
}: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-2 left-2">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">by {instructor}</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{students.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">${price}</span>
            <Button asChild size="sm">
              <Link href={`/courses/${id}`}>View Course</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
