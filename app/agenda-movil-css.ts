// Estilos de la vista para celular (los usan /agenda y /agendamovil).
export const css = `
.ag-sw-fila{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:18px;font-size:.85rem;color:var(--soft)}
.ag-sw{position:relative;display:inline-grid;grid-template-columns:1fr 1fr;padding:3px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.05)}
.ag-sw::before{content:"";position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 3px);border-radius:999px;background:var(--gold);transition:transform .25s ease}
.ag-sw[data-v="cel"]::before{transform:translateX(100%)}
.ag-sw button{position:relative;z-index:1;font:inherit;font-size:.82rem;font-weight:700;padding:8px 14px;border:0;border-radius:999px;background:none;color:var(--soft);cursor:pointer;white-space:nowrap;transition:color .2s}
.ag-sw button.on{color:#1a1200}
.ag-aviso{display:flex;align-items:center;gap:10px;margin-top:22px;padding:10px 12px;border:1px solid var(--gold);border-radius:12px;background:rgba(255,194,60,.1);font-size:.85rem;line-height:1.35}
.ag-aviso span:nth-child(2){flex:1}
.ag-aviso-flecha{font-size:1.2rem;font-weight:800;color:var(--gold);animation:ag-rebote 1.2s ease-in-out infinite}
.ag-aviso button{font:inherit;background:none;border:0;color:var(--soft);cursor:pointer;padding:4px 6px}
@keyframes ag-rebote{0%,100%{transform:translateY(-2px)}50%{transform:translateY(3px)}}
.am-barra{position:sticky;top:64px;z-index:20;margin:22px -4px 0;padding:8px 4px;background:rgba(9,15,13,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);display:grid;gap:6px}
.am-vista{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.am-vista button{font:inherit;font-size:.74rem;font-weight:700;padding:8px 2px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--dim);cursor:pointer}
.am-vista button.on{color:var(--gold);border-color:var(--gold)}
.am-sala{margin-top:4px;font-size:.74rem;font-weight:700;color:var(--gold)}
.am-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.am-tabs button{font:inherit;font-size:.82rem;font-weight:700;padding:11px 4px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--soft);cursor:pointer}
.am-tabs button.on{background:var(--gold);border-color:var(--gold);color:#1a1200}
.am-head{margin:22px 0 12px;scroll-margin-top:190px}
.am-head h2{font-size:1.3rem;margin:0 0 2px}
.am-head small{color:var(--dim);font-size:.8rem}
.am-aviso{margin:8px 0 0;font-size:.8rem;color:var(--soft)}
.am-jornada{margin:14px 0 2px;font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}
.am-next{display:flex;margin-top:22px}
.am-next button{font:inherit;font-weight:700;font-size:.85rem;padding:10px 14px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--soft);cursor:pointer}
.am-list{display:grid;gap:8px}
.am-item{display:grid;grid-template-columns:62px 1fr;gap:10px;align-items:stretch}
.am-hora{font-variant-numeric:tabular-nums;font-size:.74rem;font-weight:700;color:var(--gold);line-height:1.35;padding-top:12px;text-align:right}
.am-card{border:1px solid var(--line);border-left-width:4px;border-radius:10px;padding:10px 12px;min-width:0}
.am-card .t{font-weight:600;font-size:.92rem;line-height:1.3;overflow-wrap:anywhere}
.am-card .p{color:var(--soft);font-size:.82rem;margin-top:3px}
.am-card .n{color:var(--dim);font-size:.76rem;margin-top:3px}
.am-tag{display:inline-block;font-size:.62rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:1px 7px;border-radius:999px;margin-right:6px;background:rgba(255,255,255,.08);vertical-align:1px}
.am-card.pend{border-style:dashed}
.am-card.pend .t{color:var(--dim);font-style:italic}
.am-card.suave .t{font-weight:500;font-size:.85rem;color:var(--soft)}
.am-legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:16px;font-size:.78rem;color:var(--soft)}
.am-legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:6px}
`;
