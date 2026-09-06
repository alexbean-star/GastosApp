// ===== Mis Gastos - Lógica de la app =====

const STORAGE = {
  gastos: "misGastos",
  tarjetas: "misTarjetas",       // crédito
  debitos: "misDebitos",         // cuentas de débito
  ahorros: "misAhorros",         // guardadito
  presupuesto: "miPresupuesto",
  pagos: "misPagosTarjetas",     // pagos de crédito acumulados
  aportes: "misAportesAhorro",   // aportes a ahorro acumulados (descuentan quincena)
};

const ICONOS = {
  Comida: "🍔",
  Transporte: "🚗",
  Compras: "🛍️",
  Servicios: "💡",
  Salud: "🏥",
  Ocio: "🎮",
  Otros: "📦",
};

// ===== Estado =====
let gastos = [];          // { id, descripcion, monto, categoria, metodo, fecha }
let tarjetas = [];        // { id, nombre }  (crédito)
let debitos = [];         // { id, nombre }  (cuentas de débito)
let ahorros = [];         // { id, nombre, saldo, tasa, ultimaActualizacion }
let presupuesto = 0;
let totalPagosTarjetas = 0;
let totalAportesAhorro = 0;
let editandoId = null;

// ===== Referencias DOM =====
const form = document.getElementById("formGasto");
const inputDescripcion = document.getElementById("descripcion");
const inputMonto = document.getElementById("monto");
const inputCategoria = document.getElementById("categoria");
const inputMetodoPago = document.getElementById("metodoPago");
const inputFecha = document.getElementById("fecha");

const listaGastos = document.getElementById("listaGastos");
const mensajeVacio = document.getElementById("mensajeVacio");
const totalGastoEl = document.getElementById("totalGasto");
const cantidadGastosEl = document.getElementById("cantidadGastos");
const btnLimpiar = document.getElementById("btnLimpiar");

const cardFormGasto = document.getElementById("cardFormGasto");
const tituloFormGasto = document.getElementById("tituloFormGasto");
const bannerEdicion = document.getElementById("bannerEdicion");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const btnSubmitGasto = document.getElementById("btnSubmitGasto");

// Efectivo
const listaEfectivo = document.getElementById("listaEfectivo");
const mensajeSinEfectivo = document.getElementById("mensajeSinEfectivo");
const totalEfectivoEl = document.getElementById("totalEfectivo");
const cantidadEfectivoEl = document.getElementById("gastadoEfectivo");

// Débito
const formDebito = document.getElementById("formDebito");
const inputNombreDebito = document.getElementById("nombreDebito");
const inputSaldoDebito = document.getElementById("saldoDebito");
const listaDebito = document.getElementById("listaDebito");
const mensajeSinDebito = document.getElementById("mensajeSinDebito");

// Modal de transferencia
const modalTransfer = document.getElementById("modalTransfer");
const formTransfer = document.getElementById("formTransfer");
const transferOrigen = document.getElementById("transferOrigen");
const transferTipo = document.getElementById("transferTipo");
const campoDestinoCuenta = document.getElementById("campoDestinoCuenta");
const transferDestino = document.getElementById("transferDestino");
const campoConcepto = document.getElementById("campoConcepto");
const transferConcepto = document.getElementById("transferConcepto");
const transferMonto = document.getElementById("transferMonto");
const transferFecha = document.getElementById("transferFecha");
const btnCancelarTransfer = document.getElementById("btnCancelarTransfer");
let cuentaOrigenTransfer = null; // id de la cuenta de débito origen

// Crédito
const formTarjeta = document.getElementById("formTarjeta");
const inputNombreTarjeta = document.getElementById("nombreTarjeta");
const listaTarjetas = document.getElementById("listaTarjetas");
const mensajeSinTarjetas = document.getElementById("mensajeSinTarjetas");

// Guardadito
const formAhorro = document.getElementById("formAhorro");
const inputNombreAhorro = document.getElementById("nombreAhorro");
const inputSaldoAhorro = document.getElementById("saldoAhorro");
const inputTasaAhorro = document.getElementById("tasaAhorro");
const inputTopeAhorro = document.getElementById("topeAhorro");
const inputTasaExcedenteAhorro = document.getElementById("tasaExcedenteAhorro");
const listaAhorro = document.getElementById("listaAhorro");
const mensajeSinAhorro = document.getElementById("mensajeSinAhorro");
const totalAhorradoEl = document.getElementById("totalAhorrado");
const rendimientoHoyEl = document.getElementById("rendimientoHoy");

// Modal de transferencia de Guardadito
const modalTransferAhorro = document.getElementById("modalTransferAhorro");
const formTransferAhorro = document.getElementById("formTransferAhorro");
const transferAhorroOrigen = document.getElementById("transferAhorroOrigen");
const transferAhorroTipo = document.getElementById("transferAhorroTipo");
const transferAhorroDestino = document.getElementById("transferAhorroDestino");
const transferAhorroConcepto = document.getElementById("transferAhorroConcepto");
const campoConceptoAhorro = document.getElementById("campoConceptoAhorro");
const transferAhorroMonto = document.getElementById("transferAhorroMonto");
const btnCancelarTransferAhorro = document.getElementById("btnCancelarTransferAhorro");
let cuentaAhorroOrigen = null;

// Presupuesto
const disponibleEl = document.getElementById("disponible");
const gastadoQuincenaEl = document.getElementById("gastadoQuincena");
const presupuestoQuincenaEl = document.getElementById("presupuestoQuincena");
const barraProgreso = document.getElementById("barraProgreso");
const btnEditarPresupuesto = document.getElementById("btnEditarPresupuesto");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnNuevaQuincena = document.getElementById("btnNuevaQuincena");

// ===== Persistencia =====
function cargarDatos() {
  const leer = (k, def) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? def; }
    catch (e) { return def; }
  };
  gastos = leer(STORAGE.gastos, []);
  tarjetas = leer(STORAGE.tarjetas, []);
  debitos = leer(STORAGE.debitos, []);
  ahorros = leer(STORAGE.ahorros, []);
  presupuesto = parseFloat(localStorage.getItem(STORAGE.presupuesto)) || 0;
  totalPagosTarjetas = parseFloat(localStorage.getItem(STORAGE.pagos)) || 0;
  totalAportesAhorro = parseFloat(localStorage.getItem(STORAGE.aportes)) || 0;
}

function guardar(clave, valor) {
  localStorage.setItem(clave, typeof valor === "object" ? JSON.stringify(valor) : String(valor));
}

// ===== Utilidades =====
function formatearDinero(valor) {
  return "$" + Number(valor).toFixed(2);
}
function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}
function hoyISO() {
  return new Date().toISOString().split("T")[0];
}
function esCredito(metodo) {
  return metodo && metodo.startsWith("credito:");
}
function esDebito(metodo) {
  return metodo && metodo.startsWith("debito:");
}

// ===== Presupuesto de la quincena =====
// Descuenta: gastos en efectivo + gastos en débito + pagos de crédito + aportes a ahorro.
// NO descuenta: gastos de crédito sin pagar (se descuentan al pagar la tarjeta),
//               ni las transferencias internas (movimiento entre cuentas propias).
function totalDescontadoQuincena() {
  const efectivoYDebito = gastos.reduce((suma, g) => {
    if (esCredito(g.metodo)) return suma;               // crédito no descuenta aquí
    if (g.esEntrada) return suma;                        // dinero recibido no es gasto
    if (g.esTransferencia && !g.descuenta) return suma;  // transferencia interna (salida)
    return suma + Number(g.monto);
  }, 0);
  return efectivoYDebito + totalPagosTarjetas + totalAportesAhorro;
}

function renderPresupuesto() {
  const gastado = totalDescontadoQuincena();
  const disponible = presupuesto - gastado;

  disponibleEl.textContent = formatearDinero(disponible);
  disponibleEl.classList.toggle("negativo", disponible < 0);

  gastadoQuincenaEl.textContent = "Descontado: " + formatearDinero(gastado);
  presupuestoQuincenaEl.textContent = "Presupuesto: " + formatearDinero(presupuesto);

  let porcentaje = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0;
  porcentaje = Math.min(porcentaje, 100);
  barraProgreso.style.width = porcentaje + "%";
  barraProgreso.classList.remove("warning", "danger");
  if (porcentaje >= 100) barraProgreso.classList.add("danger");
  else if (porcentaje >= 75) barraProgreso.classList.add("warning");
}

btnEditarPresupuesto.addEventListener("click", () => {
  // El usuario edita el DISPONIBLE directamente (Opción 2).
  const disponibleActual = presupuesto - totalDescontadoQuincena();
  const valor = prompt("Ingresa el dinero disponible en tu quincena:", disponibleActual || "");
  if (valor === null) return;
  const num = parseFloat(valor);
  if (isNaN(num) || num < 0) { alert("Ingresa un monto válido."); return; }
  // Ajustamos el presupuesto para que el disponible mostrado sea exactamente lo escrito:
  // disponible = presupuesto - descontado  =>  presupuesto = disponible + descontado
  presupuesto = num + totalDescontadoQuincena();
  guardar(STORAGE.presupuesto, presupuesto);
  renderTodo();
});

// Reiniciar los números a cero, conservando las cuentas y tarjetas (estructura).
// El Guardadito no se toca.
btnReiniciar.addEventListener("click", () => {
  const msg = "¿Reiniciar gastos, efectivo y débito?\n\n" +
    "Se pondrá en cero: gastos de débito, movimientos de efectivo, saldos de las cuentas de débito y el presupuesto.\n" +
    "Se conservan: tus tarjetas de crédito (con su deuda) y el Guardadito.\n\n" +
    "Esta acción no se puede deshacer.";
  if (!confirm(msg)) return;

  // Conservar SOLO los gastos de tarjetas de crédito (su deuda no se reinicia).
  // Se borran: gastos/movimientos de débito y todos los movimientos de efectivo.
  gastos = gastos.filter((g) => esCredito(g.metodo));

  // Conservar las cuentas de débito, pero poner su saldo en cero
  debitos = debitos.map((d) => ({ ...d, saldo: 0 }));
  // Las tarjetas se conservan tal cual (con su abonado y deuda)
  // Reiniciar presupuesto y aportes de ahorro
  presupuesto = 0;
  totalAportesAhorro = 0;
  // El acumulado de pagos de tarjeta se reinicia (era para descontar de la quincena
  // pasada). La deuda de cada tarjeta se conserva en sus propios gastos.
  totalPagosTarjetas = 0;

  guardar(STORAGE.gastos, gastos);
  guardar(STORAGE.debitos, debitos);
  guardar(STORAGE.presupuesto, presupuesto);
  guardar(STORAGE.aportes, totalAportesAhorro);
  guardar(STORAGE.pagos, totalPagosTarjetas);
  // STORAGE.ahorros y STORAGE.tarjetas NO se tocan.

  salirModoEdicion();
  renderTodo();
  alert("Listo. Se reiniciaron gastos, efectivo y débito.\nLas tarjetas de crédito y el Guardadito se conservaron.");
});

// Nueva quincena: pregunta el nuevo disponible y le SUMA lo que sobró en la cuenta Azteca.
btnNuevaQuincena.addEventListener("click", () => {
  // Lo que sobró = el disponible actual de la quincena.
  const sobrante = presupuesto - totalDescontadoQuincena();

  let mensaje = "Nueva quincena\n\n¿Cuánto dinero entra esta quincena?";
  if (sobrante > 0) {
    mensaje += `\n\nSe le sumará lo que te sobró de la quincena anterior: ${formatearDinero(sobrante)}`;
  }

  const valor = prompt(mensaje, "");
  if (valor === null) return;
  const nuevo = parseFloat(valor);
  if (isNaN(nuevo) || nuevo < 0) { alert("Ingresa un monto válido."); return; }

  // El nuevo disponible = lo que entra + lo que sobró (si es positivo)
  const disponibleTotal = nuevo + (sobrante > 0 ? sobrante : 0);

  // Ajustar el presupuesto para que el disponible mostrado sea exactamente disponibleTotal
  presupuesto = disponibleTotal + totalDescontadoQuincena();
  guardar(STORAGE.presupuesto, presupuesto);
  renderTodo();

  let resumen = `Nueva quincena lista.\nDisponible: ${formatearDinero(disponibleTotal)}`;
  if (sobrante > 0) resumen += `\n(incluye ${formatearDinero(sobrante)} que te sobró)`;
  alert(resumen);
});

// ===== Pestañas =====
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
  });
});

// ===== Historial colapsable =====
const toggleHistorial = document.getElementById("toggleHistorial");
const contenedorHistorial = document.getElementById("contenedorHistorial");
const flechaHistorial = document.getElementById("flechaHistorial");

// Función genérica para hacer una sección desplegable.
// contador() devuelve el número a mostrar entre paréntesis.
function configurarColapsable(botonToggle, contenedor, flecha, contador, ignorarSelector) {
  botonToggle.addEventListener("click", (e) => {
    if (ignorarSelector && e.target.closest(ignorarSelector)) return;
    const oculto = contenedor.hasAttribute("hidden");
    if (oculto) contenedor.removeAttribute("hidden");
    else contenedor.setAttribute("hidden", "");
    actualizarFlecha(contenedor, flecha, contador);
  });
}

function actualizarFlecha(contenedor, flecha, contador) {
  const colapsado = contenedor.hasAttribute("hidden");
  const n = typeof contador === "function" ? contador() : contador;
  flecha.textContent = (colapsado ? "▶" : "▼") + ` (${n})`;
}

configurarColapsable(toggleHistorial, contenedorHistorial, flechaHistorial,
  () => gastos.length, "#btnLimpiar");

// Efectivo colapsable
const toggleEfectivo = document.getElementById("toggleEfectivo");
const contenedorEfectivo = document.getElementById("contenedorEfectivo");
const flechaEfectivo = document.getElementById("flechaEfectivo");
configurarColapsable(toggleEfectivo, contenedorEfectivo, flechaEfectivo,
  () => gastos.filter((g) => g.metodo === "Efectivo").length);

// ===== Método de pago (Efectivo + cuentas débito + tarjetas crédito) =====
function renderMetodosPago() {
  const seleccionActual = inputMetodoPago.value;
  inputMetodoPago.innerHTML = '<option value="Efectivo">💵 Efectivo</option>';
  debitos.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = "debito:" + d.id;
    opt.textContent = "💳 " + d.nombre + " (Débito)";
    inputMetodoPago.appendChild(opt);
  });
  tarjetas.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = "credito:" + t.id;
    opt.textContent = "💳 " + t.nombre + " (Crédito)";
    inputMetodoPago.appendChild(opt);
  });
  if ([...inputMetodoPago.options].some((o) => o.value === seleccionActual)) {
    inputMetodoPago.value = seleccionActual;
  }
}

function etiquetaMetodo(gasto) {
  if (esCredito(gasto.metodo)) {
    const t = tarjetas.find((x) => x.id === gasto.metodo.split(":")[1]);
    return t ? "💳 " + t.nombre : "Tarjeta eliminada";
  }
  if (esDebito(gasto.metodo)) {
    const d = debitos.find((x) => x.id === gasto.metodo.split(":")[1]);
    return d ? "💳 " + d.nombre : "Cuenta eliminada";
  }
  return "💵 Efectivo";
}

// ===== Render: Historial de Gastos (todos) =====
function renderGastos() {
  const ordenados = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha));

  listaGastos.innerHTML = "";
  if (gastos.length === 0) {
    mensajeVacio.hidden = false;
  } else {
    mensajeVacio.hidden = true;
    ordenados.forEach((gasto) => {
      const item = document.createElement("div");
      item.className = "expense-item";
      item.innerHTML = `
        <span class="expense-icon">${ICONOS[gasto.categoria] || "📦"}</span>
        <div class="expense-info">
          <div class="expense-desc"></div>
          <div class="expense-meta"></div>
        </div>
        <span class="expense-amount">${formatearDinero(gasto.monto)}</span>
        <div class="expense-actions">
          <button class="expense-edit" data-id="${gasto.id}" aria-label="Editar">✏️</button>
          <button class="expense-delete" data-id="${gasto.id}" aria-label="Borrar">✕</button>
        </div>
      `;
      item.querySelector(".expense-desc").textContent = gasto.descripcion;
      item.querySelector(".expense-meta").textContent =
        `${gasto.categoria} · ${etiquetaMetodo(gasto)} · ${formatearFecha(gasto.fecha)}`;
      listaGastos.appendChild(item);
    });
  }

  totalGastoEl.textContent = formatearDinero(gastos.reduce((s, g) => s + Number(g.monto), 0));
  cantidadGastosEl.textContent = gastos.length;

  // Actualizar la flecha del historial con el conteo, respetando si está colapsado
  actualizarFlecha(contenedorHistorial, flechaHistorial, gastos.length);
}

// ===== Render: Efectivo =====
function renderEfectivo() {
  const movimientos = gastos
    .filter((g) => g.metodo === "Efectivo")
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  listaEfectivo.innerHTML = "";
  if (movimientos.length === 0) {
    mensajeSinEfectivo.hidden = false;
  } else {
    mensajeSinEfectivo.hidden = true;
    movimientos.forEach((g) => {
      const item = document.createElement("div");
      item.className = "expense-item";
      const signo = g.esEntrada ? "+" : "-";
      const claseMonto = g.esEntrada ? "expense-amount entrada" : "expense-amount";
      item.innerHTML = `
        <span class="expense-icon">${g.esEntrada ? "💵" : (ICONOS[g.categoria] || "📦")}</span>
        <div class="expense-info">
          <div class="expense-desc"></div>
          <div class="expense-meta">${g.categoria} · ${formatearFecha(g.fecha)}</div>
        </div>
        <span class="${claseMonto}">${signo}${formatearDinero(g.monto)}</span>
        <div class="expense-actions">
          <button class="expense-delete" data-id="${g.id}" aria-label="Borrar">✕</button>
        </div>
      `;
      item.querySelector(".expense-desc").textContent = g.descripcion;
      listaEfectivo.appendChild(item);
    });
  }

  // Entradas (retiros a efectivo) − gastos en efectivo = efectivo disponible
  let entradas = 0, gastadoEfvo = 0;
  movimientos.forEach((g) => {
    if (g.esEntrada) entradas += Number(g.monto);
    else gastadoEfvo += Number(g.monto);
  });
  totalEfectivoEl.textContent = formatearDinero(entradas - gastadoEfvo);
  cantidadEfectivoEl.textContent = formatearDinero(gastadoEfvo);
  actualizarFlecha(contenedorEfectivo, flechaEfectivo, movimientos.length);
}

// ===== Render genérico de gastos dentro de una cuenta (débito/crédito) =====
function detalleGastosHtml(gastosCuenta) {
  if (gastosCuenta.length === 0) {
    return '<div class="card-detail-empty">Sin gastos registrados</div>';
  }
  // Usamos <details> nativo para desplegar/ocultar los movimientos.
  let html = `<details class="card-detail-toggle">
    <summary>Ver movimientos (${gastosCuenta.length})</summary>
    <div class="card-detail">`;
  gastosCuenta.forEach((g) => {
    const signo = g.esEntrada ? "+" : "";
    const clase = g.esEntrada ? "cd-amount entrada" : "cd-amount";
    html += `
      <div class="card-detail-row">
        <span class="cd-desc" data-desc="${g.id}"></span>
        <span class="${clase}">${signo}${formatearDinero(g.monto)}</span>
        <button class="cd-del" data-del="${g.id}" aria-label="Borrar gasto">✕</button>
      </div>`;
  });
  html += "</div></details>";
  return html;
}

function llenarDescripciones(card, gastosCuenta) {
  gastosCuenta.forEach((g) => {
    const span = card.querySelector(`[data-desc="${g.id}"]`);
    if (span) span.textContent = `${g.descripcion} · ${formatearFecha(g.fecha)}`;
  });
}

// ===== Render: Débito =====
// Total "gastado" de una cuenta: excluye entradas recibidas y transferencias internas
// de salida (movimientos entre cuentas propias no son gasto).
function totalPorDebito(id) {
  return gastos
    .filter((g) => g.metodo === "debito:" + id)
    .filter((g) => !g.esEntrada && !(g.esTransferencia && !g.descuenta))
    .reduce((s, g) => s + Number(g.monto), 0);
}

// Efectivo disponible total = entradas de efectivo (retiros) − gastos en efectivo.
function efectivoDisponibleTotal() {
  return gastos
    .filter((g) => g.metodo === "Efectivo")
    .reduce((s, g) => s + (g.esEntrada ? Number(g.monto) : -Number(g.monto)), 0);
}

// Saldo disponible de una cuenta de débito:
// saldo inicial − (todo lo que sale) + (entradas recibidas).
// "Sale" = gastos, retiros, transferencias (internas de salida y a persona) y pagos de TDC.
function saldoDisponibleDebito(id) {
  const cuenta = debitos.find((d) => d.id === id);
  const inicial = cuenta ? Number(cuenta.saldo || 0) : 0;
  let saldo = inicial;
  gastos.filter((g) => g.metodo === "debito:" + id).forEach((g) => {
    if (g.esEntrada) saldo += Number(g.monto);   // dinero recibido
    else saldo -= Number(g.monto);               // gasto/salida/retiro/pago
  });
  return saldo;
}

function renderDebito() {
  listaDebito.innerHTML = "";
  if (debitos.length === 0) { mensajeSinDebito.hidden = false; return; }
  mensajeSinDebito.hidden = true;

  debitos.forEach((d) => {
    const saldo = saldoDisponibleDebito(d.id);
    const gastosCuenta = gastos.filter((g) => g.metodo === "debito:" + d.id)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    const banco = detectarBanco(d.nombre);

    // Si la cuenta es de Banco Azteca, mostrar también el disponible de la quincena.
    const esAzteca = banco.clase === "banco-azteca";
    let bloqueQuincena = "";
    if (esAzteca) {
      const disponible = presupuesto - totalDescontadoQuincena();

      // "Solo esta cuenta" = disponible − efectivo − saldo de las OTRAS cuentas de débito
      const efectivoDisponible = efectivoDisponibleTotal();
      const otrasDebito = debitos
        .filter((x) => x.id !== d.id)
        .reduce((s, x) => s + saldoDisponibleDebito(x.id), 0);
      const soloEstaCuenta = disponible - efectivoDisponible - otrasDebito;

      bloqueQuincena = `
        <div class="card-quincena">
          <span>💰 Disponible en la quincena</span>
          <strong class="${disponible < 0 ? "negativo" : ""}">${formatearDinero(disponible)}</strong>
        </div>
        <div class="card-quincena solo-cuenta">
          <span>🏦 Solo esta cuenta</span>
          <strong class="${soloEstaCuenta < 0 ? "negativo" : ""}">${formatearDinero(soloEstaCuenta)}</strong>
        </div>`;
    }

    const card = document.createElement("div");
    // Si detecta banco usa su color; si no, el azul por defecto de débito.
    card.className = "credit-card " + (banco.clase || "debito");
    card.innerHTML = `
      <div class="credit-card-top">
        <span class="credit-card-name"></span>
        <span class="bank-badge">${banco.distintivo}</span>
      </div>
      <div>
        <div class="credit-card-total">Saldo disponible</div>
        <div class="credit-card-amount ${saldo < 0 ? "negativo-amount" : ""}">${formatearDinero(saldo)}</div>
      </div>
      ${bloqueQuincena}
      ${detalleGastosHtml(gastosCuenta)}
      <div class="credit-card-actions">
        <button class="btn-card add-debito" data-id="${d.id}">+ Gasto</button>
        <button class="btn-card transfer" data-id="${d.id}">🔄 Transferir</button>
        <button class="btn-card retirar" data-id="${d.id}">💸 Retirar</button>
        <button class="btn-card pagar-tdc" data-id="${d.id}">💳 Pagar TDC</button>
        <button class="btn-card delete-debito" data-id="${d.id}" aria-label="Eliminar">🗑️</button>
      </div>
    `;
    card.querySelector(".credit-card-name").textContent = d.nombre;
    llenarDescripciones(card, gastosCuenta);
    listaDebito.appendChild(card);
  });
}

// ===== Render: Crédito =====
// Saldo pendiente = suma de gastos de la tarjeta − lo ya abonado.
function saldoPendienteTarjeta(id) {
  const t = tarjetas.find((x) => x.id === id);
  const totalGastos = gastos.filter((g) => g.metodo === "credito:" + id)
    .reduce((s, g) => s + Number(g.monto), 0);
  const abonado = t ? Number(t.abonado || 0) : 0;
  return Math.max(totalGastos - abonado, 0);
}

// Detecta el banco a partir del nombre de la tarjeta.
// Devuelve { clase, distintivo } para aplicar color y badge.
function detectarBanco(nombre) {
  const n = (nombre || "").toLowerCase();
  if (n.includes("santander")) {
    return { clase: "banco-santander", distintivo: "Santander" };
  }
  if (n.includes("banamex") || n.includes("citibanamex")) {
    return { clase: "banco-banamex", distintivo: "Banamex" };
  }
  if (n.includes("bbva")) {
    return { clase: "banco-bbva", distintivo: "BBVA" };
  }
  if (n.includes("banorte")) {
    return { clase: "banco-banorte", distintivo: "Banorte" };
  }
  if (n.includes("hsbc")) {
    return { clase: "banco-hsbc", distintivo: "HSBC" };
  }
  if (n.includes("azteca")) {
    return { clase: "banco-azteca", distintivo: "Azteca" };
  }
  if (n.includes("nu") || n.includes("nubank")) {
    return { clase: "banco-nu", distintivo: "Nu" };
  }
  return { clase: "", distintivo: "💳" };
}

function renderTarjetas() {
  listaTarjetas.innerHTML = "";
  if (tarjetas.length === 0) { mensajeSinTarjetas.hidden = false; return; }
  mensajeSinTarjetas.hidden = true;

  tarjetas.forEach((t) => {
    const pendiente = saldoPendienteTarjeta(t.id);
    const gastosCuenta = gastos.filter((g) => g.metodo === "credito:" + t.id)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    const banco = detectarBanco(t.nombre);

    const card = document.createElement("div");
    card.className = "credit-card" + (banco.clase ? " " + banco.clase : "");
    card.innerHTML = `
      <div class="credit-card-top">
        <span class="credit-card-name"></span>
        <span class="bank-badge">${banco.distintivo}</span>
      </div>
      <div>
        <div class="credit-card-total">Por pagar</div>
        <div class="credit-card-amount">${formatearDinero(pendiente)}</div>
        ${Number(t.abonado) > 0 ? `<div class="credit-card-sub">Abonado: ${formatearDinero(t.abonado)}</div>` : ""}
      </div>
      ${detalleGastosHtml(gastosCuenta)}
      <div class="credit-card-actions">
        <button class="btn-card add-credito" data-id="${t.id}">+ Gasto</button>
        <button class="btn-card pay" data-id="${t.id}" ${pendiente <= 0 ? "disabled" : ""}>✅ Pagar</button>
        <button class="btn-card delete-credito" data-id="${t.id}" aria-label="Eliminar">🗑️</button>
      </div>
    `;
    card.querySelector(".credit-card-name").textContent = t.nombre;
    llenarDescripciones(card, gastosCuenta);
    listaTarjetas.appendChild(card);
  });
}

// Paga una tarjeta de crédito (total o parcial). Pregunta el monto.
// Descuenta de la quincena y baja el saldo pendiente (abonado).
// Si el pago cubre todo, borra los gastos y resetea el abonado.
// idDebitoOrigen (opcional): si viene, el pago sale del saldo de esa cuenta de débito.
function pagarTarjetaConMonto(id, idDebitoOrigen) {
  const t = tarjetas.find((x) => x.id === id);
  if (!t) return;
  const pendiente = saldoPendienteTarjeta(id);
  if (pendiente <= 0) { alert("Esta tarjeta no tiene saldo por pagar."); return; }

  const valor = prompt(
    `Pagar tarjeta "${t.nombre}"\nSaldo por pagar: ${formatearDinero(pendiente)}\n\n` +
    `¿Cuánto quieres pagar? (se descontará de tu quincena)`,
    pendiente.toFixed(2)
  );
  if (valor === null) return;
  let monto = parseFloat(valor);
  if (isNaN(monto) || monto <= 0) { alert("Ingresa un monto válido."); return; }
  if (monto > pendiente) monto = pendiente; // no pagar de más

  aplicarPagoTarjeta(t, monto, idDebitoOrigen);
  guardar(STORAGE.pagos, totalPagosTarjetas);
  guardar(STORAGE.tarjetas, tarjetas);
  guardar(STORAGE.debitos, debitos);
  guardar(STORAGE.gastos, gastos);
  renderTodo();
}

// Aplica un pago a una tarjeta: acumula en la quincena y ajusta el saldo.
// Si el pago liquida la tarjeta, borra sus gastos y limpia el abonado.
// Si viene idDebitoOrigen, registra el pago como salida de esa cuenta de débito.
function aplicarPagoTarjeta(t, monto, idDebitoOrigen) {
  totalPagosTarjetas += monto;
  const pendiente = saldoPendienteTarjeta(t.id);

  // Registrar la salida del dinero en la cuenta de débito origen (si aplica)
  if (idDebitoOrigen) {
    gastos.push({
      id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
      descripcion: `💳 Pago a ${t.nombre}`,
      monto,
      categoria: "Otros",
      metodo: "debito:" + idDebitoOrigen,
      fecha: hoyISO(),
      esTransferencia: true,
      esPagoTDC: true,
      descuenta: false, // ya se cuenta vía totalPagosTarjetas; no duplicar en quincena
    });
  }

  if (monto >= pendiente) {
    // Pago total: borrar gastos de la tarjeta y limpiar abonado
    gastos = gastos.filter((g) => g.metodo !== "credito:" + t.id);
    t.abonado = 0;
  } else {
    // Pago parcial: acumular abonado
    t.abonado = Number(t.abonado || 0) + monto;
  }
}
// Cada cuenta tiene dos tasas:
//  - tasa: se aplica al dinero HASTA el tope.
//  - tasaExcedente: se aplica al dinero que PASA del tope.
// Si el tope es 0 (sin tope), todo el saldo usa la tasa principal.

// Rendimiento de UN día para una cuenta, según su saldo actual.
function rendimientoDiarioCuenta(a) {
  const saldo = Number(a.saldo);
  const tope = Number(a.tope) || 0;
  const tasaBase = (Number(a.tasa) || 0) / 100 / 365;
  const tasaExc = (Number(a.tasaExcedente) || 0) / 100 / 365;

  if (tope <= 0) {
    // Sin tope: toda la base usa la tasa principal
    return saldo * tasaBase;
  }
  const parteBase = Math.min(saldo, tope);
  const parteExcedente = Math.max(saldo - tope, 0);
  return parteBase * tasaBase + parteExcedente * tasaExc;
}

// Aplica el rendimiento acumulado desde la última actualización de cada cuenta.
function aplicarRendimientos() {
  const hoy = hoyISO();
  let cambio = false;
  ahorros.forEach((a) => {
    if (!a.ultimaActualizacion) { a.ultimaActualizacion = hoy; cambio = true; return; }
    const dias = diasEntre(a.ultimaActualizacion, hoy);
    if (dias > 0) {
      // Se aplica día a día porque la base cambia conforme crece el saldo.
      for (let i = 0; i < dias; i++) {
        a.saldo = Number(a.saldo) + rendimientoDiarioCuenta(a);
      }
      a.ultimaActualizacion = hoy;
      cambio = true;
    }
  });
  if (cambio) guardar(STORAGE.ahorros, ahorros);
}

function diasEntre(isoInicio, isoFin) {
  const a = new Date(isoInicio + "T00:00:00");
  const b = new Date(isoFin + "T00:00:00");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function renderAhorros() {
  listaAhorro.innerHTML = "";
  let totalSaldo = 0;
  let totalRendHoy = 0;

  if (ahorros.length === 0) {
    mensajeSinAhorro.hidden = false;
  } else {
    mensajeSinAhorro.hidden = true;
    ahorros.forEach((a) => {
      totalSaldo += Number(a.saldo);
      totalRendHoy += rendimientoDiarioCuenta(a);

      const card = document.createElement("div");
      card.className = "credit-card ahorro";
      card.innerHTML = `
        <div class="credit-card-top">
          <span class="credit-card-name"></span><span>🐷</span>
        </div>
        <div>
          <div class="credit-card-total">Saldo actual · ${Number(a.tasa).toFixed(2)}% anual</div>
          <div class="credit-card-amount">${formatearDinero(a.saldo)}</div>
          <div class="credit-card-sub">Rendimiento diario: ${formatearDinero(rendimientoDiarioCuenta(a))}${
            Number(a.tope) > 0
              ? " · Tope: " + formatearDinero(a.tope) + " · Excedente: " + Number(a.tasaExcedente || 0).toFixed(2) + "%"
              : ""
          }</div>
        </div>
        <div class="credit-card-actions">
          <button class="btn-card transfer-ahorro" data-id="${a.id}">🔄 Transferir</button>
          <button class="btn-card editar-ahorro" data-id="${a.id}">✏️ Editar</button>
          <button class="btn-card delete-ahorro" data-id="${a.id}" aria-label="Eliminar">🗑️</button>
        </div>
      `;
      card.querySelector(".credit-card-name").textContent = a.nombre;
      listaAhorro.appendChild(card);
    });
  }

  totalAhorradoEl.textContent = formatearDinero(totalSaldo);
  rendimientoHoyEl.textContent = formatearDinero(totalRendHoy);
}

// ===== Eventos: Gastos (crear / editar) =====
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const monto = parseFloat(inputMonto.value);
  if (isNaN(monto) || monto <= 0) { alert("Ingresa un monto válido."); return; }

  if (editandoId) {
    const g = gastos.find((x) => x.id === editandoId);
    if (g) {
      g.descripcion = inputDescripcion.value.trim();
      g.monto = monto;
      g.categoria = inputCategoria.value;
      g.metodo = inputMetodoPago.value;
      g.fecha = inputFecha.value;
    }
    salirModoEdicion();
  } else {
    gastos.push({
      id: Date.now().toString(),
      descripcion: inputDescripcion.value.trim(),
      monto: monto,
      categoria: inputCategoria.value,
      metodo: inputMetodoPago.value,
      fecha: inputFecha.value,
    });
  }
  guardar(STORAGE.gastos, gastos);
  renderTodo();
  form.reset();
  establecerFechaHoy();
  inputDescripcion.focus();
});

function entrarModoEdicion(id) {
  const g = gastos.find((x) => x.id === id);
  if (!g) return;
  editandoId = id;
  inputDescripcion.value = g.descripcion;
  inputMonto.value = g.monto;
  inputCategoria.value = g.categoria;
  renderMetodosPago();
  if ([...inputMetodoPago.options].some((o) => o.value === g.metodo)) {
    inputMetodoPago.value = g.metodo;
  }
  inputFecha.value = g.fecha;
  tituloFormGasto.textContent = "Editar gasto";
  btnSubmitGasto.textContent = "Guardar cambios";
  bannerEdicion.classList.add("visible");
  cardFormGasto.classList.add("editing");
  document.querySelector('.tab[data-tab="gastos"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
  inputDescripcion.focus();
}

function salirModoEdicion() {
  editandoId = null;
  tituloFormGasto.textContent = "Agregar gasto";
  btnSubmitGasto.textContent = "Agregar gasto";
  bannerEdicion.classList.remove("visible");
  cardFormGasto.classList.remove("editing");
}

btnCancelarEdicion.addEventListener("click", () => {
  salirModoEdicion();
  form.reset();
  establecerFechaHoy();
});

listaGastos.addEventListener("click", (e) => {
  const btnEditar = e.target.closest(".expense-edit");
  const btnBorrar = e.target.closest(".expense-delete");
  if (btnEditar) { entrarModoEdicion(btnEditar.dataset.id); return; }
  if (btnBorrar) {
    const id = btnBorrar.dataset.id;
    gastos = gastos.filter((g) => g.id !== id);
    if (editandoId === id) { salirModoEdicion(); form.reset(); establecerFechaHoy(); }
    guardar(STORAGE.gastos, gastos);
    renderTodo();
  }
});

btnLimpiar.addEventListener("click", () => {
  if (gastos.length === 0) return;
  if (confirm("¿Seguro que quieres borrar todos los gastos?")) {
    gastos = [];
    guardar(STORAGE.gastos, gastos);
    renderTodo();
  }
});

// Borrar un movimiento de efectivo (gasto o retiro recibido)
listaEfectivo.addEventListener("click", (e) => {
  const btnBorrar = e.target.closest(".expense-delete");
  if (!btnBorrar) return;
  gastos = gastos.filter((g) => g.id !== btnBorrar.dataset.id);
  guardar(STORAGE.gastos, gastos);
  renderTodo();
});

// ===== Eventos: Débito =====
formDebito.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = inputNombreDebito.value.trim();
  const saldo = parseFloat(inputSaldoDebito.value);
  if (!nombre || isNaN(saldo) || saldo < 0) {
    alert("Completa el nombre y un saldo válido.");
    return;
  }
  debitos.push({ id: Date.now().toString(), nombre, saldo });
  guardar(STORAGE.debitos, debitos);
  renderTodo();
  formDebito.reset();
});

listaDebito.addEventListener("click", (e) => {
  const btnAgregar = e.target.closest(".add-debito");
  const btnTransfer = e.target.closest(".transfer");
  const btnRetirar = e.target.closest(".retirar");
  const btnPagarTdc = e.target.closest(".pagar-tdc");
  const btnEliminar = e.target.closest(".delete-debito");
  const btnBorrarGasto = e.target.closest(".cd-del");

  if (btnBorrarGasto) {
    gastos = gastos.filter((g) => g.id !== btnBorrarGasto.dataset.del);
    guardar(STORAGE.gastos, gastos);
    renderTodo();
    return;
  }
  if (btnAgregar) {
    inputMetodoPago.value = "debito:" + btnAgregar.dataset.id;
    document.querySelector('.tab[data-tab="gastos"]').click();
    window.scrollTo({ top: 0, behavior: "smooth" });
    inputDescripcion.focus();
  }
  if (btnTransfer) {
    abrirModalTransfer(btnTransfer.dataset.id);
  }
  if (btnRetirar) {
    abrirModalTransfer(btnRetirar.dataset.id);
    transferTipo.value = "retiro";
    actualizarCamposTransfer();
  }
  if (btnPagarTdc) {
    pagarTarjetasDelBanco(btnPagarTdc.dataset.id);
  }
  if (btnEliminar) {
    const id = btnEliminar.dataset.id;
    const d = debitos.find((x) => x.id === id);
    const total = totalPorDebito(id);
    let msg = `¿Eliminar la cuenta "${d.nombre}"?`;
    if (total > 0) msg += `\n\nTiene ${formatearDinero(total)} en gastos. Esos gastos NO se borran, quedarán sin cuenta asignada.`;
    if (confirm(msg)) {
      debitos = debitos.filter((x) => x.id !== id);
      guardar(STORAGE.debitos, debitos);
      renderTodo();
    }
  }
});

// Pagar una tarjeta de crédito del MISMO banco que la cuenta de débito.
// Deja elegir la tarjeta (si hay varias) y el monto (total o parcial).
function pagarTarjetasDelBanco(idDebito) {
  const cuenta = debitos.find((d) => d.id === idDebito);
  if (!cuenta) return;
  const bancoDebito = detectarBanco(cuenta.nombre);

  if (!bancoDebito.clase) {
    alert(`La cuenta "${cuenta.nombre}" no tiene un banco reconocido, así que no sé qué tarjetas paga.`);
    return;
  }

  // Tarjetas de crédito del mismo banco con saldo pendiente
  const tarjetasBanco = tarjetas.filter((t) => {
    const b = detectarBanco(t.nombre);
    return b.clase === bancoDebito.clase && saldoPendienteTarjeta(t.id) > 0;
  });

  if (tarjetasBanco.length === 0) {
    alert(`No hay tarjetas de crédito de ${bancoDebito.distintivo} con saldo por pagar.`);
    return;
  }

  let tarjetaElegida;
  if (tarjetasBanco.length === 1) {
    tarjetaElegida = tarjetasBanco[0];
  } else {
    // Varias tarjetas: preguntar cuál pagar
    let lista = tarjetasBanco.map((t, i) =>
      `${i + 1}. ${t.nombre} — por pagar ${formatearDinero(saldoPendienteTarjeta(t.id))}`
    ).join("\n");
    const opcion = prompt(
      `¿A qué tarjeta de ${bancoDebito.distintivo} quieres pagar desde "${cuenta.nombre}"?\n\n${lista}\n\nEscribe el número:`,
      "1"
    );
    if (opcion === null) return;
    const idx = parseInt(opcion, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= tarjetasBanco.length) {
      alert("Opción no válida.");
      return;
    }
    tarjetaElegida = tarjetasBanco[idx];
  }

  // Preguntar el monto a pagar (total o parcial)
  const pendiente = saldoPendienteTarjeta(tarjetaElegida.id);
  const saldoCuenta = saldoDisponibleDebito(idDebito);
  const valor = prompt(
    `Pagar "${tarjetaElegida.nombre}" desde "${cuenta.nombre}"\n` +
    `Saldo por pagar: ${formatearDinero(pendiente)}\n` +
    `Dinero en la cuenta: ${formatearDinero(saldoCuenta)}\n\n` +
    `¿Cuánto quieres pagar?`,
    Math.min(pendiente, saldoCuenta).toFixed(2)
  );
  if (valor === null) return;
  let monto = parseFloat(valor);
  if (isNaN(monto) || monto <= 0) { alert("Ingresa un monto válido."); return; }
  if (monto > pendiente) monto = pendiente;

  // Validar fondos en la cuenta de débito
  if (monto > saldoCuenta) {
    alert(`No tienes suficiente dinero en "${cuenta.nombre}".\n` +
      `Dinero disponible: ${formatearDinero(saldoCuenta)}\n` +
      `Quieres pagar: ${formatearDinero(monto)}`);
    return;
  }

  aplicarPagoTarjeta(tarjetaElegida, monto, idDebito);
  guardar(STORAGE.pagos, totalPagosTarjetas);
  guardar(STORAGE.tarjetas, tarjetas);
  guardar(STORAGE.debitos, debitos);
  guardar(STORAGE.gastos, gastos);
  renderTodo();
}

// ===== Modal de transferencia =====
function abrirModalTransfer(idOrigen) {
  cuentaOrigenTransfer = idOrigen;
  const origen = debitos.find((d) => d.id === idOrigen);
  transferOrigen.textContent = "Desde: " + (origen ? origen.nombre : "");

  // Llenar cuentas destino (todas las de débito menos la de origen)
  transferDestino.innerHTML = "";
  const otras = debitos.filter((d) => d.id !== idOrigen);
  if (otras.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(No tienes otras cuentas)";
    transferDestino.appendChild(opt);
  } else {
    otras.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.nombre;
      transferDestino.appendChild(opt);
    });
  }

  transferTipo.value = "interna";
  actualizarCamposTransfer();
  transferMonto.value = "";
  transferConcepto.value = "";
  transferFecha.value = hoyISO();
  modalTransfer.hidden = false;
}

function cerrarModalTransfer() {
  modalTransfer.hidden = true;
  cuentaOrigenTransfer = null;
}

// Muestra el campo de cuenta destino o el de concepto según el tipo
function actualizarCamposTransfer() {
  const tipo = transferTipo.value;
  if (tipo === "interna" || tipo === "ahorro") {
    campoDestinoCuenta.hidden = false;
    campoConcepto.hidden = true;
    // Llenar el selector de destino según el tipo
    transferDestino.innerHTML = "";
    let opciones = [];
    if (tipo === "interna") {
      opciones = debitos
        .filter((d) => d.id !== cuentaOrigenTransfer)
        .map((d) => ({ value: d.id, texto: d.nombre }));
    } else {
      // ahorro: cuentas del Guardadito
      opciones = ahorros.map((a) => ({ value: a.id, texto: a.nombre }));
    }
    if (opciones.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = tipo === "interna" ? "(No tienes otras cuentas)" : "(No tienes cuentas de ahorro)";
      transferDestino.appendChild(opt);
    } else {
      opciones.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.texto;
        transferDestino.appendChild(opt);
      });
    }
  } else {
    // persona o retiro
    campoDestinoCuenta.hidden = true;
    campoConcepto.hidden = false;
  }
}

transferTipo.addEventListener("change", actualizarCamposTransfer);
btnCancelarTransfer.addEventListener("click", cerrarModalTransfer);
modalTransfer.addEventListener("click", (e) => {
  if (e.target === modalTransfer) cerrarModalTransfer();
});

formTransfer.addEventListener("submit", (e) => {
  e.preventDefault();
  const monto = parseFloat(transferMonto.value);
  if (isNaN(monto) || monto <= 0) { alert("Ingresa un monto válido."); return; }

  const tipo = transferTipo.value;
  const origen = debitos.find((d) => d.id === cuentaOrigenTransfer);
  const fecha = transferFecha.value;
  if (tipo === "interna") {
    const idDestino = transferDestino.value;
    if (!idDestino) { alert("No tienes otra cuenta destino."); return; }
    const destino = debitos.find((d) => d.id === idDestino);
    // Registro de SALIDA en la cuenta origen
    gastos.push({
      id: Date.now().toString(),
      descripcion: `🔄 Transferencia a ${destino.nombre}`,
      monto,
      categoria: "Otros",
      metodo: "debito:" + cuentaOrigenTransfer,
      fecha,
      esTransferencia: true,
      descuenta: false,     // movimiento interno, no descuenta de la quincena
    });
    // Registro de ENTRADA en la cuenta destino
    gastos.push({
      id: (Date.now() + 1).toString(),
      descripcion: `⬅️ Recibido de ${origen.nombre}`,
      monto,
      categoria: "Otros",
      metodo: "debito:" + idDestino,
      fecha,
      esTransferencia: true,
      esEntrada: true,      // dinero que llegó: no es gasto
      descuenta: false,
    });
    guardar(STORAGE.gastos, gastos);
    cerrarModalTransfer();
    renderTodo();
    return;
  }

  if (tipo === "ahorro") {
    const idAhorro = transferDestino.value;
    if (!idAhorro) { alert("No tienes cuentas de ahorro."); return; }
    // Validar fondos en la cuenta de débito origen
    const saldoOrigen = saldoDisponibleDebito(cuentaOrigenTransfer);
    if (monto > saldoOrigen) {
      alert(`No tienes suficiente en "${origen ? origen.nombre : "la cuenta"}".\n` +
        `Saldo disponible: ${formatearDinero(saldoOrigen)}`);
      return;
    }
    const cuentaAhorro = ahorros.find((a) => a.id === idAhorro);
    // Salida de la cuenta de débito. NO marca descuenta aquí para no duplicar:
    // el descuento de la quincena se aplica vía totalAportesAhorro.
    gastos.push({
      id: Date.now().toString(),
      descripcion: `🐷 A ahorro ${cuentaAhorro.nombre}`,
      monto, categoria: "Otros",
      metodo: "debito:" + cuentaOrigenTransfer,
      fecha, esTransferencia: true, descuenta: false,
    });
    // Sube el saldo de la cuenta de ahorro
    cuentaAhorro.saldo = Number(cuentaAhorro.saldo) + monto;
    // Cuenta como aporte al ahorro (esto descuenta de la quincena)
    totalAportesAhorro += monto;
    guardar(STORAGE.gastos, gastos);
    guardar(STORAGE.ahorros, ahorros);
    guardar(STORAGE.aportes, totalAportesAhorro);
    cerrarModalTransfer();
    renderTodo();
    return;
  }

  let descripcion = "";
  let descuenta = false;
  if (tipo === "persona") {
    const concepto = transferConcepto.value.trim() || "otra persona";
    descripcion = `➡️ Transferencia a ${concepto}`;
    descuenta = true;
    gastos.push({
      id: Date.now().toString(),
      descripcion, monto, categoria: "Otros",
      metodo: "debito:" + cuentaOrigenTransfer,
      fecha, esTransferencia: true, descuenta,
    });
  } else { // retiro: baja el débito, sube el efectivo, NO descuenta de la quincena
    const origenNombre = origen ? origen.nombre : "cuenta";
    const concepto = transferConcepto.value.trim();
    // Salida de la cuenta de débito (no descuenta: solo movió dinero a efectivo)
    gastos.push({
      id: Date.now().toString(),
      descripcion: "💸 Retiro a efectivo" + (concepto ? " · " + concepto : ""),
      monto, categoria: "Otros",
      metodo: "debito:" + cuentaOrigenTransfer,
      fecha, esTransferencia: true, descuenta: false,
    });
    // Entrada de efectivo (dinero que ahora tienes en la mano)
    gastos.push({
      id: (Date.now() + 1).toString(),
      descripcion: `💵 Retiro de ${origenNombre}`,
      monto, categoria: "Otros",
      metodo: "Efectivo",
      fecha, esEntrada: true, descuenta: false,
    });
  }

  guardar(STORAGE.gastos, gastos);
  cerrarModalTransfer();
  renderTodo();
});

// ===== Eventos: Crédito =====
formTarjeta.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = inputNombreTarjeta.value.trim();
  if (!nombre) return;
  tarjetas.push({ id: Date.now().toString(), nombre });
  guardar(STORAGE.tarjetas, tarjetas);
  renderTodo();
  formTarjeta.reset();
});

listaTarjetas.addEventListener("click", (e) => {
  const btnAgregar = e.target.closest(".add-credito");
  const btnPagar = e.target.closest(".pay");
  const btnEliminar = e.target.closest(".delete-credito");
  const btnBorrarGasto = e.target.closest(".cd-del");

  if (btnBorrarGasto) {
    gastos = gastos.filter((g) => g.id !== btnBorrarGasto.dataset.del);
    guardar(STORAGE.gastos, gastos);
    renderTodo();
    return;
  }
  if (btnAgregar) {
    inputMetodoPago.value = "credito:" + btnAgregar.dataset.id;
    document.querySelector('.tab[data-tab="gastos"]').click();
    window.scrollTo({ top: 0, behavior: "smooth" });
    inputDescripcion.focus();
  }
  if (btnPagar) {
    pagarTarjetaConMonto(btnPagar.dataset.id);
  }
  if (btnEliminar) {
    const id = btnEliminar.dataset.id;
    const t = tarjetas.find((x) => x.id === id);
    const pendiente = saldoPendienteTarjeta(id);
    let msg = `¿Eliminar la tarjeta "${t.nombre}"?`;
    if (pendiente > 0) msg += `\n\nTiene ${formatearDinero(pendiente)} sin pagar. Esos gastos NO se borran, quedarán sin tarjeta asignada.`;
    if (confirm(msg)) {
      tarjetas = tarjetas.filter((x) => x.id !== id);
      guardar(STORAGE.tarjetas, tarjetas);
      renderTodo();
    }
  }
});

// ===== Eventos: Guardadito =====
formAhorro.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = inputNombreAhorro.value.trim();
  const saldo = parseFloat(inputSaldoAhorro.value);
  const tasa = parseFloat(inputTasaAhorro.value);
  const tope = parseFloat(inputTopeAhorro.value) || 0;
  const tasaExcedente = parseFloat(inputTasaExcedenteAhorro.value) || 0;
  if (!nombre || isNaN(saldo) || saldo < 0 || isNaN(tasa) || tasa < 0) {
    alert("Completa todos los campos con valores válidos.");
    return;
  }
  ahorros.push({
    id: Date.now().toString(),
    nombre, saldo, tasa, tope, tasaExcedente,
    ultimaActualizacion: hoyISO(),
  });
  guardar(STORAGE.ahorros, ahorros);
  renderTodo();
  formAhorro.reset();
});

listaAhorro.addEventListener("click", (e) => {
  const btnTransfer = e.target.closest(".transfer-ahorro");
  const btnEditar = e.target.closest(".editar-ahorro");
  const btnEliminar = e.target.closest(".delete-ahorro");

  if (btnTransfer) {
    abrirModalTransferAhorro(btnTransfer.dataset.id);
    return;
  }

  if (btnEditar) {
    const a = ahorros.find((x) => x.id === btnEditar.dataset.id);
    const nuevoSaldo = prompt(`Nuevo saldo de "${a.nombre}":`, a.saldo);
    if (nuevoSaldo === null) return;
    const s = parseFloat(nuevoSaldo);
    if (isNaN(s) || s < 0) { alert("Saldo no válido."); return; }
    const nuevaTasa = prompt(`Rendimiento anual (%) de "${a.nombre}":`, a.tasa);
    if (nuevaTasa === null) return;
    const ta = parseFloat(nuevaTasa);
    if (isNaN(ta) || ta < 0) { alert("Tasa no válida."); return; }
    const nuevoTope = prompt(`Tope que genera rendimiento de "${a.nombre}"\n(0 = sin tope):`, a.tope || 0);
    if (nuevoTope === null) return;
    const tp = parseFloat(nuevoTope);
    if (isNaN(tp) || tp < 0) { alert("Tope no válido."); return; }
    const nuevaTasaExc = prompt(`Rendimiento anual sobre el excedente (%) de "${a.nombre}"\n(dinero que pasa del tope):`, a.tasaExcedente || 0);
    if (nuevaTasaExc === null) return;
    const te = parseFloat(nuevaTasaExc);
    if (isNaN(te) || te < 0) { alert("Tasa no válida."); return; }
    // Editar el saldo manualmente NO descuenta de la quincena (es una corrección, no un aporte).
    a.saldo = s;
    a.tasa = ta;
    a.tope = tp;
    a.tasaExcedente = te;
    a.ultimaActualizacion = hoyISO();
    guardar(STORAGE.ahorros, ahorros);
    renderTodo();
  }

  if (btnEliminar) {
    const a = ahorros.find((x) => x.id === btnEliminar.dataset.id);
    if (confirm(`¿Eliminar la cuenta de ahorro "${a.nombre}"?`)) {
      ahorros = ahorros.filter((x) => x.id !== a.id);
      guardar(STORAGE.ahorros, ahorros);
      renderTodo();
    }
  }
});

// ===== Modal de transferencia de Guardadito =====
function abrirModalTransferAhorro(idOrigen) {
  cuentaAhorroOrigen = idOrigen;
  const origen = ahorros.find((a) => a.id === idOrigen);
  transferAhorroOrigen.textContent =
    `Desde: ${origen ? origen.nombre : ""} (${formatearDinero(origen ? origen.saldo : 0)})`;
  transferAhorroTipo.value = "debito";
  llenarDestinoTransferAhorro();
  transferAhorroMonto.value = "";
  transferAhorroConcepto.value = "";
  modalTransferAhorro.hidden = false;
}

function cerrarModalTransferAhorro() {
  modalTransferAhorro.hidden = true;
  cuentaAhorroOrigen = null;
}

// Llena el selector de destino según el tipo (débito u otra cuenta de ahorro)
function llenarDestinoTransferAhorro() {
  const tipo = transferAhorroTipo.value;
  // El concepto solo aplica al pasar a débito (sacar el dinero)
  campoConceptoAhorro.hidden = (tipo !== "debito");
  transferAhorroDestino.innerHTML = "";
  let opciones = [];
  if (tipo === "debito") {
    opciones = debitos.map((d) => ({ value: "debito:" + d.id, texto: d.nombre }));
  } else {
    // otras cuentas de ahorro, menos la de origen
    opciones = ahorros
      .filter((a) => a.id !== cuentaAhorroOrigen)
      .map((a) => ({ value: "ahorro:" + a.id, texto: a.nombre }));
  }
  if (opciones.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = tipo === "debito" ? "(No tienes cuentas de débito)" : "(No tienes otra cuenta de ahorro)";
    transferAhorroDestino.appendChild(opt);
  } else {
    opciones.forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.texto;
      transferAhorroDestino.appendChild(opt);
    });
  }
}

transferAhorroTipo.addEventListener("change", llenarDestinoTransferAhorro);
btnCancelarTransferAhorro.addEventListener("click", cerrarModalTransferAhorro);
modalTransferAhorro.addEventListener("click", (e) => {
  if (e.target === modalTransferAhorro) cerrarModalTransferAhorro();
});

formTransferAhorro.addEventListener("submit", (e) => {
  e.preventDefault();
  const origen = ahorros.find((a) => a.id === cuentaAhorroOrigen);
  if (!origen) return;

  const monto = parseFloat(transferAhorroMonto.value);
  if (isNaN(monto) || monto <= 0) { alert("Ingresa un monto válido."); return; }
  if (monto > Number(origen.saldo)) {
    alert(`No tienes suficiente en "${origen.nombre}".\nSaldo: ${formatearDinero(origen.saldo)}`);
    return;
  }

  const destinoValue = transferAhorroDestino.value;
  if (!destinoValue) { alert("Elige una cuenta destino."); return; }

  // Descontar del ahorro origen
  origen.saldo = Number(origen.saldo) - monto;

  if (destinoValue.startsWith("debito:")) {
    // A cuenta de débito: sube el saldo del débito y SUMA a la quincena.
    const idDeb = destinoValue.split(":")[1];
    const dest = debitos.find((d) => d.id === idDeb);
    dest.saldo = Number(dest.saldo || 0) + monto;
    // Reintegrar a la quincena: reducir los aportes acumulados (sube el disponible)
    totalAportesAhorro -= monto;
    // Concepto de por qué se saca el dinero
    const concepto = transferAhorroConcepto.value.trim();
    const desc = `⬅️ De ahorro ${origen.nombre}` + (concepto ? " · " + concepto : "");
    // Registrar una entrada en la cuenta de débito (dinero recibido)
    gastos.push({
      id: Date.now().toString(),
      descripcion: desc,
      monto, categoria: "Otros",
      metodo: "debito:" + idDeb,
      fecha: hoyISO(),
      esEntrada: true, descuenta: false,
    });
    guardar(STORAGE.aportes, totalAportesAhorro);
    guardar(STORAGE.gastos, gastos);
    guardar(STORAGE.debitos, debitos);
  } else {
    // A otra cuenta de ahorro: solo mover el dinero
    const idAh = destinoValue.split(":")[1];
    const dest = ahorros.find((a) => a.id === idAh);
    dest.saldo = Number(dest.saldo) + monto;
  }

  guardar(STORAGE.ahorros, ahorros);
  cerrarModalTransferAhorro();
  renderTodo();
});

// ===== Inicialización =====
function establecerFechaHoy() {
  inputFecha.value = hoyISO();
}

function renderTodo() {
  renderMetodosPago();
  renderGastos();
  renderEfectivo();
  renderDebito();
  renderTarjetas();
  renderAhorros();
  renderPresupuesto();
}

function init() {
  cargarDatos();
  aplicarRendimientos();
  establecerFechaHoy();
  renderTodo();
  ajustarTopPestanas();
}

// Ajusta la posición de las pestañas para que queden justo debajo de la barra
// de saldo (que está fija arriba), evitando que se encimen.
function ajustarTopPestanas() {
  const barra = document.querySelector(".budget-bar");
  const tabs = document.querySelector(".tabs");
  if (!barra || !tabs) return;
  const alto = barra.offsetHeight;
  tabs.style.top = alto + "px";
}

window.addEventListener("resize", ajustarTopPestanas);

init();
