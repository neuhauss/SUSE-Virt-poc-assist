import React, { useEffect, useState } from 'react';
import { NetworkSpecs, ValidationStatus } from '../types';
import { Network, Router, Globe, AlertTriangle, CheckCircle2, ShieldCheck, Eye, EyeOff, Server, HardDrive, Lock, RefreshCw, XCircle, ExternalLink, Trash2, Plus } from 'lucide-react';

interface Props {
  specs: NetworkSpecs;
  updateSpecs: (specs: Partial<NetworkSpecs>) => void;
  onValidationChange: (status: ValidationStatus) => void;
}

const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const CIDR_REGEX = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))$/;

// Ports extracted from SUSE Virtualization POC Guide v1.4.x (Pages 9-11)
const REQUIRED_PORTS = [
    { port: "22", proto: "TCP", desc: "SSH Access (sshd)" },
    { port: "80", proto: "TCP", desc: "Nginx (HTTP)" },
    { port: "443", proto: "TCP", desc: "HTTPS / Rancher Integration" },
    { port: "2379-2381", proto: "TCP", desc: "Etcd (Client, Peer, Health)" },
    { port: "6443", proto: "TCP", desc: "Kubernetes API" },
    { port: "6444", proto: "TCP", desc: "RKE2 Agent" },
    { port: "8472", proto: "UDP", desc: "Canal CNI (VxLAN)" },
    { port: "9345", proto: "TCP", desc: "Rancher Agent / K8s API" },
    { port: "10250", proto: "TCP", desc: "Kubelet" },
    { port: "10251-10252", proto: "TCP", desc: "Kube Scheduler/Controller Health" },
    { port: "10256", proto: "TCP", desc: "Kube-proxy Health" },
    { port: "10257-10259", proto: "TCP", desc: "Kube Controller/Scheduler Secure" },
    { port: "30000-32767", proto: "TCP", desc: "NodePort Range" },
    { port: "2112", proto: "TCP", desc: "Kube-vip" },
    { port: "3260", proto: "TCP", desc: "iscsid (Longhorn)" },
    { port: "6060", proto: "TCP", desc: "Node-disk-manager" },
    { port: "9091, 9099", proto: "TCP", desc: "Canal/Calico Components" },
    { port: "8181, 8444", proto: "TCP", desc: "Nginx Ingress Controller" },
    { port: "10245", proto: "TCP", desc: "Nginx Ingress Controller" },
    { port: "9796", proto: "TCP", desc: "Node Exporter" },
    { port: "10010", proto: "TCP", desc: "Containerd" },
    { port: "68", proto: "UDP", desc: "Wicked (DHCP)" },
];

const OUTBOUND_CHECKS = [
    { id: 'suse', label: "SUSE Registry", url: "https://registry.suse.com", display: "registry.suse.com" },
    { id: 'docker', label: "Docker Hub", url: "https://hub.docker.com", display: "docker.io" },
    { id: 'google', label: "Internet Check", url: "https://www.google.com", display: "Google (Connectivity)" },
];

export const NetworkValidation: React.FC<Props> = ({ specs, updateSpecs, onValidationChange }) => {
  const [validation, setValidation] = useState<ValidationStatus>({ isValid: false, messages: [] });
  const [showTopology, setShowTopology] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'firewall'>('config');
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [urlStatus, setUrlStatus] = useState<Record<string, 'idle' | 'checking' | 'success' | 'error'>>({});

  // Update specific node in the array
  const handleNodeUpdate = (index: number, field: 'name' | 'ip', value: string) => {
    const newNodes = [...specs.nodes];
    newNodes[index] = { ...newNodes[index], [field]: value };
    updateSpecs({ nodes: newNodes });
  };

  const addNode = () => {
    const newNodes = [...specs.nodes, {
        name: `node-${specs.nodes.length + 1}`,
        ip: '',
        role: 'Hybrid' as const
    }];
    updateSpecs({ nodes: newNodes });
  };

  const removeNode = (index: number) => {
    const newNodes = [...specs.nodes];
    newNodes.splice(index, 1);
    updateSpecs({ nodes: newNodes });
  };

  const checkConnectivity = async (id: string, url: string) => {
    setUrlStatus(prev => ({ ...prev, [id]: 'checking' }));
    try {
        // Using no-cors to permit opaque responses from domains that don't enable CORS.
        // This confirms DNS resolution and TCP connection, which is sufficient for "reachability".
        await fetch(url, { mode: 'no-cors', method: 'HEAD', cache: 'no-cache' });
        
        // Add artificial delay for UX
        setTimeout(() => {
           setUrlStatus(prev => ({ ...prev, [id]: 'success' }));
        }, 500);
    } catch (error) {
        setUrlStatus(prev => ({ ...prev, [id]: 'error' }));
    }
  };

  const checkAllUrls = () => {
      OUTBOUND_CHECKS.forEach(check => checkConnectivity(check.id, check.url));
  };

  useEffect(() => {
    const messages: string[] = [];
    let isValid = true;

    // Validate CIDR
    if (!specs.managementCidr) {
      messages.push("Management CIDR is required.");
      isValid = false;
    } else if (!CIDR_REGEX.test(specs.managementCidr)) {
      messages.push("Invalid CIDR format (e.g., 192.168.1.0/24).");
      isValid = false;
    }

    // Validate Gateway
    if (!specs.gatewayIp) {
      messages.push("Gateway IP is required.");
      isValid = false;
    } else if (!IP_REGEX.test(specs.gatewayIp)) {
      messages.push("Invalid Gateway IP format.");
      isValid = false;
    }

    // Validate VIP
    if (!specs.clusterVip) {
      messages.push("Cluster VIP is required for HA.");
      isValid = false;
    } else if (!IP_REGEX.test(specs.clusterVip)) {
      messages.push("Invalid VIP format.");
      isValid = false;
    } else if (specs.clusterVip === specs.gatewayIp) {
      messages.push("Cluster VIP cannot be the same as Gateway IP.");
      isValid = false;
    }

    // Validate Node IPs
    const usedIps = new Set<string>();
    if (specs.gatewayIp) usedIps.add(specs.gatewayIp);
    if (specs.clusterVip) usedIps.add(specs.clusterVip);

    specs.nodes.forEach((node, idx) => {
      if (!node.ip) {
        messages.push(`Node ${idx + 1} (${node.name}) IP is required.`);
        isValid = false;
      } else if (!IP_REGEX.test(node.ip)) {
        messages.push(`Node ${idx + 1} IP format is invalid.`);
        isValid = false;
      } else {
        if (usedIps.has(node.ip)) {
          messages.push(`Node ${idx + 1} IP (${node.ip}) conflicts with another IP.`);
          isValid = false;
        }
        usedIps.add(node.ip);
      }
    });

    // Validate DNS
    if (!specs.dnsServers) {
      messages.push("DNS Server is required.");
      isValid = false;
    }

    setValidation({ isValid, messages });
    onValidationChange({ isValid, messages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs]);

  const inputClasses = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-suse-base focus:border-transparent placeholder-gray-400 shadow-sm transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <div>
               <h2 className="text-2xl font-bold text-suse-dark flex items-center gap-2">
                 <Network className="w-6 h-6 text-suse-base" /> Network Configuration
               </h2>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
               <button onClick={() => setActiveTab('config')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'config' ? 'bg-white text-suse-dark shadow-sm' : 'text-gray-500'}`}>IP & Topology</button>
               <button onClick={() => setActiveTab('firewall')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'firewall' ? 'bg-white text-suse-dark shadow-sm' : 'text-gray-500'}`}>Ports & URLs</button>
            </div>
        </div>

        {activeTab === 'config' && (
          <>
            <p className="text-gray-600 mb-6">
              Define the network parameters for the cluster and assign static IPs to each node.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Subnet */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                 <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-500"/> Management Network CIDR
                 </label>
                 <input 
                   type="text"
                   placeholder="e.g. 192.168.10.0/24"
                   value={specs.managementCidr}
                   onChange={(e) => updateSpecs({ managementCidr: e.target.value })}
                   className={inputClasses}
                 />
                 <p className="text-xs text-gray-500 mt-2">The subnet used for node management.</p>
              </div>

              {/* VLAN */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                 <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-500"/> VLAN ID (Optional)
                 </label>
                 <input 
                   type="text"
                   placeholder="e.g. 100"
                   value={specs.vlanId}
                   onChange={(e) => updateSpecs({ vlanId: e.target.value })}
                   className={inputClasses}
                 />
                 <p className="text-xs text-gray-500 mt-2">Leave empty for untagged access.</p>
              </div>

              {/* Gateway */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                 <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Router className="w-4 h-4 text-gray-500"/> Gateway IP
                 </label>
                 <input 
                   type="text"
                   placeholder="e.g. 192.168.10.1"
                   value={specs.gatewayIp}
                   onChange={(e) => updateSpecs({ gatewayIp: e.target.value })}
                   className={inputClasses}
                 />
              </div>

              {/* VIP */}
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                 <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-suse-accent"/> Cluster Virtual IP (VIP)
                 </label>
                 <input 
                   type="text"
                   placeholder="e.g. 192.168.10.10"
                   value={specs.clusterVip}
                   onChange={(e) => updateSpecs({ clusterVip: e.target.value })}
                   className={inputClasses}
                 />
                 <p className="text-xs text-emerald-800 mt-2">Must be an available IP in the subnet.</p>
              </div>
            </div>

            {/* Node Configuration Table */}
            <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-700 text-sm">Node Network Configuration</h3>
                    </div>
                    <div className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {specs.nodes.length} Nodes
                    </div>
                </div>
                <div className="p-5 bg-white">
                    <div className="grid grid-cols-12 gap-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-4">Hostname</div>
                        <div className="col-span-6">IP Address</div>
                        <div className="col-span-1"></div>
                    </div>
                    {specs.nodes.map((node, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 mb-3 items-center">
                            <div className="col-span-1 text-gray-400 font-bold text-sm text-center bg-gray-50 py-2 rounded">{idx + 1}</div>
                            <div className="col-span-4">
                                <input 
                                    type="text"
                                    value={node.name}
                                    onChange={(e) => handleNodeUpdate(idx, 'name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-suse-base focus:border-transparent placeholder-gray-400"
                                    placeholder={`e.g. node-${idx+1}`}
                                />
                            </div>
                            <div className="col-span-6">
                                <input 
                                    type="text"
                                    value={node.ip}
                                    onChange={(e) => handleNodeUpdate(idx, 'ip', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-suse-base focus:border-transparent placeholder-gray-400 font-mono"
                                    placeholder="e.g. 192.168.10.x"
                                />
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <button 
                                    onClick={() => removeNode(idx)}
                                    className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors"
                                    title="Remove Node"
                                    disabled={specs.nodes.length <= 1}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={addNode}
                        className="mt-4 flex items-center gap-2 text-xs font-bold text-suse-base hover:text-emerald-700 bg-white border border-suse-base/30 hover:border-suse-base px-4 py-2 rounded-lg transition-all shadow-sm w-full justify-center border-dashed"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Node
                    </button>
                </div>
            </div>

            {/* DNS */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500"/> DNS Servers
                </label>
                <input 
                type="text"
                placeholder="e.g. 8.8.8.8, 1.1.1.1"
                value={specs.dnsServers}
                onChange={(e) => updateSpecs({ dnsServers: e.target.value })}
                className={inputClasses}
                />
            </div>

            {/* Visual Topology Preview Toggle */}
            <div className="mb-8">
               <button 
                 onClick={() => setShowTopology(!showTopology)}
                 className="flex items-center gap-2 text-sm font-semibold text-suse-base hover:text-emerald-700 transition-colors focus:outline-none"
               >
                 {showTopology ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 {showTopology ? 'Hide Network Topology Map' : 'Show Network Topology Map'}
               </button>
               
               {showTopology && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mt-4 animate-fade-in relative overflow-hidden">
                    <div className="flex flex-col items-center w-full max-w-4xl mx-auto z-10 relative">
                      
                      {/* Level 1: Internet */}
                      <div 
                        className="flex flex-col items-center group cursor-default"
                        onMouseEnter={() => setHoveredElement('internet')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <div className={`p-3 rounded-full border-2 transition-colors duration-300 ${hoveredElement ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-300 bg-gray-100 text-gray-500'}`}>
                          <Globe className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Internet</span>
                      </div>

                      {/* Connection: Internet -> Gateway */}
                      <div className={`h-8 w-0.5 transition-colors duration-300 ${hoveredElement ? 'bg-blue-400' : 'bg-gray-300'}`}></div>

                      {/* Level 2: Gateway */}
                      <div 
                        className="relative z-20 flex flex-col items-center group cursor-pointer"
                        onMouseEnter={() => setHoveredElement('gateway')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <div className={`p-4 rounded-xl border-2 shadow-sm transition-all duration-300 bg-white ${hoveredElement === 'gateway' || hoveredElement === 'internet' ? 'border-blue-500 shadow-blue-100 ring-2 ring-blue-100' : 'border-gray-300'}`}>
                           <Router className={`w-8 h-8 ${hoveredElement === 'gateway' || hoveredElement === 'internet' ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap hidden group-hover:block z-30 animate-fade-in">
                           <div className="text-xs font-bold text-gray-500 uppercase">Gateway IP</div>
                           <div className="font-mono text-sm text-blue-600">{specs.gatewayIp || 'Not Configured'}</div>
                        </div>
                      </div>

                      {/* Connection: Gateway -> Switch */}
                      <div className={`h-8 w-0.5 transition-colors duration-300 ${hoveredElement ? 'bg-blue-400' : 'bg-gray-300'}`}></div>

                      {/* Level 3: Network Bus / Switch */}
                      <div 
                        className="relative w-full flex flex-col items-center"
                        onMouseEnter={() => setHoveredElement('network')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <div className="relative w-full h-16 flex items-center justify-center">
                            {/* The Bus Line - spans width */}
                            <div className={`absolute left-4 right-4 h-2 rounded-full transition-colors duration-300 ${hoveredElement ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
                            
                            {/* Switch Label - Centered */}
                            <div className={`relative z-10 px-6 py-2 rounded-full border-2 bg-white shadow-sm transition-all duration-300 ${hoveredElement ? 'border-blue-400 text-blue-700' : 'border-gray-300 text-gray-600'}`}>
                                <div className="flex items-center gap-2">
                                  <Network className="w-5 h-5" />
                                  <div className="text-sm font-bold">{specs.managementCidr || 'Network CIDR'}</div>
                                  {specs.vlanId && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold border border-orange-200">VLAN {specs.vlanId}</span>}
                                </div>
                            </div>

                            {/* VIP Attachment - Floating on the bus */}
                            <div 
                               className="absolute top-1/2 right-[15%] -translate-y-1/2 translate-x-1/2 z-20 group"
                               onMouseEnter={(e) => { e.stopPropagation(); setHoveredElement('vip'); }}
                               onMouseLeave={(e) => { e.stopPropagation(); setHoveredElement(null); }}
                            >
                               <div className={`w-12 h-12 rounded-full border-4 shadow-sm flex items-center justify-center transition-all duration-300 bg-white ${hoveredElement === 'vip' ? 'border-emerald-400 scale-110' : 'border-emerald-200'}`}>
                                  <ShieldCheck className={`w-6 h-6 ${hoveredElement === 'vip' ? 'text-emerald-600' : 'text-emerald-400'}`} />
                               </div>
                               {/* Tooltip */}
                               <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-lg border border-emerald-100 shadow-md whitespace-nowrap z-30 hidden group-hover:block">
                                  <div className="text-xs font-bold text-gray-500 uppercase">Cluster VIP</div>
                                  <div className="font-mono text-sm text-emerald-600">{specs.clusterVip || 'Pending'}</div>
                               </div>
                            </div>
                        </div>
                      </div>

                      {/* Connection Lines from Bus to Nodes */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full px-4 h-8 -mt-8">
                          {specs.nodes.slice(0, 4).map((_, i) => (
                              <div key={i} className="flex justify-center h-full pt-8">
                                  <div className={`w-0.5 h-full transition-colors duration-300 ${hoveredElement === `node-${i}` ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                              </div>
                          ))}
                          {specs.nodes.length > 4 && (
                               <div className="flex justify-center h-full pt-8">
                                  <div className="w-0.5 h-full bg-gray-300"></div>
                               </div>
                          )}
                      </div>

                      {/* Level 4: Nodes */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full px-4">
                         {specs.nodes.slice(0, 4).map((node, i) => (
                           <div 
                             key={i} 
                             className="flex flex-col items-center group relative"
                             onMouseEnter={() => setHoveredElement(`node-${i}`)}
                             onMouseLeave={() => setHoveredElement(null)}
                           >
                              <div className={`w-full bg-white p-3 rounded-xl border-2 shadow-sm transition-all duration-300 hover:-translate-y-1 relative z-10 ${hoveredElement === `node-${i}` ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}>
                                 <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                       <Server className={`w-5 h-5 ${hoveredElement === `node-${i}` ? 'text-blue-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="overflow-hidden">
                                       <div className="font-bold text-sm text-gray-800 truncate" title={node.name}>{node.name}</div>
                                       <div className="text-[10px] text-gray-500 uppercase font-semibold">{node.role}</div>
                                    </div>
                                 </div>
                                 <div className={`font-mono text-xs px-2 py-1 rounded text-center transition-colors ${node.ip ? (hoveredElement === `node-${i}` ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600') : 'bg-red-50 text-red-400'}`}>
                                    {node.ip || 'No IP'}
                                 </div>
                              </div>
                           </div>
                         ))}
                         
                         {/* Extra Nodes Indicator */}
                         {specs.nodes.length > 4 && (
                             <div className="flex flex-col items-center justify-center relative">
                                 <div className="w-full h-full min-h-[80px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                    <span className="font-bold text-lg">+{specs.nodes.length - 4}</span>
                                    <span className="text-xs">More Nodes</span>
                                 </div>
                             </div>
                         )}
                      </div>

                    </div>
                    
                    <div className="text-center mt-8 text-xs text-gray-400">
                       Interactive Topology Map • Hover over elements to trace connections
                    </div>
                  </div>
               )}
            </div>

            {/* Validation Feedback */}
            <div className={`p-4 rounded-md ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <h3 className="font-bold flex items-center gap-2 mb-2">
                {validation.isValid ? (
                  <span className="text-green-700 flex items-center gap-2"><CheckCircle2/> Configuration Valid</span>
                ) : (
                  <span className="text-orange-700 flex items-center gap-2"><AlertTriangle/> Configuration Issues</span>
                )}
              </h3>
              <ul className="space-y-1 ml-6 list-disc text-sm">
                {validation.messages.map((msg, idx) => (
                  <li key={idx} className="text-gray-700">
                    {msg}
                  </li>
                ))}
                {validation.messages.length === 0 && <li className="text-green-700">Network settings look correct.</li>}
              </ul>
            </div>
          </>
        )}

        {activeTab === 'firewall' && (
          <div className="animate-fade-in space-y-6">
             <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                <p className="text-sm text-amber-900">
                   Ensure your physical firewalls and upstream routers permit the following traffic for a successful deployment.
                   Reference: SUSE Virtualization POC Guide (v1.4.x) Pages 9-11.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-suse-base"/> Required Inbound Ports
                   </h3>
                   <div className="bg-white border rounded-lg overflow-hidden shadow-sm max-h-[500px] overflow-y-auto">
                      <table className="w-full text-xs text-left">
                         <thead className="bg-gray-100 text-gray-600 uppercase font-semibold sticky top-0">
                            <tr>
                               <th className="px-3 py-2">Port</th>
                               <th className="px-3 py-2">Protocol</th>
                               <th className="px-3 py-2">Purpose</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {REQUIRED_PORTS.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 font-mono font-bold text-gray-800">{p.port}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.proto === 'TCP' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {p.proto}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-600">{p.desc}</td>
                                </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                <div className="md:col-span-2">
                   <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-suse-base"/> Required Outbound URLs
                      </h3>
                      <button 
                        onClick={checkAllUrls}
                        className="text-xs flex items-center gap-1 text-suse-base font-bold hover:text-emerald-700 transition-colors"
                      >
                         <RefreshCw className="w-3 h-3"/> Check Connectivity
                      </button>
                   </div>
                   
                   <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                      <div className="p-4 space-y-3">
                        {OUTBOUND_CHECKS.map((item) => (
                            <div key={item.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                <div className="flex items-start gap-3">
                                   <div className="mt-1">
                                      {urlStatus[item.id] === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                      {urlStatus[item.id] === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                      {urlStatus[item.id] === 'checking' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                                      {!urlStatus[item.id] && <Globe className="w-5 h-5 text-gray-300" />}
                                   </div>
                                   <div>
                                       <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                                       <div className="text-xs text-gray-500 font-mono">{item.display}</div>
                                   </div>
                                </div>
                                <button 
                                  onClick={() => checkConnectivity(item.id, item.url)}
                                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-600 rounded border border-gray-200 transition-colors"
                                >
                                  {urlStatus[item.id] === 'checking' ? 'Checking...' : 'Check'}
                                </button>
                            </div>
                        ))}
                        
                        {/* Static / Manual entries */}
                        <div className="flex items-center justify-between pt-2">
                             <div className="flex items-start gap-3">
                                <div className="mt-1"><Globe className="w-5 h-5 text-gray-300" /></div>
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">Google DNS (UDP)</div>
                                    <div className="text-xs text-gray-500 font-mono">8.8.8.8:53</div>
                                </div>
                             </div>
                             <div className="text-xs text-gray-400 italic px-3">Manual Check Only</div>
                        </div>
                         <div className="flex items-center justify-between pt-2">
                             <div className="flex items-start gap-3">
                                <div className="mt-1"><Globe className="w-5 h-5 text-gray-300" /></div>
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">Rancher Manager</div>
                                    <div className="text-xs text-gray-500 font-mono">Your Rancher URL:443</div>
                                </div>
                             </div>
                             <div className="text-xs text-gray-400 italic px-3">Manual Check Only</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-500 border-t border-gray-100">
                         <strong>Note:</strong> Browser-based checks confirm HTTP reachability. Some corporate firewalls may block these checks due to CORS, even if the server itself is reachable from the CLI.
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};