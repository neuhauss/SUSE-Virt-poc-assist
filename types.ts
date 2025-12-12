
export enum POCStep {
  DASHBOARD = -1,
  POC_DETAILS = 0,
  HARDWARE_VALIDATION = 1,
  NETWORK_CONFIG = 2,
  ARCHITECTURE_PREVIEW = 3,
  INSTALLATION_PROCESS = 4,
  INITIAL_CONFIG = 5,
  CLOUD_INIT = 6,
  INSTALL_GUIDE = 7, // New Step
  COMPLETED = 8
}

export interface POCData {
  projectName: string;
  
  // Partner / SUSE Lead Info
  leadEngineer: string;
  leadEmail: string;
  organization: string; // Partner/Integrator Organization

  // Client Info
  clientOrganization: string;
  clientContactName: string;
  clientContactRole: string;
  clientContactEmail: string;
  clientContactPhone: string;

  // Schedule
  startDate: string;
  targetDate: string; // Expected End Date
  
  goals: string[];
}

export interface HardwareSpecs {
  cpuCores: number;
  ramGb: number;
  diskGb: number;
  diskType: 'SSD' | 'HDD' | 'NVMe';
  networkSpeedGb: number;
  nodeCount: number;
}

export interface NodeNetworkConfig {
  name: string;
  ip: string;
  role: 'Master' | 'Worker' | 'Hybrid';
}

export interface NetworkSpecs {
  managementCidr: string;
  gatewayIp: string;
  clusterVip: string;
  dnsServers: string;
  vlanId: string;
  nodes: NodeNetworkConfig[]; 
}

export interface MountPoint {
  device: string; // e.g., /dev/vdb
  mountPath: string; // e.g., /data
  fsType: string; // e.g., ext4, xfs
}

export interface NetworkInterface {
  name: string; // e.g., eth1
  dhcp: boolean;
  ip?: string; // e.g. 192.168.1.100/24
  gateway?: string;
  nameservers?: string; // Comma separated
}

export interface CloudInitConfig {
  user: string;
  password?: string;
  sshKeys: string[];
  packages: string[];
  runCmds: string[];
  writeFiles: { path: string; content: string; permissions: string }[];
  timezone: string;
  hostnamePattern: string;
  // New Fields
  locale: string;
  mounts: MountPoint[];
  networkInterfaces: NetworkInterface[];
}

export interface ArchitectureExtras {
  hasFirewall: boolean;
  hasProxy: boolean;
  hasAirGap: boolean;
  hasRancher: boolean;
  hasExternalStorage: boolean;
  hasBastion: boolean;
  hasNTP: boolean;
}

export interface ValidationStatus {
  isValid: boolean;
  messages: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  details?: string;
  troubleshooting?: string[];
  checked: boolean;
}