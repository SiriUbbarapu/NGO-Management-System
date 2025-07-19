import React, { useState } from 'react';
import { Download, TrendingUp, Users, GraduationCap, Heart, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { mockFamilies, mockStudents, mockWomen, centers } from '../data/mockData';

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCenter, setSelectedCenter] = useState('All Centers');

  // Calculate comprehensive statistics
  const stats = {
    totalFamilies: mockFamilies.length,
    totalStudents: mockStudents.length,
    totalWomen: mockWomen.length,
    averageAttendance: Math.round(mockStudents.reduce((acc, s) => acc + s.attendance, 0) / mockStudents.length),
    averageTestScore: Math.round(mockStudents.reduce((acc, s) => acc + s.lastTestScore, 0) / mockStudents.length),
    womenEmployed: mockWomen.filter(w => w.jobStatus === 'employed').length,
    trainingCompleted: mockWomen.filter(w => w.trainingStatus === 'completed').length,
    skillCompletionRate: Math.round((mockWomen.filter(w => w.trainingStatus === 'completed').length / mockWomen.length) * 100)
  };

  // Center-wise breakdown
  const centerStats = centers.slice(1).map(center => {
    const centerFamilies = mockFamilies.filter(f => f.center === center);
    const centerStudents = mockStudents.filter(s => s.center === center);
    const centerWomen = mockWomen.filter(w => w.center === center);
    
    return {
      name: center,
      families: centerFamilies.length,
      students: centerStudents.length,
      women: centerWomen.length,
      avgAttendance: centerStudents.length > 0 
        ? Math.round(centerStudents.reduce((acc, s) => acc + s.attendance, 0) / centerStudents.length)
        : 0
    };
  });

  // Performance trends (mock data)
  const performanceTrends = [
    { month: 'Jan', attendance: 82, testScores: 75, employment: 45 },
    { month: 'Feb', attendance: 85, testScores: 78, employment: 52 },
    { month: 'Mar', attendance: 88, testScores: 82, employment: 58 },
    { month: 'Apr', attendance: 87, testScores: 85, employment: 65 },
    { month: 'May', attendance: 90, testScores: 88, employment: 72 },
    { month: 'Jun', attendance: stats.averageAttendance, testScores: stats.averageTestScore, employment: 78 }
  ];

  const exportData = () => {
    // Create CSV content
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Families', stats.totalFamilies],
      ['Total Students', stats.totalStudents],
      ['Total Women', stats.totalWomen],
      ['Average Attendance', `${stats.averageAttendance}%`],
      ['Average Test Score', stats.averageTestScore],
      ['Women Employed', stats.womenEmployed],
      ['Training Completed', stats.trainingCompleted],
      ['Skill Completion Rate', `${stats.skillCompletionRate}%`]
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kalam-foundation-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-auto"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </Select>
          <Button onClick={exportData} variant="kalam">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Families</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFamilies}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="neumorphic-card p-3">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-xs text-green-600 mt-1">+8% from last month</p>
              </div>
              <div className="neumorphic-card p-3">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Women Empowered</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalWomen}</p>
                <p className="text-xs text-green-600 mt-1">+15% from last month</p>
              </div>
              <div className="neumorphic-card p-3">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Skill Completion</p>
                <p className="text-3xl font-bold text-gray-900">{stats.skillCompletionRate}%</p>
                <p className="text-xs text-green-600 mt-1">+5% from last month</p>
              </div>
              <div className="neumorphic-card p-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="neumorphic-card p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Attendance</span>
                  <Badge variant="success">{stats.averageAttendance}%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{ width: `${stats.averageAttendance}%` }}
                  ></div>
                </div>
              </div>

              <div className="neumorphic-card p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Test Score</span>
                  <Badge variant="primary">{stats.averageTestScore}/100</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${stats.averageTestScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="neumorphic-card p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Women Employment Rate</span>
                  <Badge variant="kalam">{Math.round((stats.womenEmployed / stats.totalWomen) * 100)}%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-kalam-orange to-kalam-blue h-3 rounded-full" 
                    style={{ width: `${(stats.womenEmployed / stats.totalWomen) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Center-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {centerStats.map((center, index) => (
                <div key={index} className="neumorphic-card p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{center.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Families:</span>
                      <span className="font-medium ml-2">{center.families}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium ml-2">{center.students}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Women:</span>
                      <span className="font-medium ml-2">{center.women}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Attendance:</span>
                      <span className="font-medium ml-2">{center.avgAttendance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceTrends.slice(-3).map((trend, index) => (
                <div key={index} className="neumorphic-card p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{trend.month} 2024</span>
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Attendance</span>
                      <p className="font-medium text-green-600">{trend.attendance}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Test Scores</span>
                      <p className="font-medium text-blue-600">{trend.testScores}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Employment</span>
                      <p className="font-medium text-orange-600">{trend.employment}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="neumorphic-card p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Education Impact</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {stats.totalStudents} students are receiving quality education across {centers.length - 1} centers.
                </p>
                <Badge variant="success">Average attendance: {stats.averageAttendance}%</Badge>
              </div>

              <div className="neumorphic-card p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Women Empowerment</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {stats.womenEmployed} women have secured employment after skill training.
                </p>
                <Badge variant="kalam">{stats.skillCompletionRate}% completion rate</Badge>
              </div>

              <div className="neumorphic-card p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Community Growth</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {stats.totalFamilies} families are part of the Kalam community ecosystem.
                </p>
                <Badge variant="primary">Growing by 12% monthly</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
