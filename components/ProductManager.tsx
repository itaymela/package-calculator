import React, { useState } from 'react';
import { Product, ProductManagerProps } from '../types';
import { Button, Input, Card, Toggle } from './ui/UIComponents';
import { Plus, Trash2, Edit2, Package, Search, Calculator } from 'lucide-react';

const ProductManager: React.FC<ProductManagerProps> = ({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct 
}) => {
  // Form State
  const [name, setName] = useState('');
  const [isBulk, setIsBulk] = useState(false);
  
  // Standard Cost
  const [cost, setCost] = useState('');
  
  // Bulk Cost
  const [packCost, setPackCost] = useState('');
  const [packUnits, setPackUnits] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Computed unit cost for display
  const calculatedUnitCost = isBulk && packCost && packUnits 
    ? (parseFloat(packCost) / parseFloat(packUnits)) 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    let finalUnitCost = 0;

    if (isBulk) {
      const pCost = parseFloat(packCost);
      const pUnits = parseFloat(packUnits);
      if (isNaN(pCost) || isNaN(pUnits) || pUnits === 0) return;
      finalUnitCost = pCost / pUnits;
    } else {
      finalUnitCost = parseFloat(cost);
      if (isNaN(finalUnitCost)) return;
    }

    const productData: Product = {
      id: editingId || crypto.randomUUID(),
      name,
      cost: finalUnitCost,
      isBulk,
      packCost: isBulk ? parseFloat(packCost) : undefined,
      packUnits: isBulk ? parseFloat(packUnits) : undefined
    };

    if (editingId) {
      onUpdateProduct(productData);
      setEditingId(null);
    } else {
      onAddProduct(productData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCost('');
    setPackCost('');
    setPackUnits('');
    setIsBulk(false);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setIsBulk(!!product.isBulk);
    
    if (product.isBulk) {
      setPackCost(product.packCost?.toString() || '');
      setPackUnits(product.packUnits?.toString() || '');
      setCost('');
    } else {
      setCost(product.cost.toString());
      setPackCost('');
      setPackUnits('');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <Card className="p-5 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              {editingId ? 'עריכת מוצר' : 'מוצר חדש'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="שם המוצר"
                placeholder="לדוגמה: בקבוק יין"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Toggle 
                  checked={isBulk} 
                  onChange={setIsBulk} 
                  label="מוצר בכמות (מארז)?" 
                />
              </div>

              {isBulk ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="מחיר מארז (₪)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={packCost}
                      onChange={(e) => setPackCost(e.target.value)}
                    />
                    <Input
                      label="יחידות במארז"
                      type="number"
                      step="1"
                      min="1"
                      placeholder="0"
                      value={packUnits}
                      onChange={(e) => setPackUnits(e.target.value)}
                    />
                  </div>
                  
                  {calculatedUnitCost > 0 && (
                    <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 p-2.5 rounded-md border border-indigo-100">
                      <Calculator className="w-4 h-4" />
                      <span>עלות ליחידה: <strong>₪{calculatedUnitCost.toFixed(2)}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Input
                    label="עלות ליחידה (₪)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'עדכן מוצר' : 'הוסף מוצר'}
                </Button>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    ביטול
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-full min-h-[500px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-700">רשימת מוצרים ({products.length})</h3>
              <div className="relative w-full max-w-xs">
                 <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400"/>
                 </div>
                 <input 
                    type="text" 
                    placeholder="חיפוש..." 
                    className="block w-full p-2 ps-10 text-sm text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                  <Package className="w-12 h-12 mb-2 opacity-20" />
                  <p>לא נמצאו מוצרים</p>
                  <p className="text-sm">הוסף מוצר חדש כדי להתחיל</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div>
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-sm text-slate-500 mt-0.5">
                          {product.isBulk ? (
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-medium inline-block w-fit">
                                מארז: ₪{product.packCost} / {product.packUnits} יח'
                              </span>
                              <span className="text-slate-400 hidden md:inline">•</span>
                              <span>עלות ליחידה: <strong>₪{product.cost.toFixed(2)}</strong></span>
                            </div>
                          ) : (
                            <span>עלות: ₪{product.cost.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(product)} title="ערוך">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onDeleteProduct(product.id)} title="מחק">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
