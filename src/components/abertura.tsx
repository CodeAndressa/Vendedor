import { config } from "@/lib/config";

// Roda no <head> do layout, antes da primeira pintura, só na carga completa da página (nunca de novo
// numa navegação dentro do site, onde o React não executa <script>). Mostra a abertura uma vez por sessão
// e só quando a pessoa entra pela página inicial; nos outros casos a esconde antes de aparecer.
export const scriptAbertura = `try{var h=document.documentElement;if(location.pathname!=='/'||sessionStorage.getItem('abriu')||matchMedia('(prefers-reduced-motion: reduce)').matches){h.classList.add('ja-abriu')}else{sessionStorage.setItem('abriu','1');h.classList.add('abrindo');setTimeout(function(){h.classList.remove('abrindo')},1400)}}catch(e){}`;

// Abertura do site: fundo verde, "soares" sendo digitado, linha dourada carregando e a cortina subindo
// (cerca de 1,4 s no total). É só CSS e some sozinha mesmo sem JavaScript.
export function Abertura() {
  const letras = config.logo.split("");
  return (
    <div aria-hidden className="abertura">
      <div className="abertura-nome">
        {letras.map((l, i) => (
          <span key={i} style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
            {l}
          </span>
        ))}
        <i className="cursor-piscando" />
      </div>
      <div className="abertura-linha" />
    </div>
  );
}
