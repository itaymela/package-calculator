import React, { useState, useMemo } from 'react';
import { Product, Package, PackageItem, PackageManagerProps } from '../types';
import { Button, Input, Card, StatCard } from './ui/UIComponents';
import { Trash2, Plus, Box, ArrowLeft, Save, AlertCircle } from 'lucide-react';

const PackageManager: React.FC<PackageManagerProps> = ({ 
  products, 
  packages, 
  onAddPackage, 
  onDeletePackage 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  
  // Creation State
  const [pkgName, setPkgName] = useState('');
  const [pkgItems, setPkgItems] = useState<PackageItem[]>([]);
  const [sellingPrice, setSellingPrice] = useState('');

  // Helper to get total cost of a package (dynamic based on current product prices)
  const calculateCost = (items: PackageItem[]) => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.cost * item.quantity : 0);
    }, 0);
  };

  // Real-time calculation for creation form
  const currentCost = useMemo(() => calculateCost(pkgItems), [pkgItems, products]);
  const currentPrice = parseFloat(sellingPrice) || 0;
  const currentProfit = currentPrice - currentCost;
  const currentMargin = currentPrice > 0 ? (currentProfit / currentPrice) * 100 : 0;

  const handleAddItem = (productId: string) => {
    if (!productId) return;
    setPkgItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setPkgItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateItemQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setPkgItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: qty } : item));
  };

  const handleSave = () => {
    if (!pkgName || pkgItems.length === 0 || !sellingPrice) return;
    
    onAddPackage({
      id: crypto.randomUUID(),
      name: pkgName,
      items: pkgItems,
      sellingPrice: parseFloat(sellingPrice)
    });

    // Reset
    setPkgName('');
    setPkgItems([]);
    setSellingPrice('');
    setIsCreating(false);
  };

  // List View Rendering
  if (!isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">החבילות שלי</h2>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            צור חבילה חדשה
          </Button>
        </div>

        {packages.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
             <Box className="w-16 h-16 mx-auto text-slate-300 mb-4" />
             <h3 className="text-lg font-medium text-slate-900">אין חבילות עדיין</h3>
             <p className="text-slate-500 mt-1">צור חבילה המורכבת מהמוצרים שלך כדי להתחיל.</p>
             <Button onClick={() => setIsCreating(true)} variant="secondary" className="mt-4">
               צור חבילה ראשונה
             </Button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {packages.map(pkg => {
              const cost = calculateCost(pkg.items);
              const profit = pkg.sellingPrice - cost;
              const margin = pkg.sellingPrice > 0 ? (profit / pkg.sellingPrice) * 100 : 0;
              
              return (
                <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-slate-800">{pkg.name}</h3>
                      <button 
                        onClick={() => onDeletePackage(pkg.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">עלות מוצרים:</span>
                        <span className="font-medium text-slate-700">₪{cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">מחיר מכירה:</span>
                        <span className="font-medium text-slate-900">₪{pkg.sellingPrice.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-100 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">רווח:</span>
                        <span className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ₪{profit.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                      <span className="text-xs text-slate-500 uppercase tracking-wide">אחוז רווח</span>
                      <div className={`font-bold ${margin >= 30 ? 'text-emerald-600' : margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {margin.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">תכולת החבילה:</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.items.slice(0, 3).map((item, i) => {
                          const p = products.find(prod => prod.id === item.productId);
                          return p ? (
                            <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                              {item.quantity}x {p.name}
                            </span>
                          ) : null;
                        })}
                        {pkg.items.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                            +{pkg.items.length - 3} עוד
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Create Mode
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" onClick={() => setIsCreating(false)} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold text-slate-800">בניית חבילה חדשה</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <Input 
              label="שם החבילה"
              placeholder="לדוגמה: מארז חג מפנק"
              value={pkgName}
              onChange={(e) => setPkgName(e.target.value)}
              className="text-lg font-medium"
            />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">תכולת החבילה</h3>
            
            {/* Product Selector */}
            <div className="flex gap-2 mb-6">
              <select 
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 bg-white"
                onChange={(e) => {
                    handleAddItem(e.target.value);
                    e.target.value = ''; // reset
                }}
                defaultValue=""
              >
                <option value="" disabled>בחר מוצר להוספה...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₪{p.cost})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Items List */}
            <div className="space-y-3">
              {pkgItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p>עדיין לא נבחרו מוצרים</p>
                </div>
              ) : (
                pkgItems.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">עלות יחידה: ₪{product.cost}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-300 rounded-md">
                          <button 
                            className="px-2 py-1 text-slate-600 hover:bg-slate-100 border-e border-slate-300"
                            onClick={() => updateItemQty(item.productId, item.quantity + 1)}
                          >+</button>
                          <input 
                            type="number" 
                            className="w-12 text-center text-sm border-none focus:ring-0 p-1"
                            value={item.quantity}
                            onChange={(e) => updateItemQty(item.productId, parseInt(e.target.value) || 0)}
                          />
                          <button 
                             className="px-2 py-1 text-slate-600 hover:bg-slate-100 border-s border-slate-300"
                             onClick={() => updateItemQty(item.productId, item.quantity - 1)}
                          >-</button>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Pricing & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 sticky top-6">
            <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">סיכום תמחור</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-500">עלות כוללת למוצרים</label>
                <div className="text-2xl font-mono text-slate-700">₪{currentCost.toFixed(2)}</div>
              </div>

              <Input 
                label="מחיר מכירה לחבילה (₪)"
                type="number"
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="text-lg font-bold text-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">רווח נקי</div>
                <div className={`text-lg font-bold ${currentProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ₪{currentProfit.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">אחוז רווח</div>
                <div className={`text-lg font-bold ${currentMargin >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                  {currentMargin.toFixed(1)}%
                </div>
              </div>
            </div>
            
            {currentProfit < 0 && (
               <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-4">
                 <AlertCircle className="w-4 h-4" />
                 שים לב: החבילה בהפסד
               </div>
            )}

            <Button 
              className="w-full h-12 text-lg shadow-lg shadow-indigo-200" 
              onClick={handleSave}
              disabled={!pkgName || pkgItems.length === 0 || !sellingPrice}
            >
              <Save className="w-5 h-5 ms-2" />
              שמור חבילה
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PackageManager;