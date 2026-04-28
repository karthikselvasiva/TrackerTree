'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { useCategories } from '@/hooks/useCategories';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Circle');
  const [color, setColor] = useState('#f97316');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [saving, setSaving] = useState(false);

  const openEdit = (cat: Category) => {
    setEditCat(cat); setName(cat.name); setIcon(cat.icon); setColor(cat.color); setType(cat.type); setShowForm(true);
  };

  const openAdd = () => {
    setEditCat(null); setName(''); setIcon('Circle'); setColor('#f97316'); setType('expense'); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    if (editCat) await updateCategory(editCat.id, { name, icon, color, type });
    else await addCategory({ name, icon, color, type });
    setSaving(false);
    setShowForm(false);
  };

  const renderGrid = (cats: Category[], label: string) => (
    <div>
      <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{label}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {cats.map((cat, i) => (
          <Card key={cat.id} hoverable className="flex flex-col items-center gap-2 p-4 group animate-fade-in relative" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
              <DynamicIcon name={cat.icon} size={22} style={{ color: cat.color }} />
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)] text-center truncate w-full">{cat.name}</span>
            {!cat.is_default && (
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer"><Pencil size={12} /></button>
                <button onClick={() => { if(confirm('Delete?')) deleteCategory(cat.id); }} className="p-1 rounded-md hover:bg-[var(--danger-light)] text-[var(--text-muted)] cursor-pointer"><Trash2 size={12} /></button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1><p className="text-sm text-[var(--text-muted)]">Organize your transactions</p></div>
        <Button onClick={openAdd}><Plus size={18} /> Add</Button>
      </div>
      {loading ? <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{[...Array(12)].map((_,i)=><Card key={i} className="h-24 animate-shimmer"><div/></Card>)}</div> : (
        <>{renderGrid(categories.filter(c=>c.type==='expense'), 'Expense')}{renderGrid(categories.filter(c=>c.type==='income'), 'Income')}</>
      )}
      <Modal isOpen={showForm} onClose={()=>setShowForm(false)} title={editCat?'Edit Category':'New Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl">
            <button type="button" onClick={()=>setType('expense')} className={cn('flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer',type==='expense'?'bg-[var(--bg-secondary)] shadow-sm text-[var(--text-primary)]':'text-[var(--text-muted)]')}>Expense</button>
            <button type="button" onClick={()=>setType('income')} className={cn('flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer',type==='income'?'bg-[var(--bg-secondary)] shadow-sm text-[var(--text-primary)]':'text-[var(--text-muted)]')}>Income</button>
          </div>
          <Input label="Name" value={name} onChange={(e)=>setName(e.target.value)} required placeholder="Category name"/>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Icon</label><div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto">{CATEGORY_ICONS.map(ic=><button key={ic} type="button" onClick={()=>setIcon(ic)} className={cn('p-2 rounded-lg cursor-pointer',icon===ic?'bg-[var(--accent-light)] ring-2 ring-[var(--accent)]':'hover:bg-[var(--bg-hover)]')}><DynamicIcon name={ic} size={18} className="mx-auto" style={{color:icon===ic?'var(--accent)':'var(--text-muted)'}}/></button>)}</div></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Color</label><div className="flex flex-wrap gap-2">{CATEGORY_COLORS.map(c=><button key={c} type="button" onClick={()=>setColor(c)} className={cn('w-7 h-7 rounded-lg cursor-pointer',color===c?'ring-2 ring-offset-2 ring-[var(--accent)] scale-110':'hover:scale-110')} style={{backgroundColor:c}}/>)}</div></div>
          <Button type="submit" loading={saving} className="w-full" size="lg">{editCat?'Update':'Create'} Category</Button>
        </form>
      </Modal>
    </div>
  );
}
