import React, { useState } from 'react';
import TownshipScene from './3d/TownshipScene';
import TopBar from './components/TopBar';
import ControlsDock from './components/ControlsDock';
import TownshipStatsBar from './components/TownshipStatsBar';
import FloorAnalyticsDrawer from './components/FloorAnalyticsDrawer';
import MainPageTotals from './components/MainPageTotals';
import JarvisAgent from './components/JarvisAgent';
import { BUILDINGS_DATA } from './data/townshipData';

export default function App() {
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [showEnergyFlow, setShowEnergyFlow] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);

  // Stage 2: Focus on building
  const handleSelectBuilding = (buildingId) => {
    setSelectedBuildingId(buildingId);
    setSelectedFloorId(null); // Focus whole building first
  };

  // Stage 3: Focus on specific floor clearly
  const handleSelectFloor = (floorId) => {
    setSelectedFloorId(floorId);
  };

  // Return to Stage 2 (All floors of building)
  const handleViewAllFloors = () => {
    setSelectedFloorId(null);
  };

  // Return to Stage 1 (Township Overview)
  const handleResetView = () => {
    setSelectedBuildingId(null);
    setSelectedFloorId(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-200 font-sans select-none">
      {/* 1. Fullscreen 3D Canvas */}
      <TownshipScene
        selectedBuildingId={selectedBuildingId}
        selectedFloorId={selectedFloorId}
        onSelectBuilding={handleSelectBuilding}
        onSelectFloor={handleSelectFloor}
        showEnergyFlow={showEnergyFlow}
        isNightMode={isNightMode}
        wireframeMode={wireframeMode}
      />

      {/* 2. Top Navigation & Status Bar */}
      <TopBar
        selectedBuildingId={selectedBuildingId}
        selectedFloorId={selectedFloorId}
        onResetView={handleResetView}
        onViewAllFloors={handleViewAllFloors}
      />

      {/* 3. Main Page 3 Core Macro Totals (Shown only when in Township Overview) */}
      <MainPageTotals isVisible={!selectedBuildingId} />

      {/* 4. Floating 3D Control Dock */}
      <ControlsDock
        showEnergyFlow={showEnergyFlow}
        setShowEnergyFlow={setShowEnergyFlow}
        isNightMode={isNightMode}
        setIsNightMode={setIsNightMode}
        wireframeMode={wireframeMode}
        setWireframeMode={setWireframeMode}
        onResetCamera={handleResetView}
      />

      {/* 5. Bottom Township Stats Dock & Quick Building Switcher */}
      <TownshipStatsBar
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={handleSelectBuilding}
      />

      {/* 6. Right Slide-Out Floor & Building Analytics Drawer */}
      {selectedBuildingId && (
        <FloorAnalyticsDrawer
          selectedBuildingId={selectedBuildingId}
          selectedFloorId={selectedFloorId}
          onSelectFloor={handleSelectFloor}
          onViewAllFloors={handleViewAllFloors}
          onClose={handleResetView}
        />
      )}

      {/* 7. J.A.R.V.I.S. Core AI Agent */}
      <JarvisAgent
        selectedBuildingId={selectedBuildingId}
        selectedFloorId={selectedFloorId}
        onSelectBuilding={handleSelectBuilding}
        onSelectFloor={handleSelectFloor}
        onResetView={handleResetView}
        isNightMode={isNightMode}
        setIsNightMode={setIsNightMode}
        showEnergyFlow={showEnergyFlow}
        setShowEnergyFlow={setShowEnergyFlow}
        wireframeMode={wireframeMode}
        setWireframeMode={setWireframeMode}
      />
    </div>
  );
}
