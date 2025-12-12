import React, { useState, useEffect } from 'react';
import { ChecklistItem } from '../types';
import { CheckSquare, Square, Info, Server, Settings, PlayCircle, ChevronDown, ChevronUp, Wrench, ExternalLink, Cpu, HardDrive, AlertTriangle, Clock, Disc } from 'lucide-react';

interface Props {
  onComplete: (isComplete: boolean) => void;
}

interface StepGroup {
  title: string;
  icon: React.ReactNode;
  steps: ChecklistItem[];
}

const INITIAL_GROUPS: StepGroup[] = [
  {
    title: "1. Boot & Installer Init",
    icon: <Server className="w-5 h-5" />,
    steps: [
      { 
        id: 'boot', 
        label: 'Boot from ISO (v1.6.0)', 
        description: 'Boot server with SUSE Virtualization ISO.', 
        details: '1. Insert the installation USB or mount the ISO via IPMI/iDRAC.\n2. Reboot the server and enter the Boot Menu (F11/F12).\n3. Select "SUSE Virtualization Installer" from the GRUB menu.\n4. The installer will load the kernel and display the console wizard.',
        checked: false 
      },
      { 
        id: 'mode', 
        label: 'Installation Mode', 
        description: 'Create New Cluster vs Join.', 
        details: '1. On the "Installation Mode" screen, verify the options.\n2. **First Node**: Select "Create a new SUSE Virtualization cluster".\n3. **Subsequent Nodes**: Select "Join an existing cluster".',
        checked: false 
      },
    ]
  },
  {
    title: "2. Disk & Network Setup",
    icon: <Settings className="w-5 h-5" />,
    steps: [
      { 
        id: 'disk', 
        label: 'Disk Configuration', 
        description: 'Select Installation and Data disks.', 
        details: '1. **Installation Target**: Select the smaller/fastest drive for the OS (e.g., `/dev/sda` 250GB SSD).\n2. **Data Disk**: Select the larger drive for VM storage (e.g., `/dev/sdb` 4TB).\n3. **Note**: If only one disk is available, the installer will partition it automatically, but separate disks are recommended for production.',
        checked: false 
      },
      { 
        id: 'net', 
        label: 'Management Network', 
        description: 'Configure interface and Static IP.', 
        details: '1. Select the primary management interface (e.g., `eth0`).\n2. Set IPv4 Method to **Static** (Recommended for nodes).\n3. **IP Address**: Enter the node IP (e.g., 192.168.10.20).\n4. **Gateway**: Enter the gateway (e.g., 192.168.10.1).\n5. **DNS**: Enter 8.8.8.8 or local DNS.',
        checked: false 
      },
       { 
        id: 'vip', 
        label: 'VIP Configuration', 
        description: 'Virtual IP for Cluster HA.', 
        details: '1. The VIP is the single IP used to access the dashboard of the entire cluster.\n2. **VIP Mode**: Select `Static`.\n3. **VIP Address**: Enter an IP that is NOT used by any node but is in the same subnet (e.g., 192.168.10.10).\n4. This VIP will float between nodes if the leader goes down.',
        checked: false 
      },
    ]
  },
  {
    title: "3. Access & Finalize",
    icon: <PlayCircle className="w-5 h-5" />,
    steps: [
      { 
        id: 'creds', 
        label: 'Cluster Token & Passwords', 
        description: 'Define secure access tokens.', 
        details: '1. **Cluster Token**: Create a strong string (e.g., `SusePoc!2024`). You MUST save this; it is required to join other nodes to the cluster.\n2. **Password**: Set the Linux OS password for the `rancher` user. This is for SSH access.',
        checked: false 
      },
      { 
        id: 'confirm', 
        label: 'Install & Reboot', 
        description: 'Confirm settings and start installation.', 
        details: '1. Review the summary screen carefully.\n2. Confirm that the correct disks are selected to be wiped.\n3. Press **F10** or type `y` to start the installation.\n4. Once complete, the system will reboot. Remove the installation media.',
        checked: false 
      },
    ]
  }
];

export const InstallationChecklist: React.FC<Props> = ({ onComplete }) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'troubleshoot'>('checklist');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  
  // Collect all step IDs to initialize as expanded
  const allStepIds = INITIAL_GROUPS.flatMap(g => g.steps.map(s => s.id));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(allStepIds));

  const toggleCheck = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newChecked = new Set(checkedIds);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIds(newChecked);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Always return true to allow skipping checks
  useEffect(() => {
    onComplete(true); 
  }, [onComplete]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-suse-dark">Installation Procedure (v1.6)</h2>
           <p className="text-gray-600">
             Follow the steps on the bare metal console.
           </p>
        </div>
        <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'checklist' ? 'bg-suse-base text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Checklist
            </button>
            <button 
              onClick={() => setActiveTab('troubleshoot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'troubleshoot' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
            >
              <Wrench className="w-4 h-4"/> Hardware & Troubleshoot
            </button>
        </div>
      </div>

      {activeTab === 'checklist' && (
        <div className="space-y-6 animate-fade-in">
          {INITIAL_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <span className="text-suse-dark">{group.icon}</span>
                <h3 className="font-bold text-gray-800">{group.title}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {group.steps.map((step) => {
                  const isChecked = checkedIds.has(step.id);
                  const isExpanded = expandedIds.has(step.id);

                  return (
                    <div key={step.id} className="bg-white">
                      <div 
                        className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-gray-50 ${isChecked ? 'bg-green-50/50' : ''}`}
                        onClick={() => toggleExpand(step.id)}
                      >
                        <div 
                          onClick={(e) => toggleCheck(e, step.id)}
                          className={`mr-4 transition-colors ${isChecked ? 'text-suse-base' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                          {isChecked ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                        </div>

                        <div className="flex-1">
                          <h4 className={`font-medium ${isChecked ? 'text-green-800' : 'text-gray-900'}`}>
                            {step.label}
                          </h4>
                          <p className="text-sm text-gray-500">{step.description}</p>
                        </div>

                        <div className="text-gray-400 ml-2">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-slate-50 px-4 py-4 pl-14 border-t border-gray-100 text-sm text-gray-700 animate-fade-in">
                          <div className="w-full">
                             <h5 className="font-semibold text-suse-dark mb-2 text-xs uppercase tracking-wide">Instructions:</h5>
                             <div className="whitespace-pre-line leading-relaxed mb-4 text-gray-800">
                               {step.details}
                             </div>
                             
                             {!isChecked && (
                                <button 
                                  onClick={(e) => toggleCheck(e, step.id)}
                                  className="mt-2 text-xs font-semibold text-suse-base hover:text-emerald-700 underline"
                                >
                                  Mark as Complete
                                </button>
                             )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'troubleshoot' && (
        <div className="animate-fade-in space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" /> Hardware Readiness Checklist
                </h3>
                <p className="text-amber-800 mb-4 text-sm">
                    Before installation, ensure your hardware BIOS/UEFI settings are optimized for virtualization.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                            <Cpu className="w-4 h-4 text-suse-base" /> Virtualization Flags
                        </div>
                        <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                            <li><strong>Intel:</strong> Enable <code className="bg-gray-100 px-1 rounded">VT-x</code> and <code className="bg-gray-100 px-1 rounded">VT-d</code></li>
                            <li><strong>AMD:</strong> Enable <code className="bg-gray-100 px-1 rounded">AMD-V</code> and <code className="bg-gray-100 px-1 rounded">IOMMU</code></li>
                            <li>Ensure "Execute Disable Bit" (XD) is enabled.</li>
                        </ul>
                     </div>

                     <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                            <HardDrive className="w-4 h-4 text-suse-base" /> Storage Performance
                        </div>
                        <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                            <li><strong>Etcd Sensitivity:</strong> SUSE Virtualization relies on etcd. Slow disks cause cluster instability.</li>
                            <li><strong>Requirement:</strong> SSD/NVMe with > 5000 IOPS.</li>
                            <li><strong>Verification:</strong> Use <code className="bg-gray-100 px-1 rounded">fio</code> on a live CD to verify throughput if unsure.</li>
                        </ul>
                     </div>

                     <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                            <Clock className="w-4 h-4 text-suse-base" /> Time Synchronization
                        </div>
                        <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                            <li><strong>BIOS Time:</strong> Ensure UTC time is set correctly in BIOS.</li>
                            <li><strong>NTP:</strong> Harvester requires NTP. If offline, ensure the hardware clock is accurate to avoid token expiration issues (tokens typically expire in 5-30m).</li>
                        </ul>
                     </div>
                </div>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Common Installation Errors
                </h3>
                <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                        <div className="font-bold text-gray-800 text-sm mb-1">Boot Fails or Black Screen</div>
                        <p className="text-xs text-gray-600">
                            <strong>Secure Boot:</strong> While supported, some hardware implementations cause issues. Try disabling "Secure Boot" in BIOS if the installer hangs after GRUB.<br/>
                            <strong>Video Mode:</strong> If the GUI installer doesn't load, try adding `nomodeset` to the kernel parameters in GRUB.
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                        <div className="font-bold text-gray-800 text-sm mb-1">No Disks Detected</div>
                        <p className="text-xs text-gray-600">
                            <strong>RAID Controllers:</strong> SUSE Virtualization uses software-defined storage (Longhorn). Hardware RAID is generally <strong>not supported</strong> for data disks. Configure your RAID controller to <strong>HBA / IT Mode / Passthrough</strong> to expose raw disks.
                        </p>
                    </div>
                     <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                        <div className="font-bold text-gray-800 text-sm mb-1">Network Interface Missing</div>
                        <p className="text-xs text-gray-600">
                            <strong>Driver Support:</strong> Very new NICs might lack drivers in the specific kernel version. Check the Hardware Compatibility List (HCL).<br/>
                            <strong>Cable Check:</strong> Ensure the cable is plugged into the primary LOM (LAN On Motherboard) port, which is usually eth0/eno1.
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                        <div className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2"><Disc className="w-3 h-3"/> Installation Stalls / Media Errors</div>
                        <p className="text-xs text-gray-600">
                            <strong>Corrupt ISO:</strong> Verify the SHA256 checksum of the downloaded ISO. <br/>
                            <strong>USB Issues:</strong> Use a USB 3.0 port if possible, but some older servers boot better from USB 2.0. If "squashfs" errors appear, re-burn the USB using <code>dd</code> or Etcher.
                        </p>
                    </div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Vendor Specific BMC Management</h3>
                <p className="text-sm text-gray-600 mb-4">Use your server's Out-of-Band management to mount the ISO and access the Virtual Console.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="https://www.dell.com/support/kbdoc/en-us/000130567/how-to-configure-the-integrated-dell-remote-access-controller-idrac-9-enterprise-network-settings" target="_blank" rel="noreferrer" className="block group">
                        <div className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                            <div className="font-bold text-gray-800 group-hover:text-blue-700 mb-1">Dell iDRAC</div>
                            <div className="text-xs text-gray-500 flex justify-center items-center gap-1">
                                Configuration Guide <ExternalLink className="w-3 h-3"/>
                            </div>
                        </div>
                    </a>
                    
                    <a href="https://support.hpe.com/hpesc/public/docDisplay?docId=a00105236en_us" target="_blank" rel="noreferrer" className="block group">
                        <div className="p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center">
                            <div className="font-bold text-gray-800 group-hover:text-green-700 mb-1">HPE iLO</div>
                            <div className="text-xs text-gray-500 flex justify-center items-center gap-1">
                                Configuration Guide <ExternalLink className="w-3 h-3"/>
                            </div>
                        </div>
                    </a>

                    <a href="https://lenovopress.lenovo.com/lp0096-common-administrative-tasks-in-xclarity-controller" target="_blank" rel="noreferrer" className="block group">
                        <div className="p-4 border rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-center">
                            <div className="font-bold text-gray-800 group-hover:text-red-700 mb-1">Lenovo XClarity</div>
                            <div className="text-xs text-gray-500 flex justify-center items-center gap-1">
                                Configuration Guide <ExternalLink className="w-3 h-3"/>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};