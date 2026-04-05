
import React, { useState } from 'react';
import { Image as ImageIcon, Trash2, Download, ExternalLink, Loader2, AlertTriangle, CheckCircle2, Play, Search } from 'lucide-react';
import { ImageGeneration } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralAssetGalleryProps {
  images: ImageGeneration[];
  onDeleteImage: (id: string) => void;
  onCreateSlideshow: (imageIds: string[]) => void;
  isGenerating: boolean;
  isCreatingSlideshow: boolean;
}

const ImageAsset: React.FC<{ image: ImageGeneration; onDelete: (id: string) => void }> = ({ image, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group transition-all hover:border-cyan-500/30"
    >
      <div className="aspect-square bg-black relative flex items-center justify-center overflow-hidden">
        {image.status === 'completed' && image.url ? (
          <img 
            src={image.url} 
            alt={image.prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : image.status === 'generating' ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-500" />
            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">Neural_Synthesis...</span>
          </div>
        ) : image.status === 'failed' ? (
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Synthesis_Failed</span>
          </div>
        ) : null}
        
        <div className="absolute top-4 left-4 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[7px] font-black text-white uppercase tracking-widest">
          {image.aspectRatio}
        </div>
        
        {image.status === 'completed' && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <a 
              href={image.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
            <button 
              onClick={() => onDelete(image.id)}
              className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-all"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-white uppercase truncate pr-4">{image.imageName}</p>
            <p className="text-[6px] text-slate-600 font-bold mono uppercase">{image.systemId}</p>
          </div>
          {image.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
        </div>
        <p className="text-[8px] text-slate-400 uppercase mono line-clamp-2 h-6">{image.prompt}</p>
      </div>
    </motion.div>
  );
};

const NeuralAssetGallery: React.FC<NeuralAssetGalleryProps> = ({ images, onDeleteImage, onCreateSlideshow, isGenerating, isCreatingSlideshow }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredImages = images.filter(img => 
    img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.imageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.systemId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedImages = filteredImages.filter(img => img.status === 'completed' && img.url);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Visual_Asset_Vault
          </h3>
          <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[7px] font-black text-cyan-500 uppercase tracking-widest">
            Nano_Banana_Active
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg pl-8 pr-4 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan-500 transition-all mono w-48"
            />
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase mono">{filteredImages.length} Assets_Found</span>
          {completedImages.length >= 2 && (
            <button
              onClick={() => onCreateSlideshow(completedImages.map(img => img.id))}
              disabled={isCreatingSlideshow}
              className="px-4 py-2 bg-fuchsia-500 text-white text-[9px] font-black uppercase rounded-xl hover:bg-fuchsia-400 disabled:opacity-50 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(192,38,211,0.3)]"
            >
              {isCreatingSlideshow ? <Loader2 className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isCreatingSlideshow ? 'Synthesizing_Slideshow...' : 'Synthesize_Slideshow'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredImages.map((image) => (
            <ImageAsset key={image.id} image={image} onDelete={onDeleteImage} />
          ))}
        </AnimatePresence>
      </div>

      {filteredImages.length === 0 && !isGenerating && (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
          <ImageIcon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
          <p className="text-[10px] text-slate-600 uppercase mono tracking-widest">No visual assets found.</p>
        </div>
      )}
    </div>
  );
};

export default NeuralAssetGallery;
