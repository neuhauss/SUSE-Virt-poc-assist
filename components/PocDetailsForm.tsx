import React from 'react';
import { POCData } from '../types';
import { ClipboardList, Target, User, Building, CheckSquare, Square, Flag, Calendar, Phone, Mail, Briefcase } from 'lucide-react';

interface Props {
  data: POCData;
  updateData: (data: Partial<POCData>) => void;
}

const POC_GOALS_OPTIONS = [
  "Provision hosts through the ISO installer",
  "Optional. Provision hosts through PXE boot",
  "Register an image to use for VMs",
  "Create a Storage Class and Volume",
  "Create a VLAN network in SUSE Virtualization",
  "Create a VM",
  "Configure a backup target",
  "Configure a user-data cloud-config script",
  "Create a backup of a VM",
  "Restore a VM from a backup",
  "Perform a live migration of a VM (requires multi-host)",
  "Use the serial/VNC console of a VM",
  "Import the SSH key and access a VM using the key (Linux only)",
  "Multi-cluster management, multi-tenancy for VM management, multi-disk support",
  "Integration with Rancher. Provision a RKE2 Kubernetes cluster on top of a SUSE Virtualization cluster"
];

export const PocDetailsForm: React.FC<Props> = ({ data, updateData }) => {
  
  const toggleGoal = (goal: string) => {
    const currentGoals = data.goals || [];
    if (currentGoals.includes(goal)) {
      updateData({ goals: currentGoals.filter(g => g !== goal) });
    } else {
      updateData({ goals: [...currentGoals, goal] });
    }
  };

  const inputClasses = "w-full pl-3 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-suse-base focus:border-suse-base placeholder-gray-400 shadow-sm transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-suse-dark mb-4 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-suse-base" />
          Client & Project Information
        </h2>
        <p className="text-gray-600 mb-8">
          Define the administrative details, including the Partner responsible for the installation and the Client contact who will validate the environment.
        </p>

        {/* Global Project Name */}
        <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-1">POC / Project Name</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400"><Target className="w-5 h-5"/></span>
              <input 
                type="text" 
                value={data.projectName}
                onChange={(e) => updateData({ projectName: e.target.value })}
                className={`${inputClasses} pl-10 text-lg`}
                placeholder="e.g. Retail Edge Migration - Phase 1"
              />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Partner / SUSE Lead */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <div className="bg-white p-1.5 rounded-md shadow-sm">
                        <User className="w-5 h-5 text-blue-600" /> 
                    </div>
                    Partner / SUSE Lead
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Responsible Engineer</label>
                        <input 
                            type="text" 
                            value={data.leadEngineer}
                            onChange={(e) => updateData({ leadEngineer: e.target.value })}
                            className={inputClasses}
                            placeholder="e.g. John Smith"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Engineer Email</label>
                        <input 
                            type="email" 
                            value={data.leadEmail}
                            onChange={(e) => updateData({ leadEmail: e.target.value })}
                            className={inputClasses}
                            placeholder="john.smith@partner.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Partner Organization</label>
                        <input 
                            type="text" 
                            value={data.organization}
                            onChange={(e) => updateData({ organization: e.target.value })}
                            className={inputClasses}
                            placeholder="e.g. Tech Solutions Inc."
                        />
                    </div>
                </div>
            </div>

            {/* Right Column: Client Info */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <div className="bg-white p-1.5 rounded-md shadow-sm">
                        <Building className="w-5 h-5 text-gray-600" /> 
                    </div>
                    Client Information
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Client Organization</label>
                        <input 
                            type="text" 
                            value={data.clientOrganization}
                            onChange={(e) => updateData({ clientOrganization: e.target.value })}
                            className={inputClasses}
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Contact Name</label>
                            <input 
                                type="text" 
                                value={data.clientContactName}
                                onChange={(e) => updateData({ clientContactName: e.target.value })}
                                className={inputClasses}
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Role / Job Title</label>
                            <input 
                                type="text" 
                                value={data.clientContactRole}
                                onChange={(e) => updateData({ clientContactRole: e.target.value })}
                                className={inputClasses}
                                placeholder="e.g. CTO / SysAdmin"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide flex items-center gap-1"><Mail className="w-3 h-3"/> Email</label>
                             <input 
                                type="email"
                                value={data.clientContactEmail}
                                onChange={(e) => updateData({ clientContactEmail: e.target.value })}
                                className={inputClasses}
                                placeholder="jane@acme.com"
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</label>
                             <input 
                                type="tel"
                                value={data.clientContactPhone}
                                onChange={(e) => updateData({ clientContactPhone: e.target.value })}
                                className={inputClasses}
                                placeholder="+1 555-0123"
                             />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Schedule Section */}
        <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-suse-accent" /> POC Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50/50 p-6 rounded-lg border border-orange-100">
                <div>
                    <label className="block text-sm font-bold text-orange-900 mb-1">Start Date</label>
                    <input 
                    type="date" 
                    value={data.startDate}
                    onChange={(e) => updateData({ startDate: e.target.value })}
                    className={inputClasses}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-orange-900 mb-1">Expected Completion Date</label>
                    <input 
                    type="date" 
                    value={data.targetDate}
                    onChange={(e) => updateData({ targetDate: e.target.value })}
                    className={inputClasses}
                    />
                </div>
            </div>
        </div>

        {/* POC Goals Segment */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-suse-accent/10 rounded-lg">
                <Flag className="w-6 h-6 text-suse-accent" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-800">POC Goals</h3>
                <p className="text-sm text-gray-500">Select the specific validation scenarios for this proof of concept.</p>
             </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="grid grid-cols-1 gap-3">
              {POC_GOALS_OPTIONS.map((goal, index) => {
                const isSelected = data.goals.includes(goal);
                return (
                  <div 
                    key={index}
                    onClick={() => toggleGoal(goal)}
                    className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected ? 'bg-white border-suse-base shadow-md ring-1 ring-suse-base' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                  >
                    <div className={`mt-0.5 mr-3 transition-colors ${isSelected ? 'text-suse-base' : 'text-gray-300'}`}>
                      {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>
                    <span className={`text-sm ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                      {goal}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-right text-xs text-gray-500 font-medium">
               {data.goals.length} goals selected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};