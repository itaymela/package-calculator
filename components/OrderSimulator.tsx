import React, { useState, useMemo } from 'react';
import { Package, Product, OrderSimulatorProps } from '../types';
import { Card, Button, StatCard } from './ui/UIComponents';
import { ShoppingCart, RefreshCw, Trash2, TrendingUp, DollarSign, Package as PackageIcon, ClipboardList, Box } from 'lucide-react';

const OrderSimulator: React.FC<OrderSimulatorProps> = ({ packages, products }) => {
  // State: Map of packageId -> quantity
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleUpdateQty = (pkgId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[pkgId] || 0;
      const next = Math.max(0, current + delta);
      const newQuantities = { ...prev, [pkgId]: next };
      if (next === 0) delete newQuantities[pkgId];
      return newQuantities;
    });
  };

  const clearOrder = () => setQuantities({});

  // Calculations
  const calculateTotals = () => {
    let revenue = 0;
    let totalCost = 0;
    let itemCount = 0;

    Object.entries(quantities).forEach(([pkgId, qtyValue]) => {
      const qty = qtyValue as number;
      const pkg = packages.find(p => p.id === pkgId);
      if (pkg) {
        revenue += pkg.sellingPrice * qty;
        
        // Calculate dynamic cost of this package
        const pkgCost = pkg.items.reduce((sum, item) => {
          const prod = products.find(p => p.id === item.productId);
          return sum + (prod ? prod.cost * item.quantity : 0);
        }, 0);

        totalCost += pkgCost * qty;
        itemCount += qty;
      }
    });

    return {
      revenue,
      totalCost,
      profit: revenue - totalCost,
      itemCount
    };
  };

  const { revenue, profit, itemCount } = calculateTotals();

  // Shopping List Calculation
  const shoppingList = useMemo(() => {
    const totals: Record<string, number> = {};

    // 1. Aggregate totals
    Object.entries(quantities).forEach(([pkgId, qtyValue]) => {
      const pkgQty = qtyValue as number;
      const pkg = packages.find(p => p.id === pkgId);
      if (pkg && pkgQty > 0) {
        pkg.items.forEach(item => {
          totals[item.productId] = (totals[item.productId] || 0) + (item.quantity * pkgQty);
        });
      }
    });

    // 2. Map to display data
    return Object.entries(totals).map(([productId, totalUnits]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;

      let buyAmount = '';
      let notes = '';

      if (product.isBulk && product.packUnits && product.packUnits > 0) {
        const packsToBuy = Math.ceil(totalUnits / product.packUnits);
        buyAmount = `${packsToBuy} מארזים`;
        notes = `(כל מארז מכיל ${product.packUnits} יח')`;
      } else {
        buyAmount = `${totalUnits} יחידות`;
      }

      return {
        id: productId,
        name: product.name,
        totalUnits,
        buyAmount,
        notes,
        isBulk: product.isBulk
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [quantities, packages, products]);

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <PackageIcon className="w-12 h-12 mb-3 opacity-20" />
        <p>אין חבילות זמינות לבדיקה</p>
        <p className="text-sm">עבור ללשונית "קביעת חבילות" כדי להתחיל</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Package Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              בחר חבילות להזמנה
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => {
               const qty = quantities[pkg.id] || 0;
               return (
                <Card key={pkg.id} className={`transition-all border-2 ${qty > 0 ? 'border-indigo-500 shadow-md bg-indigo-50/10' : 'border-transparent hover:border-slate-200'}`}>
                  <div className="p-4 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                         <h3 className="font-bold text-slate-800">{pkg.name}</h3>
                         <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">
                           ₪{pkg.sellingPrice}
                         </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {pkg.items.length} סוגי מוצרים בחבילה
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-end gap-3">
                      {qty > 0 && (
                         <span className="text-sm font-bold text-indigo-600 w-8 text-center">{qty}</span>
                      )}
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button 
                          onClick={() => handleUpdateQty(pkg.id, -1)}
                          className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 disabled:opacity-30"
                          disabled={qty === 0}
                        >-</button>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <button 
                          onClick={() => handleUpdateQty(pkg.id, 1)}
                          className="px-3 py-1.5 hover:bg-slate-50 text-indigo-600 font-medium"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </Card>
               );
            })}
          </div>
        </div>

        {/* Right: Summary Dashboard */}
        <div className="lg:col-span-1">
           <Card className="sticky top-6 bg-slate-900 text-white border-none shadow-xl">
             <div className="p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                  <h3 className="font-semibold text-slate-100">סיכום הזמנה</h3>
                  {itemCount > 0 && (
                    <button onClick={clearOrder} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      אפס
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                      <PackageIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">כמות חבילות</div>
                      <div className="text-xl font-bold">{itemCount}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">סה"כ לתשלום (לקוח)</div>
                      <div className="text-2xl font-bold text-emerald-400">₪{revenue.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">רווח משוער</div>
                      <div className="text-2xl font-bold text-blue-400">₪{profit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {itemCount > 0 && (
                  <div className="pt-4 border-t border-slate-700 mt-4">
                    <div className="flex justify-between items-center text-sm text-slate-300">
                      <span>אחוז רווח בהזמנה זו:</span>
                      <span className="font-bold">
                        {revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                )}
             </div>
           </Card>
        </div>
      </div>

      {/* Shopping List Section */}
      {itemCount > 0 && (
        <Card className="mt-8 border-t-4 border-t-indigo-500">
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              סיכום מלאי להזמנה
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-r-lg">שם המוצר</th>
                    <th className="px-4 py-3">כמות לקנייה</th>
                    <th className="px-4 py-3 rounded-l-lg w-1/4">סה"כ יחידות נדרשות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shoppingList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          {item.isBulk ? <Box className="w-4 h-4 text-indigo-500" /> : <div className="w-4 h-4" />}
                          {item.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-indigo-600">{item.buyAmount}</span>
                          {item.notes && <span className="text-xs text-slate-400">{item.notes}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.totalUnits} יחידות
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-100">
              <p>
                <strong>שים לב:</strong> הכמויות בטבלה מחושבות לפי סך כל החבילות שנבחרו.
                עבור מוצרים הנמכרים במארזים, החישוב מעגל כלפי מעלה למספר המארזים השלם הקרוב ביותר.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrderSimulator;