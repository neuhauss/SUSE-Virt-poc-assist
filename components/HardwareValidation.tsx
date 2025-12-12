import React, { useEffect, useState } from 'react';
import { HardwareSpecs, ValidationStatus } from '../types';
import { Server, Cpu, HardDrive, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  specs: HardwareSpecs;
  updateSpecs: (specs: Partial<HardwareSpecs>) => void;
  onValidationChange: (status: ValidationStatus) => void;
}

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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-suse-dark mb-4 flex items-center gap-2">
          <Server className="w-6 h-6 text-suse-base" />
          Hardware Validation
        </h2>
        <p className="text-gray-600 mb-6">
          Validate your environment against SUSE Virtualization v1.4.x requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           {/* Node Count */}
           <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Nodes</label>
            <input 
              type="number" 
              min={1}
              value={specs.nodeCount}
              onChange={(e) => updateSpecs({ nodeCount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">3+ recommended for HA</p>
          </div>

          {/* CPU */}
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4"/> CPU Cores per Node
            </label>
            <input 
              type="number" 
              value={specs.cpuCores}
              onChange={(e) => updateSpecs({ cpuCores: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">Min: 8 Cores</p>
          </div>

          {/* RAM */}
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2">RAM (GB)</label>
            <input 
              type="number" 
              value={specs.ramGb}
              onChange={(e) => updateSpecs({ ramGb: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
             <p className="text-xs text-gray-500 mt-1">Min: 32 GB</p>
          </div>

          {/* Disk */}
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <HardDrive className="w-4 h-4"/> Disk Size (GB)
            </label>
            <input 
              type="number" 
              value={specs.diskGb}
              onChange={(e) => updateSpecs({ diskGb: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
             <p className="text-xs text-gray-500 mt-1">Min: 250 GB</p>
          </div>

          {/* Disk Type */}
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Disk Type</label>
            <select 
              value={specs.diskType}
              onChange={(e) => updateSpecs({ diskType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="SSD">SSD</option>
              <option value="NVMe">NVMe</option>
              <option value="HDD">HDD (Rotational)</option>
            </select>
          </div>

          {/* Network */}
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Network Speed (Gbps)</label>
            <input 
              type="number" 
              value={specs.networkSpeedGb}
              onChange={(e) => updateSpecs({ networkSpeedGb: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
             <p className="text-xs text-gray-500 mt-1">Min: 1 Gbps</p>
          </div>
        </div>

        {/* Validation Feedback */}
        <div className={`p-4 rounded-md ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <h3 className="font-bold flex items-center gap-2 mb-2">
            {validation.isValid ? (
              <span className="text-green-700 flex items-center gap-2"><CheckCircle2/> Compatible</span>
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