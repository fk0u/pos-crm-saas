import{r as e}from"./api-DoA2WkOh.js";var t=e=>`Rp ${new Intl.NumberFormat(`id-ID`).format(e)}`;async function n(n){try{let r=(await(await fetch(`/dashboard/recent`,{headers:{Accept:`application/json`,"X-CSRF-TOKEN":e()}})).json()).data??[];n&&r.length>0&&(n.innerHTML=r.map(e=>`
                <li class="px-6 py-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-slate-700">${e.invoice_number}</span>
                        <span class="text-sm font-bold text-blue-700">${t(e.grand_total)}</span>
                    </div>
                    <p class="text-xs text-slate-400">
                        ${e.outlet??`—`} · ${e.cashier??`—`} · ${e.customer??`—`} · ${e.payment_method.toUpperCase()}
                    </p>
                </li>`).join(``))}catch{}}function r(){if(!document.getElementById(`owner-dashboard-app`))return;let e=document.getElementById(`ticker-list`);e&&(document.getElementById(`btn-refresh-ticker`)?.addEventListener(`click`,()=>void n(e)),window.setInterval(()=>void n(e),1e4))}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,r):r();