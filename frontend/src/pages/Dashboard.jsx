import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  Users,
  GraduationCap,
  Heart,
  TrendingUp,
  Calendar,
  FileText,
  Download,
  UserCheck,
  BookOpen,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Save,
  X
} from 'lucide-react';
import dashboardAPI from '../services/dashboardAPI';
import { attendanceAPI, testScoresAPI, studentsAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [error, setError] = useState(null);
  const [isQuickAttendanceOpen, setIsQuickAttendanceOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // All hooks must be at the top before any conditional returns

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, studentsResponse, attendanceResponse] = await Promise.all([
          dashboardAPI.getDashboardStats(),
          dashboardAPI.getStudentManagement(),
          dashboardAPI.getAttendanceReports()
        ]);

        // Data loaded successfully

        setDashboardData(statsResponse.data);
        setStudentData(studentsResponse.data);
        setAttendanceData(attendanceResponse.data);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Prepare stats for display
  const stats = [
    {
      title: 'Total Students',
      value: dashboardData?.overview?.totalStudents || 0,
      icon: Users,
      change: dashboardData?.overview?.studentGrowth || '+0%',
      changeType: 'positive'
    },
    {
      title: 'Active Students',
      value: dashboardData?.overview?.activeStudents || 0,
      icon: GraduationCap,
      change: dashboardData?.overview?.familyGrowth || '+0%',
      changeType: 'positive'
    },
    {
      title: 'Student Progress',
      value: `${studentData?.averageTestScore || 0}%`,
      icon: BarChart3,
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Reduced Dropout Rate',
      value: `${dashboardData?.overview?.attendancePercentage || 0}%`,
      icon: TrendingUp,
      change: '+5%',
      changeType: 'positive'
    }
  ];

  const recentActivities = dashboardData?.recentActivities || [];

  // Download attendance report function
  const downloadAttendanceReport = () => {
    if (!attendanceData?.recentRecords) return;

    const csvContent = [
      ['Date', 'Present', 'Absent', 'Total', 'Attendance Rate'],
      ...attendanceData.recentRecords.map(record => [
        record._id,
        record.present,
        record.absent,
        record.total,
        `${record.rate}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Navigation functions
  const navigateToStudents = () => navigate('/students');
  const navigateToAttendance = () => navigate('/students'); // Students page has attendance
  const navigateToReports = () => navigate('/students'); // Students page has reports

  // Quick attendance functions
  const openQuickAttendance = async () => {
    try {
      setIsQuickAttendanceOpen(true);
      const response = await studentsAPI.getStudents();
      if (response.success) {
        setAllStudents(response.data.students);
        // Initialize attendance records with today's date and default status
        const today = new Date().toISOString().split('T')[0];
        const initialRecords = {};
        response.data.students.forEach(student => {
          initialRecords[student._id] = {
            studentId: student._id,
            date: today,
            status: 'Present'
          };
        });
        setAttendanceRecords(initialRecords);
      }
    } catch (error) {
      console.error('Error fetching students for attendance:', error);
      setError('Failed to load students for attendance');
    }
  };

  const closeQuickAttendance = () => {
    setIsQuickAttendanceOpen(false);
    setAttendanceSuccess(null);
    setError(null);
    setSearchTerm('');
  };

  // Filter students based on search term
  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.educationLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.familyId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manual refresh function
  const refreshDashboard = async () => {
    try {
      setLoading(true);
      console.log('🔄 Manual dashboard refresh triggered...');

      const [statsResponse, studentsResponse, attendanceResponse] = await Promise.all([
        dashboardAPI.getDashboardStats(),
        dashboardAPI.getStudentManagement(),
        dashboardAPI.getAttendanceReports()
      ]);

      console.log('📊 Refreshed stats:', statsResponse);
      console.log('👨‍🎓 Refreshed students:', studentsResponse);
      console.log('📅 Refreshed attendance:', attendanceResponse);

      if (statsResponse?.data) setDashboardData(statsResponse.data);
      if (studentsResponse?.data) setStudentData(studentsResponse.data);
      if (attendanceResponse?.data) setAttendanceData(attendanceResponse.data);

      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('❌ Manual refresh error:', error);
      setError('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceStatus = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const markAllStudents = (status) => {
    setAttendanceRecords(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(studentId => {
        updated[studentId] = {
          ...updated[studentId],
          status
        };
      });
      return updated;
    });
  };

  const submitQuickAttendance = async () => {
    try {
      setSubmittingAttendance(true);
      setError(null);

      const attendanceList = Object.values(attendanceRecords);
      const response = await attendanceAPI.markBulkAttendance({ attendanceRecords: attendanceList });

      if (response.success) {
        setAttendanceSuccess('Attendance recorded successfully!');

        // Refresh dashboard data
        try {
          const [statsResponse, studentsResponse, attendanceResponse] = await Promise.all([
            dashboardAPI.getDashboardStats(),
            dashboardAPI.getStudentManagement(),
            dashboardAPI.getAttendanceReports()
          ]);

          // Update state with fresh data
          setDashboardData(statsResponse?.data || null);
          setStudentData(studentsResponse?.data || null);
          setAttendanceData(attendanceResponse?.data || null);

          setAttendanceSuccess('Attendance recorded successfully!');
        } catch (refreshError) {
          console.error('❌ Error refreshing dashboard data:', refreshError);
          setError('Attendance submitted but dashboard refresh failed. Please reload the page.');
        }

        setTimeout(() => {
          closeQuickAttendance();
        }, 2000);
      } else {
        setError('Failed to submit attendance. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting attendance:', error);
      setError('Failed to submit attendance. Please try again.');
    } finally {
      setSubmittingAttendance(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="neumorphic-card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your Kalam Foundation dashboard today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="neumorphic-card p-3">
                  <stat.icon className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="success" className="text-xs">
                  {stat.change}
                </Badge>
                <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Management</span>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Track student progress, attendance, and performance</span>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshDashboard}
                disabled={loading}
                className="text-xs"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600 mr-1"></div>
                ) : (
                  <BarChart3 className="h-3 w-3 mr-1" />
                )}
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Student Stats Summary */}
          <div key={`student-stats-${studentData?.totalStudents}-${studentData?.averageAttendance}`} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="neumorphic-card p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{studentData?.totalStudents || 0}</p>
              <p className="text-sm text-gray-600">Total Students</p>

            </div>
            <div className="neumorphic-card p-4 text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{studentData?.averageAttendance || 0}%</p>
              <p className="text-sm text-gray-600">Average Attendance</p>

            </div>
            <div className="neumorphic-card p-4 text-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{studentData?.averageTestScore || 0}</p>
              <p className="text-sm text-gray-600">Average Test Score</p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">Showing {studentData?.totalStudents || 0} students</p>
          </div>

          {/* Student Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentData?.students?.slice(0, 6).map((student) => (
              <div key={student._id} className="neumorphic-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <Badge variant={getPerformanceBadge(student.attendancePercentage)}>
                    {getPerformanceLabel(student.attendancePercentage)}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Education:</span>
                    <span className="font-medium">{student.educationLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Center:</span>
                    <span className="font-medium">{student.center}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Family:</span>
                    <span className="font-medium">{student.family}</span>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Attendance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${student.attendancePercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{student.attendancePercentage}%</span>
                    </div>
                  </div>

                  {student.lastTestScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Test Score</span>
                      <span className="text-sm font-medium">
                        {student.lastTestScore}/{student.lastTestMaxScore}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={navigateToAttendance}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={navigateToStudents}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Test Score
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Attendance Reports</span>
            <Button size="sm" variant="outline" onClick={downloadAttendanceReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </CardTitle>
          <p className="text-sm text-gray-600">View and analyze attendance data</p>
        </CardHeader>
        <CardContent>
          {/* Attendance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="neumorphic-card p-4 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{attendanceData?.summary?.totalSessions || 0}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="neumorphic-card p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{attendanceData?.summary?.averageAttendance || 0}%</p>
              <p className="text-sm text-gray-600">Average Attendance</p>
            </div>
            <div className="neumorphic-card p-4 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{attendanceData?.summary?.studentsTracked || 0}</p>
              <p className="text-sm text-gray-600">Students Tracked</p>
            </div>
          </div>

          {/* Recent Attendance Records */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Recent Attendance Records</h4>
            <div className="space-y-3">
              {attendanceData?.recentRecords?.slice(0, 5).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 neumorphic-card">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{record._id}</p>
                      <p className="text-sm text-gray-600">All Centers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{record.present}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">{record.absent}</span>
                    </div>
                    <Badge variant={record.rate >= 80 ? 'success' : record.rate >= 60 ? 'warning' : 'error'}>
                      {record.rate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 neumorphic-card">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={openQuickAttendance}
                className="w-full p-4 text-left neumorphic-button rounded-xl hover:shadow-neumorphic-sm transition-all"
              >
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Quick Attendance</p>
                    <p className="text-sm text-gray-600">Record student attendance quickly</p>
                  </div>
                </div>
              </button>

              <button
                onClick={navigateToStudents}
                className="w-full p-4 text-left neumorphic-button rounded-xl hover:shadow-neumorphic-sm transition-all"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Update Student Scores</p>
                    <p className="text-sm text-gray-600">Record latest test scores</p>
                  </div>
                </div>
              </button>

              <button
                onClick={navigateToReports}
                className="w-full p-4 text-left neumorphic-button rounded-xl hover:shadow-neumorphic-sm transition-all"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-600">View attendance and progress reports</p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Attendance Modal */}
      <Modal
        isOpen={isQuickAttendanceOpen}
        onClose={closeQuickAttendance}
        title="Quick Attendance"
        size="lg"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
              <p className="text-sm text-gray-600">
                Date: {new Date().toLocaleDateString()} | Total: {allStudents.length} | Showing: {filteredStudents.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Present: {Object.values(attendanceRecords).filter(r => r.status === 'Present').length}
              </p>
              <p className="text-sm text-gray-600">
                Absent: {Object.values(attendanceRecords).filter(r => r.status === 'Absent').length}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllStudents('Present')}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Mark All Present
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllStudents('Absent')}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Mark All Absent
            </Button>
          </div>

          {/* Search Input */}
          <div>
            <Input
              type="text"
              placeholder="Search students by name, class, or family..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Success/Error Messages */}
          {attendanceSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800">{attendanceSuccess}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Student List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No students found matching your search.' : 'No students available.'}
              </div>
            ) : (
              filteredStudents.map((student) => (
              <div key={student._id} className="neumorphic-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">
                      {student.educationLevel} • {student.center}
                    </p>
                    {student.familyId && (
                      <p className="text-xs text-gray-500">
                        Family: {student.familyId.name}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateAttendanceStatus(student._id, 'Present')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        attendanceRecords[student._id]?.status === 'Present'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Present
                    </button>
                    <button
                      onClick={() => updateAttendanceStatus(student._id, 'Absent')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        attendanceRecords[student._id]?.status === 'Absent'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      <XCircle className="h-4 w-4 inline mr-1" />
                      Absent
                    </button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={closeQuickAttendance}
              disabled={submittingAttendance}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={submitQuickAttendance}
              disabled={submittingAttendance || allStudents.length === 0}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {submittingAttendance ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Attendance
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper functions
const getPerformanceBadge = (attendance) => {
  if (attendance >= 90) return 'success';
  if (attendance >= 75) return 'warning';
  return 'error';
};

const getPerformanceLabel = (attendance) => {
  if (attendance >= 90) return 'Excellent';
  if (attendance >= 75) return 'Good';
  return 'Needs Attention';
};

export default Dashboard;
