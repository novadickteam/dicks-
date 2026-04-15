import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Tag, Filter, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  category: string;
  stock: number;
  sellerName: string;
}

export function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/products');
      setProducts(data.products);
    } catch (err) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (productId: number) => {
    try {
      await apiPost(`/products/${productId}/buy`, { quantity: 1 });
      toast.success('¡Compra realizada con éxito!');
      fetchProducts(); // Refresh stock
    } catch (err: any) {
      toast.error(err.message || 'Error al comprar');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Buscar productos agrícolas, sensores, abonos..." 
            className="pl-10 h-12 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categories.slice(0, 5).map(cat => (
            <Button 
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className="capitalize rounded-xl h-12 px-6"
              onClick={() => setCategory(cat)}
            >
              {cat === 'all' ? 'Todos' : cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img 
                      src={product.image || '/images/default-product.png'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-foreground border-border/50">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl font-bold truncate leading-tight">
                        {product.name}
                      </CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      Vendido por <span className="font-bold text-primary">{product.sellerName}</span>
                      <CheckCircle2 size={12} />
                    </p>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono">${product.price}</span>
                      <span className="text-xs text-muted-foreground uppercase font-bold">USD</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6 px-6">
                    <Button 
                      className="w-full gap-2 rounded-xl h-11" 
                      onClick={() => handleBuy(product.id)}
                      disabled={product.stock <= 0}
                    >
                      <ShoppingCart size={18} />
                      {product.stock > 0 ? 'Comprar Ahora' : 'Sin Stock'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <Tag className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-2xl font-bold mb-2">No se encontraron productos</h3>
          <p className="text-muted-foreground">Intenta con otros términos de búsqueda o categorías.</p>
        </div>
      )}
    </div>
  );
}
