'use client';

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, X } from 'lucide-react';

interface ImageViewerProps {
  images: string[];
  annotations?: Array<{ x: number; y: number; label: string }>;
  onAnnotationAdd?: (annotation: { x: number; y: number; label: string }) => void;
  showHeatmap?: boolean;
  heatmapData?: Array<{ x: number; y: number; intensity: number }>;
}

export function ImageViewer({
  images,
  annotations = [],
  onAnnotationAdd,
  showHeatmap = false,
  heatmapData = [],
}: ImageViewerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (onAnnotationAdd) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onAnnotationAdd({ x, y, label: 'Annotated Area' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Image Viewer</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="px-2 py-1 text-sm">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Image Selector */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 p-1 border rounded ${
                    selectedImageIndex === index ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-16 w-16 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image Viewer */}
          <div className="relative border rounded-lg overflow-hidden bg-gray-100">
            <div
              className="relative"
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={images[selectedImageIndex]}
                alt={`Retina image ${selectedImageIndex + 1}`}
                className="max-w-full h-auto cursor-crosshair"
                onClick={handleImageClick}
                style={{
                  minWidth: '100%',
                  height: 'auto',
                }}
              />

              {/* Heatmap Overlay */}
              {showHeatmap && heatmapData.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {heatmapData.map((point, index) => (
                    <div
                      key={index}
                      className="absolute rounded-full"
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: '20px',
                        height: '20px',
                        backgroundColor: `rgba(255, 0, 0, ${point.intensity})`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Annotations */}
              {annotations.map((annotation, index) => (
                <div
                  key={index}
                  className="absolute bg-blue-500/50 border-2 border-blue-500 rounded p-1 pointer-events-none"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span className="text-xs text-white font-medium">{annotation.label}</span>
                </div>
              ))}
            </div>
          </div>

          {annotations.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {annotations.length} annotation(s) on this image
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


