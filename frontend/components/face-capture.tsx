'use client';

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle, XCircle, RotateCcw, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CameraPermissionHelper } from './camera-permission-helper';

interface FaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel?: () => void;
  mode?: 'register' | 'recognize';
  userId?: string;
}

export function FaceCapture({ onCapture, onCancel, mode = 'register', userId }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [imageData, setImageData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [availableDevices, setAvailableDevices] = useState<Array<{deviceId: string; label: string}>>([]);
  const { toast } = useToast();

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    // Don't auto-start camera, wait for user interaction
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    // Ensure video plays when stream is set
    if (videoRef.current && stream) {
      const video = videoRef.current;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Video play failed:', error);
          setError('Failed to play video stream. Please try again.');
        });
      }
    }
  }, [stream]);

  const enumerateDevices = async (withLabels = false) => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available video devices:', videoDevices.length);
        console.log('All devices:', devices.map(d => ({ kind: d.kind, label: d.label || 'No label', deviceId: d.deviceId.substring(0, 20) + '...' })));
        
        if (withLabels) {
          // Return devices with labels (only available after permission is granted)
          return videoDevices.map(device => ({
            deviceId: device.deviceId,
            label: device.label || 'Camera',
            kind: device.kind,
          }));
        }
        
        return videoDevices.length > 0;
      }
      return withLabels ? [] : true; // Assume devices exist if enumeration is not supported
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return withLabels ? [] : true; // Assume devices exist if enumeration fails
    }
  };

  const startCamera = async () => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support camera access. Please use a modern browser (Chrome, Firefox, Safari, or Edge).');
        toast({
          title: 'Browser Not Supported',
          description: 'Your browser does not support camera access. Please use Chrome, Firefox, Safari, or Edge.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Requesting camera access...');
      
      // Note: enumerateDevices() may return empty labels until permission is granted
      // So we'll request permission first, then enumerate
      
      // Try with front-facing camera first
      let mediaStream: MediaStream | null = null;
      let lastError: any = null;
      
      // Strategy 1: Try front-facing camera with ideal constraints
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user', // Front-facing camera
          },
        });
      } catch (err: any) {
        lastError = err;
        console.log('Front camera failed, trying any camera...', err.name);
        
        // Strategy 2: Try any camera with simple constraints
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          });
        } catch (err2: any) {
          lastError = err2;
          console.log('Ideal constraints failed, trying minimal constraints...', err2.name);
          
          // Strategy 3: Try with minimal constraints
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
          } catch (err3: any) {
            lastError = err3;
            console.log('All camera strategies failed:', err3.name);
            throw err3;
          }
        }
      }
      
      if (mediaStream && videoRef.current) {
        console.log('Camera access granted, setting up video element...');
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(''); // Clear any previous errors
        
        // Enumerate devices now that we have permission
        const devices = await enumerateDevices(true) as Array<{deviceId: string; label: string}>;
        setAvailableDevices(devices);
        console.log('Available cameras:', devices);
        console.log('Camera stream set successfully');
        return;
      } else if (mediaStream) {
        console.error('Video ref is null');
        mediaStream.getTracks().forEach(track => track.stop());
        setError('Camera initialization error. Please refresh and try again.');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMessage = 'Unable to access camera. ';
      let errorType: 'permission' | 'notfound' | 'inuse' | 'other' = 'other';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and refresh the page.';
        errorType = 'permission';
        toast({
          title: 'Camera Permission Denied',
          description: 'Please allow camera access and refresh the page. Check your browser address bar for the camera icon.',
          variant: 'destructive',
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        // Try to enumerate devices to see if any are available
        // Note: enumerateDevices may return 0 devices if permission hasn't been granted
        // or if cameras are truly not available
        let devices: Array<{deviceId: string; label: string}> = [];
        try {
          devices = await enumerateDevices(true) as Array<{deviceId: string; label: string}>;
        } catch (enumError) {
          console.error('Failed to enumerate devices:', enumError);
        }
        
        if (devices.length === 0) {
          errorMessage = 'No camera detected. This could mean: (1) No camera is connected, (2) Camera is disabled in System Settings, or (3) Browser needs permission to detect cameras.';
          errorType = 'notfound';
          toast({
            title: 'No Camera Detected',
            description: 'Please check System Settings → Privacy & Security → Camera and ensure your browser has permission.',
            variant: 'destructive',
            duration: 10000,
          });
        } else {
          // Devices exist but access failed - might be permission or system issue
          errorMessage = `Found ${devices.length} camera(s) but unable to access. Please check system permissions.`;
          errorType = 'other';
          toast({
            title: 'Camera Access Failed',
            description: `Found ${devices.length} camera(s) but unable to access. Check system settings.`,
            variant: 'destructive',
          });
        }
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is already in use by another application. Please close other apps using the camera and try again.';
        errorType = 'inuse';
        toast({
          title: 'Camera In Use',
          description: 'Camera is being used by another application. Please close other apps and try again.',
          variant: 'destructive',
        });
      } else {
        errorMessage += err.message || 'Please check your camera permissions and try again.';
        toast({
          title: 'Camera Error',
          description: err.message || 'Failed to access camera. Please check your camera settings.',
          variant: 'destructive',
        });
      }
      
      setError(errorMessage);
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

        // Convert to base64
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImageData(imageDataUrl);
        setCaptured(true);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCaptured(false);
    setImageData('');
    startCamera();
  };

  const confirm = () => {
    if (imageData) {
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = imageData.split(',')[1];
      onCapture(base64Data);
    }
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
          <Camera className="h-5 w-5" />
          {mode === 'register' ? 'Register Face' : 'Face Recognition'}
        </CardTitle>
        <CardDescription>
          {mode === 'register'
            ? 'Position your face in the center and look directly at the camera'
            : 'Look at the camera for face recognition'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stream && !captured && !error && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Click the button below to start your camera and {mode === 'register' ? 'register' : 'recognize'} your face
            </p>
            <Button onClick={startCamera} size="lg" className="btn-modern glow-primary">
              <Camera className="h-5 w-5 mr-2" />
              Start Camera
            </Button>
          </div>
        )}

        {error && (
          <>
            {error.includes('permission') || error.includes('Permission') ? (
              <CameraPermissionHelper
                onPermissionGranted={() => {
                  setError('');
                  startCamera();
                }}
              />
            ) : null}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 mb-1">Camera Access Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                  {(error.includes('No camera') || error.includes('No Camera')) && (
                    <div className="mt-3 space-y-2 text-xs text-red-600">
                      {availableDevices.length > 0 ? (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="font-medium text-blue-800 mb-1">Detected Cameras:</p>
                          <ul className="list-disc list-inside ml-2 text-blue-700">
                            {availableDevices.map((device, idx) => (
                              <li key={device.deviceId}>{device.label || `Camera ${idx + 1}`}</li>
                            ))}
                          </ul>
                          <p className="text-blue-600 mt-2">Cameras are detected but cannot be accessed. Check permissions below.</p>
                        </div>
                      ) : (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="font-medium text-yellow-800 mb-2">⚠️ No cameras detected by browser</p>
                          <p className="text-yellow-700 text-xs mb-2">This usually means:</p>
                          <ol className="list-decimal list-inside ml-2 space-y-1 text-yellow-700">
                            <li>Camera is disabled in macOS System Settings</li>
                            <li>Browser doesn&apos;t have permission to see cameras</li>
                            <li>No camera hardware is connected</li>
                          </ol>
                        </div>
                      )}
                      <p className="font-medium">Step-by-step fix for macOS:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li className="font-semibold">Open System Settings
                          <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                            <li>Click Apple menu → System Settings</li>
                            <li>Or press Cmd + Space and type &quot;System Settings&quot;</li>
                          </ul>
                        </li>
                        <li className="font-semibold">Go to Privacy & Security → Camera
                          <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                            <li>Click &quot;Privacy & Security&quot; in the sidebar</li>
                            <li>Click &quot;Camera&quot; in the list</li>
                          </ul>
                        </li>
                        <li className="font-semibold">Enable your browser
                          <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                            <li>Find your browser (Chrome, Safari, Firefox, etc.)</li>
                            <li>Toggle the switch to ON (green)</li>
                            <li>If you don&apos;t see your browser, try accessing the camera first, then check again</li>
                          </ul>
                        </li>
                        <li className="font-semibold">Verify camera works
                          <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                            <li>Open Photo Booth app to test your camera</li>
                            <li>If Photo Booth works, your camera hardware is fine</li>
                          </ul>
                        </li>
                        <li className="font-semibold">Restart browser and try again
                          <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                            <li>Quit your browser completely (Cmd + Q)</li>
                            <li>Reopen the browser</li>
                            <li>Refresh this page</li>
                            <li>Click &quot;Start Camera&quot; again</li>
                          </ul>
                        </li>
                      </ol>
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-300">
                        <p className="font-medium text-blue-800 mb-2">💡 Quick Test:</p>
                        <p className="text-blue-700 text-xs mb-2">Before fixing settings, test if your camera works:</p>
                        <ol className="list-decimal list-inside ml-2 text-blue-700 text-xs space-y-1">
                          <li>Open Photo Booth app (Cmd + Space, type &quot;Photo Booth&quot;)</li>
                          <li>If Photo Booth shows your camera, hardware is OK - it&apos;s a permission issue</li>
                          <li>If Photo Booth doesn&apos;t work, check System Settings → Privacy & Security → Camera</li>
                        </ol>
                      </div>
                    </div>
                  )}
                  {error.includes('Found') && error.includes('camera') && (
                    <div className="mt-3 space-y-2 text-xs text-red-600">
                      {availableDevices.length > 0 && (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="font-medium text-yellow-800 mb-1">Detected Cameras:</p>
                          <ul className="list-disc list-inside ml-2 text-yellow-700">
                            {availableDevices.map((device, idx) => (
                              <li key={device.deviceId}>{device.label || `Camera ${idx + 1}`}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="font-medium">System Permission Issue:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Cameras are detected but system permissions are blocking access</li>
                        <li>Go to System Settings → Privacy & Security → Camera</li>
                        <li>Enable camera access for your browser</li>
                        <li>Restart your browser after enabling permissions</li>
                      </ul>
                    </div>
                  )}
                  {error.includes('already in use') && (
                    <div className="mt-3 space-y-2 text-xs text-red-600">
                      <p className="font-medium">To fix this:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Close other applications using the camera (Zoom, Teams, etc.)</li>
                        <li>Check if other browser tabs are using the camera</li>
                        <li>Restart your browser if the issue persists</li>
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={async () => {
                        setError('');
                        toast({
                          title: 'Checking for cameras...',
                          description: 'Requesting camera permission to detect available devices.',
                        });
                        // First request permission to enumerate devices
                        try {
                          // Request permission with minimal constraints
                          const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
                          testStream.getTracks().forEach(track => track.stop());
                          
                          // Wait a bit for permission to propagate
                          await new Promise(resolve => setTimeout(resolve, 500));
                          
                          // Now enumerate devices (should have labels now)
                          const devices = await enumerateDevices(true) as Array<{deviceId: string; label: string}>;
                          setAvailableDevices(devices);
                          
                          if (devices.length > 0) {
                            toast({
                              title: 'Cameras Detected!',
                              description: `Found ${devices.length} camera(s): ${devices.map(d => d.label).join(', ')}`,
                            });
                            // Try to start camera again
                            setTimeout(() => startCamera(), 1000);
                          } else {
                            setError('No cameras detected. Please check System Settings → Privacy & Security → Camera and ensure your browser is enabled.');
                            toast({
                              title: 'No Cameras Found',
                              description: 'No cameras detected. Check System Settings → Privacy & Security → Camera.',
                              variant: 'destructive',
                              duration: 8000,
                            });
                          }
                        } catch (err: any) {
                          console.error('Permission check failed:', err);
                          if (err.name === 'NotFoundError') {
                            setError('No camera hardware detected. Please ensure a camera is connected and enabled in System Settings → Privacy & Security → Camera.');
                            toast({
                              title: 'No Camera Hardware',
                              description: 'No camera found. Check System Settings → Privacy & Security → Camera.',
                              variant: 'destructive',
                              duration: 8000,
                            });
                          } else {
                            // Permission denied or other error - try normal start
                            startCamera();
                          }
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Check for Cameras
                    </Button>
                    <Button
                      onClick={() => {
                        setError('');
                        startCamera();
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {stream && !captured && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg border-2 border-dashed bg-gray-900"
              style={{ maxHeight: '480px' }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-white rounded-full w-48 h-48 opacity-50" />
            </div>
          </div>
        )}

        {captured && (
          <div className="relative">
            <img
              src={imageData}
              alt="Captured face"
              className="w-full rounded-lg border-2"
              style={{ maxHeight: '480px' }}
            />
            <div className="absolute top-2 right-2">
              <CheckCircle className="h-8 w-8 text-green-500 bg-white rounded-full" />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-2">
          {stream && !captured && (
            <>
              <Button onClick={capturePhoto} className="flex-1 btn-modern">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button variant="outline" onClick={() => {
                stopCamera();
                setError('');
              }}>
                Cancel
              </Button>
            </>
          )}

          {captured && (
            <>
              <Button onClick={confirm} className="flex-1 btn-modern glow-primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
              <Button variant="outline" onClick={retake}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button variant="outline" onClick={cancel}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>

        {(stream || captured) && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Ensure good lighting</p>
            <p>• Face the camera directly</p>
            <p>• Remove glasses if possible</p>
            <p>• Keep a neutral expression</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

