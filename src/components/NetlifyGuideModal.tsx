import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Server, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  Key, 
  Copy,
  Check
} from 'lucide-react';

interface NetlifyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetlifyGuideModal: React.FC<NetlifyGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'How It Works',
      subtitle: 'Zero-maintenance dynamic architecture',
    },
    {
      id: 2,
      title: 'Free TMDB Key',
      subtitle: 'Dynamic movie posters, cast & plot',
    },
    {
      id: 3,
      title: 'Deploy to Netlify',
      subtitle: 'Free hosting in 1 minute',
    },
    {
      id: 4,
      title: 'Custom Domain',
      subtitle: 'Connect your purchased domain',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div 
        id="netlify-guide-modal"
        className="relative z-10 w-full max-w-3xl bg-[#0e0e11] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-zinc-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-orange-950/30 via-[#0e0e11] to-[#0e0e11] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2 font-['Outfit']">
                K Cinema Beginner's Deployment Guide
              </h2>
              <p className="text-xs text-zinc-400">
                How to host K Cinema on Netlify, get your free TMDB API key, and connect your custom domain.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-zinc-800 bg-[#050505]/60 shrink-0">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={`p-3 text-left transition-all border-b-2 cursor-pointer font-['Outfit'] ${
                currentStep === s.id
                  ? 'border-orange-500 bg-orange-950/20 text-orange-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Step {s.id}
              </div>
              <div className="text-xs font-bold truncate text-zinc-100">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: Architecture Explained */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#050505] border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider font-['Outfit']">
                  💡 Zero-Maintenance Dynamic Movie Architecture
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  You requested: <em>"i dont want to host anything on my website. i just want to show data fetched dynamically from public movie APIs like TMDB."</em>
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  K Cinema connects directly to public movie API endpoints in real-time, meaning you never need to store huge gigabytes of video or movie posters on your server.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#050505] border border-zinc-800 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold border border-orange-500/30">1</div>
                  <h4 className="text-xs font-bold text-zinc-100 font-['Outfit']">Dynamic TMDB API</h4>
                  <p className="text-[11px] text-zinc-400">Movie details, posters, trailers and cast are fetched directly from TMDB's public servers in real time.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#050505] border border-zinc-800 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold border border-orange-500/30">2</div>
                  <h4 className="text-xs font-bold text-zinc-100 font-['Outfit']">Admin Panel & Posts</h4>
                  <p className="text-[11px] text-zinc-400">Publish custom movie reviews, video embeds, and HTML articles with password protection.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#050505] border border-zinc-800 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold border border-orange-500/30">3</div>
                  <h4 className="text-xs font-bold text-zinc-100 font-['Outfit']">Netlify Global CDN</h4>
                  <p className="text-[11px] text-zinc-400">Netlify hosts your site for free on their global CDN with automated HTTPS and lightning-fast speeds.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: How to Get Free TMDB API Key */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#050505] border border-zinc-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-['Outfit']">
                  <Key className="w-4 h-4 text-orange-400" />
                  Get Your Free TMDB API Key in 3 Steps:
                </h3>
                <ol className="space-y-3 pt-2 text-xs text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-orange-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-white">Create a Free Account on TMDB:</strong>
                      <p className="text-zinc-400">Go to <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline inline-flex items-center gap-0.5 font-semibold">themoviedb.org/signup <ExternalLink className="w-2.5 h-2.5" /></a> and sign up for free.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-orange-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-white">Request an API Key:</strong>
                      <p className="text-zinc-400">Click your profile avatar &gt; <strong>Settings</strong> &gt; <strong>API</strong> &gt; Click <strong>Create</strong> (Choose "Developer"). Fill in any website name (e.g. K Cinema).</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-orange-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-white">Paste Key in Admin Panel:</strong>
                      <p className="text-zinc-400">Copy your <strong>API Key (v3 auth)</strong> and paste it into the K Cinema Admin Panel (Settings tab). Everything will fetch live immediately!</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* STEP 3: Deploying to Netlify */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#050505] border border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-['Outfit']">
                  <Server className="w-4 h-4 text-orange-400" />
                  Deploying to Netlify (Free Tier)
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  We have already created a pre-configured <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-orange-300 font-mono">netlify.toml</code> file in your project.
                </p>

                <div className="space-y-3 pt-1 text-xs text-zinc-300">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <strong className="text-zinc-100 block mb-1 font-['Outfit']">Option A: Via GitHub (Recommended)</strong>
                    <p className="text-zinc-400 text-[11px] mb-2">Export to GitHub via the AI Studio Settings menu, then on <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-orange-400 underline font-semibold">Netlify.com</a> click <em>"Add new site" &gt; "Import an existing project from GitHub"</em>.</p>
                    <div className="bg-[#050505] p-2.5 rounded-lg font-mono text-[11px] text-zinc-400 space-y-1 border border-zinc-800/80">
                      <div>Build Command: <span className="text-orange-400 font-bold">npm run build</span></div>
                      <div>Publish Directory: <span className="text-orange-400 font-bold">dist</span></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <strong className="text-zinc-100 block mb-1 font-['Outfit']">Option B: Drag & Drop (Netlify Drop)</strong>
                    <p className="text-zinc-400 text-[11px]">Download ZIP from the top right menu, run <code className="text-orange-400">npm run build</code>, and drag the resulting <code className="text-orange-400 font-bold">dist</code> folder onto <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-orange-400 underline font-semibold">app.netlify.com/drop</a>.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Connect Custom Domain */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#050505] border border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-['Outfit']">
                  <Globe className="w-4 h-4 text-orange-400" />
                  Connect Your Purchased Domain to Netlify
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You bought a domain name! Here is how to point it to your Netlify website:
                </p>

                <ol className="space-y-3 pt-1 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-orange-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-white">Add Domain in Netlify:</strong>
                      <p className="text-zinc-400">In Netlify dashboard, go to <strong>Site configuration</strong> &gt; <strong>Domain management</strong> &gt; Click <strong>Add a domain</strong> and type your domain (e.g. <code className="text-orange-300">yourdomain.com</code>).</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-orange-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-white">Update DNS Records at your Domain Registrar (GoDaddy / Namecheap / Google Domains):</strong>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px]">
                          <span><strong>A Record:</strong> @ &rarr; 75.2.60.5</span>
                          <button onClick={() => copyToClipboard('75.2.60.5', 'a_rec')} className="text-orange-400 hover:text-white cursor-pointer">
                            {copiedCode === 'a_rec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px]">
                          <span><strong>CNAME Record:</strong> www &rarr; your-site.netlify.app</span>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-orange-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-white">Free SSL (HTTPS):</strong>
                      <p className="text-zinc-400">Netlify will automatically provision a free Let's Encrypt SSL certificate within a few minutes!</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-6 border-t border-zinc-800 bg-[#050505]/80 flex items-center justify-between shrink-0">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer border border-zinc-800"
          >
            Previous
          </button>

          <span className="text-xs text-zinc-500 font-medium">
            Step {currentStep} of {steps.length}
          </span>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.3)]"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              Ready to Launch! <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
