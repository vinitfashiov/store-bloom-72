import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Package, Upload, X, Trash2, Image as ImageIcon, Layers } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock_qty: number;
  is_active: boolean;
  category_id: string | null;
  brand_id: string | null;
  has_variants: boolean;
  images: string[] | null;
  description: string | null;
  compare_at_price: number | null;
  sku: string | null;
  category?: { name: string } | null;
  brand?: { name: string } | null;
}

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }
interface Attribute { id: string; name: string; values: AttributeValue[]; }
interface AttributeValue { id: string; value: string; }
interface Variant {
  id: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_qty: number;
  is_active: boolean;
  attributes: { attribute_id: string; attribute_name: string; value_id: string; value: string }[];
}

interface AdminProductsProps {
  tenantId: string;
  disabled?: boolean;
}

export default function AdminProducts({ tenantId, disabled }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', compare_at_price: '',
    sku: '', stock_qty: '0', category_id: '', brand_id: '', is_active: true, has_variants: false
  });
  
  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Variants state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<{ attributeId: string; valueIds: string[] }[]>([]);

  const fetchData = async () => {
    const [productsRes, catsRes, brandsRes, attrsRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(name), brand:brands(name)').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name').eq('tenant_id', tenantId).eq('is_active', true),
      supabase.from('brands').select('id, name').eq('tenant_id', tenantId).eq('is_active', true),
      supabase.from('attributes').select('id, name').eq('tenant_id', tenantId)
    ]);
    
    // Fetch attribute values
    const attrsWithValues: Attribute[] = [];
    if (attrsRes.data) {
      for (const attr of attrsRes.data) {
        const { data: values } = await supabase.from('attribute_values').select('id, value').eq('attribute_id', attr.id);
        attrsWithValues.push({ ...attr, values: values || [] });
      }
    }
    
    const processedProducts = (productsRes.data || []).map(p => ({
      ...p,
      images: Array.isArray(p.images) ? (p.images as string[]) : (p.images ? [String(p.images)] : [])
    })) as Product[];
    
    setProducts(processedProducts);
    setCategories(catsRes.data || []);
    setBrands(brandsRes.data || []);
    setAttributes(attrsWithValues);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tenantId]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    setForm({ ...form, name, slug: editingProduct ? form.slug : generateSlug(name) });
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newImages: string[] = [];
    
    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenantId}/products/${editingProduct?.id || 'new'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error } = await supabase.storage.from('product-images').upload(fileName, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }
      newImages.push(fileName);
    }
    
    setImages([...images, ...newImages]);
    setUploading(false);
    toast.success(`${newImages.length} image(s) uploaded`);
  };

  const removeImage = async (path: string) => {
    await supabase.storage.from('product-images').remove([path]);
    setImages(images.filter(img => img !== path));
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  // Generate variants from selected attributes
  const generateVariants = () => {
    if (selectedAttributes.length === 0) {
      toast.error('Select at least one attribute');
      return;
    }
    
    // Generate all combinations
    const combinations: { attribute_id: string; attribute_name: string; value_id: string; value: string }[][] = [];
    
    const generate = (index: number, current: { attribute_id: string; attribute_name: string; value_id: string; value: string }[]) => {
      if (index === selectedAttributes.length) {
        if (current.length > 0) combinations.push([...current]);
        return;
      }
      
      const { attributeId, valueIds } = selectedAttributes[index];
      const attr = attributes.find(a => a.id === attributeId);
      if (!attr || valueIds.length === 0) {
        generate(index + 1, current);
        return;
      }
      
      for (const valueId of valueIds) {
        const val = attr.values.find(v => v.id === valueId);
        if (val) {
          generate(index + 1, [...current, { attribute_id: attributeId, attribute_name: attr.name, value_id: valueId, value: val.value }]);
        }
      }
    };
    
    generate(0, []);
    
    const newVariants: Variant[] = combinations.map(attrs => ({
      id: `new-${Math.random().toString(36).substring(7)}`,
      sku: null,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      stock_qty: 0,
      is_active: true,
      attributes: attrs
    }));
    
    setVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variant(s)`);
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    const productData = {
      tenant_id: tenantId,
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      sku: form.sku || null,
      stock_qty: form.has_variants ? 0 : (parseInt(form.stock_qty) || 0),
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      is_active: form.is_active,
      has_variants: form.has_variants,
      images: images
    };

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        
        // Update variants if has_variants
        if (form.has_variants) {
          // Delete existing variants
          await supabase.from('product_variants').delete().eq('product_id', editingProduct.id);
          
          // Insert new variants
          for (const variant of variants) {
            const { data: newVariant, error: variantError } = await supabase.from('product_variants').insert({
              tenant_id: tenantId,
              product_id: editingProduct.id,
              sku: variant.sku,
              price: variant.price,
              compare_at_price: variant.compare_at_price,
              stock_qty: variant.stock_qty,
              is_active: variant.is_active
            }).select().single();
            
            if (variantError) throw variantError;
            
            // Insert variant attributes
            for (const attr of variant.attributes) {
              await supabase.from('variant_attributes').insert({
                variant_id: newVariant.id,
                attribute_id: attr.attribute_id,
                attribute_value_id: attr.value_id
              });
            }
          }
        }
        
        toast.success('Product updated');
      } else {
        const { data: newProduct, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        
        // Move images to correct folder
        if (images.length > 0 && newProduct) {
          const movedImages: string[] = [];
          for (const oldPath of images) {
            if (oldPath.includes('/new/')) {
              const newPath = oldPath.replace('/new/', `/${newProduct.id}/`);
              await supabase.storage.from('product-images').move(oldPath, newPath);
              movedImages.push(newPath);
            } else {
              movedImages.push(oldPath);
            }
          }
          await supabase.from('products').update({ images: movedImages }).eq('id', newProduct.id);
        }
        
        // Insert variants if has_variants
        if (form.has_variants && newProduct) {
          for (const variant of variants) {
            const { data: newVariant, error: variantError } = await supabase.from('product_variants').insert({
              tenant_id: tenantId,
              product_id: newProduct.id,
              sku: variant.sku,
              price: variant.price,
              compare_at_price: variant.compare_at_price,
              stock_qty: variant.stock_qty,
              is_active: variant.is_active
            }).select().single();
            
            if (variantError) throw variantError;
            
            for (const attr of variant.attributes) {
              await supabase.from('variant_attributes').insert({
                variant_id: newVariant.id,
                attribute_id: attr.attribute_id,
                attribute_value_id: attr.value_id
              });
            }
          }
        }
        
        toast.success('Product created');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message?.includes('duplicate') ? 'Slug already exists' : 'Failed to save product');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({ name: '', slug: '', description: '', price: '', compare_at_price: '', sku: '', stock_qty: '0', category_id: '', brand_id: '', is_active: true, has_variants: false });
    setImages([]);
    setVariants([]);
    setSelectedAttributes([]);
    setActiveTab('basic');
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      sku: product.sku || '',
      stock_qty: product.stock_qty.toString(),
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      is_active: product.is_active,
      has_variants: product.has_variants
    });
    setImages(product.images || []);
    
    // Load existing variants
    if (product.has_variants) {
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id);
      
      if (existingVariants) {
        const variantsWithAttrs: Variant[] = [];
        for (const v of existingVariants) {
          const { data: variantAttrs } = await supabase
            .from('variant_attributes')
            .select('attribute_id, attribute_value_id')
            .eq('variant_id', v.id);
          
          const attrs: Variant['attributes'] = [];
          if (variantAttrs) {
            for (const va of variantAttrs) {
              const attr = attributes.find(a => a.id === va.attribute_id);
              const val = attr?.values.find(val => val.id === va.attribute_value_id);
              if (attr && val) {
                attrs.push({ attribute_id: va.attribute_id, attribute_name: attr.name, value_id: va.attribute_value_id, value: val.value });
              }
            }
          }
          
          variantsWithAttrs.push({
            id: v.id,
            sku: v.sku,
            price: Number(v.price),
            compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
            stock_qty: v.stock_qty,
            is_active: v.is_active,
            attributes: attrs
          });
        }
        setVariants(variantsWithAttrs);
      }
    }
    
    setDialogOpen(true);
  };

  const toggleActive = async (product: Product) => {
    if (disabled) return;
    const { error } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    if (error) { toast.error('Failed to update product'); return; }
    toast.success(product.is_active ? 'Product deactivated' : 'Product activated');
    fetchData();
  };

  const addAttributeSelection = () => {
    setSelectedAttributes([...selectedAttributes, { attributeId: '', valueIds: [] }]);
  };

  const updateAttributeSelection = (index: number, field: 'attributeId' | 'valueIds', value: any) => {
    const updated = [...selectedAttributes];
    updated[index][field] = value;
    if (field === 'attributeId') updated[index].valueIds = [];
    setSelectedAttributes(updated);
  };

  const removeAttributeSelection = (index: number) => {
    setSelectedAttributes(selectedAttributes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} disabled={disabled}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div><Label>Name *</Label><Input value={form.name} onChange={e => handleNameChange(e.target.value)} required /></div>
                  <div><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required /></div>
                  <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Price (₹) *</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
                    <div><Label>Compare Price</Label><Input type="number" step="0.01" value={form.compare_at_price} onChange={e => setForm({ ...form, compare_at_price: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
                    {!form.has_variants && (
                      <div><Label>Stock Qty *</Label><Input type="number" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: e.target.value })} required /></div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Brand</Label>
                      <Select value={form.brand_id} onValueChange={v => setForm({ ...form, brand_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                        <SelectContent>
                          {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                      <Label>Active</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={form.has_variants} onCheckedChange={v => setForm({ ...form, has_variants: v })} />
                      <Label>Has Variants</Label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="images" className="space-y-4 mt-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {uploading ? 'Uploading...' : 'Click to upload images'}
                      </p>
                    </label>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {images.map((img, i) => (
                        <div key={i} className="relative group aspect-square">
                          <img src={getImageUrl(img)} alt={`Product ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(img)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="variants" className="space-y-4 mt-4">
                  {!form.has_variants ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Enable "Has Variants" in Basic Info to manage variants</p>
                    </div>
                  ) : (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Select Attributes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedAttributes.map((sel, i) => (
                            <div key={i} className="flex gap-2 items-start">
                              <Select value={sel.attributeId} onValueChange={v => updateAttributeSelection(i, 'attributeId', v)}>
                                <SelectTrigger className="w-40"><SelectValue placeholder="Attribute" /></SelectTrigger>
                                <SelectContent>
                                  {attributes.filter(a => !selectedAttributes.some((s, si) => si !== i && s.attributeId === a.id)).map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex-1 flex flex-wrap gap-2">
                                {sel.attributeId && attributes.find(a => a.id === sel.attributeId)?.values.map(v => (
                                  <label key={v.id} className="flex items-center gap-1 text-sm cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={sel.valueIds.includes(v.id)}
                                      onChange={e => {
                                        const newIds = e.target.checked
                                          ? [...sel.valueIds, v.id]
                                          : sel.valueIds.filter(id => id !== v.id);
                                        updateAttributeSelection(i, 'valueIds', newIds);
                                      }}
                                    />
                                    {v.value}
                                  </label>
                                ))}
                              </div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeAttributeSelection(i)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={addAttributeSelection} disabled={selectedAttributes.length >= attributes.length}>
                              <Plus className="w-4 h-4 mr-1" /> Add Attribute
                            </Button>
                            <Button type="button" variant="secondary" size="sm" onClick={generateVariants}>
                              Generate Variants
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {variants.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Variants ({variants.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Variant</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Stock</TableHead>
                                  <TableHead>Active</TableHead>
                                  <TableHead></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {variants.map((v, i) => (
                                  <TableRow key={v.id}>
                                    <TableCell className="font-medium">
                                      {v.attributes.map(a => a.value).join(' / ')}
                                    </TableCell>
                                    <TableCell>
                                      <Input 
                                        value={v.sku || ''} 
                                        onChange={e => updateVariant(i, 'sku', e.target.value)}
                                        className="w-24"
                                        placeholder="SKU"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input 
                                        type="number" 
                                        value={v.price} 
                                        onChange={e => updateVariant(i, 'price', parseFloat(e.target.value) || 0)}
                                        className="w-24"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input 
                                        type="number" 
                                        value={v.stock_qty} 
                                        onChange={e => updateVariant(i, 'stock_qty', parseInt(e.target.value) || 0)}
                                        className="w-20"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Switch 
                                        checked={v.is_active} 
                                        onCheckedChange={val => updateVariant(i, 'is_active', val)} 
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <Button type="submit" className="w-full" disabled={disabled}>{editingProduct ? 'Update' : 'Create'} Product</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Add your first product to start selling</p>
              <Button onClick={resetForm} disabled={disabled}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img src={getImageUrl(product.images[0])} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{product.name}</span>
                          {product.has_variants && <Badge variant="outline" className="ml-2 text-xs">Variants</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.category?.name || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{product.brand?.name || '-'}</TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock_qty > 0 ? 'outline' : 'destructive'}>
                        {product.has_variants ? 'Variants' : product.stock_qty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} disabled={disabled}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(product)} disabled={disabled}>
                        {product.is_active ? 'Deactivate' : 'Activate'}
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