import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { User, Edit, Save, X } from "lucide-react";
import { api, storage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";

interface UserProfile {
  id: number;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  frequency: number;
  duration: number;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    frequency: "",
    duration: ""
  });

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    
    setUser(currentUser);
    fetchUserProfile(currentUser.id);
  }, [navigate]);

  const fetchUserProfile = async (userId: number) => {
    try {
      const response = await api.getLatestAssessment(userId);
      if (response.assessment) {
        setProfile(response.assessment);
        setEditForm({
          name: response.assessment.name || "",
          age: response.assessment.age?.toString() || "",
          gender: response.assessment.gender || "",
          height: response.assessment.height?.toString() || "",
          weight: response.assessment.weight?.toString() || "",
          frequency: response.assessment.frequency?.toString() || "",
          duration: response.assessment.duration?.toString() || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast({
        title: "Error",
        description: "Failed to load your profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (profile) {
      setEditForm({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        frequency: profile.frequency?.toString() || "",
        duration: profile.duration?.toString() || ""
      });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      // Update existing assessment with new profile data
      const updatedAssessment = {
        user_id: user.id,
        name: editForm.name,
        age: parseInt(editForm.age),
        gender: editForm.gender,
        height: parseFloat(editForm.height),
        weight: parseFloat(editForm.weight),
        frequency: parseInt(editForm.frequency),
        duration: parseFloat(editForm.duration),
        exercises: profile.exercises || [] // Keep existing exercises
      };

      const response = await api.updateAssessment(updatedAssessment);
      
      toast({
        title: "Profile Updated! 🎉",
        description: "Your profile and predictions have been updated successfully.",
      });

      // Refresh profile data
      await fetchUserProfile(user.id);
      setIsEditing(false);
      
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

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
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
                <p className="text-muted-foreground">
                  Manage your personal information and fitness data
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {profile ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Your fitness profile and personal details
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline" className="gap-2">
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="gap-2 bg-gradient-primary"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 text-lg font-medium">{profile.name}</div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="age">Age</Label>
                      {isEditing ? (
                        <Input
                          id="age"
                          type="number"
                          value={editForm.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 text-lg font-medium">{profile.age} years</div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      {isEditing ? (
                        <Select value={editForm.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1 text-lg font-medium capitalize">{profile.gender}</div>
                      )}
                    </div>
                  </div>

                  {/* Physical Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="height">Height (m)</Label>
                      {isEditing ? (
                        <Input
                          id="height"
                          type="number"
                          step="0.01"
                          value={editForm.height}
                          onChange={(e) => handleInputChange("height", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 text-lg font-medium">{profile.height} m</div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      {isEditing ? (
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={editForm.weight}
                          onChange={(e) => handleInputChange("weight", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 text-lg font-medium">{profile.weight} kg</div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="frequency">Workout Frequency (days/week)</Label>
                      {isEditing ? (
                        <Input
                          id="frequency"
                          type="number"
                          value={editForm.frequency}
                          onChange={(e) => handleInputChange("frequency", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 text-lg font-medium">{profile.frequency} days/week</div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="duration">Session Duration (hours/day)</Label>
                      {isEditing ? (
                        <Input
                          id="duration"
                          type="number"
                          step="0.1"
                          value={editForm.duration}
                          onChange={(e) => handleInputChange("duration", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 text-lg font-medium">{profile.duration} hours/day</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Profile Data</h3>
                <p className="text-muted-foreground mb-4">
                  Complete your fitness assessment to create your profile.
                </p>
                <Button 
                  onClick={() => navigate("/assessment")}
                  className="bg-gradient-primary"
                >
                  Complete Assessment
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
