
export enum ProjectType {
  WALL = 'Parede',
  CEILING = 'Forro',
  PAINTING = 'Pintura' // Added standalone painting type
}

export interface MaterialPrices {
  sheet: number;
  stud: number;
  track: number;
  f530: number;
  perimeter: number;
  screw_sheet: number;
  screw_metal: number;
  tape: number;
  compound: number;
  bucha_6: number;
  regulator: number;
  wire: number;
  // Painting Items
  paint_18l: number;
  massa_15kg: number;
  sandpaper: number;
  roller: number;
  brush: number;
  wide_tape: number;
  canvas: number;
}

export interface Material {
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  category: 'Drywall' | 'Pintura'; // Added category for organization
}

export interface Client {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Company {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  logo?: string;
  defaultLaborPrice: number;
  defaultPaintingPrice: number;
  materialPrices: MaterialPrices;
}

export interface ProjectRoom {
  id: string;
  name: string;
  type: ProjectType;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  includePainting?: boolean; // New: Per-room painting flag
  materials: Material[]; // Calculated materials for this specific room
}

export interface Project {
  id: string;
  date: string;
  client: Client;
  type: string; // Changed from ProjectType to string to support "Múltiplos Ambientes"
  rooms?: ProjectRoom[]; // New: List of rooms
  
  // Legacy single-room dimensions (optional now)
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  
  includePainting: boolean; // Kept for legacy compatibility or global summary
  laborPrice: number;
  paintingPrice: number;
  materials: Material[]; // Aggregated total materials
  materialTotal: number;
  laborTotal: number;
  paintingTotal: number;
  totalValue: number;
  downPayment: number;
  status: 'draft' | 'sent' | 'approved';
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  url: string; // Base64 for images, URL for videos
  date: number;
}

export interface User {
  id: string;
  email: string;
  company?: Company;
  subscriptionActive: boolean;
  subscriptionExpiresAt?: string;
  installDate: number; // Timestamp for trial period tracking
}
