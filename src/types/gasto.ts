export interface GastoCreateInput {
  nome: string;
  valor: number;
  usuario?: string;
  usuarioId?: number;
  categoriaId: number;
  formaPagamentoId: number;
}

export interface GastoUpdateInput {
  nome?: string;
  valor?: number;
}

export interface GastoResponse {
  id: number;
  nome: string;
  valor: number;
  usuario: {
    id: number;
    nome: string;
    email?: string | null;
  };
  categoria: {
    id: number;
    nome: string;
  };
  formaPagamento: {
    id: number;
    nome: string;
  };
}
