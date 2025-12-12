import React, { useState } from 'react';
import { Server, Settings, Network, HardDrive, Disc, LayoutTemplate, Play, Database, Cloud, ArrowRight, ShieldCheck, Cpu, Shuffle, Lock, Globe, Clock, CheckCircle, Sliders, Laptop, ExternalLink } from 'lucide-react';
import { UISnapshot } from './ui/UISnapshot';

interface Step {
  num: number;
  title: string;
  description: string;
  imgSrc: string;
  caption: string;
}

const StepGuide: React.FC<{ steps: Step[] }> = ({ steps }) => {
  return (
    <div className="space-y-12">
      {steps.map((step, idx) => (
        <div key={idx} className="relative pl-8 border-l-2 border-gray-200 pb-8 last:pb-0 last:border-0">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-suse-base text-white font-bold flex items-center justify-center shadow-sm">
            {step.num}
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h4>
          <p className="text-gray-600 mb-4">{step.description}</p>
          <UISnapshot 
            type={step.title.includes('Install') || step.title.includes('Boot') ? 'console' : 'dashboard'}
            imageSrc={step.imgSrc}
            title={step.caption}
          />
        </div>
      ))}
    </div>
  );
};

const PortTable: React.FC<{ ports: { port: string, proto: string, desc: string }[] }> = ({ ports }) => (
  <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm mb-6">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-gray-700">
        <tr>
          <th className="px-4 py-2 text-left">Port</th>
          <th className="px-4 py-2 text-left">Protocol</th>
          <th className="px-4 py-2 text-left">Description</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {ports.map((p, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="px-4 py-2 font-mono font-bold text-blue-600">{p.port}</td>
            <td className="px-4 py-2 text-gray-600">{p.proto}</td>
            <td className="px-4 py-2 text-gray-800">{p.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto border-l-4 border-suse-base mb-6">
    <pre>{code}</pre>
  </div>
);

export const InstallGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', icon: <LayoutTemplate className="w-4 h-4" />, label: 'Home / Overview' },
    { id: 'planning', icon: <Cpu className="w-4 h-4" />, label: 'Planning' },
    { id: 'install', icon: <Play className="w-4 h-4" />, label: 'Installation (ISO)' },
    { id: 'config', icon: <Settings className="w-4 h-4" />, label: 'Initial Config' },
    { id: 'network', icon: <Network className="w-4 h-4" />, label: 'Networking' },
    { id: 'storage', icon: <HardDrive className="w-4 h-4" />, label: 'Storage' },
    { id: 'vm-images', icon: <Disc className="w-4 h-4" />, label: 'VM Images' },
    { id: 'vm-mgmt', icon: <Server className="w-4 h-4" />, label: 'VM Management' },
    { id: 'backup', icon: <Database className="w-4 h-4" />, label: 'Backup & Restore' },
    { id: 'rancher', icon: <Cloud className="w-4 h-4" />, label: 'Rancher Integration' },
  ];

  const handleNext = () => {
    const idx = sections.findIndex(s => s.id === activeSection);
    if (idx < sections.length - 1) {
      setActiveSection(sections[idx + 1].id);
      window.scrollTo(0, 0);
    }
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">What is SUSE Virtualization?</h1>
            <p className="text-gray-600 leading-relaxed">
              SUSE Virtualization is a modern, open, and interoperable Hyperconverged Infrastructure (HCI) solution built on top of Kubernetes.
              It is an open-source alternative designed for operators looking for a cloud-native HCI solution.
              SUSE Virtualization runs on bare metal servers and provides integrated capabilities for virtualization and distributed storage.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800">Key Technologies (Architecture)</h3>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-blue-700">
                <li><strong>Linux OS:</strong> Elemental for SL-Micro 5.5 (Immutable).</li>
                <li><strong>Kubernetes:</strong> Container orchestration under the hood.</li>
                <li><strong>KubeVirt:</strong> VM management via KVM.</li>
                <li><strong>Longhorn:</strong> Distributed block storage and tiering.</li>
              </ul>
            </div>
            <div className="my-8">
              <UISnapshot 
                type="dashboard"
                imageSrc="https://placehold.co/800x400/f1f5f9/334155?text=SUSE+Virtualization+Architecture+Diagram"
                title="Figure: SUSE Virtualization Architecture (Page 4)"
              />
            </div>
          </div>
        );

      case 'planning':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">Planning & Requirements</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Cpu className="w-5 h-5 text-purple-500"/> Minimum Hardware</h3>
                    <ul className="text-sm space-y-2 text-gray-600">
                        <li><strong>CPU:</strong> x86_64, 8 cores (min) / 16 cores (prod).</li>
                        <li><strong>RAM:</strong> 32 GB (min) / 64 GB+ (prod).</li>
                        <li><strong>Disk:</strong> 250 GB SSD/NVMe (5,000+ IOPS).</li>
                        <li><strong>NIC:</strong> 1 Gbps (min) / 10 Gbps (prod).</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Network className="w-5 h-5 text-blue-500"/> Topology</h3>
                    <p className="text-sm text-gray-600">
                        A 3-node cluster is required for High Availability (HA). 
                        The first node is always a management node.
                    </p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Port Requirements (TCP/UDP)</h2>
            <p className="text-sm text-gray-500 mb-4">Ensure the following ports are allowed between nodes.</p>
            
            <h3 className="font-bold text-sm text-suse-dark uppercase">Essential Ports</h3>
            <PortTable ports={[
                { port: "2379-2381", proto: "TCP", desc: "Etcd (Client, Peer, Health)" },
                { port: "6443", proto: "TCP", desc: "Kubernetes API" },
                { port: "10250", proto: "TCP", desc: "Kubelet" },
                { port: "9345", proto: "TCP", desc: "Rancher/K8s API" },
                { port: "8472", proto: "UDP", desc: "Canal CNI (VxLAN Overlay)" },
                { port: "22", proto: "TCP", desc: "SSH Access" }
            ]} />
          </div>
        );

      case 'install':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">ISO Installation</h1>
            <p className="text-gray-600 mb-8">Step-by-step guide to install the first node of the cluster.</p>
            
            <StepGuide steps={[
                {
                    num: 1,
                    title: "Boot & Installation Mode",
                    description: "Mount the ISO and boot the server. Select 'Create a new SUSE Virtualization cluster' for the first node.",
                    imgSrc: "https://placehold.co/600x400/2d3748/FFFFFF?text=GRUB+Menu:+Create+New+Cluster",
                    caption: "Figure: Installation Mode Selection (Create/Join)"
                },
                {
                    num: 2,
                    title: "Disk Selection",
                    description: "Select the Installation Disk (OS) and Data Disk (VM Storage). If using a single disk, set the persistent partition size (min 150GB).",
                    imgSrc: "https://placehold.co/600x400/2d3748/FFFFFF?text=Select+Installation+Disk",
                    caption: "Figure: Disk Selection"
                },
                {
                    num: 3,
                    title: "Hostname & Management Network",
                    description: "Set the Hostname and configure the management network interface (Static IP, Gateway, DNS).",
                    imgSrc: "https://placehold.co/600x400/2d3748/FFFFFF?text=Configure+Static+IP:+192.168.10.20",
                    caption: "Figure: Management Interface Configuration"
                },
                {
                    num: 4,
                    title: "VIP & Cluster Token",
                    description: "Configure the VIP (Virtual IP) for cluster access and define a secure Token for adding new nodes later.",
                    imgSrc: "https://placehold.co/600x400/2d3748/FFFFFF?text=VIP:+192.168.10.10%0AToken:+*******",
                    caption: "Figure: High Availability Configuration (VIP)"
                }
            ]} />
          </div>
        );

      case 'config':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">Initial Configuration</h1>
            <div className="bg-white border-l-4 border-yellow-400 p-4 rounded shadow-sm">
                <p className="text-gray-700">
                    After installation, the node will reboot. The console will display the Management URL: 
                    <code className="bg-gray-100 px-2 py-1 rounded ml-2 font-bold">https://your-configured-vip</code>
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                    <h3 className="font-bold text-lg mb-2">First Access</h3>
                    <p className="text-gray-600 mb-4">
                        1. Access the URL in a browser.<br/>
                        2. Accept the self-signed certificate.<br/>
                        3. Set the password for the <strong>admin</strong> user.
                    </p>
                    <UISnapshot 
                        type="dashboard"
                        imageSrc="https://placehold.co/500x300/e2e8f0/475569?text=Set+Admin+Password"
                        title="First Login Screen"
                    />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2">Dashboard</h3>
                    <p className="text-gray-600 mb-4">
                        The Dashboard provides an overview of CPU, Memory, and Storage of the cluster.
                    </p>
                    <UISnapshot 
                        type="dashboard"
                        imageSrc="https://placehold.co/500x300/e2e8f0/475569?text=Dashboard+Overview"
                        title="Dashboard"
                    />
                </div>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">Networking</h1>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Key Concepts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border border-slate-200">
                        <span className="font-bold text-blue-600 block mb-1">Management Network</span>
                        <p className="text-sm text-gray-600">Internal cluster network (Canal/Flannel). Used for communication between nodes. VM IPs on this network are not externally accessible.</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-slate-200">
                        <span className="font-bold text-orange-600 block mb-1">VLAN Network (Bridge)</span>
                        <p className="text-sm text-gray-600">Connects VMs to the external physical network. Uses Multus + Bridge CNI. Allows VMs to receive IPs from your corporate network (L2).</p>
                    </div>
                </div>
            </div>

            <div className="my-6">
                 <UISnapshot 
                    type="dashboard"
                    imageSrc="https://placehold.co/800x300/f8fafc/64748b?text=Network+Topology+Diagram+(Page+30)"
                    title="Figure: Network Flow Diagram"
                 />
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Creating a VLAN Network</h3>
            <ol className="list-decimal list-inside space-y-4 text-gray-700 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <li>Go to <strong>Networks &gt; VM Networks</strong>.</li>
                <li>Click <strong>Create</strong>.</li>
                <li>Select type <strong>L2VlanNetwork</strong>.</li>
                <li>Define the <strong>VLAN ID</strong> (e.g., 100) and Cluster Network (mgmt).</li>
                <li>On the <strong>Route</strong> tab, configure Gateway and CIDR if DHCP is not available on the VLAN.</li>
            </ol>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">Storage</h1>
            <p className="text-gray-600">SUSE Virtualization uses <strong>Longhorn</strong> for distributed block storage.</p>

            <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h3 className="font-bold text-lg mb-2">Storage Classes</h3>
                    <p className="text-sm text-gray-600 mb-2">Defines replication policies. By default, 3 replicas are kept for redundancy.</p>
                    <CodeBlock code={`kind: StorageClass\nname: longhorn\nparameters:\n  numberOfReplicas: "3"`} />
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h3 className="font-bold text-lg mb-2">Volumes</h3>
                    <p className="text-sm text-gray-600 mb-4">Volumes are virtual disks that can be attached to VMs. They can be created empty or from Images.</p>
                    <UISnapshot 
                        type="dashboard"
                        imageSrc="https://placehold.co/700x200/e2e8f0/475569?text=Create+Volume+UI"
                        title="Create Volume Screen"
                    />
                </div>
            </div>
          </div>
        );

      case 'vm-images':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">VM Images</h1>
            <p className="text-gray-600">Support for ISO, RAW, and QCOW2 images.</p>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4">Step-by-Step: Upload via URL</h3>
                <ol className="space-y-4">
                    <li className="flex gap-4">
                        <div className="bg-gray-100 px-3 py-1 rounded font-bold h-fit">1</div>
                        <div>Go to the <strong>Images</strong> tab and click <strong>Create</strong>.</div>
                    </li>
                    <li className="flex gap-4">
                        <div className="bg-gray-100 px-3 py-1 rounded font-bold h-fit">2</div>
                        <div>Enter the name (e.g., <code>opensuse-leap-15.6</code>).</div>
                    </li>
                    <li className="flex gap-4">
                        <div className="bg-gray-100 px-3 py-1 rounded font-bold h-fit">3</div>
                        <div>Select <strong>Download via URL</strong> and paste the qcow2 image link.</div>
                    </li>
                    <li className="flex gap-4">
                        <div className="bg-gray-100 px-3 py-1 rounded font-bold h-fit">4</div>
                        <div>Click Create and wait for the status to change to <span className="text-green-600 font-bold">Active</span>.</div>
                    </li>
                </ol>
            </div>
          </div>
        );

      case 'vm-mgmt':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">VM Management</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Create VM</h3>
                    <p className="text-sm text-gray-600">Configure CPU, Memory, SSH Keys, and Networks. Use Cloud-Init in the Advanced tab for automation.</p>
                    <UISnapshot 
                        type="dashboard"
                        imageSrc="https://placehold.co/500x300/e2e8f0/475569?text=Create+VM+Wizard"
                        title="Create VM Form"
                    />
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Console Access</h3>
                    <p className="text-sm text-gray-600">Access via VNC (Graphic) or Serial (Text) directly from the browser.</p>
                    <UISnapshot 
                        type="dashboard"
                        imageSrc="https://placehold.co/500x300/000000/FFFFFF?text=Web+VNC+Console"
                        title="Web Console"
                    />
                </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mt-6">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <Shuffle className="w-5 h-5"/> Live Migration
                </h3>
                <p className="text-sm text-purple-800 mb-4">
                    Move VMs between nodes without downtime. Requires Shared Storage (Longhorn) and correctly configured networks.
                </p>
                <div className="bg-white p-3 rounded text-sm text-gray-600 border border-purple-100">
                    Action: Select VM &gt; Click 3 dots &gt; <strong>Migrate</strong> &gt; Choose Target Node.
                </div>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">Backup & Restore</h1>
            <p className="text-gray-600">Configure external targets for data safety.</p>

            <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg">1. Configure Backup Target</h3>
                    <p className="text-sm text-gray-600 mb-2">Go to <strong>Advanced Settings &gt; backup-target</strong>.</p>
                    <p className="text-sm text-gray-600">Supports S3 (AWS/MinIO) and NFS.</p>
                    <CodeBlock code={`type: s3\nendpoint: https://s3.amazonaws.com\nbucketName: my-backups\naccessKeyId: ...\nsecretAccessKey: ...`} />
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg">2. Take Backup</h3>
                    <p className="text-sm text-gray-600">Go to Virtual Machines, select the VM, and click <strong>Take Backup</strong>.</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg">3. Restore</h3>
                    <p className="text-sm text-gray-600">Go to <strong>Backup & Snapshot</strong>, select the backup, and choose:</p>
                    <ul className="list-disc ml-5 text-sm text-gray-600">
                        <li><strong>New VM:</strong> Creates a clone.</li>
                        <li><strong>Replace Existing:</strong> Overwrites current VM.</li>
                    </ul>
                </div>
            </div>
          </div>
        );

      case 'rancher':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-suse-dark">Rancher Integration & RKE2 Provisioning</h1>
            <p className="text-gray-600">
              Integrate SUSE Virtualization with Rancher Manager to enable multi-cluster management and provision downstream Kubernetes (RKE2/K3s) clusters directly on top of VMs.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h4 className="font-bold text-blue-800 text-sm uppercase mb-1">Prerequisites</h4>
                <ul className="list-disc ml-5 text-sm text-blue-700">
                    <li>Rancher Manager v2.6.3+ (v2.7+ recommended).</li>
                    <li><strong>Network:</strong> Rancher must be reachable from SUSE Virtualization VIP (port 443), and SUSE Virtualization VIP must be reachable from Rancher.</li>
                    <li><strong>Feature Flag:</strong> Ensure 'Virtualization Management' (Harvester) is enabled in Rancher Global Settings.</li>
                </ul>
            </div>

            <StepGuide steps={[
                {
                    num: 1,
                    title: "Enable Virtualization Management",
                    description: "In Rancher, navigate to Global Settings > Feature Flags. Locate 'harvester' and ensure it is set to 'Active'. This enables the Harvester node driver and dashboard integration.",
                    imgSrc: "https://placehold.co/800x400/2c3e50/ffffff?text=Rancher+Menu:+Enable+Harvester+Flag",
                    caption: "Figure: Enable Harvester Feature Flag"
                },
                {
                    num: 2,
                    title: "Import Cluster",
                    description: "Navigate to 'Virtualization Management' in the side menu. Click 'Import Existing', name your cluster (e.g., 'harvester-poc'), and click Create.",
                    imgSrc: "https://placehold.co/800x400/e2e8f0/475569?text=Rancher:+Import+Harvester+Cluster",
                    caption: "Figure: Import Cluster Wizard"
                },
                {
                    num: 3,
                    title: "Register via SSH",
                    description: "Copy the `kubectl apply` command generated by Rancher. SSH into any SUSE Virtualization node (user: rancher) and run the command. This installs the cattle-cluster-agent.",
                    imgSrc: "https://placehold.co/600x150/1e293b/FFFFFF?text=rancher@node1:~>+kubectl+apply+-f+https://rancher.../import.yaml",
                    caption: "Figure: Registration Command Execution"
                },
                {
                   num: 4,
                   title: "Create RKE2 Guest Cluster",
                   description: "Once Active, go to Cluster Management > Create > RKE2/K3s > Harvester. Select the imported Harvester cluster as the Cloud Credential.",
                   imgSrc: "https://placehold.co/800x500/e2e8f0/475569?text=Rancher:+Create+RKE2+on+Harvester",
                   caption: "Figure: Provision RKE2 Cluster"
                },
                {
                   num: 5,
                   title: "Configure Node Pools",
                   description: "Define Machine Pools for your Kubernetes nodes. You can specify CPU, Memory, and Disk size directly. Rancher will spin up VMs in SUSE Virtualization automatically.",
                   imgSrc: "https://placehold.co/800x400/e2e8f0/475569?text=RKE2+Node+Pools:+VM+Sizing",
                   caption: "Figure: Machine Pool Configuration"
                }
            ]} />
            
            <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-suse-base"/> Troubleshooting & Verification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-bold text-red-600 mb-2">Cluster Stuck in "Pending"</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-500 space-y-1">
                            <li><strong>Connectivity:</strong> Can the Harvester nodes reach the Rancher URL? Check DNS and Firewalls.</li>
                            <li><strong>Certificates:</strong> If using self-signed certs on Rancher, ensure the `CATTLE_CA_CHECKSUM` is correct in the import YAML.</li>
                            <li><strong>Logs:</strong> Check `kubectl logs -n cattle-system -l app=cattle-cluster-agent`.</li>
                        </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                         <h4 className="font-bold text-amber-600 mb-2">Cloud Provider Issues</h4>
                         <ul className="list-disc ml-5 text-sm text-gray-500 space-y-1">
                             <li><strong>Load Balancer:</strong> If LoadBalancer services stay 'Pending', check if the `harvester-load-balancer` is enabled in the RKE2 config.</li>
                             <li><strong>IP Pool:</strong> Ensure a VM Network IP Pool is configured in SUSE Virtualization for the VLAN used by the guest cluster.</li>
                         </ul>
                    </div>
                </div>

                <div className="mt-6 flex gap-4 flex-wrap">
                    <a href="https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/manage-clusters/register-existing-clusters" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                        <ExternalLink className="w-4 h-4" /> Official Rancher Registration Docs
                    </a>
                     <a href="https://docs.harvesterhci.io/v1.4/rancher/rancher-integration/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                        <ExternalLink className="w-4 h-4" /> SUSE Virtualization Integration Guide
                    </a>
                    <a href="https://docs.harvesterhci.io/v1.4/troubleshooting/rancher/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                        <ExternalLink className="w-4 h-4" /> Troubleshooting Guide
                    </a>
                </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 flex-shrink-0">
        <nav className="space-y-1 sticky top-24">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-suse-base text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        {renderContent()}
        
        {/* Navigation Footer */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end">
            {activeSection !== 'rancher' && (
                <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors"
                >
                    Next Topic <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};