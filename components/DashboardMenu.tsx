import React from 'react';
import { POCStep } from '../types';
import { ClipboardList, Server, Network, LayoutTemplate, PlayCircle, Settings, FileText, CheckCircle2, Circle, AlertCircle, ArrowRight, FileCode, Target, BookOpen } from 'lucide-react';

interface Props {
  onSelectStep: (step: POCStep) => void;
  status: {
    details: boolean;
    hardware: boolean;
    network: boolean;
    install: boolean;
    config: boolean;
  };
}

export const DashboardMenu: React.FC<Props> = ({ onSelectStep, status }) => {
  
  const menuItems = [
    {
      step: POCStep.POC_DETAILS,
      title: "Client Information",
      desc: "Define project scope, engineer details, and goals.",
      icon: <ClipboardList className="w-8 h-8 text-blue-500" />,
      isValid: status.details,
      color: "bg-blue-50 border-blue-200 hover:border-blue-400"
    },
    {
      step: POCStep.HARDWARE_VALIDATION,
      title: "Hardware Validation",
      desc: "Check node specs against SUSE requirements.",
      icon: <Server className="w-8 h-8 text-purple-500" />,
      isValid: status.hardware,
      color: "bg-purple-50 border-purple-200 hover:border-purple-400"
    },
    {
      step: POCStep.NETWORK_CONFIG,
      title: "Network & Validation",
      desc: "Configure IPs, VLANs, and validate topology.",
      icon: <Network className="w-8 h-8 text-orange-500" />,
      isValid: status.network,
      color: "bg-orange-50 border-orange-200 hover:border-orange-400"
    },
    {
      step: POCStep.INSTALL_GUIDE,
      title: "Full Installation Guide",
      desc: "Comprehensive documentation and step-by-step installation manual.",
      icon: <BookOpen className="w-8 h-8 text-suse-base" />,
      isValid: true,
      color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400"
    },
    {
      step: POCStep.ARCHITECTURE_PREVIEW,
      title: "Architecture Plan",
      desc: "View the generated infrastructure topology map.",
      icon: <LayoutTemplate className="w-8 h-8 text-indigo-500" />,
      isValid: true, // Always accessible
      color: "bg-indigo-50 border-indigo-200 hover:border-indigo-400"
    },
    {
      step: POCStep.CLOUD_INIT,
      title: "Cloud-Init Generator",
      desc: "Create YAML for VM/Node configuration.",
      icon: <FileCode className="w-8 h-8 text-teal-600" />,
      isValid: true,
      color: "bg-teal-50 border-teal-200 hover:border-teal-400"
    },
    {
      step: POCStep.INSTALLATION_PROCESS,
      title: "Installation Checklist",
      desc: "Interactive checklist for tracking deployment progress.",
      icon: <PlayCircle className="w-8 h-8 text-gray-600" />,
      isValid: status.install,
      color: "bg-gray-50 border-gray-200 hover:border-gray-400"
    },
    {
      step: POCStep.INITIAL_CONFIG,
      title: "POC Goals & Validation",
      desc: "Step-by-step guides for specific POC success criteria.",
      icon: <Target className="w-8 h-8 text-cyan-600" />,
      isValid: status.config,
      color: "bg-cyan-50 border-cyan-200 hover:border-cyan-400"
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-suse-dark">Project Dashboard</h2>
        <p className="text-gray-600 mt-2">Select a module to configure or validate aspects of your SUSE Virtualization POC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.step}
            onClick={() => onSelectStep(item.step)}
            className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 shadow-sm hover:shadow-md group ${item.color}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {item.icon}
              </div>
              <div className="mt-1">
                 {item.isValid ? (
                    <CheckCircle2 className="w-6 h-6 text-suse-base" />
                 ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                 )}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-black">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
            
            <div className="flex items-center text-sm font-semibold text-gray-500 group-hover:text-gray-800">
              Open Module <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}

        {/* Summary Card - Special Styling */}
        <button
            onClick={() => onSelectStep(POCStep.COMPLETED)}
            className="relative p-6 rounded-xl border-2 border-slate-200 bg-slate-800 text-left transition-all duration-200 shadow-md hover:shadow-xl hover:bg-slate-900 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">Generate Report</h3>
            <p className="text-sm text-slate-300 mb-4">View summary and export final PDF.</p>
            
            <div className="flex items-center text-sm font-semibold text-slate-300 group-hover:text-white">
              View Summary <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
        </button>
      </div>
    </div>
  );
};