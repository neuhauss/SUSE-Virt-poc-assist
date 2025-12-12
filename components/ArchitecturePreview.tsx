import React, { useState } from 'react';
import { HardwareSpecs, POCData, NetworkSpecs, ArchitectureExtras } from '../types';
import { InfraDiagram } from './InfraDiagram';
import { CheckCircle, Sliders, Shield, Shuffle, Database, Cloud, Laptop, Lock, Clock } from 'lucide-react';

interface Props {
  specs: HardwareSpecs;
  pocData: POCData;
  netSpecs: NetworkSpecs;
}

export const ArchitecturePreview: React.FC<Props> = ({ specs, pocData, netSpecs }) => {
  const [extras, setExtras] = useState<ArchitectureExtras>({
    hasFirewall: true,
    hasProxy: false,
    hasAirGap: false,
    hasRancher: false,
    hasExternalStorage: false,
    hasBastion: false,
    hasNTP: true,
  });

  const toggle = (key: keyof ArchitectureExtras) => {
    setExtras(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-suse-dark mb-4 flex items-center gap-2">
          Architecture & Topology Plan
        </h2>
        <p className="text-gray-600 mb-6">
          Customize the infrastructure diagram to match your POC environment reality. 
          Use the controls below to add Enterprise features often found in production scenarios.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Sliders className="w-4 h-4" /> Environment Options
                    </h3>
                    
                    <div className="space-y-2">
                        {/* Firewall Toggle */}
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${extras.hasFirewall ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-100 border-transparent opacity-60'}`}
                          onClick={() => toggle('hasFirewall')}
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <Shield className="w-4 h-4 text-red-500" /> External Firewall
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${extras.hasFirewall ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${extras.hasFirewall ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        {/* Airgap Toggle */}
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${extras.hasAirGap ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-100 border-transparent opacity-60'}`}
                          onClick={() => {
                              // If enabling AirGap, suggest Proxy
                              if (!extras.hasAirGap) setExtras(prev => ({...prev, hasProxy: true})); 
                              toggle('hasAirGap');
                          }}
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <Lock className="w-4 h-4 text-gray-600" /> Air-Gapped / Restricted
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${extras.hasAirGap ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${extras.hasAirGap ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        {/* Proxy Toggle */}
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${extras.hasProxy ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-100 border-transparent opacity-60'}`}
                          onClick={() => toggle('hasProxy')}
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <Shuffle className="w-4 h-4 text-amber-500" /> HTTP Proxy
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${extras.hasProxy ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${extras.hasProxy ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        {/* Rancher Toggle */}
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${extras.hasRancher ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-100 border-transparent opacity-60'}`}
                          onClick={() => toggle('hasRancher')}
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <Cloud className="w-4 h-4 text-blue-500" /> Upstream Rancher
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${extras.hasRancher ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${extras.hasRancher ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        
                         {/* Storage Toggle */}
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${extras.hasExternalStorage ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-100 border-transparent opacity-60'}`}
                          onClick={() => toggle('hasExternalStorage')}
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <Database className="w-4 h-4 text-purple-500" /> Ext. Backup (S3/NFS)
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${extras.hasExternalStorage ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${extras.hasExternalStorage ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                         {/* Bastion Toggle */}
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${extras.hasBastion ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-100 border-transparent opacity-60'}`}
                          onClick={() => toggle('hasBastion')}
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <Laptop className="w-4 h-4 text-gray-700" /> Bastion / Jump Host
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${extras.hasBastion ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${extras.hasBastion ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        {/* NTP Toggle */}
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${extras.hasNTP ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-100 border-transparent opacity-60'}`}
                          onClick={() => toggle('hasNTP')}
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <Clock className="w-4 h-4 text-gray-500" /> Local NTP Server
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${extras.hasNTP ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${extras.hasNTP ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                    </div>
                    
                    {extras.hasAirGap && (
                        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <strong>Note:</strong> Air-gapped environments require a local registry (for images) and HTTP Proxy settings during installation (Section 5 of PDF).
                        </div>
                    )}
                </div>
            </div>

            {/* Diagram Area */}
            <div className="lg:col-span-3 flex justify-center py-6 bg-slate-50 rounded-xl border border-dashed border-gray-300 relative">
                 <div className="absolute top-2 right-2 text-xs text-gray-400 italic">Live Preview</div>
                 <InfraDiagram specs={specs} projectName={pocData.projectName} networkSpecs={netSpecs} extras={extras} />
            </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 flex items-start gap-3 mt-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
                <strong>Design Validated:</strong> The topology above supports SUSE Virtualization v1.6.0 requirements, 
                including High Availability (if 3+ nodes) and Dedicated Management Network VLANs. 
                {extras.hasProxy && " Proxy configuration fields will be highlighted in the Cloud-Init generator."}
            </div>
        </div>
      </div>
    </div>
  );
};