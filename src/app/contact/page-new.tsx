'use client';

import React, { useState, FormEvent } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // Symulacja wysyłania - tutaj można zintegrować z rzeczywistym API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Have questions about AltrSeed? We're here to help you navigate the future of decentralized crowdfunding.
          </p>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Send us a Message
              </h2>
              <p className="text-gray-600">
                Whether you're a project creator, donor, or just curious about our platform, we'd love to hear from you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/70 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/70 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/70 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full bg-white/70 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all transform ${
                  status === 'sending'
                    ? 'bg-gray-400 cursor-not-allowed scale-100'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {status === 'sending' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="bg-green-100 border border-green-300 rounded-2xl p-4 text-green-700">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">✅</div>
                    <div>
                      <p className="font-semibold">Message sent successfully!</p>
                      <p className="text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-100 border border-red-300 rounded-2xl p-4 text-red-700">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">❌</div>
                    <div>
                      <p className="font-semibold">Oops! Something went wrong.</p>
                      <p className="text-sm">Please try again or contact us directly.</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            
            {/* Quick Info Cards */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Email Us</h3>
                    <p className="text-gray-600 mb-2">For general inquiries and support</p>
                    <a href="mailto:support@altrseed.com" className="text-blue-600 hover:text-blue-700 font-medium">
                      support@altrseed.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Community Support</h3>
                    <p className="text-gray-600 mb-2">Join our Discord for real-time help</p>
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Join Discord Community
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Documentation</h3>
                    <p className="text-gray-600 mb-2">Check our comprehensive guides</p>
                    <a href="/whitepaper" className="text-green-600 hover:text-green-700 font-medium">
                      View Whitepaper
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">How do I create a campaign?</h4>
                  <p className="text-gray-600 text-sm">Connect your wallet, click "Create Campaign", fill in your details, and deploy to the blockchain.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">What tokens are accepted?</h4>
                  <p className="text-gray-600 text-sm">We currently support USDC and other whitelisted ERC-20 tokens on Ethereum Sepolia testnet.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">How do refunds work?</h4>
                  <p className="text-gray-600 text-sm">If a campaign fails or is cancelled, donors can claim refunds directly through smart contracts.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">What are the fees?</h4>
                  <p className="text-gray-600 text-sm">Startup campaigns: 3% donation + 5% success fee. Charity campaigns: 2% donation + 3% success fee.</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                  <span className="text-xl">🐦</span>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-white hover:bg-gray-900 transition-colors">
                  <span className="text-xl">📱</span>
                </a>
                <a href="#" className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <span className="text-xl">💼</span>
                </a>
                <a href="#" className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                  <span className="text-xl">📺</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}