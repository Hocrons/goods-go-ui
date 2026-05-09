import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { extractError } from "@/services/api";
import { productImageOptions, productImages } from "@/assets/products";
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

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    status: "active",
    image: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        const p = data.product || data;
        setForm({
          name: p.name || "",
          price: p.price ?? "",
          quantity: p.quantity ?? p.stock ?? "",
          status: p.status === false || p.status === "inactive" || p.status === "inativo" ? "inactive" : "active",
          image: p.image || "",
        });
      } catch (error) {
        toast.error(extractError(error, "Erro ao carregar produto"));
      } finally {
        setFetching(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
      status: form.status,
      image: form.image,
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success("Produto atualizado!");
      } else {
        await api.post("/products", payload);
        toast.success("Produto cadastrado!");
      }
      navigate("/products");
    } catch (error) {
      toast.error(extractError(error, "Erro ao salvar produto"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-muted-foreground">Carregando produto...</div>;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Editar produto" : "Novo produto"}
        description={isEdit ? "Atualize as informações do produto" : "Adicione um produto ao catálogo"}
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-5 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Estoque</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              required
              value={form.quantity}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Imagem do produto</Label>
          <Select
            value={form.image || "none"}
            onValueChange={(v) => setForm({ ...form, image: v === "none" ? "" : v })}
          >
            <SelectTrigger id="image">
              <SelectValue placeholder="Selecione uma imagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem imagem</SelectItem>
              {productImageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.image && productImages[form.image] && (
            <img
              src={productImages[form.image]}
              alt="Preview"
              className="mt-2 h-24 w-24 rounded border border-border object-cover"
            />
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : isEdit ? "Atualizar produto" : "Cadastrar produto"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/products")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
