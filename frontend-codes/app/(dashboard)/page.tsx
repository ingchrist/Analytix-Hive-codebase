
import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirect to student dashboard for now
  redirect('/dashboard/student')
}
