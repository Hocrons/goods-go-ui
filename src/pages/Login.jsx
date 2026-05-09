import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "../services/api";

const handleLogin = async () => {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("seller", JSON.stringify(response.data.seller));

    // redirecionar
    window.location.href = "/dashboard";
  } catch (error) {
    console.error(error);
    alert("Erro no login");
  }
};
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast.success("Bem-vindo de volta!");
      navigate("/");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Entrar no Seller System</h1>
            <p className="text-sm text-muted-foreground">Acesse seu painel de vendas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>
            Não tem conta?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
          <p>
            <Link to="/activate" className="hover:underline">
              Ativar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
