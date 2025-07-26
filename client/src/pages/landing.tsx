import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-ios-light-gray">
      {/* iOS Status Bar */}
      <div className="bg-white pt-safe-top">
        <div className="flex justify-between items-center px-6 py-2 text-sm font-semibold">
          <span>9:41</span>
          <span>Gym Tracker</span>
          <div className="flex space-x-1 text-xs">
            <span>📶</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-ios-separator px-6 py-8 text-center">
        <div className="text-6xl mb-4">💪</div>
        <h1 className="text-3xl font-bold mb-2">Gym Class Tracker</h1>
        <p className="text-ios-gray text-lg">Track your fitness classes with ease</p>
      </header>

      <main className="px-4 py-8 space-y-8">
        {/* Features */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white rounded-xl shadow-sm border-ios-separator">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Calendar className="text-ios-blue mr-3 h-6 w-6" />
                Easy Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-ios-gray">
                Quickly record your gym class attendance with date, participant count, and notes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-ios-separator">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart3 className="text-ios-green mr-3 h-6 w-6" />
                Track Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-ios-gray">
                View your weekly stats and average attendance to monitor your fitness journey.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-ios-separator">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Shield className="text-ios-purple mr-3 h-6 w-6" />
                Secure & Private
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-ios-gray">
                Your data is securely stored and only accessible to you with authentication.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Button */}
        <div className="pt-8">
          <Button
            onClick={() => window.location.href = "/"}
            className="w-full bg-ios-blue hover:bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 active:scale-95"
          >
            Get Started
          </Button>
        </div>

        {/* Info */}
        <div className="text-center pt-4">
          <p className="text-sm text-ios-gray">
            Start tracking your gym classes immediately
          </p>
        </div>
      </main>

      {/* Bottom Safe Area */}
      <div className="h-safe-bottom bg-ios-light-gray"></div>
    </div>
  );
}