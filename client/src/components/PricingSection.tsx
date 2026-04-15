import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiPost } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Rocket, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const PLANS = [
  {
    id: 1,
    name: "Raíz Solidaria",
    price: "0",
    description: "Ideal para individuos que están empezando su huerto.",
    features: ["Herramientas básicas", "Sección educativa completa", "Acceso al marketplace"],
    icon: <Zap size={24} className="text-primary" />,
    color: "bg-primary/10",
    btnText: "Empezar Gratis"
  },
  {
    id: 2,
    name: "Desarrollo Rural",
    price: "2",
    period: "/mes",
    description: "Potencia tu producción con tecnología inteligente.",
    features: ["Todo lo de Raíz Solidaria", "Chatbot con IA 24/7", "Estadísticas detalladas", "Soporte prioritario"],
    highlight: "Más Popular",
    icon: <Rocket size={24} className="text-blue-500" />,
    color: "bg-blue-500/10",
    btnText: "3 Meses GRATIS"
  },
  {
    id: 3,
    name: "Impacto Global",
    price: "4",
    period: "/mes",
    description: "Para productores que buscan escalabilidad total.",
    features: ["Todo lo de Desarrollo Rural", "Sugerencias IA automáticas", "Informes por email", "Reportes de impacto"],
    icon: <Globe size={24} className="text-emerald-500" />,
    color: "bg-emerald-500/10",
    btnText: "3 Meses GRATIS"
  }
];

export function PricingSection() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleSubscribe = async (planId: number) => {
    if (!user) {
      toast.error('Por favor inicia sesión para suscribirte');
      return;
    }

    try {
      await apiPost('/plans/subscribe', { planId, billingCycle });
      toast.success('¡Suscripción activa! Revisa tu email.');
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar suscripción');
    }
  };

  return (
    <section id="pricing" className="py-32 relative bg-background overflow-hidden px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-[2px] w-6 bg-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">Planes y Alcance</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Elige tu camino hacia la <br/> <span className="text-primary italic">Sostenibilidad</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Donamos el 30% de cada plan a proyectos de agricultura urbana comunitaria.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Mensual</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-8 bg-muted rounded-full relative p-1 transition-colors hover:bg-muted/80"
          >
            <motion.div 
              animate={{ x: billingCycle === 'monthly' ? 0 : 24 }}
              className="w-6 h-6 bg-primary rounded-full shadow-lg"
            />
          </button>
          <span className={`text-sm font-bold ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>Anual (Ahorra 20%)</span>
          <div className="px-3 py-1 border-l-2 border-emerald-500 bg-emerald-500/5 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Ahorro Activo</div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-border/50 rounded-3xl ${plan.highlight ? 'border-primary shadow-xl scale-105 z-20' : ''}`}>
                {plan.highlight && (
                  <div className="absolute top-0 right-0 p-8 pointer-events-none">
                    <Sparkles className="text-primary animate-pulse" />
                  </div>
                )}
                
                <CardHeader className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${plan.color} flex items-center justify-center mb-6`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-5xl font-extrabold font-mono">${billingCycle === 'annual' ? (parseFloat(plan.price) * 10).toFixed(0) : plan.price}</span>
                    <span className="text-muted-foreground font-bold">USD{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="p-8 pt-0 flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-8 pt-0 mt-auto">
                  <Button 
                    className={`w-full h-14 rounded-2xl font-bold text-lg ${plan.highlight ? 'bg-primary' : 'variant-outline'}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {plan.btnText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
