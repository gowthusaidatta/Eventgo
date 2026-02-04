import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, BookOpen, Trophy, ArrowRight } from 'lucide-react';

// Import logos as public assets
const adityaLogo = '/aditya-logo.svg';
const eventgoLogo = '/eventgo-logo.svg';

export default function IndexAditya() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/aditya" className="flex items-center gap-3">
            <img src={adityaLogo} alt="Aditya University" className="h-12 w-12" />
            <span className="font-bold text-lg text-blue-900">Aditya</span>
            <span className="text-gray-300 px-2">|</span>
            <img src={eventgoLogo} alt="EvntGo" className="h-12 w-12" />
            <span className="font-bold text-lg text-purple-600">EvntGo</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/aditya/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/aditya/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-blue-900">
                Aditya University Events & Opportunities
              </h1>
              <p className="text-xl text-gray-600">
                Powered by EvntGo - Discover, Create, and Manage Events with Ease
              </p>
            </div>
            <p className="text-lg text-gray-600">
              Connect students with opportunities, manage campus events, and foster collaboration across Aditya University.
            </p>
            <div className="flex gap-4">
              <Link to="/aditya/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/aditya/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-24 w-24 mx-auto text-white mb-4" />
                <p className="text-white text-lg font-semibold">Manage Campus Events</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Event Management',
                description: 'Create and manage campus events seamlessly'
              },
              {
                icon: Users,
                title: 'Student Engagement',
                description: 'Connect students with campus opportunities'
              },
              {
                icon: BookOpen,
                title: 'Learning Opportunities',
                description: 'Discover workshops, seminars, and competitions'
              },
              {
                icon: Trophy,
                title: 'Achievements',
                description: 'Track participation and achievements'
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border-blue-100 hover:shadow-lg transition">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to Join Aditya University Community?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Create your account and start exploring events, opportunities, and connections today.
          </p>
          <Link to="/aditya/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Aditya University</h3>
              <p className="text-sm text-gray-600">
                Powered by EvntGo - Event Management Platform
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/aditya/login" className="hover:text-blue-600">Sign In</Link></li>
                <li><Link to="/aditya/signup" className="hover:text-blue-600">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">About</h3>
              <p className="text-sm text-gray-600">
                © 2026 Aditya University. All rights reserved.
              </p>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-gray-600">
            <p>Powered by <span className="font-semibold">EvntGo</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
