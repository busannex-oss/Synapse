
import React, { useState } from 'react';
import { X, Send, Bug, MessageSquare, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'suggestion' | 'bug'>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with a realistic delay
    setTimeout(() => {
      console.log('Feedback submitted:', { type, title, description, email });
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Auto close after success message display
      setTimeout(() => {
        setIsSuccess(false);
        setTitle('');
        setDescription('');
        setEmail('');
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/90 glass w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40 flex flex-col apple-shadow animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-gray-900">System Feedback</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Neural Link v4</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Intel Received</h3>
                <p className="text-gray-500 text-sm mt-1">Your report has been analyzed and queued for processing.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('suggestion')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    type === 'suggestion' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Suggestion
                </button>
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    type === 'bug' ? 'bg-white shadow-sm text-red-500' : 'text-gray-400'
                  }`}
                >
                  <Bug className="w-3.5 h-3.5" /> Report Bug
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subject</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === 'suggestion' ? "Feature request..." : "Something isn't right..."}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Detailed Context</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your suggestion or the steps to reproduce the bug..."
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/10 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Reply Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 apple-shadow mt-4"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> UPLOAD TO HUB
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
