'use client';

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Camera, CheckCircle, XCircle, RotateCcw, FileText, Upload, Scan } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

interface DocumentScannerProps {
  onScanComplete: (data: {
    documentType: string;
    frontImage: string;
    backImage?: string;
    extractedData?: any;
  }) => void;
  onCancel?: () => void;
  userId?: string;
}

export function DocumentScanner({ onScanComplete, onCancel, userId }: DocumentScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [documentType, setDocumentType] = useState<string>('id_card');
  const [capturedFront, setCapturedFront] = useState(false);
  const [capturedBack, setCapturedBack] = useState(false);
  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: 'Browser Not Supported',
          description: 'Your browser does not support camera access. Please use a modern browser.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Requesting camera access for document scanning...');
      
      // Try multiple strategies to get camera access
      let mediaStream: MediaStream | null = null;
      
      // Strategy 1: Try back camera (environment) for documents
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: 'environment' }, // Back camera for documents
          },
        });
      } catch (err: any) {
        console.log('Back camera failed, trying any camera...', err.name);
        
        // Strategy 2: Try any camera with ideal resolution
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch (err2: any) {
          console.log('Ideal resolution failed, trying minimal constraints...', err2.name);
          
          // Strategy 3: Try with minimal constraints
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
          } catch (err3: any) {
            console.log('All camera strategies failed:', err3.name);
            throw err3;
          }
        }
      }
      
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        console.log('Camera stream set successfully for document scanning');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorDescription = 'Failed to access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorDescription = 'Camera permission denied. Please allow camera access in your browser settings and refresh the page.';
        toast({
          title: 'Camera Permission Denied',
          description: 'Please allow camera access and refresh the page. Check your browser address bar for the camera icon.',
          variant: 'destructive',
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorDescription = 'No camera found. Please ensure a camera is connected and try again.';
        toast({
          title: 'No Camera Found',
          description: 'No camera detected. Please connect a camera and refresh the page.',
          variant: 'destructive',
        });
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorDescription = 'Camera is already in use by another application. Please close other apps using the camera.';
        toast({
          title: 'Camera In Use',
          description: 'Camera is being used by another application. Please close other apps and try again.',
          variant: 'destructive',
        });
      } else {
        errorDescription = err.message || 'Please check your camera permissions and try again.';
        toast({
          title: 'Camera Error',
          description: err.message || 'Failed to access camera. Please check your camera settings.',
          variant: 'destructive',
        });
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        if (!capturedFront) {
          setFrontImage(imageDataUrl);
          setCapturedFront(true);
          stopCamera();
        } else if (!capturedBack && documentType === 'id_card') {
          setBackImage(imageDataUrl);
          setCapturedBack(true);
          stopCamera();
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        
        if (!capturedFront) {
          setFrontImage(imageDataUrl);
          setCapturedFront(true);
        } else if (!capturedBack && documentType === 'id_card') {
          setBackImage(imageDataUrl);
          setCapturedBack(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const scanDocument = async () => {
    if (!frontImage) return;

    setScanning(true);
    try {
      const base64Front = frontImage.split(',')[1];
      const base64Back = backImage ? backImage.split(',')[1] : undefined;

      // Call backend OCR service
      const response = await fetch('http://localhost:3001/biometric/document/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          documentType,
          frontImage: base64Front,
          backImage: base64Back,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setExtractedData(data.extractedData);
        toast({
          title: 'Document Scanned',
          description: 'OCR extraction completed successfully',
        });
      } else {
        throw new Error(data.message || 'Failed to scan document');
      }
    } catch (error: any) {
      toast({
        title: 'Scan Error',
        description: error.message || 'Failed to scan document',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  const confirm = () => {
    const base64Front = frontImage.split(',')[1];
    const base64Back = backImage ? backImage.split(',')[1] : undefined;

    onScanComplete({
      documentType,
      frontImage: base64Front,
      backImage: base64Back,
      extractedData,
    });
  };

  const retake = () => {
    if (capturedBack) {
      setBackImage('');
      setCapturedBack(false);
    } else if (capturedFront) {
      setFrontImage('');
      setCapturedFront(false);
    }
    startCamera();
  };

  const cancel = () => {
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Document Scanner
        </CardTitle>
        <CardDescription>Scan ID card or passport for automatic data extraction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selection */}
        <div>
          <Label>Document Type</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
            value={documentType}
            onChange={(e) => {
              setDocumentType(e.target.value);
              setFrontImage('');
              setBackImage('');
              setCapturedFront(false);
              setCapturedBack(false);
            }}
          >
            <option value="id_card">ID Card</option>
            <option value="passport">Passport</option>
            <option value="driver_license">Driver License</option>
          </select>
        </div>

        {/* Front Image */}
        {!capturedFront ? (
          <div>
            <Label>Front Side</Label>
            <div className="mt-2 space-y-2">
              <div className="relative border-2 border-dashed rounded-lg p-4">
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Camera not active</p>
                    <Button onClick={startCamera} variant="outline" size="sm">
                      Start Camera
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1" disabled={!stream}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Front
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <Label>Front Side</Label>
            <div className="mt-2 relative">
              <img
                src={frontImage}
                alt="Front document"
                className="w-full rounded-lg border-2"
                style={{ maxHeight: '400px' }}
              />
              <Badge className="absolute top-2 right-2 bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Captured
              </Badge>
            </div>
          </div>
        )}

        {/* Back Image (only for ID cards) */}
        {documentType === 'id_card' && capturedFront && !capturedBack && (
          <div>
            <Label>Back Side</Label>
            <div className="mt-2 space-y-2">
              <div className="relative border-2 border-dashed rounded-lg p-4">
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Camera not active</p>
                    <Button onClick={startCamera} variant="outline" size="sm">
                      Start Camera
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1" disabled={!stream}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        )}

        {capturedBack && (
          <div>
            <Label>Back Side</Label>
            <div className="mt-2 relative">
              <img
                src={backImage}
                alt="Back document"
                className="w-full rounded-lg border-2"
                style={{ maxHeight: '400px' }}
              />
              <Badge className="absolute top-2 right-2 bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Captured
              </Badge>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Extracted Data Display */}
        {extractedData && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">Extracted Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {extractedData.fullName && (
                  <div>
                    <span className="font-medium">Name:</span> {extractedData.fullName}
                  </div>
                )}
                {extractedData.documentNumber && (
                  <div>
                    <span className="font-medium">Document Number:</span> {extractedData.documentNumber}
                  </div>
                )}
                {extractedData.dateOfBirth && (
                  <div>
                    <span className="font-medium">Date of Birth:</span> {extractedData.dateOfBirth}
                  </div>
                )}
                {extractedData.nationality && (
                  <div>
                    <span className="font-medium">Nationality:</span> {extractedData.nationality}
                  </div>
                )}
                {extractedData.address && (
                  <div>
                    <span className="font-medium">Address:</span> {extractedData.address}
                  </div>
                )}
                <Badge variant="outline" className="mt-2">
                  OCR Confidence: {Math.round((extractedData.ocrConfidence || 0) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {capturedFront && (!capturedBack || documentType !== 'id_card') && !extractedData && (
            <Button onClick={scanDocument} className="flex-1" disabled={scanning}>
              <Scan className="h-4 w-4 mr-2" />
              {scanning ? 'Scanning...' : 'Scan Document'}
            </Button>
          )}
          {extractedData && (
            <Button onClick={confirm} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Use This Data
            </Button>
          )}
          <Button variant="outline" onClick={retake} disabled={!capturedFront}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={cancel}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Ensure document is well-lit and in focus</p>
          <p>• Place document on a flat surface</p>
          <p>• Keep camera steady while capturing</p>
          <p>• OCR accuracy depends on image quality</p>
        </div>
      </CardContent>
    </Card>
  );
}

