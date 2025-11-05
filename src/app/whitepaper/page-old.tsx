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
              structures, and comprehensive campaign lifecycle management - all governed by immutable 
              smart contract logic.
            </p>
          </section>

          {/* Introduction */}
          <section id="introduction">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">2. Introduction</h2>
            <p className="mb-4">
              Traditional crowdfunding platforms suffer from centralization issues including high fees, 
              lack of transparency, potential censorship, and limited global accessibility. AltrSeed 
              addresses these challenges by leveraging blockchain technology to create a truly 
              decentralized fundraising ecosystem.
            </p>
            <p>
              Built on Ethereum with IPFS integration, AltrSeed ensures campaign data immutability, 
              transparent fund tracking, and automated execution of fundraising rules without requiring 
              trust in centralized authorities.
            </p>
          </section>

          {/* Problem Statement */}
          <section id="problem">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">3. Problem Statement</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-2">3.1 Traditional Platform Limitations</h3>
                <ul className="list-disc ml-6 space-y-2">
                  <li>High platform fees (5-8% + payment processing)</li>
                  <li>Geographic restrictions and accessibility barriers</li>
                  <li>Centralized control over fund disbursement</li>
                  <li>Limited transparency in fund management</li>
                  <li>Potential for platform bankruptcy affecting campaigns</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-2">3.2 Donor Protection Issues</h3>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Lack of guaranteed refund mechanisms</li>
                  <li>Limited visibility into actual fund usage</li>
                  <li>No programmable conditions for fund release</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Solution Overview */}
          <section id="solution">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">4. Solution Overview</h2>
            <p className="mb-4">
              AltrSeed provides a comprehensive decentralized crowdfunding solution with the following key features:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-[#1F4E79] mb-2">🔒 Smart Contract Security</h3>
                <p className="text-sm">Automated fund management with built-in security mechanisms and reentrancy protection</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-[#1F4E79] mb-2">💰 Flexible Funding Models</h3>
                <p className="text-sm">Support for both startup and charitable campaigns with different success criteria</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-[#1F4E79] mb-2">🔄 Donor Protection</h3>
                <p className="text-sm">Built-in refund mechanisms and reclaim periods for failed campaigns</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-[#1F4E79] mb-2">🌐 IPFS Integration</h3>
                <p className="text-sm">Decentralized storage for campaign metadata and images via Web3.Storage</p>
              </div>
            </div>
          </section>

          {/* Technical Architecture */}
          <section id="architecture">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">5. Technical Architecture</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-2">5.1 Technology Stack</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Blockchain:</strong> Ethereum (Sepolia testnet)</li>
                  <li><strong>Smart Contracts:</strong> Solidity with OpenZeppelin libraries</li>
                  <li><strong>Frontend:</strong> Next.js 15, React 18, TypeScript</li>
                  <li><strong>Web3 Integration:</strong> Wagmi, Viem, Reown AppKit</li>
                  <li><strong>Storage:</strong> IPFS via Web3.Storage</li>
                  <li><strong>Tokens:</strong> ERC-20 (USDC primary)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-2">5.2 Contract Architecture</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`Contract: Crowdfund
├── Ownable (Access Control)
├── Pausable (Emergency Stop)
├── ReentrancyGuard (Security)
└── Core Functions:
    ├── Campaign Management
    ├── Donation Processing  
    ├── Fund Distribution
    ├── Refund Mechanisms
    └── Token Management`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Smart Contract Functionality */}
          <section id="smart-contract">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">6. Smart Contract Functionality</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-3">6.1 Campaign Lifecycle</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-semibold">Creation Phase</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>• <code>createCampaign()</code> - Deploy new campaign</li>
                        <li>• Set target amount, end time, campaign type</li>
                        <li>• Upload metadata to IPFS</li>
                      </ul>
                    </div>
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-semibold">Active Phase</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>• <code>donate()</code> - Accept donations</li>
                        <li>• <code>updateDataCID()</code> - Update campaign info</li>
                        <li>• <code>cancelCampaign()</code> - Creator cancellation</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                      <h4 className="font-semibold">Completion Phase</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>• <code>withdrawFunds()</code> - Successful campaigns</li>
                        <li>• <code>failCampaignIfUnsuccessful()</code> - Mark failed</li>
                        <li>• <code>initiateClosure()</code> - Start closing process</li>
                      </ul>
                    </div>
                    <div className="p-3 border-l-4 border-red-500 bg-red-50">
                      <h4 className="font-semibold">Refund Phase</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>• <code>claimRefund()</code> - Donor refunds</li>
                        <li>• <code>withdrawFailedCampaignFunds()</code> - Remaining funds</li>
                        <li>• 14-day reclaim period protection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-3">6.2 Campaign States</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 p-2 text-left">State</th>
                        <th className="border border-gray-300 p-2 text-left">Description</th>
                        <th className="border border-gray-300 p-2 text-left">Available Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold text-blue-600">Active (0)</td>
                        <td className="border border-gray-300 p-2">Campaign accepting donations</td>
                        <td className="border border-gray-300 p-2">Donate, Update, Cancel</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold text-green-600">Successful (1)</td>
                        <td className="border border-gray-300 p-2">Target reached, ended</td>
                        <td className="border border-gray-300 p-2">Withdraw Funds</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold text-yellow-600">Closing (2)</td>
                        <td className="border border-gray-300 p-2">Creator initiated closure</td>
                        <td className="border border-gray-300 p-2">Claim Refund (14 days)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold text-red-600">Failed (5)</td>
                        <td className="border border-gray-300 p-2">Time expired, target not met</td>
                        <td className="border border-gray-300 p-2">Claim Refund</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold text-gray-600">Cancelled (3)</td>
                        <td className="border border-gray-300 p-2">Creator cancelled</td>
                        <td className="border border-gray-300 p-2">Claim Refund</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-3">6.3 Security Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Protection Mechanisms</h4>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li>ReentrancyGuard prevents recursive calls</li>
                      <li>Pausable contract for emergency stops</li>
                      <li>Access control for admin functions</li>
                      <li>Validation of all input parameters</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Donor Protections</h4>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li>14-day reclaim period for closures</li>
                      <li>Automatic refunds for failed campaigns</li>
                      <li>Transparent fund tracking</li>
                      <li>Immutable campaign commitments</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Commission Structure */}
          <section id="tokenomics">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">7. Commission Structure</h2>
            <div className="space-y-4">
              <p className="mb-4">
                AltrSeed employs a transparent, programmable commission structure that varies by campaign type and action:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-[#1F4E79] mb-3">📈 Startup Campaigns</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Donation Commission:</strong> Configurable % on each donation</li>
                    <li><strong>Success Commission:</strong> Configurable % on final withdrawal</li>
                    <li><strong>Default:</strong> Competitive rates vs traditional platforms</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-[#1F4E79] mb-3">❤️ Charity Campaigns</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Donation Commission:</strong> Lower rate for social impact</li>
                    <li><strong>Success Commission:</strong> Reduced fees for charities</li>
                    <li><strong>Purpose:</strong> Maximize funds for good causes</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-[#1F4E79] mb-3">🔄 Refund Commission</h3>
                <p className="text-sm mb-2">
                  When donors claim refunds, a small commission (default 20%) is deducted to cover:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>Gas costs for refund processing</li>
                  <li>Platform maintenance and development</li>
                  <li>Incentive for successful campaign completion</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-[#1F4E79] mb-3">⚙️ Dynamic Configuration</h3>
                <p className="text-sm">
                  All commission rates are configurable by contract owner through governance functions:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li><code>setStartupDonationCommissionPercentage()</code></li>
                  <li><code>setCharityDonationCommissionPercentage()</code></li>
                  <li><code>setStartupSuccessCommissionPercentage()</code></li>
                  <li><code>setCharitySuccessCommissionPercentage()</code></li>
                  <li><code>setRefundCommissionPercentage()</code></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Governance & Security */}
          <section id="governance">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">8. Governance & Security</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-3">8.1 Access Control</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">Owner Functions</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Commission rate management</li>
                      <li>• Token whitelist management</li>
                      <li>• Emergency pause/unpause</li>
                      <li>• Commission wallet updates</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">Creator Functions</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Campaign creation</li>
                      <li>• Metadata updates</li>
                      <li>• Fund withdrawal</li>
                      <li>• Campaign cancellation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1F4E79] mb-3">8.2 Security Audits & Best Practices</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-1">✅ Implemented</h4>
                    <ul className="text-xs space-y-1">
                      <li>OpenZeppelin libraries</li>
                      <li>Reentrancy protection</li>
                      <li>Input validation</li>
                      <li>Emergency pause</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-700 mb-1">🔍 Recommended</h4>
                    <ul className="text-xs space-y-1">
                      <li>Third-party audit</li>
                      <li>Bug bounty program</li>
                      <li>Formal verification</li>
                      <li>Stress testing</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-1">🚀 Future</h4>
                    <ul className="text-xs space-y-1">
                      <li>DAO governance</li>
                      <li>Multi-sig treasury</li>
                      <li>Decentralized upgrades</li>
                      <li>Community voting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section id="roadmap">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">9. Roadmap</h2>
            <div className="space-y-6">
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#00ADEF]"></div>
                
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#00ADEF] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-[#1F4E79]">Phase 1: MVP Launch (Q4 2025)</h3>
                      <ul className="text-sm mt-2 space-y-1 text-gray-600">
                        <li>✅ Core smart contract deployment</li>
                        <li>✅ Basic frontend interface</li>
                        <li>✅ IPFS integration</li>
                        <li>🔄 Security audit initiation</li>
                        <li>🔄 Sepolia testnet deployment</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-[#1F4E79]">Phase 2: Enhanced Features (Q1 2026)</h3>
                      <ul className="text-sm mt-2 space-y-1 text-gray-600">
                        <li>🔮 Multi-token support expansion</li>
                        <li>🔮 Advanced campaign analytics</li>
                        <li>🔮 Mobile app development</li>
                        <li>🔮 Milestone-based funding</li>
                        <li>🔮 KYC/AML integration</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-[#1F4E79]">Phase 3: Mainnet & Scaling (Q2 2026)</h3>
                      <ul className="text-sm mt-2 space-y-1 text-gray-600">
                        <li>🔮 Ethereum mainnet deployment</li>
                        <li>🔮 Layer 2 integration (Polygon, Arbitrum)</li>
                        <li>🔮 Cross-chain functionality</li>
                        <li>🔮 Advanced governance implementation</li>
                        <li>🔮 Partnership integrations</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      4
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-[#1F4E79]">Phase 4: Ecosystem Growth (Q3-Q4 2026)</h3>
                      <ul className="text-sm mt-2 space-y-1 text-gray-600">
                        <li>🔮 DAO transition</li>
                        <li>🔮 Native token launch</li>
                        <li>🔮 Liquidity mining programs</li>
                        <li>🔮 Third-party integrations</li>
                        <li>🔮 Global expansion</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-[#1F4E79] mb-2">🎯 Success Metrics</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Adoption:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• 1,000+ campaigns</li>
                      <li>• $1M+ total volume</li>
                      <li>• 10,000+ users</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Technical:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• 99.9% uptime</li>
                      <li>• &lt;$5 avg gas costs</li>
                      <li>• &lt;3s response times</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Community:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Active governance</li>
                      <li>• Developer ecosystem</li>
                      <li>• Educational content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section id="conclusion">
            <h2 className="text-2xl font-bold text-[#1F4E79] mb-4">10. Conclusion</h2>
            <div className="space-y-4">
              <p>
                AltrSeed represents a significant advancement in crowdfunding technology, leveraging blockchain's 
                inherent transparency, security, and decentralization to create a more equitable fundraising ecosystem. 
                By eliminating traditional intermediaries and implementing programmable fund management, we enable 
                direct creator-donor relationships with unprecedented transparency.
              </p>
              
              <p>
                The platform's smart contract architecture ensures that funds are managed according to predetermined 
                rules, protecting both creators and donors while reducing operational costs. Our commission structure 
                is competitive with traditional platforms while providing additional value through blockchain benefits.
              </p>

              <div className="p-6 bg-gradient-to-r from-[#E0F0FF] to-[#F0F8FF] rounded-lg border border-[#00ADEF]">
                <h3 className="font-semibold text-[#1F4E79] mb-3">🌟 Vision Statement</h3>
                <p className="text-gray-700 italic">
                  "To democratize access to funding for innovative projects and meaningful causes worldwide, 
                  creating a transparent, trustless, and inclusive financial ecosystem that empowers creators 
                  and protects supporters through blockchain technology."
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-[#1F4E79] mb-2">📞 Contact Information</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>Website:</strong> altrseed.com</li>
                    <li><strong>Email:</strong> contact@altrseed.com</li>
                    <li><strong>GitHub:</strong> github.com/altrseed</li>
                    <li><strong>Discord:</strong> discord.gg/altrseed</li>
                  </ul>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-[#1F4E79] mb-2">🔗 Technical Resources</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>Smart Contract:</strong> 0x774Ebb...e79d</li>
                    <li><strong>Documentation:</strong> docs.altrseed.com</li>
                    <li><strong>API:</strong> api.altrseed.com</li>
                    <li><strong>Status:</strong> status.altrseed.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2025 AltrSeed. This whitepaper is for informational purposes only and does not constitute financial advice.</p>
        </footer>
      </div>
    </main>
  );
}
