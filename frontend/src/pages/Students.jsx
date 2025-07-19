import React, { useState, useEffect } from 'react';
import { Calendar, Plus, BookOpen, TrendingUp, Users, Filter, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { studentsAPI, attendanceAPI, testScoresAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState('All Centers');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isTestScoreModalOpen, setIsTestScoreModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });
  const [testScoreData, setTestScoreData] = useState({
    subject: '',
    score: '',
    maxScore: '100',
    testType: ''
  });
  const { user } = useAuth();

  // Available centers based on user role
  const availableCenters = user?.role === 'admin'
    ? ['Delhi Center', 'Mumbai Center', 'Bangalore Center']
    : [user?.center].filter(Boolean);

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching students...');
        const response = await studentsAPI.getStudents();
        console.log('👨‍🎓 Students response:', response);

        if (response.success) {
          setStudents(response.data.students || []);
          console.log('✅ Students loaded successfully:', response.data.students?.length || 0);
        } else {
          throw new Error(response.message || 'Failed to fetch students');
        }
      } catch (error) {
        console.error('❌ Error fetching students:', error);
        setError(error.message);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = selectedCenter === 'All Centers'
    ? students
    : students.filter(student => student.center === selectedCenter);

  const getPerformanceBadge = (student) => {
    const attendance = student.attendanceRate || 0;
    const avgScore = student.averageScore || 0;

    if (attendance >= 90 && avgScore >= 85) {
      return { variant: 'success', text: 'Excellent' };
    } else if (attendance >= 75 && avgScore >= 70) {
      return { variant: 'primary', text: 'Good' };
    } else if (attendance >= 60 || avgScore >= 50) {
      return { variant: 'warning', text: 'Needs Attention' };
    } else {
      return { variant: 'danger', text: 'At Risk' };
    }
  };

  const handleTakeAttendance = (student) => {
    setSelectedStudent(student);
    setIsAttendanceModalOpen(true);
  };

  const handleAddTestScore = (student) => {
    setSelectedStudent(student);
    setIsTestScoreModalOpen(true);
  };

  const submitAttendance = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const attendancePayload = {
        studentId: selectedStudent._id,
        date: attendanceData.date,
        status: attendanceData.status
      };

      console.log('📝 Recording attendance:', attendancePayload);
      const response = await attendanceAPI.markAttendance(attendancePayload);
      console.log('✅ Attendance recorded:', response);

      if (response.success) {
        setSuccess(`Attendance recorded for ${selectedStudent.name}`);
        setIsAttendanceModalOpen(false);
        setAttendanceData({
          date: new Date().toISOString().split('T')[0],
          status: 'present'
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to record attendance');
      }
    } catch (error) {
      console.error('❌ Error recording attendance:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitTestScore = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const scorePayload = {
        studentId: selectedStudent._id,
        subject: testScoreData.subject,
        score: parseInt(testScoreData.score),
        maxScore: parseInt(testScoreData.maxScore),
        testType: testScoreData.testType,
        date: new Date().toISOString().split('T')[0]
      };

      console.log('📊 Recording test score:', scorePayload);
      const response = await testScoresAPI.addTestScore(scorePayload);
      console.log('✅ Test score recorded:', response);

      if (response.success) {
        setSuccess(`Test score recorded for ${selectedStudent.name}`);
        setIsTestScoreModalOpen(false);
        setTestScoreData({ subject: '', score: '', maxScore: '100' });

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to record test score');
      }
    } catch (error) {
      console.error('❌ Error recording test score:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Track student progress, attendance, and performance</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="text-green-800 font-medium">Success</h3>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading students...</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Test Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(students.reduce((acc, s) => acc + s.lastTestScore, 0) / students.length)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full sm:w-auto"
            >
              <option value="All Centers">All Centers</option>
              {availableCenters.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </Select>
            <div className="text-sm text-gray-600">
              Showing {filteredStudents.length} students
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">
                {selectedCenter === 'All Centers'
                  ? 'No students have been enrolled yet.'
                  : `No students found in ${selectedCenter}.`
                }
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const badge = getPerformanceBadge(student);
              return (
                <Card key={student._id} className="hover:shadow-neumorphic-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{student.name}</span>
                  <Badge variant={badge.variant}>{badge.text}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Student Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Education:</span>
                      <span className="font-medium">{student.education}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Center:</span>
                      <span className="font-medium">{student.center}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Family:</span>
                      <span className="font-medium">{student.familyName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{student.age || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="neumorphic-card p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Attendance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${student.attendanceRate || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{student.attendanceRate || 0}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average Score:</span>
                        <span className="font-medium">{student.averageScore || 0}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleTakeAttendance(student)}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Attendance
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddTestScore(student)}
                      className="flex-1"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Test Score
                    </Button>
                  </div>
                </div>
              </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title={`Take Attendance - ${selectedStudent?.name}`}
      >
        <form onSubmit={submitAttendance} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={attendanceData.date}
              onChange={(e) => setAttendanceData({...attendanceData, date: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={attendanceData.status}
              onChange={(e) => setAttendanceData({...attendanceData, status: e.target.value})}
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </Select>
          </div>
          
          {/* Error display in modal */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Record Attendance
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAttendanceModalOpen(false);
                setError(null);
              }}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Test Score Modal */}
      <Modal
        isOpen={isTestScoreModalOpen}
        onClose={() => setIsTestScoreModalOpen(false)}
        title={`Add Test Score - ${selectedStudent?.name}`}
      >
        <form onSubmit={submitTestScore} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <Select
              value={testScoreData.subject}
              onChange={(e) => setTestScoreData({...testScoreData, subject: e.target.value})}
              required
            >
              <option value="">Select subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Science">Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Hindi">Hindi</option>
              <option value="Computer">Computer</option>
              <option value="Art">Art</option>
              <option value="Physical Education">Physical Education</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score
            </label>
            <Input
              type="number"
              min="0"
              max={testScoreData.maxScore}
              value={testScoreData.score}
              onChange={(e) => setTestScoreData({...testScoreData, score: e.target.value})}
              placeholder="Enter score"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Score
            </label>
            <Input
              type="number"
              value={testScoreData.maxScore}
              onChange={(e) => setTestScoreData({...testScoreData, maxScore: e.target.value})}
              placeholder="Enter maximum score"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Type
            </label>
            <Select
              value={testScoreData.testType}
              onChange={(e) => setTestScoreData({...testScoreData, testType: e.target.value})}
              required
            >
              <option value="">Select test type</option>
              <option value="Quiz">Quiz</option>
              <option value="Unit Test">Unit Test</option>
              <option value="Mid Term">Mid Term</option>
              <option value="Final Exam">Final Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Project">Project</option>
            </Select>
          </div>
          
          {/* Error display in modal */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Adding Score...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Score
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsTestScoreModalOpen(false);
                setTestScoreData({ subject: '', score: '', maxScore: '100' });
                setError(null);
              }}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
