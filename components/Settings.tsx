import React, { useRef } from 'react';
import { SettingsProps } from '../types';
import { Button, Card } from './ui/UIComponents';
import { Download, Upload, AlertTriangle, Database } from 'lucide-react';

const Settings: React.FC<SettingsProps> = ({ products, packages, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      products,
      packages,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pricing_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) return;

        const data = JSON.parse(content);
        
        // Basic validation
        if (!data.products || !Array.isArray(data.products) || !data.packages || !Array.isArray(data.packages)) {
          alert('שגיאה: קובץ זה אינו מכיל מבנה נתונים תקין של המערכת.');
          return;
        }

        if (window.confirm('זה יחליף את הנתונים הקיימים, האם אתה בטוח?')) {
          onImport({
            products: data.products,
            packages: data.packages
          });
          alert('הנתונים שוחזרו בהצלחה!');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('שגיאה בטעינת הקובץ. וודא שזהו קובץ JSON תקין.');
      }
    };

    reader.onerror = () => {
        alert('שגיאה בקריאת הקובץ.');
    };

    reader.readAsText(file);
    
    // Reset input immediately to allow selecting the same file again if needed
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-100 p-3 rounded-full">
            <Database className="w-8 h-8 text-slate-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">ניהול נתונים</h2>
            <p className="text-slate-500">גיבוי ושחזור של כל הנתונים במערכת</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            ייצוא וגיבוי
        </h3>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          שמור את כל המוצרים והחבילות שלך בקובץ גיבוי במחשב. מומלץ לבצע גיבוי באופן קבוע כדי למנוע אובדן נתונים.
        </p>
        <Button onClick={handleExport} className="w-full sm:w-auto gap-2">
          <Download className="w-4 h-4" />
          ייצוא נתונים
        </Button>
      </Card>

      <Card className="p-6 border-l-4 border-l-amber-400">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-600" />
            ייבוא ושחזור
        </h3>
        <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-100">
          <div className="flex gap-3">
             <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
             <p className="text-sm text-amber-800">
               <strong>שים לב:</strong> ייבוא נתונים ימחק את כל המוצרים והחבילות הקיימים כרגע במערכת ויחליף אותם בנתונים מהקובץ.
             </p>
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
        
        <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="secondary" 
            className="w-full sm:w-auto gap-2 border-slate-300"
        >
          <Upload className="w-4 h-4" />
          ייבוא נתונים
        </Button>
      </Card>
    </div>
  );
};

export default Settings;