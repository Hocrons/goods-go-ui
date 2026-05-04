import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import api, { extractError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Activate = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/seller/activate", { email, code });
      toast.success("Conta ativada! Você já pode entrar.");
      navigate("/login");
    } catch (error) {
      toast.error(extractError(error, "Falha ao ativar conta"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success text-success-foreground">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ativar conta</h1>
            <p className="text-sm text-muted-foreground">Informe o código enviado ao seu e-mail</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Código de ativação</Label>
            <Input id="code" required value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ativando..." : "Ativar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="hover:underline">Voltar para login</Link>
        </p>
      </div>
    </div>
  );
};

export default Activate;
