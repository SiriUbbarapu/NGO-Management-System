require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Family = require('../models/Family');
const Student = require('../models/Student');
const Woman = require('../models/Woman');
const Attendance = require('../models/Attendance');
const TestScore = require('../models/TestScore');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Please ensure MongoDB is running or update MONGO_URI in .env file');
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Family.deleteMany({});
    await Student.deleteMany({});
    await Woman.deleteMany({});
    await Attendance.deleteMany({});
    await TestScore.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kalamfoundation.org',
      password: 'admin123',
      role: 'admin'
    });

    // Create tutor users
    console.log('Creating tutor users...');
    const tutor1 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@kalamfoundation.org',
      password: 'tutor123',
      role: 'tutor',
      center: 'Delhi Center'
    });

    const tutor2 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@kalamfoundation.org',
      password: 'tutor123',
      role: 'tutor',
      center: 'Mumbai Center'
    });

    const tutor3 = await User.create({
      name: 'Anita Patel',
      email: 'anita@kalamfoundation.org',
      password: 'tutor123',
      role: 'tutor',
      center: 'Bangalore Center'
    });

    // Create families
    console.log('Creating families...');
    const families = await Family.insertMany([
      {
        name: 'Sharma Family',
        contact: '9876543210',
        center: 'Delhi Center',
        address: '123 Main Street, New Delhi, Delhi 110001',
        createdBy: admin._id
      },
      {
        name: 'Kumar Family',
        contact: '9876543211',
        center: 'Delhi Center',
        address: '456 Park Avenue, New Delhi, Delhi 110002',
        createdBy: tutor1._id
      },
      {
        name: 'Patel Family',
        contact: '9876543212',
        center: 'Mumbai Center',
        address: '789 Marine Drive, Mumbai, Maharashtra 400001',
        createdBy: tutor2._id
      },
      {
        name: 'Singh Family',
        contact: '9876543213',
        center: 'Mumbai Center',
        address: '321 Linking Road, Mumbai, Maharashtra 400002',
        createdBy: tutor2._id
      },
      {
        name: 'Reddy Family',
        contact: '9876543214',
        center: 'Bangalore Center',
        address: '654 MG Road, Bangalore, Karnataka 560001',
        createdBy: tutor3._id
      }
    ]);

    // Create students
    console.log('Creating students...');
    const students = await Student.insertMany([
      {
        name: 'Arjun Sharma',
        familyId: families[0]._id,
        center: 'Delhi Center',
        educationLevel: 'Class 5',
        age: 10,
        gender: 'Male',
        createdBy: tutor1._id
      },
      {
        name: 'Priya Sharma',
        familyId: families[0]._id,
        center: 'Delhi Center',
        educationLevel: 'Class 3',
        age: 8,
        gender: 'Female',
        createdBy: tutor1._id
      },
      {
        name: 'Rohit Kumar',
        familyId: families[1]._id,
        center: 'Delhi Center',
        educationLevel: 'Class 7',
        age: 12,
        gender: 'Male',
        createdBy: tutor1._id
      },
      {
        name: 'Sneha Patel',
        familyId: families[2]._id,
        center: 'Mumbai Center',
        educationLevel: 'Class 6',
        age: 11,
        gender: 'Female',
        createdBy: tutor2._id
      },
      {
        name: 'Vikram Singh',
        familyId: families[3]._id,
        center: 'Mumbai Center',
        educationLevel: 'Class 4',
        age: 9,
        gender: 'Male',
        createdBy: tutor2._id
      },
      {
        name: 'Kavya Reddy',
        familyId: families[4]._id,
        center: 'Bangalore Center',
        educationLevel: 'Class 8',
        age: 13,
        gender: 'Female',
        createdBy: tutor3._id
      }
    ]);

    // Create women
    console.log('Creating women...');
    const women = await Woman.insertMany([
      {
        name: 'Sunita Sharma',
        familyId: families[0]._id,
        age: 35,
        skill: 'Tailoring',
        trainingStatus: 'Completed',
        trainingStartDate: new Date('2023-01-15'),
        trainingEndDate: new Date('2023-06-15'),
        jobStatus: 'Self Employed',
        monthlyIncome: 15000,
        center: 'Delhi Center',
        contactNumber: '9876543210',
        createdBy: tutor1._id
      },
      {
        name: 'Meera Kumar',
        familyId: families[1]._id,
        age: 32,
        skill: 'Cooking',
        trainingStatus: 'In Progress',
        trainingStartDate: new Date('2024-01-01'),
        jobStatus: 'Seeking Employment',
        monthlyIncome: 0,
        center: 'Delhi Center',
        contactNumber: '9876543211',
        createdBy: tutor1._id
      },
      {
        name: 'Rekha Patel',
        familyId: families[2]._id,
        age: 28,
        skill: 'Beauty & Wellness',
        trainingStatus: 'Completed',
        trainingStartDate: new Date('2023-03-01'),
        trainingEndDate: new Date('2023-09-01'),
        jobStatus: 'Employed',
        monthlyIncome: 20000,
        center: 'Mumbai Center',
        contactNumber: '9876543212',
        createdBy: tutor2._id
      },
      {
        name: 'Lakshmi Singh',
        familyId: families[3]._id,
        age: 30,
        skill: 'Handicrafts',
        trainingStatus: 'Started',
        trainingStartDate: new Date('2024-02-01'),
        jobStatus: 'Unemployed',
        monthlyIncome: 0,
        center: 'Mumbai Center',
        contactNumber: '9876543213',
        createdBy: tutor2._id
      },
      {
        name: 'Radha Reddy',
        familyId: families[4]._id,
        age: 26,
        skill: 'Computer Skills',
        trainingStatus: 'Completed',
        trainingStartDate: new Date('2023-07-01'),
        trainingEndDate: new Date('2023-12-01'),
        jobStatus: 'Employed',
        monthlyIncome: 25000,
        center: 'Bangalore Center',
        contactNumber: '9876543214',
        createdBy: tutor3._id
      }
    ]);

    // Create attendance records for the last 30 days
    console.log('Creating attendance records...');
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      for (const student of students) {
        // 85% attendance rate
        const isPresent = Math.random() > 0.15;
        const tutor = student.center === 'Delhi Center' ? tutor1 : 
                     student.center === 'Mumbai Center' ? tutor2 : tutor3;
        
        attendanceRecords.push({
          studentId: student._id,
          date: date,
          status: isPresent ? 'Present' : 'Absent',
          markedBy: tutor._id,
          center: student.center
        });
      }
    }
    
    await Attendance.insertMany(attendanceRecords);

    // Create test scores
    console.log('Creating test scores...');
    const testScores = [];
    const subjects = ['Mathematics', 'English', 'Science', 'Hindi'];
    const testTypes = ['Quiz', 'Unit Test', 'Mid Term', 'Final Exam'];
    
    for (const student of students) {
      const tutor = student.center === 'Delhi Center' ? tutor1 : 
                   student.center === 'Mumbai Center' ? tutor2 : tutor3;
      
      for (const subject of subjects) {
        for (let i = 0; i < 3; i++) {
          const score = Math.floor(Math.random() * 40) + 60; // Scores between 60-100
          const testDate = new Date();
          testDate.setDate(testDate.getDate() - (i * 15));
          
          testScores.push({
            studentId: student._id,
            subject: subject,
            score: score,
            maxScore: 100,
            testType: testTypes[Math.floor(Math.random() * testTypes.length)],
            date: testDate,
            markedBy: tutor._id,
            center: student.center
          });
        }
      }
    }
    
    await TestScore.insertMany(testScores);

    // Update family member counts
    console.log('Updating family member counts...');
    for (const family of families) {
      const studentCount = await Student.countDocuments({ familyId: family._id, isActive: true });
      const womenCount = await Woman.countDocuments({ familyId: family._id, isActive: true });
      
      await Family.findByIdAndUpdate(family._id, {
        totalMembers: studentCount + womenCount
      });
    }

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👨‍💼 Admin: admin@kalamfoundation.org / admin123');
    console.log('👩‍🏫 Tutor (Delhi): priya@kalamfoundation.org / tutor123');
    console.log('👨‍🏫 Tutor (Mumbai): rajesh@kalamfoundation.org / tutor123');
    console.log('👩‍🏫 Tutor (Bangalore): anita@kalamfoundation.org / tutor123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
connectDB().then(() => {
  seedData();
});
