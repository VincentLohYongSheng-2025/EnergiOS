import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BUILDINGS_DATA } from '../data/townshipData';

export default function TownshipScene({
  selectedBuildingId,
  selectedFloorId,
  onSelectBuilding,
  onSelectFloor,
  showEnergyFlow = true,
  isNightMode = false,
  wireframeMode = false
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // References for dynamic 3D elements
  const buildingGroupsRef = useRef({});
  const interactiveMeshesRef = useRef([]);
  const flowCurvesRef = useRef([]);
  const pulseMarkersRef = useRef([]);
  const airflowStreamsRef = useRef([]);
  const dirLightRef = useRef(null);
  const hemiLightRef = useRef(null);

  // Target camera state for cinematic interpolation
  const cameraTargetPos = useRef(new THREE.Vector3(0, 240, 310));
  const cameraLookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with Brighter, Clean Architectural Environment
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const daylightSky = 0xe2e8f0; // Brighter modern sky
    scene.background = new THREE.Color(daylightSky);
    scene.fog = new THREE.FogExp2(daylightSky, 0.0016);

    // 2. Camera with tuned depth precision
    const camera = new THREE.PerspectiveCamera(45, width / height, 2, 2000);
    camera.position.set(0, 250, 320);
    cameraRef.current = camera;

    // 3. Renderer with logarithmicDepthBuffer to eliminate z-fighting
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 25;
    controls.maxDistance = 650;
    controlsRef.current = controls;

    // 5. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 0.95);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffbf0, 1.6);
    dirLight.position.set(180, 280, 150);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 800;
    const d = 300;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.6);
    fillLight.position.set(-150, 180, -100);
    scene.add(fillLight);

    // 6. Terrain, Roads & Lush Landscaping
    const groundGeo = new THREE.PlaneGeometry(750, 750);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(660, 42, 0x006948, 0xcfd8dc);
    grid.position.y = 0.15;
    scene.add(grid);

    // Roads
    const createRoad = (w, l, x, z, rotY = 0) => {
      const roadGeo = new THREE.PlaneGeometry(w, l);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = rotY;
      road.position.set(x, 0.25, z);
      road.receiveShadow = true;
      scene.add(road);

      const lineGeo = new THREE.PlaneGeometry(0.8, l * 0.95);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = rotY;
      line.position.set(x, 0.28, z);
      scene.add(line);
    };

    createRoad(24, 580, 0, 10);
    createRoad(24, 580, 10, 0, Math.PI / 2);

    // Green Lawns
    const createGreenLawn = (w, d, x, z) => {
      const lawnGeo = new THREE.BoxGeometry(w, 0.6, d);
      const lawnMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 });
      const lawn = new THREE.Mesh(lawnGeo, lawnMat);
      lawn.position.set(x, 0.3, z);
      lawn.receiveShadow = true;
      scene.add(lawn);
    };

    createGreenLawn(90, 70, -80, -40);
    createGreenLawn(85, 80, 75, -50);
    createGreenLawn(80, 70, -65, 75);
    createGreenLawn(95, 85, 75, 70);

    // Lake
    const shoreGeo = new THREE.CylinderGeometry(44, 46, 1.2, 32);
    const shoreMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 });
    const shore = new THREE.Mesh(shoreGeo, shoreMat);
    shore.position.set(-10, 0.4, -130);
    scene.add(shore);

    const lakeGeo = new THREE.CylinderGeometry(41, 41, 1.4, 32);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.position.set(-10, 0.5, -130);
    scene.add(lake);

    // Trees
    const treeGeo = new THREE.ConeGeometry(3.5, 9, 7);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const trunkGeo = new THREE.CylinderGeometry(0.6, 0.8, 3, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    const createTree = (tx, tz) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tx, 0, tz);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      treeGroup.add(trunk);
      const foliage = new THREE.Mesh(treeGeo, treeMat);
      foliage.position.y = 7;
      foliage.castShadow = true;
      treeGroup.add(foliage);
      scene.add(treeGroup);
    };

    const treeCoords = [
      [-30, -85], [-20, -95], [0, -90], [20, -100], [-35, -130], [25, -130],
      [-15, 25], [-15, 45], [-15, 65], [35, 25], [35, 45], [35, 65],
      [-110, -10], [-110, 10], [120, -10], [120, 10]
    ];
    treeCoords.forEach(([tx, tz]) => createTree(tx, tz));

    // 7. REALISTIC BEAUTIFUL BUILDINGS WITH RICH INTERIOR FLOOR DETAIL
    const interactiveList = [];
    const buildingGroups = {};

    Object.values(BUILDINGS_DATA).forEach((bData) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(bData.position[0], bData.position[1], bData.position[2]);
      bGroup.userData = { isBuildingGroup: true, buildingId: bData.id, bData };
      scene.add(bGroup);
      buildingGroups[bData.id] = bGroup;

      // Foundation Plinth
      const plinthGeo = new THREE.BoxGeometry(bData.dimensions.width + 6, 2.5, bData.dimensions.depth + 6);
      const plinthMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.y = 1.25;
      plinth.receiveShadow = true;
      bGroup.add(plinth);

      const floorCount = bData.floors.length;
      const floorHeight = 7.0;

      // Sort floors from ground level (levelNumber 0) up to roof (levelNumber 4)
      const sortedFloors = [...bData.floors].sort((a, b) => a.levelNumber - b.levelNumber);

      sortedFloors.forEach((floor, idx) => {
        const floorGroup = new THREE.Group();
        floorGroup.position.y = 2.5 + idx * floorHeight;
        floorGroup.userData = {
          isFloor: true,
          floorId: floor.id,
          buildingId: bData.id,
          baseY: 2.5 + idx * floorHeight,
          explodedY: 2.5 + idx * 14.0 // Spaced out exploded stack
        };
        bGroup.add(floorGroup);

        const isRoof = floor.id === 'roof';
        const isGround = floor.id === 'g';

        const widthTaper = isRoof ? 0.90 : 1.0 - (floorCount - 1 - idx) * 0.02;
        const depthTaper = isRoof ? 0.90 : 1.0 - (floorCount - 1 - idx) * 0.02;
        const w = bData.dimensions.width * widthTaper;
        const d = bData.dimensions.depth * depthTaper;
        const h = isRoof ? 4.0 : floorHeight - 1.0;

        // 1. Authoritative Solid Slabs (Single mesh - NO overlapping boxes!)
        const slabCoreGeo = new THREE.BoxGeometry(w + 0.6, 1.2, d + 0.6);
        const slabCoreMat = new THREE.MeshStandardMaterial({
          color: isRoof ? 0x334155 : bData.primaryColor,
          roughness: 0.35,
          metalness: 0.15
        });
        const slabMesh = new THREE.Mesh(slabCoreGeo, slabCoreMat);
        slabMesh.position.y = 0.6;
        slabMesh.castShadow = true;
        slabMesh.receiveShadow = true;
        slabMesh.userData = {
          isFloorClickable: true,
          floorId: floor.id,
          buildingId: bData.id,
          originalColor: isRoof ? 0x334155 : bData.primaryColor
        };
        floorGroup.add(slabMesh);
        interactiveList.push(slabMesh);

        // 2. Interior Floor Partitions & Rooms (Revealed clearly when inspecting floor)
        const interiorGroup = new THREE.Group();
        interiorGroup.userData = { isInteriorDetail: true };
        floorGroup.add(interiorGroup);

        if (!isRoof) {
          // A. Central Service Core (Elevators, Restrooms & Risers)
          const coreGeo = new THREE.BoxGeometry(w * 0.24, h, d * 0.26);
          const coreMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.6,
            metalness: 0.2
          });
          const coreMesh = new THREE.Mesh(coreGeo, coreMat);
          coreMesh.position.y = h / 2;
          interiorGroup.add(coreMesh);

          // Stainless Steel Elevator Doors on Core Wall
          const doorGeo = new THREE.PlaneGeometry(3.2, 4.4);
          const doorMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            metalness: 0.8,
            roughness: 0.25
          });
          const doorMesh = new THREE.Mesh(doorGeo, doorMat);
          doorMesh.position.set(0, 2.2, d * 0.131);
          interiorGroup.add(doorMesh);

          // Wall-Mounted Digital Smart Thermostat on Core
          const statBackGeo = new THREE.BoxGeometry(0.9, 1.2, 0.15);
          const statBackMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
          const statBack = new THREE.Mesh(statBackGeo, statBackMat);
          statBack.position.set(2.8, 2.8, d * 0.132);
          interiorGroup.add(statBack);

          const statScreenGeo = new THREE.PlaneGeometry(0.7, 0.7);
          const statScreenMat = new THREE.MeshBasicMaterial({
            color: floor.anomaly ? 0xf43f5e : 0x0284c7
          });
          const statScreen = new THREE.Mesh(statScreenGeo, statScreenMat);
          statScreen.position.set(2.8, 2.9, d * 0.134);
          interiorGroup.add(statScreen);

          // B. Interior Glass Office Partitions
          const wallGeoX = new THREE.BoxGeometry(w * 0.72, h * 0.75, 0.35);
          const wallGeoZ = new THREE.BoxGeometry(0.35, h * 0.75, d * 0.65);
          const wallMat = new THREE.MeshStandardMaterial({
            color: 0xbae6fd,
            transparent: true,
            opacity: 0.35,
            roughness: 0.15,
            metalness: 0.5
          });

          const partition1 = new THREE.Mesh(wallGeoX, wallMat);
          partition1.position.set(0, h * 0.38, -d * 0.2);
          interiorGroup.add(partition1);

          const partition2 = new THREE.Mesh(wallGeoZ, wallMat);
          partition2.position.set(w * 0.22, h * 0.38, 0);
          interiorGroup.add(partition2);

          // C. REALISTIC AIR HANDLING UNIT (AHU) MECHANICAL ASSEMBLY
          const ahuX = -w * 0.30;
          const ahuZ = d * 0.24;
          const ahuW = w * 0.22;
          const ahuD = d * 0.22;
          const ahuH = h * 0.68;

          // Vibration Isolator Mounting Rails Under AHU
          const isolatorGeo = new THREE.BoxGeometry(ahuW * 0.95, 0.35, ahuD * 0.95);
          const isolatorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
          const isolator = new THREE.Mesh(isolatorGeo, isolatorMat);
          isolator.position.set(ahuX, 0.18, ahuZ);
          interiorGroup.add(isolator);

          // AHU Main Galvanized Steel Cabinet
          const ahuGeo = new THREE.BoxGeometry(ahuW, ahuH, ahuD);
          const ahuMat = new THREE.MeshStandardMaterial({
            color: 0x64748b, // Galvanized metal finish
            metalness: 0.7,
            roughness: 0.35
          });
          const ahu = new THREE.Mesh(ahuGeo, ahuMat);
          ahu.position.set(ahuX, ahuH / 2 + 0.35, ahuZ);
          interiorGroup.add(ahu);

          // AHU Front Access / Filter Inspection Doors
          const doorPanelGeo = new THREE.PlaneGeometry(ahuW * 0.85, ahuH * 0.75);
          const doorPanelMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            metalness: 0.5,
            roughness: 0.4
          });
          const doorPanel = new THREE.Mesh(doorPanelGeo, doorPanelMat);
          doorPanel.position.set(ahuX, ahuH / 2 + 0.35, ahuZ + ahuD / 2 + 0.05);
          interiorGroup.add(doorPanel);

          // Air Intake Louver Grille (Dark slotted grill on AHU side)
          const louverGeo = new THREE.PlaneGeometry(ahuW * 0.75, ahuH * 0.6);
          const louverMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            metalness: 0.8,
            roughness: 0.5
          });
          const louverMesh = new THREE.Mesh(louverGeo, louverMat);
          louverMesh.rotation.y = -Math.PI / 2;
          louverMesh.position.set(ahuX - ahuW / 2 - 0.05, ahuH / 2 + 0.35, ahuZ);
          interiorGroup.add(louverMesh);

          // Top Centrifugal Blower Discharge Scroll
          const blowerGeo = new THREE.CylinderGeometry(1.5, 1.7, 1.4, 16);
          const blowerMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            metalness: 0.75,
            roughness: 0.3
          });
          const blower = new THREE.Mesh(blowerGeo, blowerMat);
          blower.rotation.z = Math.PI / 2;
          blower.position.set(ahuX + ahuW * 0.15, ahuH + 0.85, ahuZ);
          interiorGroup.add(blower);

          // Direct Digital Controller (DDC) with Status Screen
          const ddcGeo = new THREE.BoxGeometry(1.4, 1.8, 0.4);
          const ddcMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
          const ddcBox = new THREE.Mesh(ddcGeo, ddcMat);
          ddcBox.position.set(ahuX + ahuW / 2 + 0.2, ahuH * 0.55, ahuZ + 0.5);
          interiorGroup.add(ddcBox);

          const ddcLcdGeo = new THREE.PlaneGeometry(1.0, 0.8);
          const ddcLcdMat = new THREE.MeshBasicMaterial({
            color: floor.anomaly ? 0xf43f5e : 0x10b981
          });
          const ddcLcd = new THREE.Mesh(ddcLcdGeo, ddcLcdMat);
          ddcLcd.rotation.y = Math.PI / 2;
          ddcLcd.position.set(ahuX + ahuW / 2 + 0.41, ahuH * 0.55, ahuZ + 0.5);
          interiorGroup.add(ddcLcd);

          // 3D Floating AHU Telemetry Beacon & Pulsing Halo
          const beaconGeo = new THREE.SphereGeometry(1.4, 16, 16);
          const beaconMat = new THREE.MeshBasicMaterial({
            color: floor.anomaly ? 0xf43f5e : 0x006948
          });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(ahuX, h + 3.2, ahuZ);
          interiorGroup.add(beacon);

          const haloGeo = new THREE.RingGeometry(1.8, 3.0, 16);
          const haloMat = new THREE.MeshBasicMaterial({
            color: floor.anomaly ? 0xf43f5e : 0x10b981,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
          });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.rotation.x = -Math.PI / 2;
          halo.position.set(ahuX, h + 3.3, ahuZ);
          interiorGroup.add(halo);

          // D. CHILLED WATER HYDRONIC PIPING LOOP
          // CHWS (Chilled Water Supply - 6.8°C): Blue insulated pipe connecting core to AHU
          const chwsPipeGeo = new THREE.CylinderGeometry(0.35, 0.35, Math.abs(ahuX) + 1, 12);
          const chwsPipeMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7, // Chilled blue
            metalness: 0.4,
            roughness: 0.25
          });
          const chwsPipe = new THREE.Mesh(chwsPipeGeo, chwsPipeMat);
          chwsPipe.rotation.z = Math.PI / 2;
          chwsPipe.position.set(ahuX / 2, 2.0, ahuZ - 1.2);
          interiorGroup.add(chwsPipe);

          // CHWR (Chilled Water Return - 12.4°C): Violet/Purple pipe
          const chwrPipeGeo = new THREE.CylinderGeometry(0.35, 0.35, Math.abs(ahuX) + 1, 12);
          const chwrPipeMat = new THREE.MeshStandardMaterial({
            color: 0x7c3aed, // Return purple
            metalness: 0.4,
            roughness: 0.25
          });
          const chwrPipe = new THREE.Mesh(chwrPipeGeo, chwrPipeMat);
          chwrPipe.rotation.z = Math.PI / 2;
          chwrPipe.position.set(ahuX / 2, 2.8, ahuZ - 1.2);
          interiorGroup.add(chwrPipe);

          // Brass Modulating Valve Handwheels & Actuator
          const valveGeo = new THREE.TorusGeometry(0.5, 0.1, 8, 16);
          const valveMat = new THREE.MeshStandardMaterial({
            color: 0xd97706, // Brass gold
            metalness: 0.85,
            roughness: 0.2
          });
          const valveWheel = new THREE.Mesh(valveGeo, valveMat);
          valveWheel.position.set(ahuX + 2.5, 3.3, ahuZ - 1.2);
          valveWheel.rotation.x = Math.PI / 2;
          interiorGroup.add(valveWheel);

          const actuatorGeo = new THREE.BoxGeometry(0.7, 0.8, 0.7);
          const actuatorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
          const actuator = new THREE.Mesh(actuatorGeo, actuatorMat);
          actuator.position.set(ahuX + 2.5, 2.4, ahuZ - 1.2);
          interiorGroup.add(actuator);

          // E. OVERHEAD GALVANIZED AIR SUPPLY DUCTWORK SYSTEM
          const ductY = h * 0.82; // Suspended high near ceiling slab
          const trunkLen = w * 0.70;
          const ductGeo = new THREE.BoxGeometry(trunkLen, 1.0, 1.4);
          const ductMat = new THREE.MeshStandardMaterial({
            color: 0xa1a1aa, // Galvanized zinc silver
            metalness: 0.82,
            roughness: 0.25
          });
          const trunkDuct = new THREE.Mesh(ductGeo, ductMat);
          trunkDuct.position.set(0, ductY, ahuZ);
          interiorGroup.add(trunkDuct);

          // Duct Flange Joint Collars (Galvanized sheet metal seams every 5.5 units)
          for (let fx = -trunkLen / 2 + 3; fx <= trunkLen / 2 - 3; fx += 5.5) {
            const collarGeo = new THREE.BoxGeometry(0.2, 1.15, 1.55);
            const collarMat = new THREE.MeshStandardMaterial({
              color: 0x71717a,
              metalness: 0.7,
              roughness: 0.3
            });
            const collar = new THREE.Mesh(collarGeo, collarMat);
            collar.position.set(fx, ductY, ahuZ);
            interiorGroup.add(collar);
          }

          // Lateral Branch Takeoff Ducts
          const branchDepth = d * 0.36;
          const branchGeo = new THREE.BoxGeometry(1.0, 0.8, branchDepth);

          // Branch 1: North Office Zone
          const branch1 = new THREE.Mesh(branchGeo, ductMat);
          branch1.position.set(w * 0.22, ductY - 0.1, ahuZ - branchDepth / 2);
          interiorGroup.add(branch1);

          // Branch 2: South Workstation Zone
          const branch2 = new THREE.Mesh(branchGeo, ductMat);
          branch2.position.set(-w * 0.05, ductY - 0.1, ahuZ - branchDepth / 2);
          interiorGroup.add(branch2);

          // Branch 3: Conference East Zone
          const branch3 = new THREE.Mesh(branchGeo, ductMat);
          branch3.position.set(w * 0.22, ductY - 0.1, ahuZ + branchDepth / 2 - 0.8);
          interiorGroup.add(branch3);

          // VAV (Variable Air Volume) Terminal Damper Boxes on Branches
          const vavGeo = new THREE.BoxGeometry(1.4, 1.1, 1.4);
          const vavMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
          const vav1 = new THREE.Mesh(vavGeo, vavMat);
          vav1.position.set(w * 0.22, ductY - 0.1, ahuZ - 2.5);
          interiorGroup.add(vav1);

          // F. 4-WAY CEILING AIR DIFFUSERS (VENTS) & ANIMATED COOL BREEZE
          const diffuserCoords = [
            [w * 0.22, ductY - 0.45, ahuZ - branchDepth + 1.2, 0],
            [-w * 0.05, ductY - 0.45, ahuZ - branchDepth + 1.2, 1.5],
            [w * 0.22, ductY - 0.45, ahuZ + branchDepth - 2.0, 3.0],
            [-w * 0.05, ductY - 0.45, ahuZ + 2.5, 4.5]
          ];

          const diffuserBezelGeo = new THREE.BoxGeometry(2.2, 0.16, 2.2);
          const diffuserBezelMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.4
          });

          const diffuserLouverGeo = new THREE.PlaneGeometry(1.7, 1.7);
          const diffuserLouverMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.8
          });

          diffuserCoords.forEach(([dx, dy, dz, phaseOffset]) => {
            // White 4-way diffuser face plate
            const bezel = new THREE.Mesh(diffuserBezelGeo, diffuserBezelMat);
            bezel.position.set(dx, dy, dz);
            interiorGroup.add(bezel);

            const louver = new THREE.Mesh(diffuserLouverGeo, diffuserLouverMat);
            louver.rotation.x = Math.PI / 2;
            louver.position.set(dx, dy - 0.09, dz);
            interiorGroup.add(louver);

            // ANIMATED COOL AIRFLOW STREAM (Refreshing breeze fanning downward)
            const breezeConeGeo = new THREE.ConeGeometry(2.0, 3.0, 12, 1, true);
            const breezeMat = new THREE.MeshBasicMaterial({
              color: 0x38bdf8, // Crisp icy cyan
              transparent: true,
              opacity: 0.26,
              side: THREE.DoubleSide,
              depthWrite: false
            });
            const breezeMesh = new THREE.Mesh(breezeConeGeo, breezeMat);
            breezeMesh.position.set(dx, dy - 1.5, dz);
            interiorGroup.add(breezeMesh);

            // Inner core stream
            const innerStreamGeo = new THREE.ConeGeometry(1.1, 3.2, 10, 1, true);
            const innerStreamMat = new THREE.MeshBasicMaterial({
              color: 0xe0f2fe,
              transparent: true,
              opacity: 0.18,
              side: THREE.DoubleSide,
              depthWrite: false
            });
            const innerMesh = new THREE.Mesh(innerStreamGeo, innerStreamMat);
            innerMesh.position.set(dx, dy - 1.6, dz);
            interiorGroup.add(innerMesh);

            airflowStreamsRef.current.push({
              outer: breezeMesh,
              inner: innerMesh,
              phase: phaseOffset,
              buildingId: bData.id,
              floorId: floor.id
            });
          });

          // G. REALISTIC OFFICE WORKSTATIONS & FURNITURE
          const deskGeo = new THREE.BoxGeometry(4.0, 0.16, 2.2);
          const deskMat = new THREE.MeshStandardMaterial({
            color: 0xf1ebe1, // Birch veneer
            roughness: 0.6
          });
          const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });

          const monitorGeo = new THREE.BoxGeometry(1.5, 1.0, 0.12);
          const monitorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
          const screenGeo = new THREE.PlaneGeometry(1.4, 0.9);
          const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Glowing active monitor

          const createWorkstation = (wx, wz, rot = 0) => {
            const wsGroup = new THREE.Group();
            wsGroup.position.set(wx, 1.25, wz);
            wsGroup.rotation.y = rot;

            const desk = new THREE.Mesh(deskGeo, deskMat);
            desk.position.y = 1.3;
            desk.castShadow = true;
            wsGroup.add(desk);

            const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.3, 8);
            [
              [-1.8, 0.65, -0.9],
              [1.8, 0.65, -0.9],
              [-1.8, 0.65, 0.9],
              [1.8, 0.65, 0.9]
            ].forEach(([lx, ly, lz]) => {
              const leg = new THREE.Mesh(legGeo, legMat);
              leg.position.set(lx, ly, lz);
              wsGroup.add(leg);
            });

            // Monitors
            const mon1 = new THREE.Mesh(monitorGeo, monitorMat);
            mon1.position.set(-0.9, 2.15, -0.4);
            wsGroup.add(mon1);

            const scr1 = new THREE.Mesh(screenGeo, screenMat);
            scr1.position.set(-0.9, 2.15, -0.33);
            wsGroup.add(scr1);

            const mon2 = new THREE.Mesh(monitorGeo, monitorMat);
            mon2.position.set(0.9, 2.15, -0.4);
            mon2.rotation.y = -0.15;
            wsGroup.add(mon2);

            const scr2 = new THREE.Mesh(screenGeo, screenMat);
            scr2.position.set(0.9, 2.15, -0.33);
            scr2.rotation.y = -0.15;
            wsGroup.add(scr2);

            interiorGroup.add(wsGroup);
          };

          createWorkstation(w * 0.22, ahuZ - branchDepth + 1.2, 0);
          createWorkstation(-w * 0.05, ahuZ - branchDepth + 1.2, 0);
          createWorkstation(w * 0.22, ahuZ + branchDepth - 2.0, Math.PI);

          // Zone Floor Tile Accents (Thermal Heatmap / Comfort Indicator)
          const zoneTileGeo = new THREE.PlaneGeometry(w * 0.80, d * 0.78);
          const zoneTileMat = new THREE.MeshStandardMaterial({
            color: floor.anomaly ? 0xfff1f2 : 0xf0fdf4,
            roughness: 0.9,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
          });
          const zoneTile = new THREE.Mesh(zoneTileGeo, zoneTileMat);
          zoneTile.rotation.x = -Math.PI / 2;
          zoneTile.position.set(0, 1.23, 0);
          zoneTile.receiveShadow = true;
          interiorGroup.add(zoneTile);
        }

        // 3. Facade Windows (4 Vertical Perimeter Window Walls - NO Top/Bottom Lids to prevent Z-Fighting)
        if (!isRoof) {
          const glassGroup = new THREE.Group();
          glassGroup.userData = { isFacadeGlass: true };
          floorGroup.add(glassGroup);

          const glassWallMat = new THREE.MeshStandardMaterial({
            color: bData.glassColor,
            roughness: 0.1,
            metalness: 0.85,
            transparent: true,
            opacity: 0.55,
            depthWrite: false, // Prevents depth conflict with interior objects
            side: THREE.DoubleSide
          });

          const glassH = h * 0.72;
          const glassY = h / 2;
          const gw = w + 0.4;
          const gd = d + 0.4;

          // Front Window
          const fbGeo = new THREE.PlaneGeometry(gw, glassH);
          const fGlass = new THREE.Mesh(fbGeo, glassWallMat);
          fGlass.position.set(0, glassY, gd / 2);
          glassGroup.add(fGlass);

          // Back Window
          const bGlass = new THREE.Mesh(fbGeo, glassWallMat);
          bGlass.position.set(0, glassY, -gd / 2);
          bGlass.rotation.y = Math.PI;
          glassGroup.add(bGlass);

          // Left Window
          const lrGeo = new THREE.PlaneGeometry(gd, glassH);
          const lGlass = new THREE.Mesh(lrGeo, glassWallMat);
          lGlass.position.set(-gw / 2, glassY, 0);
          lGlass.rotation.y = -Math.PI / 2;
          glassGroup.add(lGlass);

          // Right Window
          const rGlass = new THREE.Mesh(lrGeo, glassWallMat);
          rGlass.position.set(gw / 2, glassY, 0);
          rGlass.rotation.y = Math.PI / 2;
          glassGroup.add(rGlass);

          // Sunshade Louvers
          const louverCount = 6;
          for (let li = -w / 2 + 3; li <= w / 2 - 3; li += w / louverCount) {
            const louverGeo = new THREE.BoxGeometry(0.5, h, 1.2);
            const louverMat = new THREE.MeshStandardMaterial({
              color: 0x475569,
              metalness: 0.7,
              roughness: 0.3
            });
            const louverFront = new THREE.Mesh(louverGeo, louverMat);
            louverFront.position.set(li, h / 2, d / 2 + 0.5);
            floorGroup.add(louverFront);

            const louverBack = new THREE.Mesh(louverGeo, louverMat);
            louverBack.position.set(li, h / 2, -d / 2 - 0.5);
            floorGroup.add(louverBack);
          }
        }

        // Ground Floor Entrance Canopy (at bottom plinth)
        if (isGround) {
          const canopyGeo = new THREE.BoxGeometry(18, 0.8, 10);
          const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
          const canopy = new THREE.Mesh(canopyGeo, canopyMat);
          canopy.position.set(0, h * 0.75, d / 2 + 5);
          canopy.castShadow = true;
          floorGroup.add(canopy);
        }

        // Roof Floor Solar & Chillers (at very top)
        if (isRoof) {
          // Hollow perimeter parapet railing around roof deck edge
          const parapetH = 1.4;
          const parapetThick = 0.8;
          const parapetMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });

          const fbParapetGeo = new THREE.BoxGeometry(w + 0.6, parapetH, parapetThick);
          const fParapet = new THREE.Mesh(fbParapetGeo, parapetMat);
          fParapet.position.set(0, 1.2 + parapetH / 2, (d + 0.6) / 2 - parapetThick / 2);
          floorGroup.add(fParapet);

          const bParapet = new THREE.Mesh(fbParapetGeo, parapetMat);
          bParapet.position.set(0, 1.2 + parapetH / 2, -(d + 0.6) / 2 + parapetThick / 2);
          floorGroup.add(bParapet);

          const lrParapetGeo = new THREE.BoxGeometry(parapetThick, parapetH, d + 0.6 - parapetThick * 2);
          const lParapet = new THREE.Mesh(lrParapetGeo, parapetMat);
          lParapet.position.set(-(w + 0.6) / 2 + parapetThick / 2, 1.2 + parapetH / 2, 0);
          floorGroup.add(lParapet);

          const rParapet = new THREE.Mesh(lrParapetGeo, parapetMat);
          rParapet.position.set((w + 0.6) / 2 - parapetThick / 2, 1.2 + parapetH / 2, 0);
          floorGroup.add(rParapet);

          // Tilted Solar PV Panels on Open Roof Deck
          for (let sx = -w / 2 + 6; sx <= w / 2 - 6; sx += 9.5) {
            for (let sz = -d / 2 + 6; sz <= d / 2 - 12; sz += 9.5) {
              const panelGeo = new THREE.BoxGeometry(7.5, 0.35, 6.5);
              const panelMat = new THREE.MeshStandardMaterial({
                color: 0x0284c7,
                roughness: 0.15,
                metalness: 0.95
              });
              const panel = new THREE.Mesh(panelGeo, panelMat);
              panel.position.set(sx, 1.6, sz);
              panel.rotation.x = -0.22;
              panel.castShadow = true;
              floorGroup.add(panel);
            }
          }

          // Rooftop Chillers on Open Roof Deck
          const chillerGeo = new THREE.BoxGeometry(9.0, 3.5, 6.0);
          const chillerMat = new THREE.MeshStandardMaterial({ color: 0x006948, metalness: 0.5, roughness: 0.4 });
          const chiller1 = new THREE.Mesh(chillerGeo, chillerMat);
          chiller1.position.set(-w * 0.22, 2.9, d * 0.20);
          floorGroup.add(chiller1);

          const chiller2 = new THREE.Mesh(chillerGeo, chillerMat);
          chiller2.position.set(w * 0.22, 2.9, d * 0.20);
          floorGroup.add(chiller2);

          // Central Mechanical Penthouse / Crown with Beacon
          const crownGeo = new THREE.BoxGeometry(10, 5, 10);
          const crownMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
          const crown = new THREE.Mesh(crownGeo, crownMat);
          crown.position.set(0, 3.7, 0);
          crown.castShadow = true;
          floorGroup.add(crown);

          const beaconGeo = new THREE.SphereGeometry(1.4, 16, 16);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(0, 7.0, 0);
          floorGroup.add(beacon);
        }
      });
    });

    buildingGroupsRef.current = buildingGroups;
    interactiveMeshesRef.current = interactiveList;

    // 8. Municipal Solar Farm
    const solarFarmGroup = new THREE.Group();
    solarFarmGroup.position.set(160, 0, -140);
    scene.add(solarFarmGroup);

    const sfPlinthGeo = new THREE.BoxGeometry(90, 1.5, 70);
    const sfPlinthMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const sfPlinth = new THREE.Mesh(sfPlinthGeo, sfPlinthMat);
    sfPlinth.position.y = 0.75;
    sfPlinth.receiveShadow = true;
    solarFarmGroup.add(sfPlinth);

    for (let px = -35; px <= 35; px += 18) {
      for (let pz = -22; pz <= 22; pz += 15) {
        const pGeo = new THREE.BoxGeometry(14, 0.4, 9);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.95 });
        const panel = new THREE.Mesh(pGeo, pMat);
        panel.position.set(px, 4.2, pz);
        panel.rotation.x = -0.32;
        panel.castShadow = true;
        solarFarmGroup.add(panel);

        const poleGeo = new THREE.CylinderGeometry(0.4, 0.4, 3.5, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(px, 1.8, pz);
        solarFarmGroup.add(pole);
      }
    }

    // 9. BESS Substation
    const bessGroup = new THREE.Group();
    bessGroup.position.set(-150, 0, -100);
    scene.add(bessGroup);

    const bPlinthGeo = new THREE.BoxGeometry(65, 1.5, 45);
    const bPlinthMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const bPlinth = new THREE.Mesh(bPlinthGeo, bPlinthMat);
    bPlinth.position.y = 0.75;
    bPlinth.receiveShadow = true;
    bessGroup.add(bPlinth);

    for (let c = -18; c <= 18; c += 18) {
      const boxGeo = new THREE.BoxGeometry(13, 9, 24);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });
      const containerBox = new THREE.Mesh(boxGeo, boxMat);
      containerBox.position.set(c, 4.5, 0);
      containerBox.castShadow = true;
      bessGroup.add(containerBox);

      const ledGeo = new THREE.BoxGeometry(0.4, 6, 1.0);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(c + 6.6, 4.5, 7);
      bessGroup.add(led);
    }

    // 10. Smart Eco-Villas
    const resGroup = new THREE.Group();
    resGroup.position.set(-130, 0, 70);
    scene.add(resGroup);

    for (let vx = -25; vx <= 25; vx += 24) {
      for (let vz = -20; vz <= 20; vz += 22) {
        const villaGeo = new THREE.BoxGeometry(14, 7.5, 13);
        const villaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
        const villa = new THREE.Mesh(villaGeo, villaMat);
        villa.position.set(vx, 3.75, vz);
        villa.castShadow = true;
        resGroup.add(villa);

        const roofGeo = new THREE.ConeGeometry(11, 4.5, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.7 });
        const vRoof = new THREE.Mesh(roofGeo, roofMat);
        vRoof.position.set(vx, 9.5, vz);
        vRoof.rotation.y = Math.PI / 4;
        vRoof.castShadow = true;
        resGroup.add(vRoof);
      }
    }

    // 11. Energy Flow Bezier Conduits
    const flowCurves = [];
    const pulses = [];

    const createConduit = (start, end, colorHex) => {
      const mid = new THREE.Vector3(
        (start.x + end.x) / 2,
        Math.max(start.y, end.y) + 24,
        (start.z + end.z) / 2
      );
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(36);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.45,
        linewidth: 2
      });
      const line = new THREE.Line(geom, mat);
      scene.add(line);
      flowCurves.push(curve);

      const pulseGeo = new THREE.SphereGeometry(1.6, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x006948 });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      scene.add(pulseMesh);
      pulses.push({ mesh: pulseMesh, curve, t: Math.random() });
    };

    createConduit(new THREE.Vector3(160, 6, -140), new THREE.Vector3(-150, 7, -100), 0x0284c7);
    createConduit(new THREE.Vector3(-150, 7, -100), new THREE.Vector3(-80, 12, -40), 0x006948);
    createConduit(new THREE.Vector3(160, 6, -140), new THREE.Vector3(75, 12, -50), 0x006948);
    createConduit(new THREE.Vector3(-150, 7, -100), new THREE.Vector3(75, 12, 70), 0x006948);

    flowCurvesRef.current = flowCurves;
    pulseMarkersRef.current = pulses;

    // 12. Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveList, false);

      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = 'default';
      }
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveList, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const bId = hit.userData.buildingId;
        const fId = hit.userData.floorId;

        if (bId) {
          // If no building selected yet, focus on this building
          onSelectBuilding(bId);
          // If already in this building and clicks a floor, focus on that floor!
          if (fId) {
            onSelectFloor(fId);
          }
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      camera.position.lerp(cameraTargetPos.current, 0.05);
      controls.target.lerp(cameraLookTarget.current, 0.05);
      controls.update();

      // Animate Cool Airflow Breeze from Ceiling Diffusers
      const time = performance.now() * 0.003;
      airflowStreamsRef.current.forEach((stream) => {
        const pulse = Math.sin(time * 2.8 + stream.phase);
        if (stream.outer && stream.outer.material) {
          stream.outer.scale.set(1.0 + pulse * 0.09, 1.0 + pulse * 0.12, 1.0 + pulse * 0.09);
          stream.outer.material.opacity = 0.22 + pulse * 0.08;
        }
        if (stream.inner && stream.inner.material) {
          stream.inner.scale.set(1.0 - pulse * 0.07, 1.0 + pulse * 0.15, 1.0 - pulse * 0.07);
          stream.inner.material.opacity = 0.16 + pulse * 0.06;
        }
      });

      if (showEnergyFlow) {
        pulses.forEach((p) => {
          p.t += 0.007;
          if (p.t > 1) p.t = 0;
          const pos = p.curve.getPoint(p.t);
          p.mesh.position.copy(pos);
          p.mesh.visible = true;
        });
      } else {
        pulses.forEach((p) => (p.mesh.visible = false));
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', onClick);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update Night / Day lighting
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;
    if (isNightMode) {
      sceneRef.current.background = new THREE.Color(0x0a0f1d);
      sceneRef.current.fog = new THREE.FogExp2(0x0a0f1d, 0.0022);
      dirLightRef.current.color = new THREE.Color(0x38bdf8);
      dirLightRef.current.intensity = 0.55;
      hemiLightRef.current.intensity = 0.35;
    } else {
      sceneRef.current.background = new THREE.Color(0xe2e8f0);
      sceneRef.current.fog = new THREE.FogExp2(0xe2e8f0, 0.0016);
      dirLightRef.current.color = new THREE.Color(0xfffbf0);
      dirLightRef.current.intensity = 1.6;
      hemiLightRef.current.intensity = 0.95;
    }
  }, [isNightMode]);

  // Update Wireframe mode
  useEffect(() => {
    interactiveMeshesRef.current.forEach((mesh) => {
      if (mesh.material) {
        mesh.material.wireframe = wireframeMode;
      }
    });
  }, [wireframeMode]);

  // 3-STAGE CAMERA & FLOOR SELECTION LOGIC
  useEffect(() => {
    const buildingGroups = buildingGroupsRef.current;
    if (!buildingGroups) return;

    const setGlassOpacity = (glassObj, op) => {
      if (!glassObj) return;
      if (glassObj.material) {
        glassObj.material.opacity = op;
        glassObj.material.transparent = true;
      }
      if (glassObj.children) {
        glassObj.children.forEach((c) => {
          if (c.material) {
            c.material.opacity = op;
            c.material.transparent = true;
          }
        });
      }
    };

    if (selectedBuildingId && BUILDINGS_DATA[selectedBuildingId]) {
      const bData = BUILDINGS_DATA[selectedBuildingId];
      const bx = bData.position[0];
      const by = bData.position[1];
      const bz = bData.position[2];

      const targetBuildingGroup = buildingGroups[selectedBuildingId];
      let activeFloorY = 25; // default fallback

      if (selectedFloorId && targetBuildingGroup) {
        // STAGE 3: FOCUSED ON A SPECIFIC FLOOR PLATE CLEARLY
        const activeFloorChild = targetBuildingGroup.children.find(
          (c) => c.userData.isFloor && c.userData.floorId === selectedFloorId
        );
        if (activeFloorChild) {
          activeFloorY = activeFloorChild.userData.explodedY;
        }

        // Camera zooms in close, high-angle architectural view looking right onto that floor!
        cameraTargetPos.current.set(bx + 38, activeFloorY + 36, bz + 46);
        cameraLookTarget.current.set(bx, activeFloorY + 1.5, bz);

        // Adjust floors: floors above lift up & fade out so view is completely unobstructed!
        Object.entries(buildingGroups).forEach(([bId, group]) => {
          const isTarget = bId === selectedBuildingId;

          group.children.forEach((child) => {
            if (child.userData.isFloor) {
              const isSelectedFloor = isTarget && child.userData.floorId === selectedFloorId;
              const isFloorAbove = isTarget && child.userData.explodedY > activeFloorY;
              const isFloorBelow = isTarget && child.userData.explodedY < activeFloorY;

              if (isSelectedFloor) {
                child.position.y = activeFloorY;
                child.visible = true;

                // Make interior detail prominent
                const interior = child.children.find((c) => c.userData.isInteriorDetail);
                if (interior) interior.visible = true;

                // Open up view to the air conditioning & ducts by making facade glass crystal clear
                const glass = child.children.find((c) => c.userData.isFacadeGlass);
                setGlassOpacity(glass, 0.05);

                const slab = child.children.find((c) => c.userData.isFloorClickable);
                if (slab && slab.material) {
                  slab.material.color = new THREE.Color(0xffffff);
                  slab.material.emissive = new THREE.Color(0x003322);
                  slab.material.opacity = 1.0;
                }
              } else if (isFloorAbove) {
                // Lift higher and fade to transparent so it does NOT block the floor!
                child.position.y = child.userData.explodedY + 38;
                const interior = child.children.find((c) => c.userData.isInteriorDetail);
                if (interior) interior.visible = false;

                const slab = child.children.find((c) => c.userData.isFloorClickable);
                if (slab && slab.material) {
                  slab.material.color = new THREE.Color(0xcbd5e1);
                  slab.material.emissive = new THREE.Color(0x000000);
                  slab.material.opacity = 0.08;
                }
              } else if (isFloorBelow) {
                // Keep below with subtle presence
                child.position.y = child.userData.explodedY;
                const interior = child.children.find((c) => c.userData.isInteriorDetail);
                if (interior) interior.visible = false;

                const slab = child.children.find((c) => c.userData.isFloorClickable);
                if (slab && slab.material) {
                  slab.material.color = new THREE.Color(0x94a3b8);
                  slab.material.emissive = new THREE.Color(0x000000);
                  slab.material.opacity = 0.25;
                }
              } else {
                // Other buildings dim
                child.position.y = child.userData.baseY;
                const slab = child.children.find((c) => c.userData.isFloorClickable);
                if (slab && slab.material) {
                  slab.material.color = new THREE.Color(0x94a3b8);
                  slab.material.opacity = 0.18;
                }
              }
            }
          });
        });
      } else {
        // STAGE 2: FOCUSED ON THE WHOLE BUILDING (EXPLODED STACK VIEW)
        // Camera frames the entire exploded building nicely
        cameraTargetPos.current.set(bx + 75, by + 58, bz + 88);
        cameraLookTarget.current.set(bx, by + 26, bz);

        Object.entries(buildingGroups).forEach(([bId, group]) => {
          const isTarget = bId === selectedBuildingId;

          group.children.forEach((child) => {
            if (child.userData.isFloor) {
              const targetY = isTarget ? child.userData.explodedY : child.userData.baseY;
              child.position.y = targetY;
              child.visible = true;

              const interior = child.children.find((c) => c.userData.isInteriorDetail);
              if (interior) interior.visible = isTarget;

              const glass = child.children.find((c) => c.userData.isFacadeGlass);
              setGlassOpacity(glass, 0.55);

              const slab = child.children.find((c) => c.userData.isFloorClickable);
              if (slab && slab.material) {
                if (isTarget) {
                  slab.material.color = new THREE.Color(slab.userData.originalColor);
                  slab.material.emissive = new THREE.Color(0x000000);
                  slab.material.opacity = 0.95;
                } else {
                  slab.material.color = new THREE.Color(0x94a3b8);
                  slab.material.emissive = new THREE.Color(0x000000);
                  slab.material.opacity = 0.22;
                }
              }
            }
          });
        });
      }
    } else {
      // STAGE 1: TOWNSHIP OVERVIEW (MACRO VIEW)
      cameraTargetPos.current.set(0, 240, 310);
      cameraLookTarget.current.set(0, 0, 0);

      Object.values(buildingGroups).forEach((group) => {
        group.children.forEach((child) => {
          if (child.userData.isFloor) {
            child.position.y = child.userData.baseY;
            child.visible = true;

            const interior = child.children.find((c) => c.userData.isInteriorDetail);
            if (interior) interior.visible = false;

            const glass = child.children.find((c) => c.userData.isFacadeGlass);
            setGlassOpacity(glass, 0.55);

            const slab = child.children.find((c) => c.userData.isFloorClickable);
            if (slab && slab.material) {
              slab.material.color = new THREE.Color(slab.userData.originalColor);
              slab.material.emissive = new THREE.Color(0x000000);
              slab.material.opacity = 0.95;
            }
          }
        });
      });
    }
  }, [selectedBuildingId, selectedFloorId]);

  return <div ref={mountRef} className="w-full h-full relative" />;
}
