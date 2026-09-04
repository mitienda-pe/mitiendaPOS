<template>
  <div class="min-h-screen bg-white">
    <!-- Header: la app siempre a un clic -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <img src="@/assets/logo-mitiendapos-wb.svg" alt="MiTiendaPOS" class="h-8" />
        <nav class="flex items-center gap-2 sm:gap-3">
          <a href="#precios" class="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">
            Precios
          </a>
          <router-link
            to="/login"
            class="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            Administrador
          </router-link>
          <router-link
            to="/cashier-login"
            class="text-sm font-semibold rounded-lg px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Ingresar
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="bg-gray-800 text-white">
      <div class="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span class="inline-block text-xs font-bold tracking-widest text-primary-300 uppercase mb-4">
            Punto de venta · Web + Android nativo
          </span>
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            La caja hecha para vender en Perú.
          </h1>
          <p class="text-lg text-gray-300 leading-relaxed mb-8">
            Yape, Plin, tarjeta y efectivo desde un solo equipo. Facturación electrónica
            SUNAT, inventario sincronizado con tu tienda online y operación de caja completa.
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <a
              :href="demoUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Solicitar demo
            </a>
            <a href="#precios" class="inline-flex items-center gap-1 text-lg font-semibold text-white hover:text-primary-300 transition-colors">
              Ver precios <span aria-hidden="true">→</span>
            </a>
          </div>
          <p class="mt-6 text-sm text-gray-400">
            Sin compromiso · Onboarding asistido · Soporte local
          </p>
        </div>

        <div>
          <img
            src="/img/pos-banner.webp"
            alt="MiTienda POS en uso"
            class="w-full rounded-2xl shadow-2xl"
            width="640"
            height="480"
            fetchpriority="high"
          />
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="bg-gray-50 py-16 sm:py-20">
      <div class="max-w-6xl mx-auto px-4">
        <span class="inline-block text-xs font-bold tracking-widest text-primary-600 uppercase mb-4">
          Todo lo que incluye
        </span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Una caja completa, no solo un cobrador.
        </h2>
        <p class="text-lg text-gray-500 mb-10">Lo que un negocio real necesita el día a día.</p>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="f in features"
            :key="f.title"
            class="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div class="text-3xl mb-3" aria-hidden="true">{{ f.emoji }}</div>
            <h3 class="font-bold text-gray-900 mb-2 flex items-center flex-wrap gap-2">
              {{ f.title }}
              <span
                v-if="f.badge"
                class="text-[11px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 bg-primary-50 text-primary-700"
              >{{ f.badge }}</span>
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">{{ f.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Precios -->
    <section id="precios" class="py-16 sm:py-20 scroll-mt-16">
      <div class="max-w-6xl mx-auto px-4">
        <span class="inline-block text-xs font-bold tracking-widest text-primary-600 uppercase mb-4">
          Precios
        </span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Una caja al precio de una mensualidad.
        </h2>
        <p class="text-lg text-gray-500 mb-10 max-w-2xl">
          Elige cómo arrancar: solo el POS para tu local, o combínalo con tu tienda online
          y ahorra al sumar los dos canales en un mismo plan.
        </p>

        <div class="grid lg:grid-cols-12 gap-6 items-start">
          <!-- Combo -->
          <div class="lg:col-span-7 order-2 lg:order-1 rounded-2xl border-2 border-primary-500 bg-white p-8 relative">
            <div class="absolute -top-3 left-8 text-[11px] font-bold tracking-wide uppercase rounded-full px-3 py-1 bg-primary-600 text-white">
              Recomendado · Mejor valor
            </div>
            <h3 class="text-2xl font-extrabold text-gray-900">Plan Micro + POS</h3>
            <p class="text-gray-500 mt-1 mb-6">
              Tu tienda online <strong class="text-gray-700">y</strong> tu caja física en una sola mensualidad.
            </p>

            <div class="mb-6">
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-semibold text-gray-500">S/</span>
                <span class="text-5xl font-extrabold text-gray-900">79</span>
                <span class="text-sm text-gray-500">+ IGV</span>
                <span class="text-sm text-gray-400">/mes</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">S/ 49 Plan Micro + S/ 30 POS</p>
              <p class="text-sm text-primary-700 font-semibold mt-1">
                Ahorras S/ 19 al mes vs contratarlos por separado
              </p>
            </div>

            <ul class="space-y-3 mb-8">
              <li v-for="item in comboFeatures" :key="item" class="flex gap-3 text-gray-700">
                <span class="text-primary-600 font-bold shrink-0" aria-hidden="true">✓</span>
                <span v-html="item"></span>
              </li>
            </ul>

            <a
              :href="comboCtaUrl"
              target="_blank"
              rel="noopener"
              class="block text-center rounded-lg px-6 py-3 font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Contratar el combo
            </a>
            <p class="text-xs text-gray-500 text-center mt-3">
              14 días de prueba gratis · Sin tarjeta de crédito
            </p>
          </div>

          <!-- Solo -->
          <div class="lg:col-span-5 order-1 lg:order-2 rounded-2xl border border-gray-200 bg-white p-8">
            <h3 class="text-2xl font-extrabold text-gray-900">MiTienda POS solo</h3>
            <p class="text-gray-500 mt-1 mb-6">Solo la caja para tu local, sin tienda online.</p>

            <div class="mb-6">
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-semibold text-gray-500">S/</span>
                <span class="text-5xl font-extrabold text-gray-900">49</span>
                <span class="text-sm text-gray-500">+ IGV</span>
                <span class="text-sm text-gray-400">/mes</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Primera caja</p>
              <p class="text-sm text-gray-500">+ S/ 30 + IGV /mes por cada caja adicional</p>
            </div>

            <ul class="space-y-3 mb-8">
              <li v-for="item in soloFeatures" :key="item" class="flex gap-3 text-gray-700">
                <span class="text-primary-600 font-bold shrink-0" aria-hidden="true">✓</span>
                <span v-html="item"></span>
              </li>
            </ul>

            <a
              :href="soloCtaUrl"
              target="_blank"
              rel="noopener"
              class="block text-center rounded-lg px-6 py-3 font-semibold text-primary-700 border border-primary-600 hover:bg-primary-50 transition-colors"
            >
              Contratar POS solo
            </a>
            <p class="text-xs text-gray-500 text-center mt-3">
              Sumar la tienda online después cuesta solo S/ 30 más al mes
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="bg-gradient-to-br from-primary-800 to-primary-500 text-white py-16 sm:py-20">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          ¿Listo para una caja que entiende tu negocio?
        </h2>
        <p class="text-lg text-primary-50 leading-relaxed mb-8">
          Agenda una demo de 30 minutos. Te mostramos MiTienda POS funcionando con tu tipo
          de operación, tu hardware y tus métodos de pago — sin compromiso.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <a
            :href="demoUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-lg font-semibold text-primary-700 bg-white hover:bg-primary-50 transition-colors"
          >
            Solicitar demo por WhatsApp
          </a>
          <a :href="emailUrl" class="font-semibold underline underline-offset-4 hover:opacity-85">
            Escríbenos por correo
          </a>
        </div>
        <p class="text-sm text-primary-100 mt-6">
          Respuesta en menos de 24 horas hábiles · Atención en Perú
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-400 py-10">
      <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href="https://mitienda.pe" class="hover:text-white transition-colors">MiTienda</a>
          <a href="https://mitienda.pe/planes" class="hover:text-white transition-colors">Planes</a>
          <a href="https://mitienda.pe/terminos-y-condiciones" class="hover:text-white transition-colors">Términos</a>
          <a href="https://mitienda.pe/politicas-de-privacidad" class="hover:text-white transition-colors">Privacidad</a>
          <!-- Obligatorio en Perú para sitios con oferta comercial. -->
          <a href="https://mitienda.pe/libro-de-reclamaciones" class="hover:text-white transition-colors">
            Libro de Reclamaciones
          </a>
        </div>
        <p class="text-xs text-gray-500">MiTienda POS v{{ currentVersion }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAppVersion } from '../composables/useVersionCheck';

const { currentVersion } = useAppVersion();

const WHATSAPP = '51967797232';
const SUPPORT_EMAIL = 'soporte@mitienda.pe';

const wa = (message) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

const demoUrl = wa('Hola, quiero una demo de MiTienda POS');
const comboCtaUrl = wa('Hola, quiero contratar el combo Plan Micro + MiTienda POS por S/ 79 + IGV al mes');
const soloCtaUrl = wa('Hola, quiero contratar MiTienda POS solo, sin tienda online');
const emailUrl = `mailto:${SUPPORT_EMAIL}?${new URLSearchParams({
  subject: 'Demo de MiTienda POS',
  body: 'Hola, me interesa ver una demo de MiTienda POS. Mi negocio es...',
}).toString()}`;

const features = [
  { emoji: '🕒', title: 'Turno de caja obligatorio', description: 'Apertura, movimientos, cierre y arqueo. Trazabilidad por cajero.' },
  { emoji: '👥', title: 'Roles y permisos', description: 'Cajero, supervisor, administrador. PIN de supervisor para anular ventas o eliminar pagos.' },
  { emoji: '🔁', title: 'Notas de crédito', description: 'Devoluciones y anulaciones con la nota de crédito asociada al comprobante original.' },
  { emoji: '🏷️', title: 'Promociones', description: 'Crear, activar y aplicar promociones desde caja sin trucos manuales.' },
  { emoji: '📦', title: 'Inventario multi-sucursal', description: 'Stock por sucursal sincronizado con tu tienda online MiTienda.' },
  { emoji: '🛒', title: 'Catálogo unificado', description: 'Mismos productos en POS y tienda online — sin importar archivos ni cuadrar Excel.' },
  { emoji: '👤', title: 'Clientes', description: 'Base única de clientes, historial de compras, búsqueda por DNI o RUC.' },
  { emoji: '📊', title: 'Reportes de turno', description: 'Ventas, métodos de pago y rendimiento por turno. Exportable.', badge: 'Dashboard · Próximamente' },
  { emoji: '🖨️', title: 'Impresión térmica', description: 'Layout configurable, ancho de papel 58/80 mm, compatible con QZ Tray en Web.' },
  { emoji: '🏢', title: 'Integración NetSuite', description: 'Sucursales, usuarios, cuentas de caja, stock y totales. Para clientes con ERP.', badge: 'Plan Large' },
  { emoji: '🔐', title: 'Seguridad', description: 'Tokens con scope por sucursal, auditoría de operaciones y validaciones por rol.' },
  { emoji: '🌐', title: 'Listo para Perú', description: 'Moneda, impuestos y formato local configurados desde el primer día.' },
];

const comboFeatures = [
  '<strong>Tienda online MiTienda</strong> con dominio, pasarelas de pago y stock sincronizado',
  '<strong>MiTienda POS</strong> primera caja incluida (Android + Web)',
  'Hasta <strong>S/ 30,000/mes</strong> en ventas procesadas incluidas en el plan',
  'Catálogo, clientes e inventario <strong>unificados</strong> entre local y online',
  'Facturación electrónica SUNAT desde el mismo equipo',
  '<strong>S/ 30/mes + IGV</strong> por cada caja adicional',
];

const soloFeatures = [
  '<strong>POS Android y Web</strong> con turno de caja, roles y cierre',
  'Hasta <strong>S/ 30,000/mes</strong> en ventas procesadas incluidas en el plan',
  'Facturación electrónica SUNAT desde el mismo equipo',
  'Inventario multisucursal y catálogo propio',
  'Clientes, promociones y reportes de turno',
];
</script>
