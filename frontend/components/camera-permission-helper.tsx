'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Camera, CheckCircle, RefreshCw } from 'lucide-react';

interface CameraPermissionHelperProps {
  onPermissionGranted?: () => void;
}

export function CameraPermissionHelper({ onPermissionGranted }: CameraPermissionHelperProps) {
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [checking, setChecking] = useState(false);

  const checkPermissions = useCallback(async () => {
    setChecking(true);
    try {
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionStatus(permissionStatus.state as any);
        
        permissionStatus.onchange = () => {
          setPermissionStatus(permissionStatus.state as any);
          if (permissionStatus.state === 'granted' && onPermissionGranted) {
            onPermissionGranted();
          }
        };
      } else {
        // Try to access camera to check permissions
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setPermissionStatus('granted');
        } catch (error: any) {
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            setPermissionStatus('denied');
          } else {
            setPermissionStatus('prompt');
          }
        }
      }
    } catch (error) {
      setPermissionStatus('unknown');
    } finally {
      setChecking(false);
    }
  }, [onPermissionGranted]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      if (onPermissionGranted) {
        onPermissionGranted();
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
      }
    }
  };

  if (permissionStatus === 'granted') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Camera permission granted</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          Camera Permission Required
        </CardTitle>
        <CardDescription className="text-yellow-700">
          We need access to your camera for face recognition and document scanning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionStatus === 'denied' && (
          <div className="space-y-3">
            <p className="text-sm text-yellow-800">
              Camera access has been denied. Please enable it in your browser settings:
            </p>
            <div className="text-xs text-yellow-700 space-y-2">
              <div>
                <strong>Chrome/Edge:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Click the camera icon (🚫) in the address bar</li>
                  <li>Select &ldquo;Always allow camera access&rdquo;</li>
                  <li>Or go to Settings → Privacy → Site Settings → Camera</li>
                </ul>
              </div>
              <div>
                <strong>Firefox:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Click the camera icon in the address bar</li>
                  <li>Select &ldquo;Allow&rdquo; and check &ldquo;Remember this decision&rdquo;</li>
                  <li>Or go to Preferences → Privacy → Permissions → Camera</li>
                </ul>
              </div>
              <div>
                <strong>Safari:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Go to Safari → Settings → Websites → Camera</li>
                  <li>Find this website and set to &ldquo;Allow&rdquo;</li>
                </ul>
              </div>
              <div>
                <strong>Mobile (iOS/Android):</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Go to Settings → App Permissions → Camera</li>
                  <li>Enable camera access for your browser</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {permissionStatus === 'prompt' && (
          <div className="space-y-3">
            <p className="text-sm text-yellow-800">
              Please allow camera access when prompted by your browser.
            </p>
            <Button onClick={requestPermission} variant="outline" className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Request Camera Permission
            </Button>
          </div>
        )}

        <Button
          onClick={checkPermissions}
          variant="outline"
          size="sm"
          disabled={checking}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : 'Check Permission Status'}
        </Button>
      </CardContent>
    </Card>
  );
}

