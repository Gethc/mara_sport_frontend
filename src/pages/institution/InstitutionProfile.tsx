import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Edit, Save, X, Building2, User, Phone, Mail, Globe, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface InstitutionProfile {
  id: number;
  name: string;
  email: string;
  contact_person?: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  institute_info?: {
    phone_number: string;
    website: string;
    principal_name: string;
    principal_phone_number: string;
  };
}

const InstitutionProfile = () => {
  const { toast } = useToast();
  const { student } = useAuth();
  const [profile, setProfile] = useState<InstitutionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_person: {
      name: '',
      email: '',
      phone: '',
      designation: ''
    },
    institute_info: {
      phone_number: '',
      website: '',
      principal_name: '',
      principal_phone_number: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInstitutionProfile();
      
      if (response.data.success) {
        const profileData = response.data.data;
        setProfile(profileData);
        
        // Populate form data
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          contact_person: {
            name: profileData.contact_person?.name || '',
            email: profileData.contact_person?.email || '',
            phone: profileData.contact_person?.phone || '',
            designation: profileData.contact_person?.designation || ''
          },
          institute_info: {
            phone_number: profileData.institute_info?.phone_number || '',
            website: profileData.institute_info?.website || '',
            principal_name: profileData.institute_info?.principal_name || '',
            principal_phone_number: profileData.institute_info?.principal_phone_number || ''
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load institution profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        contact_person: {
          name: profile.contact_person?.name || '',
          email: profile.contact_person?.email || '',
          phone: profile.contact_person?.phone || '',
          designation: profile.contact_person?.designation || ''
        },
        institute_info: {
          phone_number: profile.institute_info?.phone_number || '',
          website: profile.institute_info?.website || '',
          principal_name: profile.institute_info?.principal_name || '',
          principal_phone_number: profile.institute_info?.principal_phone_number || ''
        }
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await apiService.updateInstitutionProfile(formData);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Institution profile updated successfully",
        });
        setEditing(false);
        await fetchProfile(); // Refresh the profile data
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update institution profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string, section?: string) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institution Profile</h1>
          <p className="text-muted-foreground">
            Manage your institution's profile information
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your institution's basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!editing}
                  placeholder="Enter institution name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!editing}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Person Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Person
            </CardTitle>
            <CardDescription>
              Primary contact person details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Person Name <span className="text-red-500">*</span></Label>
                <Input
                  id="contact_name"
                  value={formData.contact_person.name}
                  onChange={(e) => handleInputChange('name', e.target.value, 'contact_person')}
                  disabled={!editing}
                  placeholder="Enter contact person name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email <span className="text-red-500">*</span></Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_person.email}
                  onChange={(e) => handleInputChange('email', e.target.value, 'contact_person')}
                  disabled={!editing}
                  placeholder="Enter contact email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_person.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, 'contact_person')}
                  disabled={!editing}
                  placeholder="Enter contact phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_designation">Designation <span className="text-red-500">*</span></Label>
                <Input
                  id="contact_designation"
                  value={formData.contact_person.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value, 'contact_person')}
                  disabled={!editing}
                  placeholder="Enter designation"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institute Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Institute Details
            </CardTitle>
            <CardDescription>
              Additional institution information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Institution Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="phone_number"
                  value={formData.institute_info.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value, 'institute_info')}
                  disabled={!editing}
                  placeholder="Enter institution phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.institute_info.website}
                  onChange={(e) => handleInputChange('website', e.target.value, 'institute_info')}
                  disabled={!editing}
                  placeholder="Enter website URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="principal_name">Principal Name <span className="text-red-500">*</span></Label>
                <Input
                  id="principal_name"
                  value={formData.institute_info.principal_name}
                  onChange={(e) => handleInputChange('principal_name', e.target.value, 'institute_info')}
                  disabled={!editing}
                  placeholder="Enter principal name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="principal_phone">Principal Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="principal_phone"
                  value={formData.institute_info.principal_phone_number}
                  onChange={(e) => handleInputChange('principal_phone_number', e.target.value, 'institute_info')}
                  disabled={!editing}
                  placeholder="Enter principal phone"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstitutionProfile;
