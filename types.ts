export interface Product {
  id: string;
  name: string;
  cost: number; // Represents Cost per Unit
  
  // Bulk Item Fields
  isBulk?: boolean;
  packCost?: number;
  packUnits?: number;
}

export interface PackageItem {
  productId: string;
  quantity: number;
}

export interface Package {
  id: string;
  name: string;
  items: PackageItem[];
  sellingPrice: number;
}

// Helper types for props
export interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export interface PackageManagerProps {
  products: Product[];
  packages: Package[];
  onAddPackage: (pkg: Package) => void;
  onDeletePackage: (id: string) => void;
}

export interface OrderSimulatorProps {
  packages: Package[];
  products: Product[]; // Needed to calculate dynamic costs
}

export interface SettingsProps {
  products: Product[];
  packages: Package[];
  onImport: (data: { products: Product[], packages: Package[] }) => void;
}
