import React, { useEffect, useState } from 'react';
import { HardwareSpecs, ValidationStatus } from '../types';
import { Server, Cpu, HardDrive, CheckCircle2, AlertTriangle, Check } from 'lucide-react';

interface Props {
  specs: HardwareSpecs;
  updateSpecs: (specs: Partial<HardwareSpecs>) => void;
  onValidationChange: (status: ValidationStatus) => void;
}

// Component definition moved OUTSIDE to prevent re-mounting on every render
const ValidatedInput = ({ 
    type = "number", 
    value, 
    onChange, 
    isValid, 
    min,
    label,
    placeholder,
    icon: Icon 
  }: any) => (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
         {Icon && <Icon className="w-4 h-4 text-gray-500" />} {label}
      </label>
      <div className="relative">
        <input 
          type={type}
          min={min}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-3 pr-10 py-3 bg-white border rounded-lg outline-none transition-all shadow-sm placeholder-gray-400 ${isValid ? 'border-green-400 ring-1 ring-green-400/30' : 'border-gray-300 focus:border-suse-base focus:ring-2 focus:ring-suse-base/20'}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300">
          {isValid ? (
             <div className="bg-green-100 p-1 rounded-full">
               <Check className="w-4 h-4 text-green-600" />
             </div>
          ) : (
            <span className="text-xs text-gray-400 font-medium">Min: {min}</span>
          )}
        </div>
      </div>
    </div>
);

export const HardwareValidation: React.FC<Props> = ({ specs, updateSpecs, onValidationChange }) => {
  const [validation, setValidation] = useState<ValidationStatus>({ isValid: false, messages: [] });

  // Requirements from Page 8 of the PDF
  const REQ = {
    CPU_CORES: 8,
    RAM_GB: 32,
    DISK_GB: 250,
    NETWORK_GB: 1,
    MIN_NODES: 1, // Technically 1 works, but 3 for HA
  };

  useEffect(() => {
    const messages: string[] = [];
    let isValid = true;

    if (specs.nodeCount < 1) {
      messages.push("At least 1 node is required.");
      isValid = false;
    } else if (specs.nodeCount < 3) {
      messages.push("Warning: 3 nodes are required for High Availability features (Page 8).");
    }

    if (specs.cpuCores < REQ.CPU_CORES) {
      messages.push(`Error: Minimum ${REQ.CPU_CORES} CPU cores required for testing (Page 8).`);
      isValid = false;
    }

    if (specs.ramGb < REQ.RAM_GB) {
      messages.push(`Error: Minimum ${REQ.RAM_GB} GB RAM required for testing (Page 8).`);
      isValid = false;
    }

    if (specs.diskGb < REQ.DISK_GB) {
      messages.push(`Error: Minimum ${REQ.DISK_GB} GB Disk required (Page 8).`);
      isValid = false;
    }

    if (specs.diskType === 'HDD') {
      messages.push("Warning: SSD/NVMe (5000+ IOPS) is strongly recommended for etcd performance.");
    }

    setValidation({ isValid, messages });
    onValidationChange({ isValid, messages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-suse-dark mb-4 flex items-center gap-2">
          <Server className="w-6 h-6 text-suse-base" />
          Hardware Validation
        </h2>
        <p className="text-gray-600 mb-8">
          Validate your environment against SUSE Virtualization v1.4.x requirements. 
          Green checks indicate compliance with minimum specs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           {/* Node Count */}
           <ValidatedInput 
             label="Number of Nodes"
             value={specs.nodeCount}
             onChange={(e: any) => updateSpecs({ nodeCount: parseInt(e.target.value) || 0 })}
             isValid={specs.nodeCount >= 3}
             min={3}
             placeholder="e.g. 3"
           />

          {/* CPU */}
          <ValidatedInput 
             label="CPU Cores per Node"
             icon={Cpu}
             value={specs.cpuCores}
             onChange={(e: any) => updateSpecs({ cpuCores: parseInt(e.target.value) || 0 })}
             isValid={specs.cpuCores >= REQ.CPU_CORES}
             min={REQ.CPU_CORES}
             placeholder="e.g. 16"
           />

          {/* RAM */}
          <ValidatedInput 
             label="RAM (GB)"
             value={specs.ramGb}
             onChange={(e: any) => updateSpecs({ ramGb: parseInt(e.target.value) || 0 })}
             isValid={specs.ramGb >= REQ.RAM_GB}
             min={REQ.RAM_GB}
             placeholder="e.g. 64"
           />

          {/* Disk */}
          <ValidatedInput 
             label="Disk Size (GB)"
             icon={HardDrive}
             value={specs.diskGb}
             onChange={(e: any) => updateSpecs({ diskGb: parseInt(e.target.value) || 0 })}
             isValid={specs.diskGb >= REQ.DISK_GB}
             min={REQ.DISK_GB}
             placeholder="e.g. 500"
           />

          {/* Disk Type */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
            <label className="block text-sm font-bold text-gray-700 mb-2">Disk Type</label>
            <div className="relative">
              <select 
                value={specs.diskType}
                onChange={(e) => updateSpecs({ diskType: e.target.value as any })}
                className={`w-full pl-3 pr-10 py-3 bg-white border rounded-lg outline-none appearance-none transition-all cursor-pointer shadow-sm ${['SSD', 'NVMe'].includes(specs.diskType) ? 'border-green-400 ring-1 ring-green-400/30' : 'border-gray-300'}`}
              >
                <option value="SSD">SSD (Solid State)</option>
                <option value="NVMe">NVMe (Recommended)</option>
                <option value="HDD">HDD (Rotational - Not Recommended)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {['SSD', 'NVMe'].includes(specs.diskType) && (
                  <div className="bg-green-100 p-1 rounded-full">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Network */}
          <ValidatedInput 
             label="Network Speed (Gbps)"
             value={specs.networkSpeedGb}
             onChange={(e: any) => updateSpecs({ networkSpeedGb: parseInt(e.target.value) || 0 })}
             isValid={specs.networkSpeedGb >= REQ.NETWORK_GB}
             min={REQ.NETWORK_GB}
             placeholder="e.g. 10"
           />
        </div>

        {/* Validation Feedback */}
        <div className={`p-4 rounded-md transition-all duration-300 ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <h3 className="font-bold flex items-center gap-2 mb-2">
            {validation.isValid ? (
              <span className="text-green-700 flex items-center gap-2"><CheckCircle2/> Compatible Configuration</span>
            ) : (
              <span className="text-orange-700 flex items-center gap-2"><AlertTriangle/> Requirements Not Met</span>
            )}
          </h3>
          <ul className="space-y-1 ml-6 list-disc text-sm">
            {validation.messages.map((msg, idx) => (
              <li key={idx} className={`${msg.includes('Error') ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                {msg}
              </li>
            ))}
            {validation.messages.length === 0 && <li className="text-green-700">Hardware meets minimum requirements for testing.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};