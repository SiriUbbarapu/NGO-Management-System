// Mock data for the application
export const mockFamilies = [
  {
    id: 1,
    name: "The Khan Family",
    contact: "+91 9876543210",
    center: "Mehdipatnam Center",
    address: "123 Old City, Hyderabad",
    registrationDate: "2024-01-15",
    members: [
      {
        id: 1,
        name: "Aisha Khan",
        role: "student",
        age: 16,
        education: "10th Grade",
        attendance: 85,
        lastTestScore: 78
      },
      {
        id: 2,
        name: "Fatima Khan",
        role: "woman",
        age: 38,
        skill: "Tailoring",
        trainingStatus: "completed",
        jobStatus: "employed"
      }
    ]
  },
  {
    id: 2,
    name: "The Shaikh Family",
    contact: "+91 9876543211",
    center: "Santosh Nagar Center",
    address: "456 New Area, Hyderabad",
    registrationDate: "2024-02-20",
    members: [
      {
        id: 3,
        name: "Mohammed Shaikh",
        role: "student",
        age: 15,
        education: "9th Grade",
        attendance: 92,
        lastTestScore: 85
      },
      {
        id: 4,
        name: "Zainab Shaikh",
        role: "woman",
        age: 35,
        skill: "Bangle Making",
        trainingStatus: "in-progress",
        jobStatus: "unemployed"
      }
    ]
  },
  {
    id: 3,
    name: "The Ahmed Family",
    contact: "+91 9876543212",
    center: "Mehdipatnam Center",
    address: "789 Central Road, Hyderabad",
    registrationDate: "2024-03-10",
    members: [
      {
        id: 5,
        name: "Sara Ahmed",
        role: "student",
        age: 17,
        education: "11th Grade",
        attendance: 88,
        lastTestScore: 92
      },
      {
        id: 6,
        name: "Khadija Ahmed",
        role: "woman",
        age: 42,
        skill: "Computer Skills",
        trainingStatus: "started",
        jobStatus: "unemployed"
      }
    ]
  }
];

export const mockStudents = [
  {
    id: 1,
    name: "Aisha Khan",
    center: "Mehdipatnam Center",
    education: "10th Grade",
    attendance: 85,
    lastTestScore: 78,
    family: "The Khan Family",
    age: 16,
    subjects: ["Math", "English"],
    performance: "good"
  },
  {
    id: 3,
    name: "Mohammed Shaikh",
    center: "Santosh Nagar Center",
    education: "9th Grade",
    attendance: 92,
    lastTestScore: 85,
    family: "The Shaikh Family",
    age: 15,
    subjects: ["Math", "English"],
    performance: "excellent"
  },
  {
    id: 5,
    name: "Sara Ahmed",
    center: "Mehdipatnam Center",
    education: "11th Grade",
    attendance: 88,
    lastTestScore: 92,
    family: "The Ahmed Family",
    age: 17,
    subjects: ["Math", "English", "Science"],
    performance: "excellent"
  }
];

export const mockWomen = [
  {
    id: 2,
    name: "Fatima Khan",
    skill: "Tailoring",
    trainingStatus: "completed",
    jobStatus: "employed",
    family: "The Khan Family",
    age: 38,
    center: "Mehdipatnam Center",
    completionDate: "2024-05-15",
    employer: "Local Boutique"
  },
  {
    id: 4,
    name: "Zainab Shaikh",
    skill: "Bangle Making",
    trainingStatus: "in-progress",
    jobStatus: "unemployed",
    family: "The Shaikh Family",
    age: 35,
    center: "Santosh Nagar Center",
    startDate: "2024-04-01",
    progress: 65
  },
  {
    id: 6,
    name: "Khadija Ahmed",
    skill: "Computer Skills",
    trainingStatus: "started",
    jobStatus: "unemployed",
    family: "The Ahmed Family",
    age: 42,
    center: "Mehdipatnam Center",
    startDate: "2024-06-01",
    progress: 25
  }
];

export const centers = [
  "All Centers",
  "Mehdipatnam Center",
  "Santosh Nagar Center",
  "Old City Center"
];

export const skills = [
  "Tailoring",
  "Bangle Making",
  "Computer Skills",
  "Cooking",
  "Handicrafts"
];
