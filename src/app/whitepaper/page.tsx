'use client';
import React from 'react';

export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              AltrSeed
              <span className="block text-3xl md:text-4xl font-light mt-2 text-blue-200">
                Whitepaper
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Decentralized Crowdfunding Platform on Ethereum
            </p>
            <div className="mt-8 inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              Version 1.0 • November 2025
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-700">Decentralized</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">0%</div>
            <div className="text-gray-700">Platform Risk</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="text-3xl font-bold text-indigo-600 mb-2">∞</div>
            <div className="text-gray-700">Transparency</div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {[
            'Abstract', 'Problem', 'Solution', 'Architecture', 
            'Smart Contracts', 'Tokenomics', 'Security', 'Roadmap'
          ].map((item, index) => (
            <a 
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {index + 1}. {item}
            </a>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-20">
          
          {/* Abstract */}
          <section id="abstract" className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                1
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Abstract
              </h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-xl mb-6">
                AltrSeed revolutionizes crowdfunding through <span className="font-semibold text-blue-600">blockchain technology</span>, 
                creating a trustless ecosystem where transparency meets innovation.
              </p>
              <p className="mb-4">
                Built on Ethereum with smart contracts, IPFS storage, and ERC-20 tokens, AltrSeed eliminates 
                traditional intermediaries while providing robust protection for creators and donors.
              </p>
              <p>
                Our platform features automated fund management, flexible refund mechanisms, and transparent 
                commission structures designed for the decentralized future.
              </p>
            </div>
          </section>

          {/* Problem Statement */}
          <section id="problem" className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-red-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                2
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                The Problem
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-red-700 mb-3">🏦 Centralized Control</h3>
                  <p className="text-gray-700">Traditional platforms maintain control over funds, creating single points of failure</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-red-700 mb-3">💰 High Fees</h3>
                  <p className="text-gray-700">Platform fees can reach 5-8%, significantly reducing funds for projects</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-red-700 mb-3">🔒 Limited Transparency</h3>
                  <p className="text-gray-700">Donors have minimal visibility into fund usage and project progress</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-red-700 mb-3">🌍 Geographic Restrictions</h3>
                  <p className="text-gray-700">Many platforms limit access based on location, excluding global participation</p>
                </div>
              </div>
            </div>
          </section>

          {/* Solution */}
          <section id="solution" className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-green-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                3
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Our Solution
              </h2>
            </div>
            <div className="text-center mb-12">
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                AltrSeed leverages blockchain technology to create a <span className="font-bold text-green-600">fully decentralized</span>, 
                transparent, and efficient crowdfunding ecosystem.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/70 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Contracts</h3>
                <p className="text-gray-600">Automated, trustless fund management with programmable conditions</p>
              </div>
              <div className="bg-white/70 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">IPFS Storage</h3>
                <p className="text-gray-600">Decentralized metadata storage ensuring permanent accessibility</p>
              </div>
              <div className="bg-white/70 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">ERC-20 Tokens</h3>
                <p className="text-gray-600">Stable, widely-accepted digital currencies like USDC</p>
              </div>
            </div>
          </section>

          {/* Technical Architecture */}
          <section id="architecture" className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-blue-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                4
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Technical Architecture
              </h2>
            </div>
            
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Technology Stack</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/70 rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-3xl mb-3">⚡</div>
                  <h4 className="font-bold text-gray-800 mb-2">Frontend</h4>
                  <p className="text-sm text-gray-600">Next.js, React, TypeScript, Tailwind CSS</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-3xl mb-3">🔗</div>
                  <h4 className="font-bold text-gray-800 mb-2">Blockchain</h4>
                  <p className="text-sm text-gray-600">Ethereum, Wagmi, Viem, Reown AppKit</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-3xl mb-3">📦</div>
                  <h4 className="font-bold text-gray-800 mb-2">Storage</h4>
                  <p className="text-sm text-gray-600">IPFS, Web3.Storage</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-3xl mb-3">🪙</div>
                  <h4 className="font-bold text-gray-800 mb-2">Tokens</h4>
                  <p className="text-sm text-gray-600">ERC-20, USDC, Whitelisted Tokens</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Platform Flow</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4">1</div>
                  <p className="text-gray-700"><strong>Campaign Creation:</strong> Creators upload metadata to IPFS and deploy campaign via smart contract</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-4">2</div>
                  <p className="text-gray-700"><strong>Donation Process:</strong> Users donate ERC-20 tokens directly to smart contract</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-4">3</div>
                  <p className="text-gray-700"><strong>Fund Management:</strong> Smart contract automatically handles success/failure scenarios</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold mr-4">4</div>
                  <p className="text-gray-700"><strong>Withdrawal/Refund:</strong> Automated distribution based on campaign outcome</p>
                </div>
              </div>
            </div>
          </section>

          {/* Smart Contracts */}
          <section id="smart-contracts" className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-purple-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                5
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Smart Contract Features
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Core Functions</h3>
                <div className="space-y-4">
                  <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                    <h4 className="font-bold text-purple-700 mb-2">Campaign Management</h4>
                    <p className="text-sm text-gray-600">Create, update, cancel, and close campaigns with flexible parameters</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                    <h4 className="font-bold text-purple-700 mb-2">Donation Processing</h4>
                    <p className="text-sm text-gray-600">Secure ERC-20 token donations with automatic commission handling</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                    <h4 className="font-bold text-purple-700 mb-2">Refund System</h4>
                    <p className="text-sm text-gray-600">Automated refunds for failed campaigns with configurable terms</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Security Features</h3>
                <div className="space-y-4">
                  <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                    <h4 className="font-bold text-purple-700 mb-2">Access Control</h4>
                    <p className="text-sm text-gray-600">Owner-only admin functions with role-based permissions</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                    <h4 className="font-bold text-purple-700 mb-2">Reentrancy Protection</h4>
                    <p className="text-sm text-gray-600">Built-in guards preventing malicious exploit attempts</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                    <h4 className="font-bold text-purple-700 mb-2">Pausable Contract</h4>
                    <p className="text-sm text-gray-600">Emergency pause functionality for critical situations</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Smart Contract Highlights</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">40+</div>
                  <div className="text-gray-700">Functions</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">OpenZeppelin</div>
                  <div className="text-gray-700">Security Standards</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">Gas</div>
                  <div className="text-gray-700">Optimized</div>
                </div>
              </div>
            </div>
          </section>

          {/* Tokenomics */}
          <section id="tokenomics" className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-yellow-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                6
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Commission Structure
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-orange-700 mb-6">Startup Campaigns</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-orange-200">
                    <span className="text-gray-700">Donation Commission</span>
                    <span className="font-bold text-orange-600">3%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-orange-200">
                    <span className="text-gray-700">Success Commission</span>
                    <span className="font-bold text-orange-600">5%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Refund Commission</span>
                    <span className="font-bold text-orange-600">2%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-blue-700 mb-6">Charity Campaigns</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Donation Commission</span>
                    <span className="font-bold text-blue-600">2%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Success Commission</span>
                    <span className="font-bold text-blue-600">3%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Refund Commission</span>
                    <span className="font-bold text-blue-600">1%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Our Fees Are Fair</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Infrastructure Costs</h4>
                  <p className="text-gray-600 text-sm">Gas fees, IPFS storage, platform maintenance</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Security & Audits</h4>
                  <p className="text-gray-600 text-sm">Smart contract audits, security monitoring</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Platform Development</h4>
                  <p className="text-gray-600 text-sm">Continuous improvement, new features</p>
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section id="security" className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-green-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                7
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Security & Governance
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-green-700 mb-4">🔐 Multi-Layer Security</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• OpenZeppelin security standards</li>
                    <li>• Reentrancy protection</li>
                    <li>• Access control mechanisms</li>
                    <li>• Emergency pause functionality</li>
                  </ul>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-green-700 mb-4">⚖️ Governance Model</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Owner-controlled admin functions</li>
                    <li>• Transparent commission adjustments</li>
                    <li>• Community feedback integration</li>
                    <li>• Decentralized decision making</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-green-700 mb-4">🛡️ Audit & Testing</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Comprehensive test coverage</li>
                    <li>• Professional security audits</li>
                    <li>• Bug bounty programs</li>
                    <li>• Continuous monitoring</li>
                  </ul>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-green-700 mb-4">🔄 Risk Management</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Automated risk assessments</li>
                    <li>• Campaign failure protocols</li>
                    <li>• Token whitelist management</li>
                    <li>• Emergency response procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section id="roadmap" className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-indigo-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4">
                8
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Roadmap
              </h2>
            </div>

            <div className="space-y-8">
              <div className="bg-white/70 rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
                <div className="flex items-center mb-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">Q4 2025</span>
                  <h3 className="text-xl font-bold text-gray-800">Platform Launch ✅</h3>
                </div>
                <ul className="text-gray-700 space-y-1">
                  <li>• Core crowdfunding functionality</li>
                  <li>• Smart contract deployment</li>
                  <li>• IPFS integration</li>
                  <li>• Basic UI/UX implementation</li>
                </ul>
              </div>

              <div className="bg-white/70 rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">Q1 2026</span>
                  <h3 className="text-xl font-bold text-gray-800">Enhanced Features</h3>
                </div>
                <ul className="text-gray-700 space-y-1">
                  <li>• Advanced analytics dashboard</li>
                  <li>• Mobile app development</li>
                  <li>• Multi-chain support</li>
                  <li>• Social features integration</li>
                </ul>
              </div>

              <div className="bg-white/70 rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center mb-3">
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">Q2 2026</span>
                  <h3 className="text-xl font-bold text-gray-800">Ecosystem Expansion</h3>
                </div>
                <ul className="text-gray-700 space-y-1">
                  <li>• DAO governance implementation</li>
                  <li>• NFT reward system</li>
                  <li>• DeFi yield integration</li>
                  <li>• Partnership network</li>
                </ul>
              </div>

              <div className="bg-white/70 rounded-2xl p-6 shadow-lg border-l-4 border-indigo-500">
                <div className="flex items-center mb-3">
                  <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">Q3 2026</span>
                  <h3 className="text-xl font-bold text-gray-800">Global Scale</h3>
                </div>
                <ul className="text-gray-700 space-y-1">
                  <li>• Enterprise solutions</li>
                  <li>• Regulatory compliance</li>
                  <li>• Institutional partnerships</li>
                  <li>• International expansion</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Crowdfunding?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the decentralized revolution and be part of a transparent, efficient, and secure crowdfunding ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/create-campaign" className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors">
                Launch Your Campaign
              </a>
              <a href="/campaigns/1" className="bg-blue-500/20 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500/30 transition-colors border border-white/20">
                Explore Projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}