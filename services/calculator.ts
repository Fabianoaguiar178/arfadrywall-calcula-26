
import { ProjectType, Material, MaterialPrices } from '../types';
import { SHEET_SIZE, WASTE_FACTOR, TAPE_ROLL_LENGTH, BOX_SIZES, PAINT_YIELD_18L, MASSA_YIELD_15KG } from '../constants';

export const calculateMaterials = (
  type: ProjectType,
  length: number,
  width: number,
  height: number, // height is used for drop height (rebaixamento) in ceilings
  prices: MaterialPrices,
  includePainting: boolean
): Material[] => {
  const materials: Material[] = [];
  const area = type === ProjectType.CEILING ? length * width : length * height;

  // --- DRYWALL MATERIALS ---
  // Only calculate drywall materials if type is NOT Painting
  if (type === ProjectType.WALL) {
    const numSheets = Math.ceil((area / SHEET_SIZE.area) * WASTE_FACTOR);
    const numTracks = Math.ceil(((length * 2) / 3) * WASTE_FACTOR); 
    const numStuds = Math.ceil(((length / 0.6) + 1) * WASTE_FACTOR); 
    
    materials.push({ category: 'Drywall', name: 'Chapa Drywall 1.20x1.80m', quantity: numSheets, unit: 'und', estimatedPrice: prices.sheet });
    materials.push({ category: 'Drywall', name: 'Guia 30mm 3m', quantity: numTracks, unit: 'und', estimatedPrice: prices.track });
    materials.push({ category: 'Drywall', name: 'Montante 48mm 3m', quantity: numStuds, unit: 'und', estimatedPrice: prices.stud });
    materials.push({ category: 'Drywall', name: 'Parafuso Metal-Metal (LB)', quantity: Math.ceil((numStuds * 4) * WASTE_FACTOR), unit: 'und', estimatedPrice: prices.screw_metal });
    
    // GN25: Box of 1000.
    const rawGn25 = (numSheets * 30) * WASTE_FACTOR;
    const gn25Qty = Math.ceil(rawGn25 / BOX_SIZES.GN25) * BOX_SIZES.GN25;
    materials.push({ category: 'Drywall', name: 'Parafuso GN 25 (Gesso-Metal)', quantity: gn25Qty, unit: 'und', estimatedPrice: prices.screw_sheet });
    
    // Fixing: Bucha 6mm + Screw for tracks (approx 5 per track)
    const rawFixing = (numTracks * 5) * WASTE_FACTOR;
    const fixingQty = Math.ceil(rawFixing / BOX_SIZES.BUCHA6) * BOX_SIZES.BUCHA6;
    materials.push({ category: 'Drywall', name: 'Bucha 6mm c/ Parafuso (Fixação)', quantity: fixingQty, unit: 'und', estimatedPrice: prices.bucha_6 });

    // Tape calculation: ~1.5m per m2. Rounded up to nearest roll with waste factor.
    const tapeQty = Math.ceil(((area * 1.5) / TAPE_ROLL_LENGTH) * WASTE_FACTOR);
    materials.push({ category: 'Drywall', name: 'Fita Telada', quantity: tapeQty, unit: 'und', estimatedPrice: prices.tape });
    
    materials.push({ category: 'Drywall', name: 'Massa para Drywall', quantity: Math.ceil((area * 0.8) * WASTE_FACTOR), unit: 'kg', estimatedPrice: prices.compound });

  } else if (type === ProjectType.CEILING) {
    const perimeter = (length + width) * 2;
    const numSheets = Math.ceil((area / SHEET_SIZE.area) * WASTE_FACTOR);
    const numPerimeter = Math.ceil((perimeter / 3) * WASTE_FACTOR);
    const numF530 = Math.ceil(((length / 0.6) * (width / 3)) * WASTE_FACTOR);
    const numHangers = Math.ceil((area * 1.2) * WASTE_FACTOR);

    // GN25: Box of 1000.
    const rawGn25 = (numSheets * 30) * WASTE_FACTOR;
    const gn25Qty = Math.ceil(rawGn25 / BOX_SIZES.GN25) * BOX_SIZES.GN25;

    // Fixing: 5 per tabica + 1 per wire hanger
    const rawFixing = ((numPerimeter * 5) + numHangers) * WASTE_FACTOR;
    const fixingQty = Math.ceil(rawFixing / BOX_SIZES.BUCHA6) * BOX_SIZES.BUCHA6;

    // Arame calculation: 3 wires per F530. Yield: 10m/kg.
    const dropHeightMeters = height / 100;
    const totalWireLength = (numF530 * 3) * dropHeightMeters;
    const wireKg = Math.ceil((totalWireLength / 10) * WASTE_FACTOR * 10) / 10; 

    materials.push({ category: 'Drywall', name: 'Chapa Drywall 1.20x1.80m', quantity: numSheets, unit: 'und', estimatedPrice: prices.sheet });
    materials.push({ category: 'Drywall', name: 'Cantoneira/Tabica 3m', quantity: numPerimeter, unit: 'und', estimatedPrice: prices.perimeter });
    materials.push({ category: 'Drywall', name: 'Perfil F530 3m', quantity: numF530, unit: 'und', estimatedPrice: prices.f530 });
    materials.push({ category: 'Drywall', name: 'Regulador F530', quantity: numHangers, unit: 'und', estimatedPrice: prices.regulator });
    materials.push({ category: 'Drywall', name: 'Parafuso GN 25 (Gesso-Metal)', quantity: gn25Qty, unit: 'und', estimatedPrice: prices.screw_sheet });
    materials.push({ category: 'Drywall', name: 'Bucha 6mm c/ Parafuso (Fixação)', quantity: fixingQty, unit: 'und', estimatedPrice: prices.bucha_6 });
    
    // Tape calculation: ~1.5m per m2. Rounded up to nearest roll with waste factor.
    const tapeQty = Math.ceil(((area * 1.5) / TAPE_ROLL_LENGTH) * WASTE_FACTOR);
    materials.push({ category: 'Drywall', name: 'Fita Telada', quantity: tapeQty, unit: 'und', estimatedPrice: prices.tape });
    
    materials.push({ category: 'Drywall', name: 'Massa para Drywall', quantity: Math.ceil((area * 0.8) * WASTE_FACTOR), unit: 'kg', estimatedPrice: prices.compound });
    
    if (wireKg > 0) {
      materials.push({ 
        category: 'Drywall',
        name: 'Arame Galvanizado nº 18', 
        quantity: wireKg, 
        unit: 'kg', 
        estimatedPrice: prices.wire 
      });
    }
  }

  // --- PAINTING MATERIALS ---
  // If Type is PAINTING, we force painting materials.
  // If Type is WALL/CEILING, we check includePainting flag.
  if (type === ProjectType.PAINTING || includePainting) {
     
     // Determine painting area. For Drywall Walls, we paint both sides (area * 2).
     let paintingArea = area;
     if (type === ProjectType.WALL) {
       paintingArea = area * 2;
     }

     // Paint Calculation (Exact Liters)
     // Yield: 80m² per 18L can.
     // Formula: (Area / 80) * 18 = Total Liters needed.
     const litersNeeded = (paintingArea / PAINT_YIELD_18L) * 18;
     // Price per Liter based on 18L can price
     const pricePerLiter = prices.paint_18l / 18;
     
     materials.push({ 
       category: 'Pintura', 
       name: `Tinta Acrílica (Consumo)${type === ProjectType.WALL ? ' - 2 Lados' : ''}`, 
       quantity: parseFloat(litersNeeded.toFixed(2)), 
       unit: 'L', 
       estimatedPrice: pricePerLiter 
     });

     // Massa Corrida Calculation (Exact Kgs)
     // Yield: 12m² per 15kg bag.
     // Formula: (Area / 12) * 15 = Total Kg needed.
     const kgMassaNeeded = (paintingArea / MASSA_YIELD_15KG) * 15;
     // Price per Kg based on 15kg bag price
     const pricePerKgMassa = prices.massa_15kg / 15;

     materials.push({ 
       category: 'Pintura', 
       name: `Massa Corrida (Consumo)${type === ProjectType.WALL ? ' - 2 Lados' : ''}`, 
       quantity: parseFloat(kgMassaNeeded.toFixed(2)), 
       unit: 'kg', 
       estimatedPrice: pricePerKgMassa 
     });

     // Sandpaper (Lixas): 2 per 100m²
     // Requirement says: "2 lixas a cada 100 metros".
     const sandPaperQty = Math.ceil((paintingArea / 100) * 2);
     materials.push({ category: 'Pintura', name: 'Lixa (Folha)', quantity: Math.max(2, sandPaperQty), unit: 'und', estimatedPrice: prices.sandpaper });

     // Fixed items per project (Obra)
     materials.push({ category: 'Pintura', name: 'Rolo de Pintura', quantity: 1, unit: 'und', estimatedPrice: prices.roller });
     materials.push({ category: 'Pintura', name: 'Pincel / Trincha', quantity: 1, unit: 'und', estimatedPrice: prices.brush });
     materials.push({ category: 'Pintura', name: 'Fita Crepe Larga', quantity: 1, unit: 'und', estimatedPrice: prices.wide_tape });
     materials.push({ category: 'Pintura', name: 'Lona Plástica (Proteção)', quantity: 10, unit: 'm', estimatedPrice: prices.canvas });
  }

  return materials;
};

// New Helper to consolidate materials from multiple rooms
export const consolidateMaterials = (roomsMaterials: Material[][]): Material[] => {
  const consolidated: { [key: string]: Material } = {};

  roomsMaterials.flat().forEach(mat => {
    // Unique key combining name and category to avoid collisions
    const key = `${mat.category}-${mat.name}`;
    
    if (consolidated[key]) {
      consolidated[key].quantity += mat.quantity;
      // Re-normalize specific logic if needed (like rounding boxes), but simpler to just sum up first
    } else {
      consolidated[key] = { ...mat };
    }
  });

  // Re-apply specific box logic for total quantities if necessary (optional improvement)
  // For simplicity, we assume sum of quantities is accurate enough, but let's do a pass 
  // to round up things like Tape or Boxes if needed. 
  // However, simple summing is usually safer for aggregated lists to avoid over-buying.
  // The individual room calc already applies waste factor.

  // We do need to handle "Fixed items per project" like Roller/Brush so we don't buy 30 rollers for 30 rooms if not needed.
  // BUT the calculateMaterials function adds them PER call.
  // Strategy: For tools (Rolo, Pincel, Lona), we might want to cap them or set them to 1 manually after consolidation.
  const tools = ['Rolo de Pintura', 'Pincel / Trincha', 'Fita Crepe Larga', 'Lona Plástica (Proteção)'];
  
  return Object.values(consolidated).map(mat => {
     if (tools.includes(mat.name) && mat.category === 'Pintura') {
         // Determine logic: Maybe 1 kit per 3 rooms? Or just 1 kit total?
         // Let's keep it simple: 1 kit per project is usually enough unless it's huge.
         // Let's set it to Math.ceil(qty / items_added_count) ? No, hard to know count here.
         // Let's Just cap it at a reasonable number or leave it. 
         // If I have 30 rooms, 30 rollers is too much.
         // Let's set quantity to 1 if it's a tool, or scale by area?
         // Better: The user can check the final list. 
         // FIX: Let's set tools to 1 set per project in consolidation logic for specific items.
         if (mat.name === 'Rolo de Pintura' || mat.name === 'Pincel / Trincha') return { ...mat, quantity: 2 }; // 2 sets for safety
         if (mat.name === 'Lona Plástica (Proteção)') return { ...mat, quantity: Math.ceil(mat.quantity / 5) * 10 }; // Keep logic somewhat proportional but reduced
     }
     return { 
        ...mat, 
        quantity: parseFloat(mat.quantity.toFixed(2)) 
     };
  });
};

export const calculateTotals = (
  materials: Material[],
  type: string, // Changed to string
  area: number,
  laborPrice: number,
  paintingPrice: number,
  includePainting: boolean
) => {
  const materialTotal = materials.reduce((acc, m) => acc + (m.quantity * m.estimatedPrice), 0);
  
  // Labor calculations
  let laborTotal = 0;
  let paintingTotal = 0;

  if (type === ProjectType.PAINTING) {
    // Only painting labor (user inputs area directly or L x H)
    paintingTotal = area * paintingPrice;
  } else {
    // Drywall labor
    laborTotal = area * laborPrice;
    
    // Optional painting labor
    if (includePainting) {
      let paintingArea = area;
      if (type === ProjectType.WALL) {
        paintingArea = area * 2; // Labor is also for 2 sides
      }
      paintingTotal = paintingArea * paintingPrice;
    }
  }
  
  const totalValue = materialTotal + laborTotal + paintingTotal;
  const downPayment = totalValue * 0.60;

  return { materialTotal, laborTotal, paintingTotal, totalValue, downPayment };
};
