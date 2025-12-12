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
import { LayoutTemplate, ArrowLeft, Home } from 'lucide-react';

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
    nodes: []
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
  const handleHwUpdate = (data: Partial<HardwareSpecs>) => setHwSpecs({ ...hwSpecs, ...data });
  const handleNetUpdate = (data: Partial<NetworkSpecs>) => setNetSpecs({ ...netSpecs, ...data });
  
  // Sync Node List in NetSpecs when Hardware Node Count changes
  useEffect(() => {
    setNetSpecs(prev => {
      const currentCount = prev.nodes.length;
      const targetCount = hwSpecs.nodeCount;

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
  }, [hwSpecs.nodeCount]);

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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 print:pb-0">
      {/* Header */}
      <header className="bg-suse-dark text-white shadow-lg print:hidden sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
            <LayoutTemplate className="w-8 h-8 text-suse-base" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">SUSE Virtualization</h1>
              <p className="text-xs text-suse-light opacity-80">POC Assistant (v1.6.0)</p>
            </div>
          </div>
          
          {currentStep !== POCStep.DASHBOARD && (
             <Button variant="secondary" onClick={goHome} className="text-sm px-3 py-1 flex items-center gap-2 bg-white/10 hover:bg-white/20 border-none">
                 <Home className="w-4 h-4" /> Dashboard
             </Button>
          )}
        </div>
      </header>

      {/* Sub Header for Breadcrumbs / Back button */}
      {currentStep !== POCStep.DASHBOARD && (
          <div className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm print:hidden">
              <div className="max-w-6xl mx-auto flex items-center gap-4">
                  <button onClick={goHome} className="text-gray-500 hover:text-suse-base transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <h2 className="font-semibold text-gray-700">{getTitle()}</h2>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] print:hidden">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <span className="text-sm text-gray-500">
                Changes are saved automatically.
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