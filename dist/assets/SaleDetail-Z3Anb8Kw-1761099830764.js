import{g as _,y as V,c as r,b,f as z,d as a,h as C,t as o,E as N,H as I,j as v,n as T,F as $,r as j,I as G,a as R,o as l}from"./index-B9kELMXP-1761099830764.js";import{o as B}from"./ordersApi-BEdSx5Uw-1761099830764.js";const H={class:"min-h-screen bg-gray-50"},q={key:0,class:"flex items-center justify-center min-h-screen"},L={key:1,class:"flex items-center justify-center min-h-screen"},W={class:"text-center max-w-md"},J={class:"text-gray-600 mb-4"},U={key:2,class:"max-w-2xl mx-auto py-8 px-4"},K={class:"mb-6 flex items-center justify-between"},Y={class:"bg-white shadow-lg rounded-lg overflow-hidden border-2 border-gray-200"},Q={class:"p-8"},X={class:"text-center mb-6 pb-6 border-b-2 border-dashed border-gray-300"},Z={class:"text-lg font-semibold text-gray-700"},ee={class:"text-sm text-gray-500 mt-2"},te={class:"mb-6 pb-6 border-b-2 border-dashed border-gray-300"},ae={class:"space-y-1"},se={class:"text-gray-900"},oe={key:0,class:"text-gray-900"},re={key:1,class:"text-gray-900"},le={key:2,class:"text-gray-900"},ne={class:"mt-3 flex items-center gap-4"},ie={class:"mb-6 pb-6 border-b-2 border-dashed border-gray-300"},de={class:"space-y-3"},ce={class:"flex-1"},ue={class:"font-medium text-gray-900"},pe={class:"text-sm text-gray-600"},me={class:"font-semibold text-gray-900"},ve={key:1,class:"text-center py-4 text-gray-500"},be={key:0,class:"mb-6 pb-6 border-b-2 border-dashed border-gray-300"},ge={class:"space-y-2"},xe={class:"text-gray-700"},ye={class:"font-medium text-gray-900"},_e={class:"space-y-2"},fe={class:"flex justify-between text-gray-700"},he={class:"font-medium"},we={class:"flex justify-between text-gray-700"},ke={class:"font-medium"},De={class:"flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300"},Ce={class:"text-blue-600"},Ne={class:"mt-6"},Te={key:0,class:"mt-2 bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs"},Me={__name:"SaleDetail",setup($e){const E=G();R();const s=_(null),f=_(!1),g=_(null),x=_(!1),M=async()=>{f.value=!0,g.value=null;try{const t=E.params.id,e=await B.getOrder(t);if(console.log("Order Detail Response:",e),e){let m="Cliente General",n="",p="";if(e.tiendaventa_nombres||e.tiendaventa_apellidos)m=`${e.tiendaventa_nombres||""} ${e.tiendaventa_apellidos||""}`.trim(),n=e.tiendaventa_correoelectronico||"",p=e.tiendaventa_telefono||"";else if(e.billing_info){const u=e.billing_info;m=`${u.name||""} ${u.last_name||""}`.trim()||"Cliente General",n=u.email||"",p=u.phone_number||""}s.value={id:parseInt(e.tiendaventa_id||t),order_number:e.tiendaventa_codigoreferencia||e.code||t,customer:{name:m,email:n,phone:p},cajero_nombre:e.cajero_nombre||null,total:parseFloat(e.tiendaventa_totalpagar||e.total_amount||"0"),status:e.tiendaventa_pagado||e.status,source:e.tiendaventa_origen||"web",created_at:e.tiendaventa_fecha||e.date_created,_rawDetail:e}}else g.value="No se encontró la venta"}catch(t){console.error("Error loading order:",t),g.value=t.message||"Error al cargar el detalle de la venta"}finally{f.value=!1}},w=t=>t?new Date(t).toLocaleString("es-PE",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"-",i=t=>isNaN(t)||t===null||t===void 0?"S/ 0.00":new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(t),P=t=>({0:"Rechazado",1:"Aprobado",2:"Pendiente",9:"Creado"})[t]||"Desconocido",S=t=>({0:"bg-red-100 text-red-800",1:"bg-green-100 text-green-800",2:"bg-yellow-100 text-yellow-800",9:"bg-gray-100 text-gray-800"})[t]||"bg-gray-100 text-gray-800",A=t=>({pos:"POS",web:"Web",api:"API"})[t]||t||"Web",O=t=>({pos:"bg-purple-100 text-purple-800",web:"bg-blue-100 text-blue-800",api:"bg-indigo-100 text-indigo-800"})[t]||"bg-blue-100 text-blue-800",h=()=>!s.value||!s.value._rawDetail?[]:s.value._rawDetail.order_items&&Array.isArray(s.value._rawDetail.order_items)?s.value._rawDetail.order_items.map(t=>({id:t.id,name:t.tittle||t.name||"Producto",quantity:t.quantity||1,price:parseFloat(t.price||0),total:parseFloat(t.total||0)})):s.value._rawDetail.products&&Array.isArray(s.value._rawDetail.products)?s.value._rawDetail.products.map(t=>({id:t.id,name:t.name||t.producto_nombre||"Producto",quantity:t.quantity||t.cantidad||1,price:parseFloat(t.price||t.precio||0),total:parseFloat(t.total||(t.quantity||t.cantidad)*(t.price||t.precio)||0)})):[],k=()=>{var e;return s.value?(e=s.value._rawDetail)!=null&&e.subtotal?parseFloat(s.value._rawDetail.subtotal):y()/1.18:0},D=()=>{var e;if(!s.value)return 0;if((e=s.value._rawDetail)!=null&&e.tax)return parseFloat(s.value._rawDetail.tax);const t=y();return t-t/1.18},y=()=>{var t;return s.value?(t=s.value._rawDetail)!=null&&t.total_amount?parseFloat(s.value._rawDetail.total_amount):s.value.total?parseFloat(s.value.total):0:0},F=()=>{var p,u;const t=h(),e=((p=s.value._rawDetail)==null?void 0:p.payments)||[],m=`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket de Venta #${s.value.order_number}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          margin: 0;
          padding: 10px;
          width: 80mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 5px 0; }
        .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 14px; font-weight: bold; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="center bold">TICKET DE VENTA</div>
      <div class="center">Nro: ${s.value.order_number}</div>
      <div class="line"></div>
      <div>Fecha: ${w(s.value.created_at)}</div>
      <div>Cliente: ${((u=s.value.customer)==null?void 0:u.name)||"Cliente General"}</div>
      <div class="line"></div>
      <div class="bold">PRODUCTOS</div>
      <div class="line"></div>
      ${t.map(d=>`
        <div>
          ${d.name}
          <table>
            <tr>
              <td>${d.quantity} x ${i(d.price)}</td>
              <td class="right">${i(d.total)}</td>
            </tr>
          </table>
        </div>
      `).join("")}
      <div class="line"></div>
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="right">${i(k())}</td>
        </tr>
        <tr>
          <td>IGV (18%):</td>
          <td class="right">${i(D())}</td>
        </tr>
        <tr class="total">
          <td>TOTAL:</td>
          <td class="right">${i(y())}</td>
        </tr>
      </table>
      ${e.length>0?`
        <div class="line"></div>
        <div class="bold">PAGOS</div>
        ${e.map(d=>`
          <div class="item-row">
            <span>${d.method_name||d.metodo}</span>
            <span>${i(d.amount||d.monto)}</span>
          </div>
        `).join("")}
      `:""}
      <div class="line"></div>
      <div class="center">¡Gracias por su compra!</div>
      <div class="center" style="margin-top: 10px; font-size: 10px;">REIMPRESIÓN</div>
    </body>
    </html>
  `,n=window.open("","_blank","width=300,height=600");n.document.write(m),n.document.close(),n.onload=()=>{n.focus(),n.print(),setTimeout(()=>n.close(),1e3)}};return V(()=>{M()}),(t,e)=>{var n,p,u,d;const m=I("router-link");return l(),r("div",H,[f.value?(l(),r("div",q,e[1]||(e[1]=[z('<div class="text-center"><svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p class="text-gray-600">Cargando detalle de venta...</p></div>',1)]))):g.value?(l(),r("div",L,[a("div",W,[e[3]||(e[3]=a("svg",{class:"h-16 w-16 text-red-500 mx-auto mb-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[a("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})],-1)),e[4]||(e[4]=a("h2",{class:"text-xl font-semibold text-gray-900 mb-2"},"Error al cargar la venta",-1)),a("p",J,o(g.value),1),C(m,{to:"/sales",class:"inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"},{default:N(()=>e[2]||(e[2]=[v(" Volver al Historial ")])),_:1})])])):s.value?(l(),r("div",U,[a("div",K,[C(m,{to:"/sales",class:"inline-flex items-center text-gray-600 hover:text-gray-900"},{default:N(()=>e[5]||(e[5]=[a("svg",{class:"h-5 w-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[a("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M10 19l-7-7m0 0l7-7m-7 7h18"})],-1),v(" Volver al Historial ")])),_:1}),a("button",{onClick:F,class:"inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"},e[6]||(e[6]=[a("svg",{class:"h-5 w-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[a("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})],-1),v(" Reimprimir ")]))]),a("div",Y,[a("div",Q,[a("div",X,[e[7]||(e[7]=a("h1",{class:"text-2xl font-bold text-gray-900 mb-2"},"COMPROBANTE DE VENTA",-1)),a("p",Z,"Nro: "+o(s.value.order_number),1),a("p",ee,o(w(s.value.created_at)),1)]),a("div",te,[e[12]||(e[12]=a("h2",{class:"text-sm font-semibold text-gray-600 uppercase mb-3"},"Datos del Cliente",-1)),a("div",ae,[a("p",se,[e[8]||(e[8]=a("span",{class:"font-medium"},"Nombre:",-1)),v(" "+o(((n=s.value.customer)==null?void 0:n.name)||"Cliente General"),1)]),(p=s.value.customer)!=null&&p.email?(l(),r("p",oe,[e[9]||(e[9]=a("span",{class:"font-medium"},"Email:",-1)),v(" "+o(s.value.customer.email),1)])):b("",!0),(u=s.value.customer)!=null&&u.phone?(l(),r("p",re,[e[10]||(e[10]=a("span",{class:"font-medium"},"Teléfono:",-1)),v(" "+o(s.value.customer.phone),1)])):b("",!0),s.value.cajero_nombre?(l(),r("p",le,[e[11]||(e[11]=a("span",{class:"font-medium"},"Atendido por:",-1)),v(" "+o(s.value.cajero_nombre),1)])):b("",!0)]),a("div",ne,[a("span",{class:T([S(s.value.status),"px-3 py-1 text-xs font-semibold rounded-full"])},o(P(s.value.status)),3),a("span",{class:T([O(s.value.source),"px-3 py-1 text-xs font-semibold rounded-full"])},o(A(s.value.source)),3)])]),a("div",ie,[e[13]||(e[13]=a("h2",{class:"text-sm font-semibold text-gray-600 uppercase mb-3"},"Productos",-1)),a("div",de,[h().length>0?(l(!0),r($,{key:0},j(h(),c=>(l(),r("div",{key:c.id,class:"flex justify-between items-start"},[a("div",ce,[a("p",ue,o(c.name),1),a("p",pe,o(c.quantity)+" x "+o(i(c.price)),1)]),a("p",me,o(i(c.total)),1)]))),128)):(l(),r("div",ve," No hay información de productos disponible "))])]),(d=s.value._rawDetail)!=null&&d.payments&&s.value._rawDetail.payments.length>0?(l(),r("div",be,[e[14]||(e[14]=a("h2",{class:"text-sm font-semibold text-gray-600 uppercase mb-3"},"Métodos de Pago",-1)),a("div",ge,[(l(!0),r($,null,j(s.value._rawDetail.payments,c=>(l(),r("div",{key:c.id,class:"flex justify-between items-center"},[a("span",xe,o(c.method_name||c.metodo),1),a("span",ye,o(i(c.amount||c.monto)),1)]))),128))])])):b("",!0),a("div",_e,[a("div",fe,[e[15]||(e[15]=a("span",null,"Subtotal:",-1)),a("span",he,o(i(k())),1)]),a("div",we,[e[16]||(e[16]=a("span",null,"IGV (18%):",-1)),a("span",ke,o(i(D())),1)]),a("div",De,[e[17]||(e[17]=a("span",null,"TOTAL:",-1)),a("span",Ce,o(i(y())),1)])]),e[18]||(e[18]=a("div",{class:"mt-8 pt-6 border-t-2 border-dashed border-gray-300 text-center"},[a("p",{class:"text-gray-600"},"¡Gracias por su compra!")],-1))])]),a("div",Ne,[a("button",{onClick:e[0]||(e[0]=c=>x.value=!x.value),class:"text-sm text-gray-500 hover:text-gray-700"},o(x.value?"Ocultar":"Mostrar")+" datos técnicos (JSON) ",1),x.value?(l(),r("pre",Te,o(JSON.stringify(s.value,null,2)),1)):b("",!0)])])):b("",!0)])}}};export{Me as default};
