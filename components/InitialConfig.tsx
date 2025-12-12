import React, { useState, useEffect } from 'react';
import { ChecklistItem } from '../types';
import { Database, MousePointer, Terminal, CheckCircle, ChevronDown, ChevronUp, CheckSquare, Square, Flag, ExternalLink, HelpCircle, ArrowRight, Play, Settings, Monitor, Image as ImageIcon } from 'lucide-react';
import { UISnapshot } from './ui/UISnapshot';

interface Props {
  onComplete: (isComplete: boolean) => void;
  goals?: string[];
}

interface StepDetail {
  type: 'action' | 'command' | 'verify';
  label: string;
  description?: React.ReactNode; // Changed to ReactNode to support formatting
  code?: string;
  refImage?: string; 
}

interface DocLink {
  title: string;
  url: string;
}

interface GoalConfig {
  goal: string;
  steps: StepDetail[];
  docs: DocLink[];
}

// Using descriptive placeholders to ensure stability and prevent 404s from external doc site changes
const IMAGES = {
  INSTALL_MODE: "https://placehold.co/800x500/2d3748/ffffff?text=Installer:+Create+New+Cluster+Mode",
  INSTALL_DISK: "https://placehold.co/800x500/2d3748/ffffff?text=Installer:+Disk+Selection+(OS+vs+Data)",
  NETWORK_CONFIG: "https://placehold.co/800x500/2d3748/ffffff?text=Installer:+Management+NIC+%26+Static+IP",
  DASHBOARD_VOL: "https://placehold.co/800x400/f1f5f9/475569?text=Dashboard:+Create+Volume+Form",
  DASHBOARD_IMG: "https://placehold.co/800x400/f1f5f9/475569?text=Dashboard:+Create+Image+(URL+Import)",
  DASHBOARD_VM: "https://placehold.co/800x500/f1f5f9/475569?text=Dashboard:+Create+VM+Wizard+(CPU/RAM/Disks)",
  BACKUP_TARGET: "https://placehold.co/800x400/f1f5f9/475569?text=Settings:+Backup+Target+(S3/NFS)"
};

const GOAL_DATA: Record<string, GoalConfig> = {
  "Provision hosts through the ISO installer": {
    goal: "Install SUSE Virtualization on bare metal (PDF Pages 13-18).",
    steps: [
      { 
        type: 'action', 
        label: "1. Boot & Install Mode", 
        description: <span>Boot the server with the ISO. Select <strong>SUSE Virtualization Installer</strong>. On the first screen, select <strong>Create a new SUSE Virtualization cluster</strong> (for the first node).</span>,
        refImage: IMAGES.INSTALL_MODE
      },
      { 
        type: 'action', 
        label: "2. Disk Selection", 
        description: <span>Select the <strong>Installation disk</strong> (OS) and a separate <strong>Data disk</strong> (Storage). If using one disk, set <strong>Persistent size</strong> to at least 150 GiB.</span>,
        refImage: IMAGES.INSTALL_DISK
      },
      { 
        type: 'action', 
        label: "3. Hostname & Network", 
        description: <span>Enter a unique <strong>HostName</strong> (e.g., <code>node-01</code>). Select the Management NIC (creates <code>mgmt-bo</code> bond). Select <strong>Static</strong> IPv4 and enter IP/Gateway/DNS.</span>,
        refImage: IMAGES.NETWORK_CONFIG
      },
      { 
        type: 'action', 
        label: "4. Cluster VIP (Critical)", 
        description: <span>Select VIP Mode: <strong>Static</strong>. Enter a unique IP (e.g., <code>.10</code>) that is <strong>not</strong> used by any node. This is your Dashboard URL.</span> 
      },
      { 
        type: 'action', 
        label: "5. Security & NTP", 
        description: <span>Set a <strong>Cluster Token</strong> (save this securely to add nodes later). Set the OS <strong>Password</strong> (user: <code>rancher</code>). Add an NTP server (e.g., <code>0.pool.ntp.org</code>).</span> 
      },
      {
        type: 'verify',
        label: "6. Finalize",
        description: <span>Review settings and confirm. After reboot, access the dashboard at <code>https://your-vip-ip</code> using user <code>admin</code>.</span>
      }
    ],
    docs: [
      { title: "Installation Guide (PDF pg 13)", url: "#" }
    ]
  },
  "Optional. Provision hosts through PXE boot": {
    goal: "Automate installation via Network Boot (PDF Page 13).",
    steps: [
      { type: 'action', label: "1. Prereqs", description: <span>Ensure you have a DHCP/TFTP server and the kernel/initrd files hosted on an HTTP server.</span> },
      { type: 'command', label: "2. iPXE Script", description: "Configure your iPXE menu with the following arguments:", code: "#!ipxe\nkernel http://<server>/harvester-vmlinuz ip=dhcp harvester.install.automatic=true ...\ninitrd http://<server>/harvester-initrd\nboot" },
      { type: 'verify', label: "3. Verify", description: <span>Boot the server via network (PXE). The installer should start automatically without prompting for the console wizard.</span> }
    ],
    docs: [
      { title: "PXE Reference (PDF pg 13)", url: "#" }
    ]
  },
  "Register an image to use for VMs": {
    goal: "Import OS images for VM creation (PDF Page 36).",
    steps: [
      { 
        type: 'action', 
        label: "1. Navigation", 
        description: <span>Go to the left menu <strong>Images</strong> and click the blue <strong>Create</strong> button.</span>,
        refImage: IMAGES.DASHBOARD_IMG 
      },
      { 
        type: 'action', 
        label: "2. Configuration", 
        description: <span><strong>Namespace:</strong> Keep as <code>harvester-public</code> (visible to all).<br/><strong>Name:</strong> Enter <code>opensuse-15.6</code>.<br/><strong>Source:</strong> Select <code>URL</code>.</span> 
      },
      { 
        type: 'command', 
        label: "3. Image URL", 
        description: "Paste this URL (from PDF pg 35) into the URL field:", 
        code: "https://download.opensuse.org/repositories/Cloud:/Images:/Leap_15.6/images/openSUSE-Leap-15.6-OpenStack.x86_64.qcow2" 
      },
      { 
        type: 'verify', 
        label: "4. Wait for Active", 
        description: <span>Click <strong>Create</strong>. Wait until the State column shows a green <strong>Active</strong>. <span className="text-red-500 font-bold">Do not refresh</span> the page while it says 'Downloading'.</span> 
      }
    ],
    docs: [
      { title: "Upload Images (PDF pg 36)", url: "#" }
    ]
  },
  "Create a Storage Class and Volume": {
    goal: "Define storage policies and create a disk (PDF Page 27).",
    steps: [
      { 
        type: 'action', 
        label: "1. Create Storage Class", 
        description: <span>Go to <strong>Advanced</strong> > <strong>Storage Classes</strong>. Click <strong>Create</strong>.<br/>Name: <code>fast-replica-3</code>.<br/>Replicas: <code>3</code>.<br/>Click <strong>Create</strong>.</span> 
      },
      { 
        type: 'action', 
        label: "2. Create Volume", 
        description: <span>Go to <strong>Volumes</strong> menu. Click <strong>Create</strong>.</span>,
        refImage: IMAGES.DASHBOARD_VOL
      },
      { 
        type: 'action', 
        label: "3. Volume Settings", 
        description: <span><strong>Name:</strong> <code>vol-data-01</code>.<br/><strong>Source:</strong> New.<br/><strong>Storage Class:</strong> Select the class created in step 1.<br/><strong>Size:</strong> <code>10 GiB</code>.</span>
      },
      { type: 'verify', label: "4. Verify", description: <span>Click <strong>Create</strong>. Ensure status becomes <strong>Ready</strong> (or Detached). It is now ready to be attached to a VM.</span> }
    ],
    docs: [
      { title: "Storage Classes (PDF pg 27)", url: "#" },
      { title: "Create Volume (PDF pg 25)", url: "#" }
    ]
  },
  "Create a VLAN network in SUSE Virtualization": {
    goal: "Enable L2 Traffic Isolation (PDF Page 34).",
    steps: [
      { type: 'action', label: "1. Navigate", description: <span>Go to <strong>Networks</strong> > <strong>VM Networks</strong> (NOT Cluster Networks). Click <strong>Create</strong>.</span> },
      { type: 'action', label: "2. Basic Config", description: <span><strong>Name:</strong> <code>vlan-100</code>.<br/><strong>Type:</strong> Select <code>L2VlanNetwork</code>.<br/><strong>VLAN ID:</strong> Enter <code>100</code>.<br/><strong>Cluster Network:</strong> Select <code>mgmt</code>.</span> },
      { type: 'action', label: "3. Route Config", description: <span>Click the <strong>Route</strong> tab.<br/>Select <strong>Auto (DHCP)</strong> if you have an external DHCP server on VLAN 100, or Manual to specify CIDR/Gateway.</span> },
      { type: 'verify', label: "4. Physical Switch", description: <span>Ensure the physical switch ports connected to the nodes are configured as <strong>Trunk</strong> ports to allow VLAN tags. Click <strong>Create</strong>.</span> }
    ],
    docs: [
      { title: "VLAN Network (PDF pg 34)", url: "#" }
    ]
  },
  "Create a VM": {
    goal: "Launch a Virtual Machine instance (PDF Page 41).",
    steps: [
      { type: 'action', label: "1. Wizard", description: <span>Go to <strong>Virtual Machines</strong> > <strong>Create</strong>.</span> },
      { 
        type: 'action', 
        label: "2. Basics Tab", 
        description: <span><strong>Name:</strong> <code>web-server-01</code>.<br/><strong>CPU:</strong> <code>1</code> Core.<br/><strong>Memory:</strong> <code>2</code> GiB.<br/><strong>SSH Key:</strong> Select your uploaded key.</span>,
        refImage: IMAGES.DASHBOARD_VM
      },
      { type: 'action', label: "3. Volumes Tab", description: <span>Click <strong>Add Volume</strong> (if not present).<br/><strong>Source:</strong> VM Image.<br/><strong>Image:</strong> Select <code>opensuse-15.6</code> (uploaded previously).</span> },
      { type: 'action', label: "4. Networks Tab", description: <span>By default, <code>default</code> (management) is added. To use the VLAN, click <strong>Add Network</strong> and select <code>vlan-100</code>.</span> },
      { type: 'verify', label: "5. Launch", description: <span>Click <strong>Create</strong> at bottom right. Wait for the State to turn from 'Starting' to green <strong>Running</strong>.</span> }
    ],
    docs: [
      { title: "Create VM (PDF pg 41)", url: "#" }
    ]
  },
  "Configure a backup target": {
    goal: "Setup external storage for backups (PDF Page 44).",
    steps: [
      { type: 'action', label: "1. Settings", description: <span>Go to <strong>Advanced</strong> > <strong>Settings</strong>. Find <code>backup-target</code> in the list.</span> },
      { type: 'action', label: "2. Edit", description: <span>Click the <strong>⋮ (3 dots)</strong> on the right > <strong>Edit Setting</strong>.</span> },
      { 
        type: 'action', 
        label: "3. Configure S3/NFS", 
        description: <span><strong>Type:</strong> Select <code>S3</code> or <code>NFS</code>.<br/><strong>Endpoint:</strong> (e.g. <code>http://minio:9000</code>).<br/><strong>Bucket:</strong> <code>backups</code>.<br/><strong>Region:</strong> <code>us-east-1</code>.<br/><strong>Access/Secret Key:</strong> Enter credentials.</span>,
        refImage: IMAGES.BACKUP_TARGET
      },
      { type: 'verify', label: "4. Test", description: <span>Click <strong>Save</strong>. The system will immediately attempt to connect. If it fails, an error will appear at the bottom.</span> }
    ],
    docs: [
      { title: "Backup Target (PDF pg 44)", url: "#" }
    ]
  },
  "Configure a user-data cloud-config script": {
    goal: "Inject automation scripts into VM (PDF Page 43).",
    steps: [
      { type: 'action', label: "1. VM Creation", description: <span>Start creating a VM (or edit config). Go to the <strong>Advanced Options</strong> tab.</span> },
      { type: 'action', label: "2. User Data", description: <span>Locate the <strong>User Data</strong> text area.</span> },
      { type: 'command', label: "3. Paste YAML", description: "Paste the following to set root password and install iptables:", code: "#cloud-config\npassword: root\nchpasswd: { expire: False }\nssh_pwauth: True\npackages:\n  - iptables" },
      { type: 'verify', label: "4. Guest Agent", description: <span>Ensure the checkbox <strong>Install guest agent</strong> is selected (crucial for IP reporting). Click Create.</span> }
    ],
    docs: [
      { title: "Cloud Config (PDF pg 43)", url: "#" }
    ]
  },
  "Create a backup of a VM": {
    goal: "Take a snapshot to the backup target (PDF Page 45).",
    steps: [
      { type: 'action', label: "1. Select VM", description: <span>Go to <strong>Virtual Machines</strong>. Find your running VM.</span> },
      { type: 'action', label: "2. Initiate Backup", description: <span>Click the <strong>⋮ (3 dots)</strong> > <strong>Take Backup</strong>.</span> },
      { type: 'action', label: "3. Confirm", description: <span>Enter a name (e.g. <code>backup-v1</code>) and click <strong>Create</strong>.</span> },
      { type: 'verify', label: "4. Verify", description: <span>Go to <strong>Backup & Snapshot</strong> > <strong>VM Backups</strong>. Wait until <strong>ReadyToUse</strong> column shows <strong>Yes</strong>.</span> }
    ],
    docs: [
      { title: "Create Backup (PDF pg 45)", url: "#" }
    ]
  },
  "Restore a VM from a backup": {
    goal: "Restore a VM from external storage (PDF Page 46).",
    steps: [
      { type: 'action', label: "1. Navigate", description: <span>Go to <strong>Backup & Snapshot</strong> > <strong>VM Backups</strong>.</span> },
      { type: 'action', label: "2. Restore Action", description: <span>Find the backup created previously. Click <strong>⋮</strong> > <strong>Restore Virtual Machine</strong>.</span> },
      { type: 'action', label: "3. Strategy", description: <span>Select <strong>New VM</strong> (creates a clone) or <strong>Existing VM</strong> (overwrites). Enter a new name if cloning.</span> },
      { type: 'verify', label: "4. Check", description: <span>Click <strong>Create</strong>. Go to <strong>Virtual Machines</strong> and wait for the new VM to start Running.</span> }
    ],
    docs: [
      { title: "Restore VM (PDF pg 46)", url: "#" }
    ]
  },
  "Perform a live migration of a VM (requires multi-host)": {
    goal: "Move VM to another node with zero downtime (PDF Page 48).",
    steps: [
      { type: 'verify', label: "Prerequisites", description: <span>Ensure you have at least <strong>2 active nodes</strong>. VM must NOT use Bridge Network or CD-ROM.</span> },
      { type: 'action', label: "1. Migrate", description: <span>Go to <strong>Virtual Machines</strong>. Click <strong>⋮</strong> on a running VM > <strong>Migrate</strong>.</span> },
      { type: 'action', label: "2. Target", description: <span>Select a specific target node from the dropdown or check "Automatically select". Click <strong>Apply</strong>.</span> },
      { type: 'verify', label: "3. Status", description: <span>Status will change to <strong>Migrating</strong>, then back to <strong>Running</strong>. The 'Node' column should update.</span> }
    ],
    docs: [
      { title: "Live Migration (PDF pg 48)", url: "#" }
    ]
  },
  "Use the serial/VNC console of a VM": {
    goal: "Access VM terminal via Browser (PDF Page 18).",
    steps: [
      { type: 'action', label: "1. Open Console", description: <span>Go to <strong>Virtual Machines</strong>. Click the <strong>Console</strong> button on the VM card.</span> },
      { type: 'action', label: "2. VNC", description: <span>This opens the graphical interface (like a plugged-in monitor). Good for Windows or Linux GUI.</span> },
      { type: 'action', label: "3. Serial Console", description: <span>Click the dropdown arrow next to Console > <strong>Serial Console</strong>. This is faster for text-only Linux servers (requires <code>console=ttyS0</code> in kernel).</span> }
    ],
    docs: [
      { title: "Access Console (PDF pg 18)", url: "#" }
    ]
  },
  "Import the SSH key and access a VM using the key (Linux only)": {
    goal: "Key-based authentication setup (PDF Page 42).",
    steps: [
      { type: 'action', label: "1. Add Key", description: <span>Go to <strong>Advanced</strong> > <strong>SSH Keys</strong> > <strong>Create</strong>. Paste your public key (starts with <code>ssh-rsa...</code>). Name it <code>my-laptop</code>.</span> },
      { type: 'action', label: "2. Assign to VM", description: <span>During VM Creation (Basics Tab), find the <strong>SSH Key</strong> dropdown and select <code>my-laptop</code>.</span> },
      { type: 'verify', label: "3. Login", description: <span>Once VM is running, open your terminal: <code>ssh user@vm-ip</code>. You should login without password.</span> }
    ],
    docs: [
      { title: "SSH Keys (PDF pg 42)", url: "#" }
    ]
  },
  "Multi-cluster management, multi-tenancy for VM management, multi-disk support": {
    goal: "Import Cluster into Rancher (PDF Page 51).",
    steps: [
      { type: 'action', label: "1. Rancher UI", description: <span>Log into your <strong>Rancher Manager</strong>. Click the <strong>Hamburger Menu (☰)</strong> > <strong>Virtualization Management</strong>.</span> },
      { type: 'action', label: "2. Import", description: <span>Click <strong>Import Existing</strong>. Enter a Cluster Name. Click <strong>Create</strong>.</span> },
      { type: 'command', label: "3. Registration", description: "Copy the `kubectl` registration command shown. Log into the SUSE Virtualization node (SSH) and run it:", code: "kubectl apply -f https://rancher.../import.yaml" },
      { type: 'verify', label: "4. Active", description: <span>Wait for status to become <strong>Active</strong> in Rancher. You can now manage VMs from Rancher UI.</span> }
    ],
    docs: [
      { title: "Rancher Integration (PDF pg 51)", url: "#" }
    ]
  },
  "Integration with Rancher. Provision a RKE2 Kubernetes cluster on top of a SUSE Virtualization cluster": {
    goal: "Deploy Guest Kubernetes Cluster (PDF Page 55).",
    steps: [
      { type: 'action', label: "1. Create Cluster", description: <span>In Rancher, go to <strong>Cluster Management</strong> > <strong>Create</strong>.</span> },
      { type: 'action', label: "2. Select Driver", description: <span>Toggle the switch to <strong>RKE2/K3s</strong>. Click the <strong>Harvester</strong> tile (SUSE Virtualization).</span> },
      { type: 'action', label: "3. Cloud Creds", description: <span>Select the imported SUSE Virtualization cluster as your 'Cloud Credential'.</span> },
      { type: 'action', label: "4. Node Pools", description: <span>Configure Node Pools: Select <strong>Namespace</strong>, <strong>Image</strong>, and <strong>Network</strong> (use the VLAN network).</span> },
      { type: 'verify', label: "5. Provision", description: <span>Click <strong>Create</strong>. Rancher will automatically create VMs in SUSE Virtualization and install Kubernetes on them.</span> }
    ],
    docs: [
      { title: "RKE2 Cluster (PDF pg 55)", url: "#" }
    ]
  },
};

const DEFAULT_STEPS: ChecklistItem[] = [
    { 
      id: 'login', 
      label: 'Cluster Initialization', 
      description: 'First login & certificate acceptance.', 
      details: 'default-init',
      checked: false 
    },
];

export const InitialConfig: React.FC<Props> = ({ onComplete, goals = [] }) => {
  const [configSteps, setConfigSteps] = useState<ChecklistItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Initialize steps by merging defaults with selected goals
  useEffect(() => {
    const goalSteps: ChecklistItem[] = goals.map((goal, index) => ({
      id: `goal-${index}`,
      label: goal,
      description: 'POC Validation Step',
      details: goal, // Store key to lookup in GOAL_DATA
      checked: false
    }));

    setConfigSteps([...DEFAULT_STEPS, ...goalSteps]);
  }, [goals]);

  const toggleCheck = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSteps = configSteps.map(step => 
      step.id === id ? { ...step, checked: !step.checked } : step
    );
    setConfigSteps(newSteps);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  const getIcon = (id: string) => {
    if (id.startsWith('goal-')) return <Flag className="w-5 h-5 text-suse-accent" />;
    return <Database className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-8 relative">
      <div>
        <h2 className="text-2xl font-bold text-suse-dark mb-4">POC Goals & Validation</h2>
        <p className="text-gray-600 mb-6">
          Execute the following procedures to validate your Proof of Concept success criteria based on the <strong>v1.4.x Guide</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {configSteps.map((step) => {
          const isExpanded = expandedId === step.id;
          const isGoal = step.id.startsWith('goal-');
          
          // Determine content source
          const goalConfig = isGoal ? GOAL_DATA[step.details || ''] : null;

          return (
            <div 
              key={step.id}
              className={`border rounded-xl transition-all ${step.checked ? 'border-suse-base bg-emerald-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div 
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleExpand(step.id)}
              >
                 <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${step.checked ? 'bg-white' : (isGoal ? 'bg-suse-accent/10' : 'bg-gray-50')}`}>
                      {getIcon(step.id)}
                    </div>
                    <div>
                      <h3 className={`font-bold ${step.checked ? 'text-green-800' : 'text-gray-800'}`}>{step.label}</h3>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div 
                      onClick={(e) => toggleCheck(e, step.id)}
                      className={`cursor-pointer ${step.checked ? 'text-suse-base' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                      {step.checked ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                    </div>
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                    </div>
                 </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pl-0 md:pl-[4.5rem] animate-fade-in">
                  <div className="bg-slate-50 p-6 rounded-md border border-gray-100 shadow-inner flex flex-col xl:flex-row gap-8">
                    
                    {/* LEFT COLUMN: Visual Guide */}
                    <div className="flex-1 min-w-0">
                        {goalConfig ? (
                           <div>
                                <h5 className="font-bold text-suse-dark mb-4 text-xs uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-2">
                                    <TargetIcon isGoal={true} /> Execution Procedure
                                </h5>
                                
                                {/* Vertical Timeline Visualizer */}
                                <div className="space-y-0 relative">
                                    <div className="absolute left-3.5 top-2 bottom-4 w-0.5 bg-gray-200"></div>
                                    
                                    {goalConfig.steps.map((s, idx) => (
                                        <div key={idx} className="relative pl-10 py-3 group">
                                            {/* Icon Bubble */}
                                            <div className={`absolute left-0 top-3 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white z-10 ${
                                                s.type === 'action' ? 'border-blue-200 text-blue-500' : 
                                                s.type === 'command' ? 'border-gray-600 text-gray-700 bg-gray-100' : 
                                                'border-green-200 text-green-600'
                                            }`}>
                                                {s.type === 'action' && <MousePointer className="w-4 h-4" />}
                                                {s.type === 'command' && <Terminal className="w-4 h-4" />}
                                                {s.type === 'verify' && <CheckCircle className="w-4 h-4" />}
                                            </div>

                                            {/* Content */}
                                            <div>
                                                <div className="font-bold text-sm text-gray-800">{s.label}</div>
                                                {s.description && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed">{s.description}</div>}
                                                {s.code && (
                                                    <div className="mt-2 bg-gray-900 text-green-400 p-2 rounded text-xs font-mono border-l-4 border-suse-base overflow-x-auto whitespace-pre">
                                                        {s.code}
                                                    </div>
                                                )}
                                                {/* If step has a specific image reference, render it inline or via the snapshot component */}
                                                {s.refImage && (
                                                   <div className="mt-3 block xl:hidden">
                                                      <UISnapshot 
                                                        type="dashboard" 
                                                        imageSrc={s.refImage} 
                                                        title={s.label}
                                                      />
                                                   </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                           </div>
                        ) : (
                           // Fallback for Default Steps
                           <div>
                              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-3 mb-4">
                                <Settings className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0"/>
                                <div className="text-sm text-amber-800">
                                  <strong>Initial Setup (PDF Page 18-19):</strong> 
                                  After the node restarts, the console displays the Management URL (e.g., https://your-vip). 
                                  Log in with `admin` and set the password.
                                </div>
                              </div>
                           </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Visual Reference (Snapshot) & Docs */}
                    <div className="w-full xl:w-[400px] flex-shrink-0 space-y-4">
                        
                         {/* Display the Image for the FIRST step that has one, or a generic one */}
                         {goalConfig && goalConfig.steps.some(s => s.refImage) && (
                            <div className="hidden xl:block">
                                <h6 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4"/> Reference UI
                                </h6>
                                <UISnapshot 
                                    type={goalConfig.goal.includes('Install') ? 'console' : 'dashboard'}
                                    imageSrc={goalConfig.steps.find(s => s.refImage)?.refImage}
                                    title="Visual Guide"
                                    onClick={() => window.open(goalConfig.steps.find(s => s.refImage)?.refImage, '_blank')}
                                />
                                <p className="text-xs text-center text-gray-400 mt-1">Click to zoom</p>
                            </div>
                         )}

                         <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h6 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4"/> Documentation
                            </h6>
                            
                            {goalConfig?.docs ? (
                                <ul className="space-y-2">
                                    {goalConfig.docs.map((doc, dIdx) => (
                                        <li key={dIdx}>
                                            <a 
                                              href={doc.url} 
                                              target="_blank" 
                                              rel="noreferrer"
                                              className="group flex items-start gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                                                <span className="leading-tight">{doc.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-sm text-gray-400 italic">No specific docs available.</div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-xs text-gray-500 mb-2">Troubleshooting?</div>
                                <a href="https://docs.harvesterhci.io/v1.4/troubleshooting/index" target="_blank" rel="noreferrer" className="text-xs font-bold text-suse-base flex items-center gap-1 hover:underline">
                                    View Troubleshooting Guide <ArrowRight className="w-3 h-3"/>
                                </a>
                            </div>
                         </div>
                    </div>

                  </div>

                   {/* Action Bar */}
                   <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                        {!step.checked && (
                           <button 
                             onClick={(e) => toggleCheck(e, step.id)}
                             className="text-xs font-bold text-white bg-suse-base px-4 py-2 rounded hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-2"
                           >
                             <CheckCircle className="w-4 h-4"/> Mark Goal as Validated
                           </button>
                        )}
                   </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

const TargetIcon: React.FC<{isGoal: boolean}> = ({ isGoal }) => {
    return isGoal ? <Play className="w-4 h-4"/> : <Settings className="w-4 h-4"/>
}