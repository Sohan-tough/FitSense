# FitSense AI Insights 🏋️‍♂️

An AI-powered fitness insights and workout optimization platform that uses machine learning models to provide personalized body fat predictions, calorie analysis, and exercise recommendations.

## ✨ Features

### 🧠 AI-Powered Predictions
- **Body Fat Analysis**: ML model predicts current body fat percentage
- **Water Intake Optimization**: Personalized daily water intake recommendations
- **Calorie Burn Analysis**: Accurate calorie burn predictions for workouts

### 📊 Smart Exercise Recommendations
- **Hybrid Weight Distribution**: Intelligent rep increase calculations
- **Progressive Overload**: Duration-based workout progression (7-180 days)
- **Visual Analytics**: Interactive bar graphs showing current vs target reps
- **Real-time Updates**: Dynamic recalculation as parameters change

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Seamless theme switching across all pages
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Beautiful Charts**: Recharts integration for data visualization

### 🔧 Technical Features
- **Full-Stack Architecture**: React frontend + Flask backend
- **Database Integration**: SQLite with SQLAlchemy ORM
- **Session Management**: Secure user authentication
- **API Integration**: RESTful endpoints for all operations

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router DOM** for navigation

### Backend
- **Flask** Python web framework
- **SQLAlchemy** ORM
- **SQLite** database
- **scikit-learn** for ML models
- **Pickle** for model persistence

### Machine Learning
- **RandomForestRegressor** for predictions
- **Tuned Models**: `burnCal_model_tuned`, `fat_model_tuned`, `water_intake_model_tuned`

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

### Frontend Setup
```bash
# Navigate to project root
cd fitsense-ai-insights-main

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

## 🎯 Usage

### 1. User Registration/Login
- Create account or sign in
- Secure session management

### 2. Complete Assessment
- Personal information (age, gender, height, weight)
- Workout frequency and duration
- Exercise routine details

### 3. View Dashboard
- AI predictions for body fat percentage
- Water intake recommendations
- Calorie analysis with exercise optimization

### 4. Manage Profile
- Update personal information
- Modify workout parameters

### 5. Exercise Management
- Add/edit exercise routines
- View personalized recommendations

## 🔬 Machine Learning Models

### Body Fat Prediction
- **Model**: RandomForestRegressor
- **Features**: Age, gender, height, weight, workout frequency
- **Output**: Body fat percentage prediction

### Calorie Burn Analysis
- **Model**: RandomForestRegressor
- **Features**: Exercise type, sets, reps, user metrics
- **Output**: Calorie burn per exercise

### Water Intake Optimization
- **Model**: RandomForestRegressor
- **Features**: Body metrics, workout duration
- **Output**: Optimal daily water intake

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Assessments
- `POST /api/assessments/create` - Create new assessment
- `PUT /api/assessments/update` - Update existing assessment
- `POST /api/assessments/recalculate` - Recalculate with custom duration

### Predictions
- `POST /api/predictions/fat` - Body fat prediction
- `POST /api/predictions/water` - Water intake prediction
- `POST /api/predictions/calories` - Calorie burn prediction

## 🎨 Theme System

### Dark Theme (Default)
- Dark blue gradient backgrounds
- Light text with high contrast
- Subtle shadows and glows

### Light Theme
- Clean white backgrounds
- Dark text for readability
- Minimal shadows

### Theme Toggle
- Available on all pages
- Persistent across sessions
- Smooth transitions

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///fitsense.db

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000
```

### Database
- SQLite database file: `backend/fitsense.db`
- Automatic table creation on first run
- SQLAlchemy migrations supported

## 📈 Performance Features

### Frontend Optimizations
- Code splitting with React.lazy
- Memoized components
- Efficient state management
- Optimized bundle size

### Backend Optimizations
- Model caching
- Database connection pooling
- Efficient API responses
- Error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful component library
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **scikit-learn** for machine learning capabilities

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Built with ❤️ for fitness enthusiasts and AI enthusiasts alike!**