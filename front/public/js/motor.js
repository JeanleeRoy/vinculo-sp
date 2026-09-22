/**
 * MOTOR ANATÓMICO — Animación de dibujado por capas
 * ---------------------------------------------------
 * Recibe una configuración de anatomía y un contenedor DOM.
 * Genera un SVG con:
 *   - Máscara compuesta por siluetas anatómicas reales
 *   - Imagen PNG revelada por esa máscara
 *   - Capa de tinta (contornos que se trazan)
 *   - Pincel que sigue el contorno activo (solo en elementos grandes)
 */
class MotorAnatomico {
  constructor(anatomia, contenedor){
    this.anatomia = anatomia;
    this.contenedor = contenedor;
    this.svg = null;
    this.brush = null;
    this.SVG_NS = "http://www.w3.org/2000/svg";
    this.solapamiento = anatomia.solapamiento || 0.60;
    this.areaMinPincel = 1500;  // sin outlines, el pincel es más protagonista
  }

  duracionTotalMs(){
    const els = this.anatomia.elementos;
    if(!els.length) return 0;
    let acum = 900; // entrada del pincel
    for(const el of els) acum += this._dur(el);
    return acum + 800;
  }

  _dur(el){
    const a = el.area || 0;
    if(a < 1200)  return 90;
    if(a < 4000)  return 160;
    if(a < 12000) return 250;
    return 400;
  }

  init(){
    this.svg = this.construirSVG();
    this.contenedor.appendChild(this.svg);
    this.brush = this.svg.querySelector("#brush");
  }

  construirSVG(){
    const svg = document.createElementNS(this.SVG_NS, "svg");
    svg.setAttribute("viewBox", this.anatomia.viewBox);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const defs = document.createElementNS(this.SVG_NS, "defs");
    const mask = document.createElementNS(this.SVG_NS, "mask");
    mask.setAttribute("id", "reveal-mask");
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("x","0"); mask.setAttribute("y","0");
    mask.setAttribute("width","1024"); mask.setAttribute("height","1024");

    const bg = document.createElementNS(this.SVG_NS, "rect");
    bg.setAttribute("width","1024"); bg.setAttribute("height","1024");
    bg.setAttribute("fill","black");
    mask.appendChild(bg);

    for(const el of this.anatomia.elementos){
      const p = document.createElementNS(this.SVG_NS, "path");
      p.setAttribute("id", `mask-${el.id}`);
      p.setAttribute("d", el.d);
      p.setAttribute("fill", "white");
      p.setAttribute("fill-rule", "evenodd");
      p.setAttribute("opacity", "0");
      mask.appendChild(p);
    }
    defs.appendChild(mask);
    svg.appendChild(defs);

    const imagePath = (this.anatomia.imagen.startsWith('/') || this.anatomia.imagen.startsWith('http'))
      ? this.anatomia.imagen
      : `/${this.anatomia.imagen}`;

    const img = document.createElementNS(this.SVG_NS, "image");
    img.setAttribute("href", imagePath);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imagePath);
    img.setAttribute("x","0"); img.setAttribute("y","0");
    img.setAttribute("width","1024"); img.setAttribute("height","1024");
    img.setAttribute("mask","url(#reveal-mask)");
    img.setAttribute("preserveAspectRatio","xMidYMid meet");
    svg.appendChild(img);

    // Overlay final: PNG sin máscara, aparece al terminar (perfecciona el resultado)
    const finalImg = document.createElementNS(this.SVG_NS, "image");
    finalImg.setAttribute("id", "final-overlay");
    finalImg.setAttribute("href", imagePath);
    finalImg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imagePath);
    finalImg.setAttribute("x","0"); finalImg.setAttribute("y","0");
    finalImg.setAttribute("width","1024"); finalImg.setAttribute("height","1024");
    finalImg.setAttribute("preserveAspectRatio","xMidYMid meet");
    svg.appendChild(finalImg);

    const inkLayer = document.createElementNS(this.SVG_NS, "g");
    inkLayer.setAttribute("id", "ink-layer");
    for(const el of this.anatomia.elementos){
      const p = document.createElementNS(this.SVG_NS, "path");
      p.setAttribute("id", `ink-${el.id}`);
      p.setAttribute("d", el.d);
      p.setAttribute("class", "ink-path");
      inkLayer.appendChild(p);
    }
    svg.appendChild(inkLayer);

    svg.appendChild(this.construirPincel());
    return svg;
  }

  construirPincel(){
    const g = document.createElementNS(this.SVG_NS, "g");
    g.setAttribute("id", "brush");
    g.innerHTML = `
      <g transform="translate(-90,0)">
        <rect x="-4" y="-6" width="4" height="12" rx="1" fill="#3d2b1f"/>
        <rect x="0" y="-7" width="55" height="14" rx="3" fill="#8b4513" stroke="#4a2609" stroke-width=".8"/>
        <rect x="0" y="-7" width="55" height="3" fill="#a55a1e" opacity=".5"/>
        <rect x="55" y="-11" width="16" height="22" fill="#c9c9c9" stroke="#666" stroke-width=".8"/>
        <rect x="55" y="-11" width="16" height="2.5" fill="#e8e8e8"/>
        <rect x="55" y="8.5" width="16" height="2.5" fill="#7a7a7a"/>
        <path d="M 71,-11 L 86,-6 L 90,0 L 86,6 L 71,11 Z" fill="#e0a800" stroke="#8a5a00" stroke-width=".8"/>
        <path d="M 74,-8 L 87,-3 M 74,-4 L 89,-1 M 74,0 L 90,0 M 74,4 L 89,1 M 74,8 L 87,3"
              stroke="#8a5a00" stroke-width=".5" fill="none" opacity=".6"/>
        <circle cx="90" cy="0" r="3.5" fill="#ffd400"/>
        <circle cx="90" cy="0" r="1.5" fill="#fff2a8"/>
      </g>`;
    return g;
  }

  async play(){
    const elementos = this.anatomia.elementos;
    if(!elementos.length) return;

    this.brush.setAttribute("transform", "translate(512 820) rotate(-20)");
    this.brush.classList.add("active");
    await this._sleep(900);

    // Serializado: nada aparece sin el pincel encima
    for(const el of elementos){
      await this._dibujarElemento(el);
    }

    this.brush.classList.remove("active");
    await this._sleep(300);  // pausa breve antes del flash
    const stage = document.getElementById("stage");
    if(stage){
      const flash = stage.querySelector(".flash");
      if(flash){ flash.classList.add("active"); setTimeout(()=>flash.classList.remove("active"), 1600); }
    }
    this.contenedor.classList.add("done");
  }

  async _dibujarElemento(el){
    const dur = this._dur(el);
    const inkPath = this.svg.querySelector(`#ink-${el.id}`);
    const maskPath = this.svg.querySelector(`#mask-${el.id}`);

    // Revelado en sincronía con el trazo del pincel
    maskPath.style.transition = `opacity ${dur * 0.85}ms ease-out`;
    requestAnimationFrame(() => { maskPath.style.opacity = "1"; });

    // Pincel recorre el contorno en el mismo tiempo → siempre encima del revelado
    await this._moverPincelPor(inkPath, dur);
  }

  _moverPincelPor(path, duracionMs){
    return new Promise((resolve) => {
      let totalLen;
      try { totalLen = path.getTotalLength(); } catch(e){ resolve(); return; }
      if(totalLen < 1){ resolve(); return; }

      this.brush.classList.add("active");
      const t0 = performance.now();

      const step = (t) => {
        const elapsed = t - t0;
        const raw = Math.min(elapsed / duracionMs, 1);
        const eased = this._easeInOut(raw);
        const dist = totalLen * eased;
        const pt = path.getPointAtLength(dist);
        const lookAhead = Math.min(dist + 2, totalLen);
        const pt2 = path.getPointAtLength(lookAhead);
        const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
        this.brush.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${angle})`);
        if(raw < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  _easeInOut(t){
    return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
  }

  _sleep(ms){
    return new Promise(r => setTimeout(r, ms));
  }
}

window.MotorAnatomico = MotorAnatomico;