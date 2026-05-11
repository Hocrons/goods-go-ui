import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { extractError } from "@/services/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formatPrice = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const SaleForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/products");
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      } catch (error) {
        toast.error(extractError(error, "Erro ao carregar produtos"));
      }
    })();
  }, []);

  const selected = products.find((p) => String(p.id) === String(productId));
  const selectedPrice = Number(selected?.price ?? selected?.preco ?? 0);
  const total = selected ? selectedPrice * Number(quantity || 0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) return toast.error("Selecione um produto");
    setLoading(true);
    try {
      await api.post("/sales", {
        produto_id: parseInt(productId, 10),
        quantidade: parseInt(quantity, 10),
      });
      toast.success("Venda registrada com sucesso!");
      navigate("/sales");
    } catch (error) {
      toast.error(extractError(error, "Erro ao registrar venda"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Registrar venda" description="Selecione um produto e a quantidade vendida" />

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-5 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]"
      >
        <div className="space-y-2">
          <Label htmlFor="product">Produto</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger id="product">
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {(p.name || p.nome) ?? `Produto #${p.id}`} — {formatPrice(p.price ?? p.preco)} (estoque: {p.quantity ?? p.stock ?? p.quantidade_estoque ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        {selected && (
          <div className="rounded-md bg-accent p-4 text-sm">
            <div className="flex justify-between"><span className="text-accent-foreground/70">Preço unitário</span><span className="font-medium">{formatPrice(selectedPrice)}</span></div>
            <div className="flex justify-between mt-1"><span className="text-accent-foreground/70">Total</span><span className="font-bold text-accent-foreground">{formatPrice(total)}</span></div>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar venda"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/sales")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SaleForm;
