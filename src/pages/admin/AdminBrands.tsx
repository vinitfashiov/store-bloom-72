import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag, Upload, Loader2, Image } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_path: string | null;
  is_active: boolean;
  created_at: string;
}

interface AdminBrandsProps {
  tenantId: string;
  disabled?: boolean;
}

export default function AdminBrands({ tenantId, disabled }: AdminBrandsProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', logo_path: '' as string | null, is_active: true });
  const [uploading, setUploading] = useState(false);

  const fetchBrands = async () => {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    setBrands(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, [tenantId]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    setForm({ ...form, name, slug: editingBrand ? form.slug : generateSlug(name) });
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${tenantId}/brands/brand-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to upload logo');
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(fileName);

      setForm(prev => ({ ...prev, logo_path: publicUrl }));
      toast.success('Logo uploaded');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    const brandData = { 
      tenant_id: tenantId, 
      name: form.name, 
      slug: form.slug, 
      logo_path: form.logo_path || null,
      is_active: form.is_active 
    };

    if (editingBrand) {
      const { error } = await supabase.from('brands').update(brandData).eq('id', editingBrand.id);
      if (error) { toast.error('Failed to update brand'); return; }
      toast.success('Brand updated');
    } else {
      const { error } = await supabase.from('brands').insert(brandData);
      if (error) { toast.error(error.message.includes('duplicate') ? 'Slug already exists' : 'Failed to create brand'); return; }
      toast.success('Brand created');
    }

    setDialogOpen(false);
    resetForm();
    fetchBrands();
  };

  const resetForm = () => {
    setEditingBrand(null);
    setForm({ name: '', slug: '', logo_path: null, is_active: true });
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({ name: brand.name, slug: brand.slug, logo_path: brand.logo_path, is_active: brand.is_active });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (disabled) return;
    const { error } = await supabase.from('brands').update({ is_active: false }).eq('id', id);
    if (error) { toast.error('Failed to delete brand'); return; }
    toast.success('Brand deactivated');
    fetchBrands();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Brands</h1>
          <p className="text-muted-foreground">Manage product brands</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} disabled={disabled}><Plus className="w-4 h-4 mr-2" /> Add Brand</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-4">
                  {form.logo_path ? (
                    <img 
                      src={form.logo_path} 
                      alt="Logo" 
                      className="w-16 h-16 object-contain rounded-lg border bg-muted"
                    />
                  ) : (
                    <div className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="brand-logo-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('brand-logo-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {form.logo_path ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    {form.logo_path && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-destructive"
                        onClick={() => setForm(prev => ({ ...prev, logo_path: null }))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div><Label>Name *</Label><Input value={form.name} onChange={e => handleNameChange(e.target.value)} required /></div>
              <div><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required /></div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Cancel</Button>
                <Button type="submit" disabled={disabled}>{editingBrand ? 'Update' : 'Create'} Brand</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : brands.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No brands yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first brand</p>
              <Button onClick={resetForm} disabled={disabled}><Plus className="w-4 h-4 mr-2" /> Add Brand</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map(brand => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      {brand.logo_path ? (
                        <img 
                          src={brand.logo_path} 
                          alt={brand.name}
                          className="w-10 h-10 object-contain rounded border bg-muted"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                    <TableCell>
                      <Badge variant={brand.is_active ? 'default' : 'secondary'}>
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(brand)} disabled={disabled}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)} disabled={disabled}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
