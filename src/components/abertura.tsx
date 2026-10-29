import { config } from "@/lib/config";

// Abertura do site: fundo verde, "soares" sendo digitado, linha dourada carregando e a cortina subindo.
// É só CSS (some sozinha mesmo sem JavaScript) e aparece uma vez por sessão: o script marca a sessão
// e, nas visitas seguintes, esconde a abertura antes de ela ser pintada.
export function Abertura() {
  const letras = config.logo.split("");
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var h=document.documentElement;if(sessionStorage.getItem('abriu')||matchMedia('(prefers-reduced-motion: reduce)').matches){h.classList.add('ja-abriu')}else{sessionStorage.setItem('abriu','1');h.classList.add('abrindo');setTimeout(function(){h.classList.remove('abrindo')},1900)}}catch(e){}`,
        }}
      />
      <div aria-hidden className="abertura">
        <div className="abertura-nome">
          {letras.map((l, i) => (
            <span key={i} style={{ animationDelay: `${0.15 + i * 0.09}s` }}>
              {l}
            </span>
          ))}
          <i className="cursor-piscando" />
        </div>
        <div className="abertura-linha" />
      </div>
    </>
  );
}
