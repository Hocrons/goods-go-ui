import tocaABola from "./toca-a-bola.jpeg";
import coeManeFeijao from "./coe-mane-feijao.jpeg";
import carlaoDetergente from "./carlao-detergente.jpeg";

// Catálogo local de imagens de produtos.
// A chave é um identificador (slug) que pode ser:
//  - usado no campo `image` do produto (ex.: "toca-a-bola")
//  - ou inferido pelo nome do produto via `resolveProductImage`.
export const productImages = {
  "toca-a-bola": tocaABola,
  "coe-mane-feijao": coeManeFeijao,
  "carlao-detergente": carlaoDetergente,
};

export const productImageOptions = [
  { value: "toca-a-bola", label: "Toca a Bola (Refrigerante)", src: tocaABola },
  { value: "coe-mane-feijao", label: "Coé Mané (Feijão Carioca)", src: coeManeFeijao },
  { value: "carlao-detergente", label: "Carlão (Detergente)", src: carlaoDetergente },
];

const normalize = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Tenta resolver a imagem a partir do campo image (slug) ou do nome do produto.
export const resolveProductImage = (product) => {
  if (!product) return null;
  const key = product.image;
  if (key && productImages[key]) return productImages[key];
  if (typeof key === "string" && /^https?:\/\//i.test(key)) return key;

  const name = normalize(product.name);
  if (!name) return null;
  if (name.includes("toca") && name.includes("bola")) return productImages["toca-a-bola"];
  if (name.includes("coe") && name.includes("mane")) return productImages["coe-mane-feijao"];
  if (name.includes("feijao")) return productImages["coe-mane-feijao"];
  if (name.includes("carlao") || name.includes("detergente")) return productImages["carlao-detergente"];
  return null;
};
