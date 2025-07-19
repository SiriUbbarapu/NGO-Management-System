import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Heart,
  Star,
  BookOpen,
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Chatbot from '../components/Chatbot';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = (role) => {
    // Navigate to login page with role preference
    navigate('/login', { state: { preferredRole: role } });
  };

  const stats = [
    {
      icon: Users,
      number: '156+',
      label: 'Families Supported',
      color: 'text-blue-600'
    },
    {
      icon: GraduationCap,
      number: '342+',
      label: 'Students Educated',
      color: 'text-kalam-orange'
    },
    {
      icon: Heart,
      number: '89+',
      label: 'Women Empowered',
      color: 'text-pink-600'
    },
    {
      icon: Star,
      number: '96%',
      label: 'Success Rate',
      color: 'text-yellow-600'
    }
  ];

  const programs = [
    {
      icon: BookOpen,
      title: 'Education Support',
      description: 'Quality education programs for children from underprivileged families, including tutoring, learning materials, and academic support.',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      title: 'Women Empowerment',
      description: 'Skill development programs for women including tailoring, computer skills, and entrepreneurship training to achieve financial independence.',
      color: 'text-pink-600'
    },
    {
      icon: Users,
      title: 'Family Support',
      description: 'Comprehensive family support programs including healthcare assistance, counseling, and community development initiatives.',
      color: 'text-kalam-orange'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Annual Education Fair',
      date: 'March 15, 2024',
      location: 'Mehdipatnam Community Hall, Hyderabad',
      description: 'Join us for our annual education fair featuring workshops, student exhibitions, and community celebrations.',
      icon: Calendar,
      color: 'bg-kalam-orange'
    },
    {
      title: "Women's Skill Development Workshop",
      date: 'March 22, 2024',
      location: 'Santosh Nagar Training Center, Hyderabad',
      description: 'Intensive workshop on digital literacy and entrepreneurship skills for women in our community.',
      icon: Heart,
      color: 'bg-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-kalam-orange to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">KS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TODAY'S KALAM</h1>
                <p className="text-sm text-gray-600">Foundation</p>
              </div>
            </div>

            {/* Login Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => handleLoginClick('tutor')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Login as Tutor</span>
              </Button>
              <Button
                onClick={() => handleLoginClick('admin')}
                className="bg-kalam-orange hover:bg-red-600 text-white flex items-center space-x-2"
              >
                <Star className="h-4 w-4" />
                <span>Login as Admin</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Empowering Communities Through{' '}
            <span className="text-kalam-orange">Education</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            KALAMS Foundation is dedicated to transforming lives through quality education,
            skill development, and community empowerment programs for underprivileged families.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="neumorphic-card p-6 text-center">
                <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Programs</h2>
            <p className="text-xl text-gray-600">Comprehensive programs designed to create lasting impact</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="neumorphic-card p-8">
                <program.icon className={`h-12 w-12 ${program.color} mb-6`} />
                <h3 className="text-xl font-bold text-gray-900 mb-4">{program.title}</h3>
                <p className="text-gray-600 leading-relaxed">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-600">Join us in making a difference</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="neumorphic-card p-8">
                <div className={`w-12 h-12 ${event.color} rounded-xl flex items-center justify-center mb-6`}>
                  <event.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>

          {/* Volunteer Section */}
          <div className="neumorphic-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Volunteer With Us</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Make a difference in your community by volunteering with KALAMS Foundation.
                  Join our mission to empower families through education and skill development.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Flexible volunteer opportunities</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Training and support provided</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Make a lasting impact</span>
                  </div>
                </div>
              </div>
              <div className="neumorphic-card p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Get Involved Today</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kalam-orange focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kalam-orange focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kalam-orange focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Teaching, IT, Healthcare, etc."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kalam-orange focus:border-transparent"
                  />
                  <textarea
                    placeholder="Tell us about your volunteering or relevant experience..."
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kalam-orange focus:border-transparent"
                  ></textarea>
                  <Button className="w-full bg-gradient-to-r from-kalam-orange to-blue-600 hover:from-red-600 hover:to-blue-700 text-white">
                    Register as Volunteer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-kalam-blue to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our team of dedicated educators and administrators working to transform communities through education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleLoginClick('tutor')}
              className="bg-white text-kalam-blue border-white hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <Users className="h-5 w-5" />
              <span>Access Tutor Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => handleLoginClick('admin')}
              className="bg-kalam-orange hover:bg-red-600 text-white flex items-center justify-center space-x-2"
            >
              <Star className="h-5 w-5" />
              <span>Access Admin Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-kalam-orange to-red-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">KS</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">KALAMS Foundation</h3>
                  <p className="text-gray-400">Empowering Communities Through Education</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Dedicated to transforming lives through quality education, skill development,
                and community empowerment programs for underprivileged families.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Get Involved</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>Hyderabad, Telangana</p>
                <p>info@kalamsfoundation.org</p>
                <p>+91 (040) 1234-5678</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KALAMS Foundation. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default LandingPage;
