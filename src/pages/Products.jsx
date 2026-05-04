import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Package } from "lucide-react";
import api, { extractError } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const formatPrice = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      toast.error(extractError(error, "Erro ao carregar produtos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Gerencie seu catálogo"
        actions={
          <Button asChild>
            <Link to="/products/new">
              <Plus className="mr-2 h-4 w-4" /> Novo produto
            </Link>
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando...</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
            <Button asChild size="sm">
              <Link to="/products/new">Cadastrar primeiro produto</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Preço</th>
                  <th className="px-4 py-3 font-medium">Estoque</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">{p.quantity ?? p.stock ?? 0}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          p.status === "active" || p.status === "ativo" || p.status === true
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-muted-foreground/30 bg-muted text-muted-foreground"
                        }
                      >
                        {p.status === "active" || p.status === "ativo" || p.status === true ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/products/${p.id}/edit`}>
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
