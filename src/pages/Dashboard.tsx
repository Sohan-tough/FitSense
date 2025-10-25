import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Activity, Calendar, Plus } from "lucide-react";
import { api, storage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Speedometer from "@/components/Speedometer";
import WaterIntake from "@/components/WaterIntake";
import CalorieAnalysis from "@/components/CalorieAnalysis";
import ThemeToggle from "@/components/ThemeToggle";

interface Assessment {
  id: number;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  frequency: number;
  duration: number;
  exercises: any[];
  created_at: string;
  predictions?: {
    fat_model_tuned?: any;
    water_intake_model_tuned?: any;
    burnCal_model_tuned?: any;
    calorie_analysis?: any;
  };
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    
    // Validate session with backend
    const validateSession = async () => {
      try {
        await api.validateSession(currentUser.id);
        setUser(currentUser);
        fetchUserAssessments(currentUser.id);
      } catch (error) {
        // Session is invalid, clear local data and redirect to auth
        storage.clearUser();
        navigate("/auth");
      }
    };
    
    validateSession();
  }, [navigate]);

  // Refresh data when user returns to dashboard (e.g., from profile/exercises pages)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchUserAssessments(user.id);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const fetchUserAssessments = async (userId: number) => {
    try {
      const response = await api.getUserAssessments(userId);
      setAssessments(response.assessments || []);
      
      // If no assessments, try to get latest assessment for predictions
      if (!response.assessments || response.assessments.length === 0) {
        try {
          const latestResponse = await api.getLatestAssessment(userId);
          if (latestResponse.assessment) {
            setAssessments([latestResponse.assessment]);
          }
        } catch (error) {
          // No latest assessment found, that's okay
        }
      }
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      toast({
        title: "Error",
        description: "Failed to load your assessment history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestAssessment = () => {
    return assessments.length > 0 ? assessments[assessments.length - 1] : null;
  };

  const ideal_fat_percentage = (age: number, gender: string) => {
    const genderLower = gender.toLowerCase();
    if (genderLower === "male") {
      if (age <= 25) return 15;
      else if (age <= 35) return 16;
      else if (age <= 45) return 17;
      else if (age <= 55) return 18;
      else if (age <= 65) return 19;
      else return 20;
    } else {
      if (age <= 25) return 22;
      else if (age <= 35) return 24;
      else if (age <= 45) return 25;
      else if (age <= 55) return 27;
      else if (age <= 65) return 28;
      else return 30;
    }
  };

  const latestAssessment = getLatestAssessment();
  const currentFatPercentage = latestAssessment?.predictions?.fat_model_tuned?.prediction?.[0] || 0;
  const currentWaterIntake = latestAssessment?.predictions?.water_intake_model_tuned?.prediction?.[0] || 0;
  const idealWaterIntake = latestAssessment?.predictions?.calorie_analysis?.ideal_water_intake || 0;
  const idealFatPercentage = latestAssessment ? ideal_fat_percentage(latestAssessment.age, latestAssessment.gender) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Sidebar user={user} onLogout={() => {}} />
      
      <div className="ml-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Your fitness insights and predictions dashboard
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {!latestAssessment && (
                  <Button 
                    onClick={() => navigate("/assessment")}
                    className="bg-gradient-primary gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Start Assessment
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Predictions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Fat Percentage Speedometer */}
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Body Fat Analysis
                </CardTitle>
                <CardDescription>
                  Current vs Ideal Body Fat Percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestAssessment ? (
                  <Speedometer
                    value={currentFatPercentage}
                    ideal={idealFatPercentage}
                    max={50}
                    size={250}
                    strokeWidth={20}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Assessment Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Take your first assessment to see your fat percentage analysis.
                    </p>
                    <Button 
                      onClick={() => navigate("/assessment")}
                      className="bg-gradient-primary"
                    >
                      Start Assessment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Water Intake */}
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Hydration Analysis
                </CardTitle>
                <CardDescription>
                  Current Daily Water Intake
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestAssessment ? (
                  <WaterIntake
                    currentIntake={currentWaterIntake}
                    unit="L"
                  />
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Assessment Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Take your first assessment to get your personalized water intake analysis.
                    </p>
                    <Button 
                      onClick={() => navigate("/assessment")}
                      className="bg-gradient-primary"
                    >
                      Start Assessment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>


          {/* Calorie Analysis Section */}
          {latestAssessment && (
            <div className="mt-8">
              <CalorieAnalysis
                calorieData={latestAssessment.predictions?.calorie_analysis || {
                  total_calories_per_session: 0,
                  weekly_calories: 0,
                  current_fat_percentage: 0,
                  ideal_fat_percentage: 0,
                  current_fat_mass: 0,
                  ideal_fat_mass: 0,
                  fat_to_lose: 0,
                  calories_to_burn_total: 0,
                  extra_calories_per_session: 0,
                  exercise_analysis: []
                }}
                assessmentData={{
                  name: latestAssessment.name,
                  age: latestAssessment.age,
                  gender: latestAssessment.gender,
                  height: latestAssessment.height,
                  weight: latestAssessment.weight,
                  frequency: latestAssessment.frequency,
                  duration: latestAssessment.duration,
                  exercises: latestAssessment.exercises
                }}
                predictions={latestAssessment.predictions}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
