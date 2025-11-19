'use client';

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, Upload, TestTube, Brain, Camera, Activity } from 'lucide-react';

interface EyeTestFormProps {
  onTestSubmit: (testData: any) => void;
  patientId?: string;
}

export function EyeTestForm({ onTestSubmit, patientId }: EyeTestFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('visual-acuity');
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Visual Acuity
    visualAcuityRight: '',
    visualAcuityLeft: '',
    
    // Color Vision
    colorVisionResult: '',
    
    // Refraction
    refractionRight: {
      sphere: '',
      cylinder: '',
      axis: '',
    },
    refractionLeft: {
      sphere: '',
      cylinder: '',
      axis: '',
    },
    
    // Retina Images
    retinaImages: [] as string[],
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert files to base64 (in production, upload to cloud storage)
    const imagePromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    try {
      const images = await Promise.all(imagePromises);
      setFormData(prev => ({
        ...prev,
        retinaImages: [...prev.retinaImages, ...images],
      }));
      toast({ title: 'Success', description: `${images.length} image(s) uploaded` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload images', variant: 'destructive' });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      retinaImages: prev.retinaImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onTestSubmit({
        ...formData,
        patientId,
      });
      // Reset form
      setFormData({
        visualAcuityRight: '',
        visualAcuityLeft: '',
        colorVisionResult: '',
        refractionRight: { sphere: '', cylinder: '', axis: '' },
        refractionLeft: { sphere: '', cylinder: '', axis: '' },
        retinaImages: [],
      });
      toast({ title: 'Success', description: 'Eye test data submitted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit test data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'visual-acuity', label: 'Visual Acuity', icon: Eye },
    { id: 'color-vision', label: 'Color Vision', icon: TestTube },
    { id: 'refraction', label: 'Refraction', icon: Activity },
    { id: 'retina', label: 'Retina Imaging', icon: Camera },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Eye Test & Analyzer Module
        </CardTitle>
        <CardDescription>
          Enter eye test data manually or upload from devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Visual Acuity Tab */}
        {activeTab === 'visual-acuity' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="va-right">Visual Acuity - Right Eye</Label>
                <Input
                  id="va-right"
                  placeholder="e.g., 20/20, 20/40, 6/6"
                  value={formData.visualAcuityRight}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, visualAcuityRight: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter Snellen chart results (e.g., 20/20, 20/40, 6/6)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="va-left">Visual Acuity - Left Eye</Label>
                <Input
                  id="va-left"
                  placeholder="e.g., 20/20, 20/40, 6/6"
                  value={formData.visualAcuityLeft}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, visualAcuityLeft: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter Snellen chart results (e.g., 20/20, 20/40, 6/6)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Color Vision Tab */}
        {activeTab === 'color-vision' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="color-vision">Color Vision Test Result</Label>
              <select
                id="color-vision"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.colorVisionResult}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, colorVisionResult: e.target.value }))
                }
              >
                <option value="">Select result</option>
                <option value="normal">Normal</option>
                <option value="mild-deficiency">Mild Deficiency</option>
                <option value="moderate-deficiency">Moderate Deficiency</option>
                <option value="severe-deficiency">Severe Deficiency</option>
                <option value="protanopia">Protanopia (Red-blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                <option value="tritanopia">Tritanopia (Blue-blind)</option>
              </select>
            </div>
          </div>
        )}

        {/* Refraction Tab */}
        {activeTab === 'refraction' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Right Eye Refraction</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ref-right-sphere">Sphere (D)</Label>
                  <Input
                    id="ref-right-sphere"
                    type="number"
                    step="0.25"
                    placeholder="e.g., -2.50"
                    value={formData.refractionRight.sphere}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        refractionRight: { ...prev.refractionRight, sphere: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ref-right-cylinder">Cylinder (D)</Label>
                  <Input
                    id="ref-right-cylinder"
                    type="number"
                    step="0.25"
                    placeholder="e.g., -1.00"
                    value={formData.refractionRight.cylinder}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        refractionRight: { ...prev.refractionRight, cylinder: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ref-right-axis">Axis (°)</Label>
                  <Input
                    id="ref-right-axis"
                    type="number"
                    placeholder="e.g., 90"
                    value={formData.refractionRight.axis}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        refractionRight: { ...prev.refractionRight, axis: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Left Eye Refraction</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ref-left-sphere">Sphere (D)</Label>
                  <Input
                    id="ref-left-sphere"
                    type="number"
                    step="0.25"
                    placeholder="e.g., -2.50"
                    value={formData.refractionLeft.sphere}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        refractionLeft: { ...prev.refractionLeft, sphere: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ref-left-cylinder">Cylinder (D)</Label>
                  <Input
                    id="ref-left-cylinder"
                    type="number"
                    step="0.25"
                    placeholder="e.g., -1.00"
                    value={formData.refractionLeft.cylinder}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        refractionLeft: { ...prev.refractionLeft, cylinder: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ref-left-axis">Axis (°)</Label>
                  <Input
                    id="ref-left-axis"
                    type="number"
                    placeholder="e.g., 90"
                    value={formData.refractionLeft.axis}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        refractionLeft: { ...prev.refractionLeft, axis: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retina Imaging Tab */}
        {activeTab === 'retina' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retina-upload">Upload Retina Images</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="retina-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Upload retina scan images (JPEG, PNG). Multiple images allowed.
              </p>
            </div>

            {formData.retinaImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {formData.retinaImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Retina image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setFormData({
            visualAcuityRight: '',
            visualAcuityLeft: '',
            colorVisionResult: '',
            refractionRight: { sphere: '', cylinder: '', axis: '' },
            refractionLeft: { sphere: '', cylinder: '', axis: '' },
            retinaImages: [],
          })}>
            Clear Form
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Test Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


