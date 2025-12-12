import React from 'react';
import { HardwareSpecs, NetworkSpecs, ArchitectureExtras } from '../types';
import { Server, Cloud, HardDrive, Cpu, Network, Laptop, Shield, Shuffle, Database, Clock, Lock } from 'lucide-react';

interface Props {
  specs: HardwareSpecs;
  networkSpecs?: NetworkSpecs;
  projectName: string;
  extras?: ArchitectureExtras;
}

export const InfraDiagram: React.FC<Props> = ({ specs, networkSpecs, projectName, extras }) => {
  // Use actual nodes if available from NetworkSpecs, otherwise generate generic count
  const nodes = networkSpecs?.nodes && networkSpecs.nodes.length > 0 
    ? networkSpecs.nodes 
    : Array.from({ length: specs.nodeCount }, (_, i) => ({ name: `node-${i + 1}`, ip: '', role: 'Hybrid' }));

  const displayNodes = nodes.slice(0, 4); // Show max 4 nodes visually to prevent overcrowding
  const remainingNodes = nodes.length - 4;

  const hasExtras = extras && (extras.hasRancher || extras.hasExternalStorage || extras.hasNTP);

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-x-auto print:bg-white print:border-none print:p-0 transition-all duration-500">
      <h3 className="text-center font-bold text-slate-700 mb-6 print:text-black">Infrastructure Topology: {projectName}</h3>
      
      <div className="flex flex-col items-center space-y-6 min-w-[700px] print:min-w-0">
        
        {/* Network Layer (Internet / Cloud) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`bg-sky-100 border-2 ${extras?.hasAirGap ? 'border-red-300 bg-gray-100 text-gray-500' : 'border-sky-300 text-sky-800'} px-8 py-3 rounded-full flex items-center gap-3 shadow-sm print:bg-white print:border-black print:text-black transition-colors duration-300`}>
            {extras?.hasAirGap ? <Lock className="w-6 h-6" /> : <Cloud className="w-6 h-6" />}
            <div className="text-center">
              <div className="font-bold">{extras?.hasAirGap ? 'Air-Gapped / Restricted' : 'Public / Corporate Network'}</div>
              <div className="text-xs opacity-75">{specs.networkSpeedGb}Gbps Uplink • VLAN {networkSpecs?.vlanId || 'Native'}</div>
              {networkSpecs?.managementCidr && <div className="text-xs font-mono">{networkSpecs.managementCidr}</div>}
            </div>
          </div>
          {/* Vertical Line to Switch */}
          <div className="h-8 w-0.5 bg-slate-300 print:bg-black"></div>
        </div>

        {/* Security / Proxy Layer (Optional) */}
        {(extras?.hasFirewall || extras?.hasProxy) && (
             <div className="flex gap-4 relative z-10 animate-fade-in">
                 {extras.hasFirewall && (
                     <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg flex flex-col items-center shadow-sm">
                         <Shield className="w-5 h-5 mb-1" />
                         <span className="text-xs font-bold uppercase">Firewall</span>
                     </div>
                 )}
                 {extras.hasProxy && (
                     <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg flex flex-col items-center shadow-sm">
                         <Shuffle className="w-5 h-5 mb-1" />
                         <span className="text-xs font-bold uppercase">HTTP Proxy</span>
                     </div>
                 )}
                 {/* Connector passing through */}
                 <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300 -z-10"></div>
             </div>
        )}

        {/* Switch / Load Balancer & Connected Services */}
        <div className="flex items-start justify-center gap-8 w-full">
            
            {/* Core Switch */}
            <div className="relative flex flex-col items-center w-full max-w-xl">
                {/* Vertical Connector Entry */}
                {(extras?.hasFirewall || extras?.hasProxy) && <div className="h-6 w-0.5 bg-slate-300"></div>}

                <div className="bg-slate-800 text-slate-200 py-3 px-6 rounded-md text-center text-sm font-mono shadow-md w-full print:bg-white print:text-black print:border print:border-black z-20">
                    <div className="flex items-center justify-center gap-2">
                    <Network className="w-5 h-5" /> Top of Rack Switch / LB
                    {networkSpecs?.gatewayIp && <span className="text-xs opacity-70 ml-2">GW: {networkSpecs.gatewayIp}</span>}
                    </div>
                    {networkSpecs?.clusterVip && (
                        <div className="text-xs text-emerald-400 font-bold mt-1 print:text-black">VIP: {networkSpecs.clusterVip}</div>
                    )}
                </div>
                
                {/* Horizontal Distribution Line to Nodes */}
                <div className="absolute left-[5%] right-[5%] top-full h-6 border-l-2 border-r-2 border-t-2 border-slate-300 rounded-t-sm print:border-black"></div>
                
                {/* Center Line connecting Switch to Horizontal Line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full h-6 w-0.5 bg-slate-300 print:bg-black"></div>
            </div>

            {/* Side Services (Rancher, Storage, etc) */}
            {hasExtras && (
                <div className="hidden lg:flex flex-col gap-3 mt-2 animate-fade-in border-l-2 border-dashed border-slate-300 pl-6">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Connected Services</div>
                    
                    {extras.hasRancher && (
                        <div className="flex items-center gap-2 text-xs bg-white border border-blue-200 text-blue-800 p-2 rounded shadow-sm">
                            <Cloud className="w-4 h-4" /> Upstream Rancher
                        </div>
                    )}
                    
                    {extras.hasExternalStorage && (
                        <div className="flex items-center gap-2 text-xs bg-white border border-purple-200 text-purple-800 p-2 rounded shadow-sm">
                            <Database className="w-4 h-4" /> NFS / S3 Backup
                        </div>
                    )}
                    
                    {extras.hasNTP && (
                        <div className="flex items-center gap-2 text-xs bg-white border border-gray-200 text-gray-700 p-2 rounded shadow-sm">
                            <Clock className="w-4 h-4" /> NTP Server
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Nodes Layer */}
        <div className="flex justify-center gap-4 w-full px-4 pt-4">
            
          {/* Bastion Host (Optional) */}
          {extras?.hasBastion && (
               <div className="relative group mr-4 opacity-90 animate-fade-in">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-8 h-8 w-0.5 bg-slate-300 border-l border-dashed border-slate-400"></div>
                  <div className="bg-gray-100 border-2 border-gray-400 border-dashed rounded-lg p-3 w-32 shadow-sm relative z-10 flex flex-col items-center">
                    <Laptop className="w-6 h-6 text-gray-600 mb-2" />
                    <div className="font-bold text-gray-700 text-xs text-center">Bastion / Admin</div>
                    <div className="text-[10px] text-gray-500">SSH Jump Host</div>
                  </div>
               </div>
          )}  

          {displayNodes.map((node, i) => (
            <div key={i} className="relative group">
              {/* Connector Line */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-8 h-8 w-0.5 bg-slate-300 print:bg-black"></div>
              
              {/* Node Card */}
              <div className="bg-white border-2 border-suse-base rounded-lg p-3 w-40 shadow-sm hover:shadow-md transition-shadow relative z-10 print:border-black print:shadow-none">
                <div className="absolute -top-3 -right-3 bg-suse-dark text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full print:bg-black print:text-white">
                  {i + 1}
                </div>
                <div className="flex justify-center mb-2">
                  <Server className="w-8 h-8 text-suse-base print:text-black" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800 text-sm mb-1 truncate px-1" title={node.name}>{node.name}</div>
                  {node.ip && <div className="text-xs font-mono text-blue-600 mb-2 bg-blue-50 rounded print:text-black print:bg-transparent print:border print:border-gray-200">{node.ip}</div>}
                  
                  <div className="text-[10px] text-gray-500 space-y-1 text-left px-1 print:text-black">
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> {specs.cpuCores} Cores
                    </div>
                    <div className="flex items-center gap-1">
                      <Laptop className="w-3 h-3" /> {specs.ramGb} GB RAM
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> {specs.diskGb}G {specs.diskType}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {remainingNodes > 0 && (
             <div className="relative">
               <div className="absolute left-1/2 -translate-x-1/2 -top-8 h-8 w-0.5 bg-slate-300 print:bg-black"></div>
               <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-3 w-40 h-full flex flex-col items-center justify-center text-slate-500 print:border-black print:text-black">
                 <Server className="w-8 h-8 mb-2 opacity-50" />
                 <span className="font-bold">+{remainingNodes} Nodes</span>
                 <span className="text-xs">Same Specs</span>
               </div>
             </div>
          )}
        </div>

        {/* Storage / Logic Representation */}
        <div className="w-full max-w-2xl mt-4 border-t border-slate-200 pt-4 print:border-black">
           <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-orange-50 p-2 rounded border border-orange-100 print:text-black print:bg-white print:border-black">
              <HardDrive className="w-4 h-4 text-orange-400 print:text-black" />
              <span>
                <strong>Longhorn Storage:</strong> Aggregated Capacity ~{(specs.diskGb * specs.nodeCount).toLocaleString()} GB 
                ({specs.diskType}) across {specs.nodeCount} nodes
              </span>
           </div>
        </div>

      </div>
    </div>
  );
};