import React, { useState, useEffect } from 'react';
import { Plus, Filter, Users, Phone, MapPin, Calendar, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { familiesAPI, studentsAPI, womenAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Families = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState('All Centers');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState({ students: [], women: [] });
  const [memberType, setMemberType] = useState('student'); // 'student' or 'woman'
  const [submitting, setSubmitting] = useState(false);
  const [newFamily, setNewFamily] = useState({
    name: '',
    contact: '',
    center: '',
    address: ''
  });
  const [newMember, setNewMember] = useState({
    name: '',
    age: '',
    // Student specific
    educationLevel: '',
    gender: '',
    // Woman specific
    skill: '',
    trainingStatus: '',
    jobStatus: ''
  });
  const { user } = useAuth();

  // Available centers based on user role
  const availableCenters = user?.role === 'admin'
    ? ['Delhi Center', 'Mumbai Center', 'Bangalore Center']
    : [user?.center].filter(Boolean);

  // Centers for filter dropdown
  const centers = ['All Centers', ...availableCenters];

  // Fetch families on component mount
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching families...');
        const response = await familiesAPI.getFamilies();
        console.log('📋 Families response:', response);

        if (response.success) {
          setFamilies(response.data.families || []);
          console.log('✅ Families loaded successfully:', response.data.families?.length || 0);
        } else {
          throw new Error(response.message || 'Failed to fetch families');
        }
      } catch (error) {
        console.error('❌ Error fetching families:', error);
        setError(error.message);
        setFamilies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  const filteredFamilies = selectedCenter === 'All Centers'
    ? families
    : families.filter(family => family.center === selectedCenter);

  const handleAddFamily = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!newFamily.name || !newFamily.contact || !newFamily.center || !newFamily.address) {
        throw new Error('All fields are required');
      }

      // For tutors, ensure they're creating family for their center
      if (user.role === 'tutor' && newFamily.center !== user.center) {
        throw new Error('You can only create families for your assigned center');
      }

      console.log('➕ Creating family:', newFamily);
      const response = await familiesAPI.createFamily(newFamily);
      console.log('✅ Family created:', response);

      if (response.success) {
        // Add the new family to the current list
        setFamilies(prevFamilies => [response.data.family, ...prevFamilies]);

        // Reset form and close modal
        setNewFamily({ name: '', contact: '', center: '', address: '' });
        setIsAddModalOpen(false);
        setSuccess('Family created successfully!');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to create family');
      }
    } catch (error) {
      console.error('❌ Error creating family:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch family members (students and women)
  const fetchFamilyMembers = async (familyId) => {
    try {
      console.log('🔄 Fetching family members for:', familyId);

      const [studentsResponse, womenResponse] = await Promise.all([
        studentsAPI.getStudents({ familyId }),
        womenAPI.getWomen({ familyId })
      ]);

      const members = {
        students: studentsResponse.success ? studentsResponse.data.students || [] : [],
        women: womenResponse.success ? womenResponse.data.women || [] : []
      };

      console.log('👨‍👩‍👧‍👦 Family members loaded:', members);
      setFamilyMembers(members);
      return members;
    } catch (error) {
      console.error('❌ Error fetching family members:', error);
      setError('Failed to load family members');
      return { students: [], women: [] };
    }
  };

  // Open add member modal
  const handleAddMemberClick = async (family) => {
    setSelectedFamily(family);
    setIsAddMemberModalOpen(true);
    await fetchFamilyMembers(family._id);
  };

  // Add new family member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const memberData = {
        ...newMember,
        familyId: selectedFamily._id,
        center: selectedFamily.center
      };

      let response;
      if (memberType === 'student') {
        // Validate student-specific fields
        if (!memberData.name || !memberData.age || !memberData.educationLevel || !memberData.gender) {
          throw new Error('Name, age, education level, and gender are required for students');
        }
        response = await studentsAPI.createStudent(memberData);
      } else {
        // Validate woman-specific fields
        if (!memberData.name || !memberData.age || !memberData.skill || !memberData.trainingStatus || !memberData.jobStatus) {
          throw new Error('Name, age, skill, training status, and job status are required for women');
        }
        response = await womenAPI.createWoman(memberData);
      }

      if (response.success) {
        // Refresh family members
        await fetchFamilyMembers(selectedFamily._id);

        // Update family's total members count
        const updatedFamilies = families.map(family =>
          family._id === selectedFamily._id
            ? { ...family, totalMembers: (family.totalMembers || 0) + 1 }
            : family
        );
        setFamilies(updatedFamilies);

        // Reset form
        setNewMember({
          name: '',
          age: '',
          educationLevel: '',
          gender: '',
          skill: '',
          trainingStatus: '',
          jobStatus: ''
        });

        setSuccess(`${memberType === 'student' ? 'Student' : 'Woman'} added successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to add family member');
      }
    } catch (error) {
      console.error('❌ Error adding family member:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Family Management</h1>
          <p className="text-gray-600">Manage and track Kalam families and their members</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} variant="kalam">
          <Plus className="h-4 w-4 mr-2" />
          Add Family
        </Button>
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
          <span className="ml-2 text-gray-600">Loading families...</span>
        </div>
      )}

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
              {centers.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </Select>
            <div className="text-sm text-gray-600">
              Showing {filteredFamilies.length} families
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Families Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-kalam-orange" />
            <p className="text-gray-600">Loading families...</p>
          </div>
        ) : filteredFamilies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No families found</h3>
            <p className="text-gray-600 mb-4">
              {selectedCenter === 'All Centers'
                ? 'Get started by adding your first family.'
                : `No families found in ${selectedCenter}.`
              }
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} variant="kalam">
              <Plus className="h-4 w-4 mr-2" />
              Add First Family
            </Button>
          </div>
        ) : (
          filteredFamilies.map((family) => (
            <Card key={family._id} className="hover:shadow-neumorphic-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{family.name}</span>
                  <Badge variant="primary">{family.totalMembers || 0} members</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Family Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {family.contact}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {family.center}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Registered: {new Date(family.createdAt).toLocaleDateString()}
                    </div>
                    {family.address && (
                      <div className="text-sm text-gray-600">
                        <strong>Address:</strong> {family.address}
                      </div>
                    )}
                  </div>

                  {/* Family Summary */}
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Family Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Members:</span>
                        <span className="font-medium">{family.totalMembers || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created By:</span>
                        <span className="font-medium">{family.createdBy?.name || 'System'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={family.isActive ? 'success' : 'danger'}>
                          {family.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    {/* Add Members Button */}
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <Button
                        onClick={() => handleAddMemberClick(family)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Family Members
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Family Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Family"
        className="max-w-lg"
      >
        <form onSubmit={handleAddFamily} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Name
            </label>
            <Input
              value={newFamily.name}
              onChange={(e) => setNewFamily({...newFamily, name: e.target.value})}
              placeholder="Enter family name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <Input
              type="tel"
              value={newFamily.contact}
              onChange={(e) => setNewFamily({...newFamily, contact: e.target.value})}
              placeholder="10-digit contact number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter a 10-digit mobile number</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Center
            </label>
            <Select
              value={newFamily.center}
              onChange={(e) => setNewFamily({...newFamily, center: e.target.value})}
              required
            >
              <option value="">Select a center</option>
              {availableCenters.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={newFamily.address}
              onChange={(e) => setNewFamily({...newFamily, address: e.target.value})}
              placeholder="Enter complete address"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              required
            />
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
              variant="kalam"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Family
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setNewFamily({ name: '', contact: '', center: '', address: '' });
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

      {/* Add Family Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setSelectedFamily(null);
          setFamilyMembers({ students: [], women: [] });
          setNewMember({
            name: '',
            age: '',
            educationLevel: '',
            gender: '',
            skill: '',
            trainingStatus: '',
            jobStatus: ''
          });
          setError(null);
        }}
        title={`Add Member to ${selectedFamily?.name || 'Family'}`}
        className="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Current Family Members */}
          {selectedFamily && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Current Family Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Students */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Students ({familyMembers.students.length})</h4>
                  {familyMembers.students.length > 0 ? (
                    <div className="space-y-2">
                      {familyMembers.students.map((student) => (
                        <div key={student._id} className="bg-white p-2 rounded border text-sm">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-gray-600">Age: {student.age}, Level: {student.educationLevel}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No students yet</p>
                  )}
                </div>

                {/* Women */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Women ({familyMembers.women.length})</h4>
                  {familyMembers.women.length > 0 ? (
                    <div className="space-y-2">
                      {familyMembers.women.map((woman) => (
                        <div key={woman._id} className="bg-white p-2 rounded border text-sm">
                          <div className="font-medium">{woman.name}</div>
                          <div className="text-gray-600">Age: {woman.age}, Skill: {woman.skill}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No women yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add New Member Form */}
          <form onSubmit={handleAddMember} className="space-y-4">
            {/* Member Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="student"
                    checked={memberType === 'student'}
                    onChange={(e) => setMemberType(e.target.value)}
                    className="mr-2"
                  />
                  Student
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="woman"
                    checked={memberType === 'woman'}
                    onChange={(e) => setMemberType(e.target.value)}
                    className="mr-2"
                  />
                  Woman
                </label>
              </div>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <Input
                  type="number"
                  value={newMember.age}
                  onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                  placeholder="Enter age"
                  min={memberType === 'student' ? 3 : 18}
                  max={memberType === 'student' ? 18 : 65}
                  required
                />
              </div>
            </div>

            {/* Student-specific Fields */}
            {memberType === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Level
                  </label>
                  <Select
                    value={newMember.educationLevel}
                    onChange={(e) => setNewMember({...newMember, educationLevel: e.target.value})}
                    required
                  >
                    <option value="">Select education level</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <Select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({...newMember, gender: e.target.value})}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>
            )}

            {/* Woman-specific Fields */}
            {memberType === 'woman' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill
                    </label>
                    <Select
                      value={newMember.skill}
                      onChange={(e) => setNewMember({...newMember, skill: e.target.value})}
                      required
                    >
                      <option value="">Select skill</option>
                      <option value="Tailoring">Tailoring</option>
                      <option value="Cooking">Cooking</option>
                      <option value="Handicrafts">Handicrafts</option>
                      <option value="Computer Skills">Computer Skills</option>
                      <option value="Beauty & Wellness">Beauty & Wellness</option>
                      <option value="Embroidery">Embroidery</option>
                      <option value="Knitting">Knitting</option>
                      <option value="Jewelry Making">Jewelry Making</option>
                      <option value="Painting">Painting</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Status
                    </label>
                    <Select
                      value={newMember.trainingStatus}
                      onChange={(e) => setNewMember({...newMember, trainingStatus: e.target.value})}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Not Started">Not Started</option>
                      <option value="Started">Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Discontinued">Discontinued</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Status
                  </label>
                  <Select
                    value={newMember.jobStatus}
                    onChange={(e) => setNewMember({...newMember, jobStatus: e.target.value})}
                    required
                  >
                    <option value="">Select job status</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self Employed">Self Employed</option>
                    <option value="Employed">Employed</option>
                    <option value="Seeking Employment">Seeking Employment</option>
                  </Select>
                </div>
              </div>
            )}

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
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {memberType === 'student' ? 'Student' : 'Woman'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setSelectedFamily(null);
                  setFamilyMembers({ students: [], women: [] });
                  setNewMember({
                    name: '',
                    age: '',
                    educationLevel: '',
                    gender: '',
                    skill: '',
                    trainingStatus: '',
                    jobStatus: ''
                  });
                  setError(null);
                }}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Families;
