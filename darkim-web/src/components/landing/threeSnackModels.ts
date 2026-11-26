import * as THREE from 'three';

/**
 * Procedural Pixel-Art Texture Generator for Ciki (Chips Bag)
 */
export function createChipsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.imageSmoothingEnabled = false;

    // 1. Red base
    ctx.fillStyle = '#E53E3E';
    ctx.fillRect(0, 0, 128, 128);

    // 2. Top & bottom crinkle strip (darker red)
    ctx.fillStyle = '#9B1C1C';
    ctx.fillRect(0, 0, 128, 12);
    ctx.fillRect(0, 116, 128, 12);

    // Blue wavy stripe
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(128, 65);
    ctx.lineTo(128, 85);
    ctx.lineTo(0, 95);
    ctx.closePath();
    ctx.fill();

    // 3. Vibrant yellow center banner
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.lineTo(128, 20);
    ctx.lineTo(128, 66);
    ctx.lineTo(0, 72);
    ctx.closePath();
    ctx.fill();

    // 4. "CHIPS" Pixel-style text
    ctx.fillStyle = '#111827';
    ctx.font = '900 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CHIPS', 65, 46);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('CHIPS', 63, 44);

    // 5. Pixel chip illustration
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(64, 98, 18, 11, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#78350F';
    ctx.stroke();

    // 6. Mini barcode
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(16, 96, 26, 16);
    ctx.fillStyle = '#000000';
    for (let x = 18; x < 40; x += 3) {
      ctx.fillRect(x, 98, 1.5, 12);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

/**
 * Procedural Pixel-Art Texture Generator for Soda Can
 */
export function createSodaCanTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.imageSmoothingEnabled = false;

    // 1. Emerald green brand color
    ctx.fillStyle = '#00D084';
    ctx.fillRect(0, 0, 128, 128);

    // 2. Dark neo-brutalist bands
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 16, 128, 6);
    ctx.fillRect(0, 106, 128, 6);

    // 3. Diagonal lime highlight stripe
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(128, 48);
    ctx.lineTo(128, 64);
    ctx.lineTo(0, 48);
    ctx.closePath();
    ctx.fill();

    // 4. "SODA" / "DARK" retro text
    ctx.fillStyle = '#000000';
    ctx.font = '900 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SODA', 65, 78);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('SODA', 63, 76);

    // 5. Pixel bubbles
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(25, 40, 4, 4);
    ctx.fillRect(35, 52, 6, 6);
    ctx.fillRect(95, 36, 5, 5);
    ctx.fillRect(105, 58, 4, 4);
    ctx.fillRect(80, 95, 5, 5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

/**
 * Procedural Low-Poly Puffed Snack Bag Mesh
 */
export function createLowPolyChipsBag(texture: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();

  // Box geometry with segments to allow puffing & crimping
  const width = 1.35;
  const height = 1.75;
  const depth = 0.45;
  const geo = new THREE.BoxGeometry(width, height, depth, 4, 6, 2);

  const pos = geo.attributes.position;
  const halfH = height / 2;

  // Deform vertices: puff out middle, flatten top & bottom crimp
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const normalizedY = y / halfH; // -1 to +1
    const distFromCenter = Math.abs(normalizedY);

    const puff = Math.cos(normalizedY * Math.PI * 0.5);

    const z = pos.getZ(i);
    if (distFromCenter > 0.85) {
      pos.setZ(i, z * 0.12);
    } else {
      pos.setZ(i, z * (1 + puff * 0.55));
    }

    const x = pos.getX(i);
    pos.setX(i, x * (1 + puff * 0.15));
  }

  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.35,
    metalness: 0.1,
    flatShading: true,
  });

  const bagMesh = new THREE.Mesh(geo, mat);
  group.add(bagMesh);

  // Crimped edges (top and bottom zig-zag / ribbed strips)
  const crimpMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.5,
    flatShading: true,
  });

  const crimpTopGeo = new THREE.BoxGeometry(width * 1.04, 0.12, 0.08, 6, 1, 1);
  const crimpTop = new THREE.Mesh(crimpTopGeo, crimpMat);
  crimpTop.position.y = halfH + 0.04;
  group.add(crimpTop);

  const crimpBotGeo = new THREE.BoxGeometry(width * 1.04, 0.12, 0.08, 6, 1, 1);
  const crimpBot = new THREE.Mesh(crimpBotGeo, crimpMat);
  crimpBot.position.y = -halfH - 0.04;
  group.add(crimpBot);

  return group;
}

/**
 * Procedural Low-Poly Soda Can Mesh
 */
export function createLowPolySodaCan(texture: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();

  const radius = 0.48;
  const height = 1.45;
  const segments = 12;

  // Main Can Body
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, segments, 1);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.3,
    metalness: 0.25,
    flatShading: true,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(bodyMesh);

  // Metallic Material for rims & lid
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.3,
    metalness: 0.85,
    flatShading: true,
  });

  // Top Rim
  const rimTopGeo = new THREE.CylinderGeometry(radius * 1.03, radius * 0.98, 0.09, segments);
  const rimTop = new THREE.Mesh(rimTopGeo, metalMat);
  rimTop.position.y = height / 2 + 0.03;
  group.add(rimTop);

  // Bottom Rim
  const rimBotGeo = new THREE.CylinderGeometry(radius * 0.98, radius * 0.9, 0.09, segments);
  const rimBot = new THREE.Mesh(rimBotGeo, metalMat);
  rimBot.position.y = -height / 2 - 0.03;
  group.add(rimBot);

  // Top Lid Plate
  const lidGeo = new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, 0.04, segments);
  const lid = new THREE.Mesh(lidGeo, metalMat);
  lid.position.y = height / 2 + 0.05;
  group.add(lid);

  // Low-poly Pull Tab
  const tabGeo = new THREE.BoxGeometry(0.14, 0.02, 0.26);
  const tab = new THREE.Mesh(tabGeo, metalMat);
  tab.position.set(0, height / 2 + 0.08, 0.08);
  tab.rotation.x = -0.1;
  group.add(tab);

  return group;
}
