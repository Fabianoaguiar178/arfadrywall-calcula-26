
import { Project, User, Company, MaterialPrices, GalleryItem } from '../types';
import { MATERIAL_PRICES } from '../constants';

const STORAGE_KEYS = {
  PROJECTS: 'arfa_projects',
  USER: 'arfa_user',
  COMPANY: 'arfa_company',
  GALLERY: 'arfa_gallery'
};

// Safety wrapper for WebView/APK environments where localStorage might be restricted
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('Storage access denied', e);
    return null;
  }
};

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('Storage write denied', e);
  }
};

export const saveProject = (project: Project) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getProjects = (): Project[] => {
  const data = safeGetItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveCompany = (company: Company) => {
  safeSetItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
};

export const getCompany = (): Company => {
  const data = safeGetItem(STORAGE_KEYS.COMPANY);
  if (data) {
    const parsed = JSON.parse(data);
    // Migration: ensure materialPrices exists and has all current keys
    // Deep merge to ensure new keys (like regulator, wire) are added to existing saved data
    parsed.materialPrices = { ...MATERIAL_PRICES, ...(parsed.materialPrices || {}) };
    return parsed;
  }
  
  return {
    name: 'Minha Empresa Drywall',
    cnpj: '00.000.000/0001-00',
    phone: '(11) 99999-9999',
    email: 'contato@empresa.com',
    defaultLaborPrice: 35.00,
    defaultPaintingPrice: 25.00,
    materialPrices: { ...MATERIAL_PRICES }
  };
};

export const getUser = (): User => {
  const data = safeGetItem(STORAGE_KEYS.USER);
  if (data) {
    const user = JSON.parse(data);
    // Migration: Add installDate if missing
    if (!user.installDate) {
      user.installDate = Date.now();
      safeSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return user;
  }
  
  const newUser: User = {
    id: 'user_1',
    email: 'usuario@arfa.com',
    subscriptionActive: false,
    installDate: Date.now()
  };
  safeSetItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  return newUser;
};

export const updateUser = (user: User) => {
  safeSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// --- Gallery Storage ---
export const getGallery = (): GalleryItem[] => {
  const data = safeGetItem(STORAGE_KEYS.GALLERY);
  return data ? JSON.parse(data) : [];
};

export const addToGallery = (item: GalleryItem) => {
  const items = getGallery();
  items.push(item);
  safeSetItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
};

export const removeFromGallery = (id: string) => {
  const items = getGallery();
  const filtered = items.filter(i => i.id !== id);
  safeSetItem(STORAGE_KEYS.GALLERY, JSON.stringify(filtered));
};