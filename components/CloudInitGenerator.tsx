import React, { useState, useRef } from 'react';
import { CloudInitConfig, MountPoint, NetworkInterface } from '../types';
import { FileCode, Plus, Trash2, Download, Copy, Terminal, FileText, User, Save, Key, Upload, HardDrive, Network, Globe, Info, Settings } from 'lucide-react';

interface Props {
  config: CloudInitConfig;
  updateConfig: (config: CloudInitConfig) => void;
  onComplete: () => void;
}

const YamlPreview: React.FC<{ code: string }> = ({ code }) => {
  const TOP_LEVEL_KEYS = [
      'users', 'write_files', 'runcmd', 'packages', 'hostname', 'timezone', 
      'locale', 'disk_setup', 'fs_setup', 'mounts', 'network', 'ssh_authorized_keys', 
      'password', 'chpasswd', 'ssh_pwauth', 'bootcmd', 'final_message', 'power_state'
  ];

  return (
    <div className="font-mono text-xs leading-6 overflow-x-auto whitespace-pre font-medium text-gray-300">
      {code.split('\n').map((line, i) => {
        const lineNum = (
          <span className="inline-block w-8 text-right pr-3 mr-3 text-gray-700 select-none border-r border-gray-800 bg-gray-900/50">
            {i + 1}
          </span>
        );

        const trimmed = line.trim();

        if (trimmed.length === 0) {
           return <div key={i}>{lineNum}</div>;
        }

        // Comment
        if (trimmed.startsWith('#')) {
          return (
            <div key={i}>
              {lineNum}
              <span className="text-gray-500 italic">{line}</span>
            </div>
          );
        }

        // Attempt to identify indentation
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';
        const content = line.substring(indent.length);

        // Key-Value pair:  key: value (or just key:)
        const keyValMatch = content.match(/^([\w_-]+):(?:\s+(.*))?$/);
        
        if (keyValMatch) {
            const key = keyValMatch[1];
            const value = keyValMatch[2];
            
            const isTopLevel = indent.length === 0;
            const isKnownKey = TOP_LEVEL_KEYS.includes(key);
            
            let keyClass = "text-sky-300"; // Default key color
            if (isTopLevel) {
                 keyClass = isKnownKey ? "text-pink-400 font-bold" : "text-pink-400";
            }
            
            // Value highlighting
            let valueSpan = null;
            if (value) {
                if (value === '|') {
                    valueSpan = <span className="text-yellow-500 font-bold pl-1">|</span>;
                } else if (['true', 'false', 'yes', 'no', 'on', 'off'].includes(value.toLowerCase())) {
                    valueSpan = <span className="text-orange-400 font-bold pl-1">{value}</span>;
                } else if (!isNaN(Number(value))) {
                    valueSpan = <span className="text-purple-400 pl-1">{value}</span>;
                } else if (value.startsWith('[') && value.endsWith(']')) {
                     // Simple array highlight
                     valueSpan = <span className="text-cyan-300 pl-1">{value}</span>;
                } else {
                     // String
                     valueSpan = <span className="text-emerald-300 pl-1">{value}</span>;
                }
            }

            return (
                <div key={i}>
                    {lineNum}
                    <span>{indent}</span>
                    <span className={keyClass}>{key}</span>
                    <span className="text-gray-500">:</span>
                    {valueSpan}
                </div>
            );
        }

        // List item: - value
        const listMatch = content.match(/^- (.*)$/);
        if (listMatch) {
            const listContent = listMatch[1];
            
            // Check if list item has a key-value pair inside (e.g., - name: foo)
            const listKeyValMatch = listContent.match(/^([\w_-]+):\s+(.*)$/);
            
            if (listKeyValMatch) {
                 const lKey = listKeyValMatch[1];
                 const lVal = listKeyValMatch[2];
                 
                 let valSpan = <span className="text-emerald-300 pl-1">{lVal}</span>;
                 if (['true', 'false'].includes(lVal.toLowerCase())) valSpan = <span className="text-orange-400 pl-1">{lVal}</span>;
                 else if (!isNaN(Number(lVal))) valSpan = <span className="text-purple-400 pl-1">{lVal}</span>;
                 else if (lVal.startsWith('[') && lVal.endsWith(']')) valSpan = <span className="text-cyan-300 pl-1">{lVal}</span>;

                 return (
                    <div key={i}>
                        {lineNum}
                        <span>{indent}</span>
                        <span className="text-yellow-500">- </span>
                        <span className="text-sky-300">{lKey}</span>
                        <span className="text-gray-500">:</span>
                        {valSpan}
                    </div>
                 );
            }

            return (
                <div key={i}>
                    {lineNum}
                    <span>{indent}</span>
                    <span className="text-yellow-500">- </span>
                    <span className="text-emerald-300">{listContent}</span>
                </div>
            );
        }

        // Default fallback (likely string content from multiline string)
        return (
            <div key={i}>
                {lineNum}
                <span className="text-gray-400">{line}</span>
            </div>
        );
      })}
    </div>
  );
};

export const CloudInitGenerator: React.FC<Props> = ({ config, updateConfig, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'storage' | 'network' | 'files'>('users');
  const [newCmd, setNewCmd] = useState('');
  const [newPkg, setNewPkg] = useState('');
  const [newSshKey, setNewSshKey] = useState('');
  const [newFile, setNewFile] = useState({ path: '', content: '', permissions: '0644' });
  
  // Storage State
  const [newMount, setNewMount] = useState<MountPoint>({ device: '', mountPath: '', fsType: 'ext4' });

  // Network State
  const [newNet, setNewNet] = useState<NetworkInterface>({ name: '', dhcp: true, ip: '', gateway: '', nameservers: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddItem = (field: keyof CloudInitConfig, value: any) => {
    if (!value) return;
    updateConfig({
      ...config,
      [field]: [...(config[field] as any[]), value]
    });
  };

  const handleRemoveItem = (field: keyof CloudInitConfig, index: number) => {
    const newArray = [...(config[field] as any[])];
    newArray.splice(index, 1);
    updateConfig({ ...config, [field]: newArray });
  };

  const handleSshFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewSshKey(event.target.result.toString().trim());
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const generateYaml = () => {
    let yaml = `#cloud-config
hostname: ${config.hostnamePattern || 'suse-node'}
timezone: ${config.timezone}
locale: ${config.locale || 'en_US.UTF-8'}
`;

    // Users
    yaml += `
users:
  - name: ${config.user}
    sudo: ALL=(ALL) NOPASSWD:ALL
    groups: users, admin
    shell: /bin/bash
${config.sshKeys.length > 0 ? '    ssh_authorized_keys:\n' + config.sshKeys.map(k => `      - ${k}`).join('\n') : ''}
${config.password ? `    password: ${config.password}\n    lock_passwd: false` : ''}
`;

    // Network (Netplan / NetworkManager V2)
    if (config.networkInterfaces && config.networkInterfaces.length > 0) {
        yaml += `
network:
  version: 2
  ethernets:
`;
        config.networkInterfaces.forEach(net => {
            yaml += `    ${net.name}:\n`;
            yaml += `      dhcp4: ${net.dhcp}\n`;
            if (!net.dhcp && net.ip) {
                yaml += `      addresses:\n        - ${net.ip}\n`;
                if (net.gateway) yaml += `      gateway4: ${net.gateway}\n`;
                if (net.nameservers) {
                    const nsList = net.nameservers.split(',').map(n => n.trim()).filter(n => n).join(', ');
                    if(nsList) {
                        yaml += `      nameservers:\n        addresses: [${nsList}]\n`;
                    }
                }
            }
        });
    }

    // Storage (Disk Setup & FS Setup)
    if (config.mounts && config.mounts.length > 0) {
        yaml += `
disk_setup:
`;
        const devices = Array.from(new Set(config.mounts.map(m => m.device)));
        devices.forEach(dev => {
            yaml += `  ${dev}:\n    table_type: gpt\n    layout: true\n    overwrite: false\n`;
        });

        yaml += `
fs_setup:
`;
        config.mounts.forEach(m => {
            yaml += `  - label: data_${m.device.replace('/dev/', '')}\n    filesystem: ${m.fsType}\n    device: ${m.device}\n    partition: auto\n`;
        });

        yaml += `
mounts:
`;
        config.mounts.forEach(m => {
             // Basic assumption: partition 1 is created by layout: true
             // If device is a partition (e.g. /dev/vdb1), just use it directly, but disk_setup handles raw disks
             const part = m.device.match(/[0-9]$/) ? m.device : `${m.device}1`;
             yaml += `  - [ ${part}, ${m.mountPath} ]\n`;
        });
    }

    // Packages
    if (config.packages.length > 0) {
        yaml += `
packages:
${config.packages.map(p => `  - ${p}`).join('\n')}
`;
    }

    // Write Files
    if (config.writeFiles.length > 0) {
        yaml += `
write_files:
${config.writeFiles.map(f => `  - path: ${f.path}\n    permissions: '${f.permissions}'\n    content: |\n${f.content.split('\n').map(l => `      ${l}`).join('\n')}`).join('\n')}
`;
    }

    // Run Cmd
    if (config.runCmds.length > 0) {
        yaml += `
runcmd:
${config.runCmds.map(c => `  - ${c}`).join('\n')}
`;
    }

    return yaml;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateYaml());
    alert('YAML copied to clipboard!');
  };

  const downloadYaml = () => {
    const element = document.createElement("a");
    const file = new Blob([generateYaml()], {type: 'text/yaml'});
    element.href = URL.createObjectURL(file);
    element.download = "user-data.yaml";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const tabs = [
      { id: 'users', label: 'Users & SSH', icon: User },
      { id: 'system', label: 'System', icon: Globe },
      { id: 'storage', label: 'Storage', icon: HardDrive },
      { id: 'network', label: 'Network', icon: Network },
      { id: 'files', label: 'Files & Cmds', icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-suse-dark flex items-center gap-2">
                <FileCode className="w-6 h-6 text-suse-base" />
                Advanced Cloud-Init Generator
              </h2>
              <p className="text-gray-600 mt-1">
                Configure user data to bootstrap your Virtual Machines or bare metal nodes automatically.
              </p>
            </div>
            <div className="flex gap-2">
               <button onClick={downloadYaml} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm font-bold">
                 <Download className="w-4 h-4"/> Download
               </button>
               <button onClick={onComplete} className="flex items-center gap-2 px-3 py-2 bg-suse-base text-white rounded hover:bg-emerald-600 text-sm font-bold">
                 <Save className="w-4 h-4"/> Save & Exit
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Form */}
            <div>
               <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                  {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-b-2 border-suse-base text-suse-base' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Icon className="w-4 h-4"/> {tab.label}
                        </button>
                      )
                  })}
               </div>

               <div className="space-y-4 h-[500px] overflow-y-auto pr-2">
                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <div className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">Default User</label>
                         <input 
                           value={config.user} 
                           onChange={(e) => updateConfig({...config, user: e.target.value})}
                           className="w-full px-3 py-2 border rounded-md" 
                           placeholder="e.g. opensuse"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">Password (Optional)</label>
                         <input 
                           type="password"
                           value={config.password || ''} 
                           onChange={(e) => updateConfig({...config, password: e.target.value})}
                           className="w-full px-3 py-2 border rounded-md" 
                           placeholder="Leave empty to force SSH key login"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">SSH Authorized Keys</label>
                         <div className="flex flex-col gap-2 mb-2">
                            <textarea 
                              value={newSshKey} 
                              onChange={(e) => setNewSshKey(e.target.value)}
                              placeholder="Paste SSH Public Key (ssh-rsa ...)"
                              className="w-full px-3 py-2 border rounded-md font-mono text-xs" 
                              rows={2}
                            />
                            
                            {/* Hidden File Input */}
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleSshFileUpload} 
                              className="hidden" 
                              accept=".pub,text/plain"
                            />

                            <div className="flex justify-between items-center mt-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs flex items-center gap-1 text-gray-600 hover:text-suse-base font-semibold"
                                >
                                    <Upload className="w-3 h-3"/> Upload .pub File
                                </button>

                                <button 
                                    onClick={() => { handleAddItem('sshKeys', newSshKey.trim()); setNewSshKey(''); }}
                                    className="bg-slate-200 px-3 py-1 rounded hover:bg-slate-300 text-xs font-bold flex items-center gap-1"
                                    disabled={!newSshKey.trim()}
                                >
                                    <Plus className="w-4 h-4"/> Add Key
                                </button>
                            </div>
                         </div>
                         <div className="space-y-2">
                            {config.sshKeys.map((key, i) => (
                              <div key={i} className="flex items-start gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                                <Key className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-mono text-gray-600 break-all line-clamp-2" title={key}>{key}</p>
                                </div>
                                <button onClick={() => handleRemoveItem('sshKeys', i)} className="text-red-400 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {config.sshKeys.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No SSH keys added.</p>
                            )}
                         </div>
                       </div>
                    </div>
                  )}

                  {/* System Tab */}
                  {activeTab === 'system' && (
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Hostname Pattern</label>
                            <input 
                              value={config.hostnamePattern} 
                              onChange={(e) => updateConfig({...config, hostnamePattern: e.target.value})}
                              className="w-full px-3 py-2 border rounded-md" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Timezone</label>
                            <input 
                              value={config.timezone} 
                              onChange={(e) => updateConfig({...config, timezone: e.target.value})}
                              className="w-full px-3 py-2 border rounded-md" 
                            />
                          </div>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">System Locale</label>
                           <input 
                              value={config.locale} 
                              onChange={(e) => updateConfig({...config, locale: e.target.value})}
                              placeholder="en_US.UTF-8"
                              className="w-full px-3 py-2 border rounded-md" 
                           />
                       </div>

                       <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">Install Packages</label>
                         <div className="flex gap-2 mb-2">
                            <input 
                              value={newPkg} 
                              onChange={(e) => setNewPkg(e.target.value)}
                              placeholder="e.g. vim, git, htop"
                              className="flex-1 px-3 py-2 border rounded-md" 
                              onKeyDown={(e) => e.key === 'Enter' && (handleAddItem('packages', newPkg), setNewPkg(''))}
                            />
                            <button onClick={() => { handleAddItem('packages', newPkg); setNewPkg(''); }} className="bg-slate-200 p-2 rounded hover:bg-slate-300"><Plus className="w-5 h-5"/></button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {config.packages.map((pkg, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                                {pkg} <Trash2 className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveItem('packages', i)} />
                              </span>
                            ))}
                         </div>
                       </div>
                    </div>
                  )}

                  {/* Storage Tab */}
                  {activeTab === 'storage' && (
                     <div className="space-y-6">
                        <div className="bg-orange-50 p-4 rounded-md border border-orange-100 mb-4">
                           <h4 className="font-bold text-xs text-orange-800 mb-2 uppercase flex items-center gap-2">
                             <HardDrive className="w-4 h-4"/> Add Mount Point
                           </h4>
                           <div className="grid grid-cols-3 gap-3">
                              <div>
                                 <label className="block text-[10px] text-gray-600 mb-1">Device</label>
                                 <input 
                                   placeholder="/dev/vdb"
                                   value={newMount.device}
                                   onChange={(e) => setNewMount({...newMount, device: e.target.value})}
                                   className="w-full px-2 py-1.5 border rounded text-sm"
                                 />
                              </div>
                              <div>
                                 <label className="block text-[10px] text-gray-600 mb-1">FS Type</label>
                                 <select 
                                   value={newMount.fsType}
                                   onChange={(e) => setNewMount({...newMount, fsType: e.target.value})}
                                   className="w-full px-2 py-1.5 border rounded text-sm"
                                 >
                                    <option value="ext4">ext4</option>
                                    <option value="xfs">xfs</option>
                                    <option value="btrfs">btrfs</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-[10px] text-gray-600 mb-1">Mount Path</label>
                                 <input 
                                   placeholder="/data"
                                   value={newMount.mountPath}
                                   onChange={(e) => setNewMount({...newMount, mountPath: e.target.value})}
                                   className="w-full px-2 py-1.5 border rounded text-sm"
                                 />
                              </div>
                           </div>
                           <div className="mt-3 flex justify-end">
                               <button 
                                 disabled={!newMount.device || !newMount.mountPath}
                                 onClick={() => { handleAddItem('mounts', newMount); setNewMount({ device: '', mountPath: '', fsType: 'ext4' }); }}
                                 className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded font-bold disabled:bg-gray-300"
                               >
                                 Add & Auto-Format
                               </button>
                           </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Configured Mounts</label>
                            {config.mounts.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No custom mounts configured.</p>
                            ) : (
                                <div className="space-y-2">
                                    {config.mounts.map((m, i) => (
                                        <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                            <div className="text-xs">
                                                <span className="font-mono font-bold">{m.device}</span>
                                                <span className="mx-2 text-gray-400">→</span>
                                                <span className="font-bold text-orange-700">{m.mountPath}</span>
                                                <span className="ml-2 bg-gray-200 px-1 rounded text-[10px] text-gray-600">{m.fsType}</span>
                                            </div>
                                            <Trash2 className="w-4 h-4 cursor-pointer text-red-400" onClick={() => handleRemoveItem('mounts', i)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                     </div>
                  )}

                  {/* Network Tab */}
                  {activeTab === 'network' && (
                     <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4 transition-all">
                           <h4 className="font-bold text-xs text-blue-800 mb-3 uppercase flex items-center gap-2">
                             <Network className="w-4 h-4"/> Configure Network Interface
                           </h4>
                           
                           <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Interface Name</label>
                                      <input 
                                        placeholder="eth0"
                                        value={newNet.name}
                                        onChange={(e) => setNewNet({...newNet, name: e.target.value})}
                                        className="w-full px-3 py-2 border rounded text-sm bg-white"
                                      />
                                  </div>
                                  <div className="flex items-center">
                                      <div 
                                        className={`flex items-center p-3 rounded-lg border w-full cursor-pointer transition-colors ${newNet.dhcp ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200'}`}
                                        onClick={() => setNewNet({...newNet, dhcp: !newNet.dhcp})}
                                      >
                                          <div className={`w-4 h-4 border rounded-sm flex items-center justify-center mr-2 ${newNet.dhcp ? 'bg-green-500 border-green-600' : 'bg-white border-gray-400'}`}>
                                              {newNet.dhcp && <div className="w-2 h-2 bg-white rounded-sm" />}
                                          </div>
                                          <div>
                                              <div className="text-xs font-bold text-gray-800">DHCP Enabled</div>
                                              <div className="text-[10px] text-gray-500">Auto-assign IPv4</div>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {!newNet.dhcp && (
                                  <div className="bg-white p-3 rounded border border-gray-200 shadow-sm animate-fade-in">
                                      <div className="mb-2 text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                          <Settings className="w-3 h-3" /> Static Configuration
                                      </div>
                                      <div className="grid grid-cols-1 gap-3">
                                          <div>
                                              <label className="block text-[10px] text-gray-600 mb-1">Static IP (CIDR required)</label>
                                              <input 
                                                placeholder="192.168.1.100/24"
                                                value={newNet.ip}
                                                onChange={(e) => setNewNet({...newNet, ip: e.target.value})}
                                                className="w-full px-2 py-1.5 border rounded text-sm font-mono"
                                              />
                                              {!newNet.ip?.includes('/') && newNet.ip && (
                                                <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><Info className="w-3 h-3"/> CIDR suffix (e.g., /24) is required for Netplan.</p>
                                              )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-gray-600 mb-1">Gateway IPv4</label>
                                                <input 
                                                    placeholder="192.168.1.1"
                                                    value={newNet.gateway}
                                                    onChange={(e) => setNewNet({...newNet, gateway: e.target.value})}
                                                    className="w-full px-2 py-1.5 border rounded text-sm font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-600 mb-1">DNS Servers</label>
                                                <input 
                                                    placeholder="8.8.8.8, 1.1.1.1"
                                                    value={newNet.nameservers}
                                                    onChange={(e) => setNewNet({...newNet, nameservers: e.target.value})}
                                                    className="w-full px-2 py-1.5 border rounded text-sm font-mono"
                                                />
                                            </div>
                                          </div>
                                      </div>
                                  </div>
                              )}
                           </div>
                           
                           <div className="mt-4 flex justify-end">
                               <button 
                                 disabled={!newNet.name || (!newNet.dhcp && !newNet.ip)}
                                 onClick={() => { handleAddItem('networkInterfaces', newNet); setNewNet({ name: '', dhcp: true, ip: '', gateway: '', nameservers: '' }); }}
                                 className="text-xs bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300 hover:bg-blue-700 shadow-sm flex items-center gap-2"
                               >
                                 <Plus className="w-4 h-4" /> Add Interface Config
                               </button>
                           </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Configured Interfaces</label>
                            {config.networkInterfaces.length === 0 ? (
                                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
                                    <Network className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 italic">No custom interfaces defined.</p>
                                    <p className="text-[10px] text-gray-400">System will use default DHCP on all ports.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {config.networkInterfaces.map((net, i) => (
                                        <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-start group hover:border-blue-300 transition-colors">
                                            <div className="text-xs">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="font-bold text-blue-700 text-sm">{net.name}</div>
                                                    {net.dhcp ? (
                                                        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-200">DHCP</span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-gray-200">STATIC</span>
                                                    )}
                                                </div>
                                                
                                                {!net.dhcp && (
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                                        <div><span className="text-gray-400">IP:</span> <span className="font-mono">{net.ip}</span></div>
                                                        {net.gateway && <div><span className="text-gray-400">GW:</span> <span className="font-mono">{net.gateway}</span></div>}
                                                        {net.nameservers && <div className="col-span-2"><span className="text-gray-400">DNS:</span> <span className="font-mono">{net.nameservers}</span></div>}
                                                    </div>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveItem('networkInterfaces', i)}
                                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                     </div>
                  )}

                  {/* Files & Cmds Tab */}
                  {activeTab === 'files' && (
                    <div className="space-y-6">
                       {/* RunCmd */}
                       <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">Run Commands (On First Boot)</label>
                         <div className="flex gap-2 mb-2">
                            <input 
                              value={newCmd} 
                              onChange={(e) => setNewCmd(e.target.value)}
                              placeholder="e.g. systemctl start nginx"
                              className="flex-1 px-3 py-2 border rounded-md font-mono text-xs" 
                              onKeyDown={(e) => e.key === 'Enter' && (handleAddItem('runCmds', newCmd), setNewCmd(''))}
                            />
                            <button onClick={() => { handleAddItem('runCmds', newCmd); setNewCmd(''); }} className="bg-slate-200 p-2 rounded hover:bg-slate-300"><Plus className="w-5 h-5"/></button>
                         </div>
                         <ul className="space-y-1">
                            {config.runCmds.map((cmd, i) => (
                              <li key={i} className="text-xs font-mono bg-gray-50 p-1 border rounded flex justify-between items-center">
                                {cmd} <Trash2 className="w-3 h-3 cursor-pointer text-red-400" onClick={() => handleRemoveItem('runCmds', i)} />
                              </li>
                            ))}
                         </ul>
                       </div>

                       {/* Write Files */}
                       <div className="border-t pt-4">
                         <label className="block text-xs font-bold text-gray-700 mb-2">Write Files</label>
                         <div className="bg-gray-50 p-3 rounded border space-y-2">
                             <input 
                                placeholder="/etc/config.custom"
                                value={newFile.path}
                                onChange={(e) => setNewFile({...newFile, path: e.target.value})}
                                className="w-full px-2 py-1 text-xs border rounded"
                             />
                             <textarea 
                                placeholder="File content..."
                                value={newFile.content}
                                onChange={(e) => setNewFile({...newFile, content: e.target.value})}
                                className="w-full px-2 py-1 text-xs border rounded font-mono"
                                rows={3}
                             />
                             <div className="flex justify-end">
                                <button 
                                  onClick={() => { handleAddItem('writeFiles', newFile); setNewFile({path:'', content:'', permissions:'0644'}); }}
                                  className="text-xs bg-suse-base text-white px-2 py-1 rounded"
                                >
                                  Add File
                                </button>
                             </div>
                         </div>
                         <div className="mt-2 space-y-1">
                            {config.writeFiles.map((f, i) => (
                               <div key={i} className="flex items-center justify-between text-xs bg-blue-50 p-2 rounded border border-blue-100">
                                  <div className="flex items-center gap-2">
                                     <FileText className="w-3 h-3 text-blue-500" />
                                     <span className="font-bold">{f.path}</span>
                                     <span className="text-gray-500">({f.permissions})</span>
                                  </div>
                                  <Trash2 className="w-3 h-3 cursor-pointer text-red-400" onClick={() => handleRemoveItem('writeFiles', i)} />
                               </div>
                            ))}
                         </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Preview Column */}
            <div className="bg-gray-900 rounded-lg flex flex-col h-[560px] border border-gray-800 shadow-2xl overflow-hidden">
               <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                     <Terminal className="w-4 h-4 text-gray-400" />
                     <span className="text-gray-300 text-xs font-bold tracking-wider">user-data.yaml</span>
                  </div>
                  <button 
                    onClick={copyToClipboard} 
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                    title="Copy to Clipboard"
                  >
                    <Copy className="w-4 h-4"/>
                  </button>
               </div>
               <div className="flex-1 overflow-auto bg-[#0d1117] p-4">
                  <YamlPreview code={generateYaml()} />
               </div>
            </div>
          </div>
       </div>
    </div>
  );
};