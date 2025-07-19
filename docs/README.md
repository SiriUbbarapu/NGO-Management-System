# Todays Kalam Foundation Dashboard

A comprehensive web-based dashboard system for managing and monitoring the transformation of low-income families through education and skill development programs.

## 🌟 Features

### 🔐 Role-Based Authentication
- **Admin**: Full access to all features and analytics
- **Tutor**: Limited access to family, student, and women management

### 📊 Dashboard Pages
1. **Family Dashboard** - Manage Kalam families and track member progress
2. **Students Management** - Track attendance, test scores, and performance
3. **Women Skills Empowerment** - Monitor skill training and employment status
4. **Admin Analytics** - Comprehensive statistics and data export

### 🎨 Design Features
- **Neumorphism Design**: Soft shadows, rounded corners, and clean layouts
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Tailwind CSS**: Modern utility-first CSS framework
- **Interactive Components**: Modals, forms, and dynamic data visualization

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.15.1 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kalam-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔑 Demo Credentials

### Admin Login
- **Email**: admin@todayskalam.org
- **Password**: admin123

### Tutor Login
- **Email**: tutor@todayskalam.org
- **Password**: tutor123

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts (Auth)
├── data/              # Mock data and constants
├── pages/             # Main application pages
├── utils/             # Utility functions
└── App.jsx            # Main application component
```

## 🛠️ Technologies Used

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Headless UI** - Unstyled, accessible UI components

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full sidebar navigation and expanded layouts
- **Tablet**: Collapsible sidebar with touch-friendly interactions
- **Mobile**: Hamburger menu and stacked layouts

## 🎯 Key Features

### Family Management
- Add and track Kalam families
- View family members and their progress
- Filter by center location
- Track registration dates and contact information

### Student Tracking
- Monitor student attendance and performance
- Record test scores and academic progress
- Take daily attendance with date tracking
- Performance indicators and progress visualization

### Women Empowerment
- Track skill development programs
- Monitor employment status and job placements
- Update training progress and completion rates
- Skills categorization (Tailoring, Bangle Making, Computer Skills, etc.)

### Admin Analytics
- Comprehensive dashboard with key metrics
- Center-wise performance breakdown
- Monthly trend analysis
- Data export functionality (CSV)
- Impact summary and growth tracking

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in the appropriate directory
2. Add routing in `App.jsx`
3. Update navigation in `Sidebar.jsx`
4. Add mock data in `data/mockData.js`

## 🎨 Design System

### Colors
- **Primary**: Blue tones for main actions
- **Kalam Brand**: Orange to blue gradient
- **Success**: Green for positive states
- **Warning**: Yellow for attention states
- **Danger**: Red for error states

### Neumorphism Effects
- **Cards**: `neumorphic-card` class
- **Buttons**: `neumorphic-button` class
- **Inputs**: `neumorphic-input` class
- **Shadows**: Custom shadow utilities

## 📊 Data Management

Currently uses mock data for demonstration. In production, integrate with:
- REST APIs for data fetching
- Authentication service for user management
- Database for persistent storage
- Real-time updates for attendance and scores

## 🌐 Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production APIs
4. Set up proper authentication and security measures


