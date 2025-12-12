import React from 'react';
import { POCStep } from '../types';
import { ClipboardList, Server, Network, LayoutTemplate, PlayCircle, FileText, CheckCircle2, Circle, ArrowRight, FileCode, Target, BookOpen, Clock } from 'lucide-react';

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
      icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
      isValid: status.details,
      colorClass: "hover:border-blue-400 hover:shadow-blue-100",
      iconBg: "bg-blue-50"
    },
    {
      step: POCStep.HARDWARE_VALIDATION,
      title: "Hardware Validation",
      desc: "Check node specs against SUSE requirements.",
      icon: <Server className="w-6 h-6 text-purple-600" />,
      isValid: status.hardware,
      colorClass: "hover:border-purple-400 hover:shadow-purple-100",
      iconBg: "bg-purple-50"
    },
    {
      step: POCStep.NETWORK_CONFIG,
      title: "Network & Validation",
      desc: "Configure IPs, VLANs, and validate topology.",
      icon: <Network className="w-6 h-6 text-orange-600" />,
      isValid: status.network,
      colorClass: "hover:border-orange-400 hover:shadow-orange-100",
      iconBg: "bg-orange-50"
    },
    {
      step: POCStep.INSTALL_GUIDE,
      title: "Full Installation Guide",
      desc: "Comprehensive documentation and step-by-step manual.",
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      isValid: true, // Reference always available
      colorClass: "hover:border-emerald-400 hover:shadow-emerald-100",
      iconBg: "bg-emerald-50"
    },
    {
      step: POCStep.ARCHITECTURE_PREVIEW,
      title: "Architecture Plan",
      desc: "View the generated infrastructure topology map.",
      icon: <LayoutTemplate className="w-6 h-6 text-indigo-600" />,
      isValid: true, 
      colorClass: "hover:border-indigo-400 hover:shadow-indigo-100",
      iconBg: "bg-indigo-50"
    },
    {
      step: POCStep.CLOUD_INIT,
      title: "Cloud-Init Generator",
      desc: "Create YAML for VM/Node configuration.",
      icon: <FileCode className="w-6 h-6 text-teal-600" />,
      isValid: true,
      colorClass: "hover:border-teal-400 hover:shadow-teal-100",
      iconBg: "bg-teal-50"
    },
    {
      step: POCStep.INSTALLATION_PROCESS,
      title: "Installation Checklist",
      desc: "Interactive checklist for tracking deployment progress.",
      icon: <PlayCircle className="w-6 h-6 text-rose-600" />,
      isValid: status.install,
      colorClass: "hover:border-rose-400 hover:shadow-rose-100",
      iconBg: "bg-rose-50"
    },
    {
      step: POCStep.INITIAL_CONFIG,
      title: "POC Goals & Validation",
      desc: "Step-by-step guides for specific POC success criteria.",
      icon: <Target className="w-6 h-6 text-cyan-600" />,
      isValid: status.config,
      colorClass: "hover:border-cyan-400 hover:shadow-cyan-100",
      iconBg: "bg-cyan-50"
    },
  ];

  const StatusBadge = ({ valid, label }: { valid?: boolean, label?: string }) => {
     if (valid === undefined) {
         return <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 flex items-center gap-1">Reference</span>;
     }
     return valid ? (
         <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
             <CheckCircle2 className="w-3 h-3"/> {label || 'Completed'}
         </span>
     ) : (
         <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 flex items-center gap-1">
             <Clock className="w-3 h-3"/> Pending
         </span>
     );
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-suse-dark">Welcome to SUSE Virtualization</h2>
        <p className="text-gray-600 mt-3 text-lg">
            This assistant guides you through the planning, installation, and validation of your Proof of Concept. 
            Start by defining your client details and hardware specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.step}
            onClick={() => onSelectStep(item.step)}
            className={`group relative p-6 rounded-2xl border border-gray-200 bg-white text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${item.colorClass}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-colors ${item.iconBg}`}>
                {item.icon}
              </div>
              <StatusBadge valid={item.isValid} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-black">{item.title}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed min-h-[40px]">{item.desc}</p>
            
            <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-suse-base transition-colors">
              Open Module <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}

        {/* Report Card - Distinct Visuals */}
        <button
            onClick={() => onSelectStep(POCStep.COMPLETED)}
            className="group relative p-6 rounded-2xl border border-slate-700 bg-suse-dark text-left transition-all duration-300 shadow-lg hover:shadow-2xl hover:bg-[#0f3d36] hover:-translate-y-1 md:col-span-2 lg:col-span-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">Final Output</span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">Generate Final Report</h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">View the executive summary, export configuration JSON, and print the PDF validation report.</p>
            
            <div className="flex items-center text-sm font-bold text-white/70 group-hover:text-white transition-colors">
              View Summary <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
        </button>
      </div>
    </div>
  );
};