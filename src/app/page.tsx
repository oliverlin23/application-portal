import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Yale Summer Debate Program</h1>
        
        <div className="flex justify-center mb-8">
          <Link href="/dashboard/application">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Apply Now
            </Button>
          </Link>
        </div>

        <p className="text-lg mb-8">
          Improve your public speaking and argumentation skills, learn about current events and national debates, 
          and have a lot of fun with the Yale Summer Debate Program (YSDP)! You will learn from Yale coaches 
          and work closely with other high school debaters.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Program Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Monday, August 19 through Friday, August 23, 2024</p>
              <p>Daily: 10:00 AM - 4:00 PM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$599 per student</p>
              <p className="text-green-600">Financial aid available</p>
              <p className="text-sm mt-2">Free for New Haven Public Schools UDL participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eligibility</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>Open to all middle and high school students</li>
                <li>No prior debate experience required</li>
                <li>Multiple skill levels available</li>
                <li>Self-provided transportation required</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">Application Deadline: June 1, 2024</p>
                <p className="text-red-600">Rolling admissions - Apply early!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Questions?</h2>
          <ul className="space-y-2">
            <li>Visit our website: <a href="https://ynhudl.com" className="text-blue-600 hover:underline">ynhudl.com</a></li>
            <li>Check our <a href="https://tinyurl.com/udlsummerfaqs" className="text-blue-600 hover:underline">FAQs</a></li>
            <li>Email: <a href="mailto:yalesummerdebateprogram@gmail.com" className="text-blue-600 hover:underline">yalesummerdebateprogram@gmail.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

