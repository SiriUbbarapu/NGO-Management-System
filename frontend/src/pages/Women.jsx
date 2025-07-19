import React, { useState } from 'react';
import { Heart, Briefcase, TrendingUp, Filter, Edit } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { mockWomen, centers, skills } from '../data/mockData';

const Women = () => {
  const [women, setWomen] = useState(mockWomen);
  const [selectedCenter, setSelectedCenter] = useState('All Centers');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedWoman, setSelectedWoman] = useState(null);
  const [updateData, setUpdateData] = useState({
    trainingStatus: '',
    jobStatus: '',
    employer: '',
    progress: ''
  });

  const filteredWomen = women.filter(woman => {
    const centerMatch = selectedCenter === 'All Centers' || woman.center === selectedCenter;
    const skillMatch = selectedSkill === 'All Skills' || woman.skill === selectedSkill;
    return centerMatch && skillMatch;
  });

  const getTrainingStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { variant: 'success', text: 'Completed' };
      case 'in-progress':
        return { variant: 'primary', text: 'In Progress' };
      case 'started':
        return { variant: 'warning', text: 'Started' };
      default:
        return { variant: 'default', text: 'Not Started' };
    }
  };

  const getJobStatusBadge = (status) => {
    switch (status) {
      case 'employed':
        return { variant: 'success', text: 'Employed' };
      case 'self-employed':
        return { variant: 'primary', text: 'Self-Employed' };
      case 'unemployed':
        return { variant: 'warning', text: 'Seeking Employment' };
      default:
        return { variant: 'default', text: 'Unknown' };
    }
  };

  const handleUpdateStatus = (woman) => {
    setSelectedWoman(woman);
    setUpdateData({
      trainingStatus: woman.trainingStatus,
      jobStatus: woman.jobStatus,
      employer: woman.employer || '',
      progress: woman.progress || ''
    });
    setIsUpdateModalOpen(true);
  };

  const submitUpdate = (e) => {
    e.preventDefault();
    const updatedWomen = women.map(woman => 
      woman.id === selectedWoman.id 
        ? { 
            ...woman, 
            trainingStatus: updateData.trainingStatus,
            jobStatus: updateData.jobStatus,
            employer: updateData.employer,
            progress: parseInt(updateData.progress) || woman.progress
          }
        : woman
    );
    setWomen(updatedWomen);
    setIsUpdateModalOpen(false);
  };

  const stats = {
    total: women.length,
    employed: women.filter(w => w.jobStatus === 'employed').length,
    completed: women.filter(w => w.trainingStatus === 'completed').length,
    inProgress: women.filter(w => w.trainingStatus === 'in-progress').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Women Skills Empowerment</h1>
          <p className="text-gray-600">Track women's skill development and employment progress</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Women</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.employed}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Training Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Training</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <Heart className="h-8 w-8 text-orange-600" />
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
              {centers.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </Select>
            <Select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full sm:w-auto"
            >
              <option value="All Skills">All Skills</option>
              {skills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </Select>
            <div className="text-sm text-gray-600">
              Showing {filteredWomen.length} women
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Women Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWomen.map((woman) => {
          const trainingBadge = getTrainingStatusBadge(woman.trainingStatus);
          const jobBadge = getJobStatusBadge(woman.jobStatus);
          
          return (
            <Card key={woman.id} className="hover:shadow-neumorphic-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{woman.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateStatus(woman)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{woman.age} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Center:</span>
                      <span className="font-medium">{woman.center}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Family:</span>
                      <span className="font-medium">{woman.family}</span>
                    </div>
                  </div>

                  {/* Skill Information */}
                  <div className="neumorphic-card p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Skill Development</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Skill:</span>
                        <Badge variant="kalam" className="text-xs">{woman.skill}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Training:</span>
                        <Badge variant={trainingBadge.variant} className="text-xs">
                          {trainingBadge.text}
                        </Badge>
                      </div>
                      {woman.progress && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Progress:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-500 h-2 rounded-full" 
                                style={{ width: `${woman.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{woman.progress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Employment Status */}
                  <div className="neumorphic-card p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Employment</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge variant={jobBadge.variant} className="text-xs">
                          {jobBadge.text}
                        </Badge>
                      </div>
                      {woman.employer && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Employer:</span>
                          <span className="font-medium">{woman.employer}</span>
                        </div>
                      )}
                      {woman.startDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Started:</span>
                          <span className="font-medium">
                            {new Date(woman.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {woman.completionDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium">
                            {new Date(woman.completionDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Status - ${selectedWoman?.name}`}
        className="max-w-lg"
      >
        <form onSubmit={submitUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Status
            </label>
            <Select
              value={updateData.trainingStatus}
              onChange={(e) => setUpdateData({...updateData, trainingStatus: e.target.value})}
              required
            >
              <option value="started">Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Status
            </label>
            <Select
              value={updateData.jobStatus}
              onChange={(e) => setUpdateData({...updateData, jobStatus: e.target.value})}
              required
            >
              <option value="unemployed">Seeking Employment</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self-Employed</option>
            </Select>
          </div>
          
          {updateData.jobStatus === 'employed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employer
              </label>
              <Input
                value={updateData.employer}
                onChange={(e) => setUpdateData({...updateData, employer: e.target.value})}
                placeholder="Enter employer name"
              />
            </div>
          )}
          
          {updateData.trainingStatus === 'in-progress' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={updateData.progress}
                onChange={(e) => setUpdateData({...updateData, progress: e.target.value})}
                placeholder="Enter progress percentage"
              />
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="kalam" className="flex-1">
              Update Status
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsUpdateModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Women;
