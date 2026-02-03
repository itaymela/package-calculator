import React, { useState, useEffect } from 'react';
import { Package, Product } from './types';
import ProductManager from './components/ProductManager';
import PackageManager from './components/PackageManager';
import OrderSimulator from './components/OrderSimulator';
import Settings from './components/Settings';
import { LayoutDashboard, Package as PackageIcon, ShoppingCart, TrendingUp, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'products' | 'packages' | 'simulator' | 'settings'>('products');
  
  // -- Data State --
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // -- Persistence --
  useEffect(() => {
    const loadData = () => {
      try {
        const savedProducts = localStorage.getItem('profitcalc_products');
        const savedPackages = localStorage.getItem('profitcalc_packages');
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedPackages) setPackages(JSON.parse(savedPackages));
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('profitcalc_products', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('profitcalc_packages', JSON.stringify(packages));
    }
  }, [packages, isLoaded]);

  // -- Handlers --
  const handleAddProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddPackage = (pkg: Package) => {
    setPackages(prev => [...prev, pkg]);
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק חבילה זו?')) {
      setPackages(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleImportData = (data: { products: Product[], packages: Package[] }) => {
    try {
      // 1. Direct State Update
      setProducts(data.products);
      setPackages(data.packages);

      // 2. LocalStorage Sync (Force write to ensure persistence before reload)
      localStorage.setItem('profitcalc_products', JSON.stringify(data.products));
      localStorage.setItem('profitcalc_packages', JSON.stringify(data.packages));

      // 3. Force Refresh to ensure clean state
      // Using a small timeout to allow any immediate React renders or event loops to complete,
      // though typically localStorage is synchronous.
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Import failed:", error);
      alert("שגיאה בייבוא הנתונים");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-e border-slate-200 flex flex-col shadow-sm sticky top-0 z-20 h-auto md:h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-l from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            ProfitCalc IL
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavButton 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')}
            icon={<LayoutDashboard size={20} />}
            label="קביעת מוצרים"
            desc="ניהול מלאי ועלויות"
          />
          <NavButton 
            active={activeTab === 'packages'} 
            onClick={() => setActiveTab('packages')}
            icon={<PackageIcon size={20} />}
            label="קביעת חבילות"
            desc="בניית מארזים ותמחור"
          />
          <NavButton 
            active={activeTab === 'simulator'} 
            onClick={() => setActiveTab('simulator')}
            icon={<ShoppingCart size={20} />}
            label="בדיקת הזמנות"
            desc="סימולטור רווחים"
          />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<SettingsIcon size={20} />}
              label="ניהול נתונים"
              desc="גיבוי ושחזור"
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          &copy; {new Date().getFullYear()} ProfitCalc IL
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm sticky top-0 z-10">
           <div>
             <h2 className="text-2xl font-bold text-slate-800">
               {activeTab === 'products' && 'ניהול מוצרים'}
               {activeTab === 'packages' && 'בניית חבילות'}
               {activeTab === 'simulator' && 'סימולטור הזמנות'}
               {activeTab === 'settings' && 'הגדרות וניהול נתונים'}
             </h2>
             <p className="text-sm text-slate-500 mt-1">
               {activeTab === 'products' && 'הוסף את מוצרי הבסיס וקבע את עלותם'}
               {activeTab === 'packages' && 'צור חבילות רווחיות מהמוצרים הקיימים'}
               {activeTab === 'simulator' && 'בדוק את הרווחיות שלך בזמן אמת עבור כל הזמנה'}
               {activeTab === 'settings' && 'ייצוא וייבוא נתונים לגיבוי ושחזור'}
             </p>
           </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
          {activeTab === 'products' && (
            <ProductManager 
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'packages' && (
            <PackageManager 
              products={products}
              packages={packages}
              onAddPackage={handleAddPackage}
              onDeletePackage={handleDeletePackage}
            />
          )}

          {activeTab === 'simulator' && (
            <OrderSimulator 
              packages={packages}
              products={products}
            />
          )}

          {activeTab === 'settings' && (
            <Settings 
              products={products}
              packages={packages}
              onImport={handleImportData}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Internal Sidebar Button Component
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; desc: string }> = ({ active, onClick, icon, label, desc }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-right group ${
      active 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
    }`}
  >
    <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-white' : 'bg-slate-100 group-hover:bg-white'}`}>
      {icon}
    </div>
    <div>
      <div className="font-semibold">{label}</div>
      <div className={`text-xs ${active ? 'text-indigo-500' : 'text-slate-400'}`}>{desc}</div>
    </div>
  </button>
);

export default App;