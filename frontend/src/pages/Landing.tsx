import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Code, ShoppingBag, Search, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: 'Student Connection',
      description: 'Find, discover and connect with other students in your department, branch or year of study.'
    },
    {
      icon: <Code className="w-6 h-6 text-primary" />,
      title: 'Team Finder',
      description: 'Create teams, invite members, specify required skills and find project/hackathon teammates.'
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-primary" />,
      title: 'Used Marketplace',
      description: 'Buy and sell textbooks, notes, lab kits, calculators and other college materials locally on campus.'
    },
    {
      icon: <Search className="w-6 h-6 text-primary" />,
      title: 'Lost & Found Matching',
      description: 'Report lost or found items. Our rule-based matching engine scores matches to return items.'
    },
    {
      icon: <Calendar className="w-6 h-6 text-primary" />,
      title: 'Campus Events',
      description: 'Discover workshops, hackathons, seminars or sports events and register in a single click.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-150 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">CampusConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
            Join Now
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light border border-teal-200/40 text-primary text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Exclusively for college students
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-950 leading-tight">
            Your campus. Your people. <br />
            <span className="text-primary">Your opportunities.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed">
            CampusConnect is the ultimate unified platform built for students. Discover friends, construct hackathon teams, trade campus essentials, track lost items, and register for student events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/register')}
            >
              Join CampusConnect
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto hover:bg-gray-50"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Campus
            </Button>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-white border-y border-gray-150 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
              Everything in one hub
            </h2>
            <p className="text-sm md:text-base text-gray-500 text-center max-w-lg mx-auto mb-16">
              Skip scattered group chats and offline boards. Access all campus utility tools in a single modern interface.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-6 border border-gray-150 rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-xs transition-all text-left flex flex-col gap-3"
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-xs border border-gray-100">
                    {feat.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base">{feat.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Future Vision CTA */}
        <section className="py-20 px-6 text-center max-w-3xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
            Ready to enhance your college lifecycle?
          </h2>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Create an account using your details, pick your branch and year, list items, find groups, and never miss out on campus opportunities.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="px-8"
            onClick={() => navigate('/register')}
          >
            Get Started Now
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-150 py-8 px-6 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default Landing;
