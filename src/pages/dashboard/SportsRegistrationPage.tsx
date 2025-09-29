import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { calculateAge, validateAgeForAgeGroup } from "@/lib/ageValidation";
import { Trophy, Users, DollarSign, Calendar, MapPin, Clock, Star } from "lucide-react";
import sportsService, { Sport, SportCategory } from "@/services/sportsService";

// Sports data will be loaded from API

const SportsRegistrationPage = () => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { student } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SportCategory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [teamDetails, setTeamDetails] = useState({
    teamName: "",
    captainName: "",
    captainPhone: "",
    members: [""] // Start with one member field
  });
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      setLoading(true);
      const sportsData = await sportsService.getSports();
      setSports(sportsData);
    } catch (error) {
      console.error('Failed to load sports:', error);
      toast({
        title: "Error",
        description: "Failed to load sports data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...teamDetails.members];
    newMembers[index] = value;
    setTeamDetails(prev => ({ ...prev, members: newMembers }));
  };

  const addMember = () => {
    if (selectedSport && teamDetails.members.length < selectedSport.maxTeamSize) {
      setTeamDetails(prev => ({
        ...prev,
        members: [...prev.members, ""]
      }));
    }
  };

  const removeMember = (index: number) => {
    if (teamDetails.members.length > 1) {
      const newMembers = teamDetails.members.filter((_, i) => i !== index);
      setTeamDetails(prev => ({ ...prev, members: newMembers }));
    }
  };

  const handleRegister = async () => {
    if (!selectedSport || !selectedSubcategory || !student) {
      toast({
        title: "Incomplete Information",
        description: "Please select a sport and subcategory to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate age if student has date of birth
    if (student.dob && selectedSubcategory.age_from && selectedSubcategory.age_to) {
      const studentAge = calculateAge(student.dob);
      const ageGroup = `${selectedSubcategory.age_from}-${selectedSubcategory.age_to}`;
      const ageValidation = validateAgeForAgeGroup(studentAge, ageGroup, true);
      
      if (!ageValidation.isValid) {
        toast({
          title: "Age Validation Error",
          description: ageValidation.message,
          variant: "destructive",
        });
        return;
      }
    }

    if (selectedSport.type === "Team Sport" && (!teamDetails.teamName || !teamDetails.captainName)) {
      toast({
        title: "Team Details Required",
        description: "Please provide team name and captain details.",
        variant: "destructive",
      });
      return;
    }

    setRegistering(true);
    
    try {
      const registrationData = {
        studentId: student.id,
        sportCategoryId: selectedSubcategory.id,
        teamDetails: selectedSport.type === "Team Sport" ? teamDetails : undefined
      };

      await sportsService.registerForSport(registrationData);

      toast({
        title: "Registration Successful!",
        description: `Successfully registered for ${selectedSport.name} - ${selectedSubcategory.name}`,
      });

      // Add notification
      addNotification({
        title: `Enrolled in ${selectedSport.name} (${selectedSubcategory.name})`,
        message: `Successfully enrolled in ${selectedSport.name} tournament`,
        type: 'sport_enrollment',
        status: 'Successfully Enrolled',
        metadata: {
          sport: selectedSport.name,
          subCategory: selectedSubcategory.name
        }
      });

      // Reset form
      setSelectedSport(null);
      setSelectedSubcategory(null);
      setShowModal(false);
      setTeamDetails({
        teamName: "",
        captainName: "",
        captainPhone: "",
        members: [""]
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for sport. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sports Registration</h1>
          <p className="text-muted-foreground">
            Loading sports data...
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sports Registration</h1>
        <p className="text-muted-foreground">
          Register for upcoming sports events and tournaments
        </p>
      </div>

      {/* Available Sports Table */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Available Sports</h2>
        </div>
        <p className="text-muted-foreground mb-6">Choose from the available sports events</p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Sport</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Fee Range</th>
                <th className="text-left py-3 px-4 font-medium">Participants</th>
                <th className="text-left py-3 px-4 font-medium">Registration Deadline</th>
                <th className="text-left py-3 px-4 font-medium">Event Date</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sports.map((sport) => (
                <tr key={sport.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{sport.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{sport.type}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    ₹{Math.min(...sport.subcategories.map(s => s.fee))} - ₹{Math.max(...sport.subcategories.map(s => s.fee))}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {sport.minParticipants} - {sport.maxParticipants}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{sport.registrationDeadline}</td>
                  <td className="py-3 px-4 text-muted-foreground">{sport.eventDate}</td>
                  <td className="py-3 px-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSport(sport);
                        setShowModal(true);
                      }}
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Register
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-accent" />
              <span>Register for {selectedSport?.name}</span>
            </DialogTitle>
            <DialogDescription>Complete your registration details</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-6">
            <div className="space-y-6">
              {selectedSport && (
                <>
                  {/* Subcategory Selection */}
                  <div className="space-y-2">
                    <Label>Select Sub-category</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedSport.subcategories.map((subcat, index) => (
                        <div 
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedSubcategory?.name === subcat.name 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedSubcategory(subcat)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{subcat.name}</h4>
                              <p className="text-sm text-muted-foreground">{subcat.category}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">₹{subcat.fee}</div>
                              <div className="text-xs text-muted-foreground">Fee</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Details for Team Sports */}
                  {selectedSport.type === "Team Sport" && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">Team Details</h3>
                      </div>

                      <div className="space-y-2">
                        <Label>Team Name</Label>
                        <Input
                          placeholder="Enter team name"
                          value={teamDetails.teamName}
                          onChange={(e) => setTeamDetails(prev => ({ ...prev, teamName: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Captain Name</Label>
                          <Input
                            placeholder="Captain's name"
                            value={teamDetails.captainName}
                            onChange={(e) => setTeamDetails(prev => ({ ...prev, captainName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Captain Phone</Label>
                          <Input
                            placeholder="Phone number"
                            value={teamDetails.captainPhone}
                            onChange={(e) => setTeamDetails(prev => ({ ...prev, captainPhone: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Team Members ({teamDetails.members.length}/{selectedSport.maxTeamSize})</Label>
                          {teamDetails.members.length < selectedSport.maxTeamSize && (
                            <Button onClick={addMember} size="sm" variant="outline">
                              Add Member
                            </Button>
                          )}
                        </div>

                        {teamDetails.members.map((member, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              placeholder={`Member ${index + 1} name`}
                              value={member}
                              onChange={(e) => handleMemberChange(index, e.target.value)}
                            />
                            {teamDetails.members.length > 1 && (
                              <Button
                                onClick={() => removeMember(index)}
                                size="sm"
                                variant="outline"
                                className="px-3"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Registration Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="font-medium">Registration Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Sport:</span>
                        <span className="font-medium">{selectedSport.name}</span>
                      </div>
                      {selectedSubcategory && (
                        <>
                          <div className="flex justify-between">
                            <span>Sub-category:</span>
                            <span className="font-medium">{selectedSubcategory.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium">{selectedSubcategory.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Registration Fee:</span>
                            <span className="font-medium text-primary">₹{selectedSubcategory.fee}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the tournament rules and regulations
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="liability" />
                      <Label htmlFor="liability" className="text-sm">
                        I understand the risks and accept liability waiver
                      </Label>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRegister} 
                      disabled={registering}
                      className="flex-1 bg-gradient-primary hover:shadow-glow"
                    >
                      {registering ? "Registering..." : `Register for ₹${selectedSubcategory?.fee || selectedSport.fee}`}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SportsRegistrationPage;