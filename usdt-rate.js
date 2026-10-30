(() => {
  // La cápsula se alinea al botón del menú, tanto en el portal de pedidos como en el catálogo.
  const menu = document.getElementById("btnMenu") || document.getElementById("btnAbrirMenu");
  const contenedor = menu && menu.parentElement;
  if (!contenedor || typeof URL_API_APPS_SCRIPT === "undefined") {
    console.error("No se pudo inicializar el módulo de promedio USDT: falta el menú o la URL de Apps Script.");
    return;
  }

  // Estilos exclusivos de la cápsula USDT del banner, incluido su tema claro y tamaño móvil.
  const estilos = document.createElement("style");
  estilos.textContent = `
    .usdt-rate {
      position: absolute;
      top: 50%;
      right: 60px;
      min-width: 90px;
      min-height: 42px;
      padding: 6px 11px;
      border: 1px solid #3a3a3a;
      border-radius: 14px;
      background: #242424;
      color: #f5f5f5;
      font-size: 0.78rem;
      font-weight: 600;
      line-height: 1.1;
      text-align: center;
      white-space: nowrap;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
      transform: translateY(-50%);
      box-sizing: border-box;
    }
    body.light-mode .usdt-rate {
      border-color: #e2e8f0;
      background: #ffffff;
      color: #0f172a;
    }
    .usdt-rate-label {
      color: #f97316;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .usdt-rate-value {
      font-variant-numeric: tabular-nums;
    }
    @media (max-width: 375px) {
      .usdt-rate {
        min-width: 68px;
        padding: 4px 7px;
        font-size: 0.7rem;
      }
    }
  `;
  document.head.appendChild(estilos);

  // Contenido de la cápsula: etiqueta USDT, tasa promedio y estado accesible.
  const elemento = document.createElement("span");
  elemento.id = "promedioUsdt";
  elemento.className = "usdt-rate";
  elemento.setAttribute("role", "status");
  elemento.setAttribute("aria-live", "polite");
  elemento.setAttribute("aria-label", "Promedio de compra de USDT/VES en Binance P2P");
  elemento.title = "Promedio de los precios de compra de USDT/VES publicados en Binance P2P.";
  const etiqueta = document.createElement("span");
  etiqueta.className = "usdt-rate-label";
  etiqueta.textContent = "USDT";
  const valor = document.createElement("span");
  valor.className = "usdt-rate-value";
  valor.textContent = "Bs. consultando...";
  elemento.append(etiqueta, valor);
  contenedor.insertBefore(elemento, menu);

  // Consulta JSONP al Apps Script; este endpoint calcula el promedio de compra de Binance P2P.
  const callbackName = `__limzaPromedioUsdt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const script = document.createElement("script");
  let completado = false;
  const timeout = window.setTimeout(
    () => finalizar(new Error("Se agotó el tiempo de consulta del promedio USDT.")),
    10000
  );

  function finalizar(error, datos) {
    if (completado) return;
    completado = true;
    window.clearTimeout(timeout);
    delete window[callbackName];
    script.remove();

    if (
      error ||
      !datos ||
      datos.exito !== true ||
      !Number.isFinite(Number(datos.tasa)) ||
      Number(datos.tasa) <= 0
    ) {
      if (error) console.error("No se pudo cargar el promedio USDT:", error);
      else console.error("El servidor devolvió un promedio USDT inválido.", datos);
      valor.textContent = "Bs. no disponible";
      elemento.title = datos && datos.mensaje
        ? String(datos.mensaje)
        : "No se pudo consultar el promedio USDT/VES en Binance P2P.";
      return;
    }

    const formatear = (tasa) => new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(tasa));
    valor.textContent = `Bs. ${formatear(datos.tasa)}`;
    elemento.title = `Promedio de compra Binance P2P USDT/VES: Bs. ${formatear(datos.tasa)}`;
  }

  window[callbackName] = (datos) => finalizar(null, datos);
  script.onerror = () => finalizar(new Error("No se pudo cargar la respuesta de Apps Script para el promedio USDT."));
  script.src = `${URL_API_APPS_SCRIPT}?action=promedioUSDT&callback=${encodeURIComponent(callbackName)}`;
  document.head.appendChild(script);
})();
