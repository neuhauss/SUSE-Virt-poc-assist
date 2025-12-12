import React, { useState, useEffect } from 'react';
import { POCStep, POCData, HardwareSpecs, NetworkSpecs, CloudInitConfig } from './types';
import { PocDetailsForm } from './components/PocDetailsForm';
import { HardwareValidation } from './components/HardwareValidation';
import { NetworkValidation } from './components/NetworkValidation';
import { ArchitecturePreview } from './components/ArchitecturePreview';
import { InstallationChecklist } from './components/InstallationChecklist';
import { InitialConfig } from './components/InitialConfig';
import { CloudInitGenerator } from './components/CloudInitGenerator';
import { InstallGuide } from './components/InstallGuide';
import { Summary } from './components/Summary';
import { DashboardMenu } from './components/DashboardMenu';
import { Button } from './components/ui/Button';
import { LayoutTemplate, ArrowLeft, Home, Check } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<POCStep>(POCStep.DASHBOARD);

  // State
  const initialPocData: POCData = {
    projectName: '',
    // Partner
    leadEngineer: '',
    leadEmail: '',
    organization: '',
    // Client
    clientOrganization: '',
    clientContactName: '',
    clientContactRole: '',
    clientContactEmail: '',
    clientContactPhone: '',
    // Dates
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    goals: []
  };

  const initialHwSpecs: HardwareSpecs = {
    cpuCores: 16,
    ramGb: 64,
    diskGb: 500,
    diskType: 'SSD',
    networkSpeedGb: 10,
    nodeCount: 3
  };

  const initialNetSpecs: NetworkSpecs = {
    managementCidr: '',
    gatewayIp: '',
    clusterVip: '',
    dnsServers: '',
    vlanId: '',
    nodes: Array.from({ length: 3 }, (_, i) => ({
        name: `node-${i + 1}`,
        ip: '',
        role: 'Hybrid'
    }))
  };

  const initialCloudInit: CloudInitConfig = {
    user: 'opensuse',
    password: '',
    sshKeys: [],
    packages: ['curl', 'wget', 'vim'],
    runCmds: [],
    writeFiles: [],
    timezone: 'UTC',
    hostnamePattern: 'node-{dsp}',
    locale: 'en_US.UTF-8',
    mounts: [],
    networkInterfaces: []
  };

  const [pocData, setPocData] = useState<POCData>(initialPocData);
  const [hwSpecs, setHwSpecs] = useState<HardwareSpecs>(initialHwSpecs);
  const [netSpecs, setNetSpecs] = useState<NetworkSpecs>(initialNetSpecs);
  const [cloudInitConfig, setCloudInitConfig] = useState<CloudInitConfig>(initialCloudInit);

  // Status States
  const [detailsValid, setDetailsValid] = useState<boolean>(false);
  const [hwValid, setHwValid] = useState<boolean>(true);
  const [netValid, setNetValid] = useState<boolean>(false);
  const [installComplete, setInstallComplete] = useState<boolean>(false);
  const [configComplete, setConfigComplete] = useState<boolean>(false);

  // Check Details Validity
  useEffect(() => {
    setDetailsValid(
        pocData.projectName.length > 0 && 
        pocData.leadEngineer.length > 0 &&
        pocData.clientOrganization.length > 0
    );
  }, [pocData]);

  // Handlers
  const handlePocUpdate = (data: Partial<POCData>) => setPocData({ ...pocData, ...data });
  
  // Update HW specs and sync Network nodes if count changes
  const handleHwUpdate = (data: Partial<HardwareSpecs>) => {
    // If nodeCount is changing, we need to sync the network specs nodes list
    if (data.nodeCount !== undefined && data.nodeCount !== hwSpecs.nodeCount) {
       const targetCount = data.nodeCount;
       setNetSpecs(prev => {
          const currentCount = prev.nodes.length;
          if (currentCount === targetCount) return prev;

          let newNodes = [...prev.nodes];
          if (targetCount > currentCount) {
            // Add missing nodes
            const nodesToAdd = targetCount - currentCount;
            for (let i = 0; i < nodesToAdd; i++) {
              newNodes.push({
                name: `node-${currentCount + i + 1}`,
                ip: '',
                role: 'Hybrid'
              });
            }
          } else {
             // Remove extra nodes
             newNodes = newNodes.slice(0, targetCount);
          }
          return { ...prev, nodes: newNodes };
       });
    }
    setHwSpecs({ ...hwSpecs, ...data });
  };

  // Update Network specs and sync HW node count if nodes list changes
  const handleNetUpdate = (data: Partial<NetworkSpecs>) => {
     if (data.nodes && data.nodes.length !== hwSpecs.nodeCount) {
         setHwSpecs(prev => ({ ...prev, nodeCount: data.nodes!.length }));
     }
     setNetSpecs({ ...netSpecs, ...data });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to start a new POC? Current data will be lost.")) {
      setPocData(initialPocData);
      setHwSpecs(initialHwSpecs);
      setNetSpecs(initialNetSpecs); 
      setCloudInitConfig(initialCloudInit);
      setInstallComplete(false);
      setConfigComplete(false);
      setCurrentStep(POCStep.DASHBOARD);
      window.scrollTo(0, 0);
    }
  };

  const goHome = () => {
      setCurrentStep(POCStep.DASHBOARD);
      window.scrollTo(0, 0);
  };

  const renderContent = () => {
    switch (currentStep) {
        case POCStep.DASHBOARD:
            return <DashboardMenu 
                onSelectStep={setCurrentStep} 
                status={{
                    details: detailsValid,
                    hardware: hwValid,
                    network: netValid,
                    install: installComplete,
                    config: configComplete
                }}
            />;
        case POCStep.POC_DETAILS:
            return <PocDetailsForm data={pocData} updateData={handlePocUpdate} />;
        case POCStep.HARDWARE_VALIDATION:
            return <HardwareValidation 
              specs={hwSpecs} 
              updateSpecs={handleHwUpdate} 
              onValidationChange={(status) => setHwValid(status.isValid)} 
            />;
        case POCStep.NETWORK_CONFIG:
            return <NetworkValidation 
              specs={netSpecs} 
              updateSpecs={handleNetUpdate} 
              onValidationChange={(status) => setNetValid(status.isValid)} 
            />;
        case POCStep.ARCHITECTURE_PREVIEW:
            return <ArchitecturePreview specs={hwSpecs} pocData={pocData} netSpecs={netSpecs} />;
        case POCStep.INSTALLATION_PROCESS:
            return <InstallationChecklist onComplete={setInstallComplete} />;
        case POCStep.INSTALL_GUIDE:
            return <InstallGuide />;
        case POCStep.INITIAL_CONFIG:
            return <InitialConfig onComplete={setConfigComplete} goals={pocData.goals} />;
        case POCStep.CLOUD_INIT:
            return <CloudInitGenerator config={cloudInitConfig} updateConfig={setCloudInitConfig} onComplete={goHome} />;
        case POCStep.COMPLETED:
            return <Summary pocData={pocData} specs={hwSpecs} netSpecs={netSpecs} cloudInitConfig={cloudInitConfig} onReset={handleReset} />;
        default:
            return null;
    }
  };

  const getTitle = () => {
      switch(currentStep) {
          case POCStep.POC_DETAILS: return "Client Information";
          case POCStep.HARDWARE_VALIDATION: return "Hardware Specs";
          case POCStep.NETWORK_CONFIG: return "Network Plan";
          case POCStep.ARCHITECTURE_PREVIEW: return "Topology Preview";
          case POCStep.INSTALLATION_PROCESS: return "Installation";
          case POCStep.INSTALL_GUIDE: return "Documentation & Guide";
          case POCStep.INITIAL_CONFIG: return "POC Goals Validation";
          case POCStep.CLOUD_INIT: return "Cloud-Init Generator";
          case POCStep.COMPLETED: return "POC Report";
          default: return "Dashboard";
      }
  };

  // Simplified steps for the progress bar
  const PROGRESS_STEPS = [
    { id: POCStep.POC_DETAILS, label: 'Plan' },
    { id: POCStep.HARDWARE_VALIDATION, label: 'Hardware' },
    { id: POCStep.NETWORK_CONFIG, label: 'Network' },
    { id: POCStep.INSTALLATION_PROCESS, label: 'Install' },
    { id: POCStep.INITIAL_CONFIG, label: 'Config' },
    { id: POCStep.COMPLETED, label: 'Report' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 print:pb-0">
      {/* Header */}
      <header className="bg-suse-dark text-white shadow-lg print:hidden sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={goHome}>
            <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
               <LayoutTemplate className="w-6 h-6 text-suse-base" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">SUSE Virtualization</h1>
              <p className="text-[10px] text-suse-light opacity-80 uppercase tracking-wider font-semibold">POC Assistant v1.6</p>
            </div>
          </div>
          
          {/* Visual Progress Stepper (Visible on large screens when not on Dashboard) */}
          {currentStep !== POCStep.DASHBOARD && (
            <div className="hidden lg:flex items-center">
                {PROGRESS_STEPS.map((step, idx) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id || (step.id === POCStep.COMPLETED && currentStep === POCStep.COMPLETED);
                    const isLast = idx === PROGRESS_STEPS.length - 1;
                    
                    return (
                        <div key={step.id} className="flex items-center">
                            {/* Step Circle & Label */}
                            <div 
                                onClick={() => setCurrentStep(step.id)}
                                className={`flex flex-col items-center gap-1 cursor-pointer group relative z-10 px-2`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    isActive ? 'bg-suse-base border-suse-base text-white scale-110 shadow-lg shadow-suse-base/40' : 
                                    isCompleted ? 'bg-suse-dark border-suse-base text-suse-base' : 
                                    'bg-suse-dark border-gray-600 text-gray-400 group-hover:border-gray-500'
                                }`}>
                                    {isCompleted && !isActive ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                </div>
                                <span className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? 'text-white' : isCompleted ? 'text-suse-light' : 'text-gray-500'}`}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connecting Line */}
                            {!isLast && (
                                <div className={`w-12 h-0.5 -mt-4 transition-colors duration-500 ${isCompleted ? 'bg-suse-base' : 'bg-gray-700'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
          )}
          
          {currentStep !== POCStep.DASHBOARD && (
             <Button variant="secondary" onClick={goHome} className="text-xs px-4 py-2 flex items-center gap-2 bg-white/10 hover:bg-white/20 border-none rounded-full shadow-inner">
                 <Home className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Dashboard</span>
             </Button>
          )}
        </div>
      </header>

      {/* Sub Header for Breadcrumbs / Back button */}
      {currentStep !== POCStep.DASHBOARD && (
          <div className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm print:hidden">
              <div className="max-w-6xl mx-auto flex items-center gap-4">
                  <button onClick={goHome} className="text-gray-400 hover:text-suse-dark transition-colors p-1 rounded-full hover:bg-gray-100">
                      <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg leading-tight">{getTitle()}</h2>
                    <p className="text-xs text-gray-500">Step {PROGRESS_STEPS.findIndex(p => p.id === currentStep) !== -1 ? PROGRESS_STEPS.findIndex(p => p.id === currentStep) + 1 : '?'} of {PROGRESS_STEPS.length}</p>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 print:max-w-full print:px-8">
        <div className="min-h-[400px]">
          {renderContent()}
        </div>
      </main>

      {/* Module Footer (Only when inside a step) */}
      {currentStep !== POCStep.DASHBOARD && currentStep !== POCStep.COMPLETED && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] print:hidden z-40">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Auto-saved
            </span>
            <Button onClick={goHome}>
              Save & Return to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;