import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingCart } from "lucide-react";
import api, { extractError } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formatPrice = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/sales");
        setSales(Array.isArray(data) ? data : data.sales || []);
      } catch (error) {
        toast.error(extractError(error, "Erro ao carregar vendas"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Vendas"
        description="Histórico de vendas registradas"
        actions={
          <Button asChild>
            <Link to="/sales/new">
              <Plus className="mr-2 h-4 w-4" /> Registrar venda
            </Link>
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando...</div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma venda registrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Quantidade</th>
                  <th className="px-4 py-3 font-medium">Preço unitário</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const unit = Number(s.price ?? s.unitPrice ?? 0);
                  const qty = Number(s.quantity ?? 0);
                  const total = unit * qty;
                  const productName = s.product?.name || s.productName || `#${s.productId ?? s.product_id ?? "-"}`;
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{productName}</td>
                      <td className="px-4 py-3">{qty}</td>
                      <td className="px-4 py-3">{formatPrice(unit)}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(total)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.createdAt ? new Date(s.createdAt).toLocaleString("pt-BR") : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
