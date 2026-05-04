import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api, { extractError } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";

const formatPrice = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState({
    totalSold: 0,
    totalStock: 0,
    salesCount: 0,
    productsCount: 0,
    salesByProduct: [],
    stockByProduct: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let dashboard = null;
        try {
          const res = await api.get("/dashboard");
          dashboard = res.data;
        } catch {
          /* fallback abaixo */
        }

        const [productsRes, salesRes] = await Promise.all([
          api.get("/products").catch(() => ({ data: [] })),
          api.get("/sales").catch(() => ({ data: [] })),
        ]);
        const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.products || [];
        const sales = Array.isArray(salesRes.data) ? salesRes.data : salesRes.data.sales || [];

        const totalStock =
          dashboard?.totalStock ??
          products.reduce((acc, p) => acc + Number(p.quantity ?? p.stock ?? 0), 0);

        const totalSold =
          dashboard?.totalSold ??
          sales.reduce((acc, s) => acc + Number(s.price ?? s.unitPrice ?? 0) * Number(s.quantity ?? 0), 0);

        const byProduct = {};
        sales.forEach((s) => {
          const name = s.product?.name || s.productName || `#${s.productId ?? s.product_id}`;
          const value = Number(s.price ?? s.unitPrice ?? 0) * Number(s.quantity ?? 0);
          byProduct[name] = (byProduct[name] || 0) + value;
        });
        const salesByProduct = Object.entries(byProduct)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 6);

        const stockByProduct = products
          .map((p) => ({ name: p.name, stock: Number(p.quantity ?? p.stock ?? 0) }))
          .sort((a, b) => b.stock - a.stock)
          .slice(0, 6);

        setData({
          totalSold,
          totalStock,
          salesCount: sales.length,
          productsCount: products.length,
          salesByProduct,
          stockByProduct,
        });
      } catch (error) {
        toast.error(extractError(error, "Erro ao carregar dashboard"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pieColors = ["hsl(221 83% 53%)", "hsl(217 91% 65%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(280 70% 60%)", "hsl(190 70% 50%)"];

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral das suas vendas e estoque" />

      {loading ? (
        <div className="text-muted-foreground">Carregando dados...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={DollarSign} label="Total vendido" value={formatPrice(data.totalSold)} accent="bg-success/10 text-success" />
            <StatCard icon={Package} label="Estoque total" value={data.totalStock} accent="bg-primary/10 text-primary" />
            <StatCard icon={ShoppingBag} label="Vendas registradas" value={data.salesCount} accent="bg-warning/10 text-warning" />
            <StatCard icon={TrendingUp} label="Produtos cadastrados" value={data.productsCount} accent="bg-accent text-accent-foreground" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="mb-4 font-semibold">Vendas por produto</h3>
              {data.salesByProduct.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem vendas para exibir.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.salesByProduct}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(v) => formatPrice(v)}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="mb-4 font-semibold">Estoque por produto</h3>
              {data.stockByProduct.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem produtos para exibir.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.stockByProduct}
                      dataKey="stock"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {data.stockByProduct.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
