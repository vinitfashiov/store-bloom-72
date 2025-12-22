import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { CreditCard, Truck } from 'lucide-react';

interface Tenant { id: string; store_name: string; store_slug: string; business_type: 'ecommerce' | 'grocery'; }

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', line1: '', line2: '', city: '', state: '', pincode: '' });

  const { cart, getSubtotal, clearCart } = useCart(slug || '', tenant?.id || null);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!slug) return;
      const { data } = await supabase.from('tenants').select('id, store_name, store_slug, business_type').eq('store_slug', slug).eq('is_active', true).maybeSingle();
      if (data) setTenant(data as Tenant);
    };
    fetchTenant();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !tenant || cart.items.length === 0) return;

    setSubmitting(true);
    const subtotal = getSubtotal();
    const orderNumber = `ORD-${Date.now()}`;

    try {
      // Create order
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        tenant_id: tenant.id,
        order_number: orderNumber,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        shipping_address: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode },
        subtotal,
        total: subtotal,
        payment_method: paymentMethod,
        status: 'pending',
        payment_status: paymentMethod === 'cod' ? 'unpaid' : 'unpaid'
      }).select().single();

      if (orderError) throw orderError;

      // Create order items and update stock
      for (const item of cart.items) {
        await supabase.from('order_items').insert({
          tenant_id: tenant.id,
          order_id: order.id,
          product_id: item.product_id,
          name: item.product?.name || 'Product',
          qty: item.qty,
          unit_price: item.unit_price,
          line_total: item.unit_price * item.qty
        });

        // Reduce stock
        const currentStock = item.product?.stock_qty || 0;
        await supabase.from('products').update({ stock_qty: Math.max(0, currentStock - item.qty) }).eq('id', item.product_id);
      }

      // Mark cart as converted
      await supabase.from('carts').update({ status: 'converted' }).eq('id', cart.id);
      await clearCart();

      toast.success('Order placed successfully!');
      navigate(`/store/${slug}/order-confirmation?order=${orderNumber}`);
    } catch (error) {
      toast.error('Failed to place order');
    }
    setSubmitting(false);
  };

  if (!tenant || !cart) return null;
  const subtotal = getSubtotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-display font-bold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Full Name *</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div><Label>Phone *</Label><Input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Address Line 1 *</Label><Input required value={form.line1} onChange={e => setForm({...form, line1: e.target.value})} /></div>
                <div><Label>Address Line 2</Label><Input value={form.line2} onChange={e => setForm({...form, line2: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City *</Label><Input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                  <div><Label>State *</Label><Input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
                </div>
                <div><Label>Pincode *</Label><Input required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} /></div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg"><RadioGroupItem value="cod" id="cod" /><Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer"><Truck className="w-4 h-4" /> Cash on Delivery</Label></div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg mt-2"><RadioGroupItem value="razorpay" id="razorpay" /><Label htmlFor="razorpay" className="flex items-center gap-2 cursor-pointer"><CreditCard className="w-4 h-4" /> Pay Online (Razorpay)</Label></div>
                </RadioGroup>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex justify-between"><span>{item.product?.name} x{item.qty}</span><span>₹{(item.unit_price * item.qty).toFixed(2)}</span></div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg"><span>Total</span><span>₹{subtotal.toFixed(2)}</span></div>
                <Button type="submit" className="w-full mt-4" size="lg" disabled={submitting}>{submitting ? 'Placing Order...' : 'Place Order'}</Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
