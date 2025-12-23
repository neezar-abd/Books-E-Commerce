'use client';

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Wand2, Upload, Image as ImageIcon, Sparkles, Loader2, Download } from 'lucide-react';

const AIDesignStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null); // Reset generated images on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: prompt
            }
          ]
        }
      });

      let foundImage = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            foundImage = part.inlineData.data;
            break;
          }
        }
      }

      if (foundImage) {
        setGeneratedImage(`data:image/png;base64,${foundImage}`);
      } else {
        alert("The AI responded, but didn't return an image. Try a different prompt.");
      }

    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="py-20 bg-white" id="ai-design-studio">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full mb-4">
             <Sparkles size={16} className="text-secondary" />
             <span className="text-secondary font-bold text-xs uppercase tracking-wider">Nano Banana Powered</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">AI Book Cover Studio</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Visualize your story. Upload a sketch or a stock image and use our AI to reimagine it as a bestselling book cover.
          </p>
        </div>

        <div className="bg-surface rounded-3xl shadow-soft overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Input Section */}
            <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <Upload size={20} /> Upload Concept
              </h3>
              
              <div 
                className="flex-1 min-h-[300px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-white transition-colors relative overflow-hidden bg-white/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Original" className="w-full h-full object-contain z-10" />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">Click to upload an image</p>
                    <p className="text-gray-400 text-sm mt-1">Supports JPG, PNG</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div className="mt-6 space-y-4">
                <label className="block text-sm font-bold text-primary">Describe your vision</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Turn this into a minimalist sci-fi novel cover with neon blue accents"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-secondary transition-colors"
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={!selectedImage || !prompt || isGenerating}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                    {isGenerating ? 'Designing...' : 'Generate'}
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="p-8 lg:p-12 bg-gray-50/50 flex flex-col">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <Sparkles size={20} /> AI Result
              </h3>
              
              <div className="flex-1 min-h-[300px] bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-secondary mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Creating your cover art...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full group">
                    <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                    <a 
                      href={generatedImage} 
                      download="uchinaga-book-cover.png"
                      className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-secondary"
                      title="Download Image"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 p-6">
                    <p>Your AI-generated cover will appear here</p>
                  </div>
                )}
              </div>
              
              {generatedImage && (
                <div className="mt-6 bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100">
                  <span className="font-bold">Usage:</span> You can use this image for your ebook or as a reference for a professional illustrator.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDesignStudio;