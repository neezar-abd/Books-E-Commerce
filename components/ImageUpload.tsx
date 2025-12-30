'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
  bucket?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  compact?: boolean; // for smaller upload areas like logos
  aspectRatio?: 'square' | 'banner' | 'auto';
}

export default function ImageUpload({
  value,
  onChange,
  onUpload,
  bucket = 'products',
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  compact = false,
  aspectRatio = 'auto',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setError(`Format tidak valid. Gunakan: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      setError(`Ukuran file maksimal ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file if onUpload function is provided
    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        onChange(url);
        setError(null);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Gagal upload gambar. Coba lagi.');
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    } else {
      // If no upload function, just use the data URL
      onChange(reader.result as string);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Dynamic height classes based on compact mode and aspect ratio
  const getContainerClass = () => {
    if (compact) {
      return 'w-full h-full min-h-[100px]';
    }
    switch (aspectRatio) {
      case 'square':
        return 'w-full aspect-square';
      case 'banner':
        return 'w-full h-40';
      default:
        return 'w-full h-48';
    }
  };

  return (
    <div className={compact ? 'h-full' : ''}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group h-full"
          >
            <div className={`relative ${getContainerClass()} rounded-lg overflow-hidden border border-gray-200`}>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={isUploading}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  title="Ganti gambar"
                >
                  <Upload size={compact ? 16 : 20} />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  title="Hapus gambar"
                >
                  <X size={compact ? 16 : 20} />
                </button>
              </div>

              {/* Upload indicator */}
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`${compact ? 'w-8 h-8 border-2' : 'w-12 h-12 border-4'} border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2`} />
                    <p className="text-xs text-gray-600">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="upload"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className={`${getContainerClass()} border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUploading ? (
              <>
                <div className={`${compact ? 'w-6 h-6 border-2' : 'w-10 h-10 border-3'} border-primary border-t-transparent rounded-full animate-spin`} />
                <p className="text-xs">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon size={compact ? 24 : 36} className="opacity-50" />
                <div className="text-center px-2">
                  <p className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                    {compact ? 'Upload' : 'Klik untuk upload'}
                  </p>
                  {!compact && (
                    <p className="text-xs mt-1 text-gray-400">
                      Max {maxSize}MB
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
