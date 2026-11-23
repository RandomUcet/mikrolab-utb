import type {CalcProblem} from './calculations.js';
export function demandShiftEquilibrium(m:{a:number;b:number;c:number;d:number},deltaDemand=0){
 const price=(m.a+deltaDemand-m.c)/(m.b+m.d);
 return {price,quantity:m.a+deltaDemand-m.b*price};
}
export function marketProblemSvg(problem:CalcProblem,deltaDemand=0):string{
 if(!problem.market)return '';
 const m=problem.market;
 const base=demandShiftEquilibrium(m),shifted=demandShiftEquilibrium(m,deltaDemand);
 const maxQ=Math.max(80,Math.ceil(Math.max(m.a,base.quantity*1.6,shifted.quantity*1.6)/10)*10);
 const maxP=Math.max(40,Math.ceil(Math.max(m.a/m.b,(maxQ-m.c)/m.d,base.price*1.5,shifted.price*1.5)/10)*10);
 const left=68,top=30,w=540,h=280;
 const X=(q:number)=>left+q/maxQ*w,Y=(p:number)=>top+h-p/maxP*h;
 const demand=[[0,(m.a+deltaDemand)/m.b],[maxQ,(m.a+deltaDemand-maxQ)/m.b]].map(([q,p])=>X(q)+','+Y(p)).join(' ');
 const supply=[[0,-m.c/m.d],[maxQ,(maxQ-m.c)/m.d]].map(([q,p])=>X(q)+','+Y(p)).join(' ');
 const fmt=(v:number)=>Number(v.toFixed(2)).toLocaleString('cs-CZ',{maximumFractionDigits:2});
 return '<svg class="worked-market-svg" viewBox="0 0 660 360" role="img" aria-label="Model trhu z aktuální úlohy, rovnovážná cena '+fmt(shifted.price)+' a množství '+fmt(shifted.quantity)+'">'+
 '<defs><clipPath id="math-plot-clip"><rect x="'+left+'" y="'+top+'" width="'+w+'" height="'+h+'"/></clipPath></defs>'+
 '<path d="M'+left+' '+top+'V'+(top+h)+'H'+(left+w)+'" stroke="currentColor" fill="none" stroke-width="2" opacity=".65"/>'+
 '<g fill="currentColor" font-size="12"><text x="'+left+'" y="20">Cena P</text><text x="'+(left+w-85)+'" y="345">Množství Q</text></g>'+
 '<g clip-path="url(#math-plot-clip)"><polyline points="'+supply+'" stroke="#229266" stroke-width="4" fill="none"/><polyline points="'+demand+'" stroke="#d76e5e" stroke-width="4" fill="none"/>'+
 '<circle cx="'+X(shifted.quantity)+'" cy="'+Y(shifted.price)+'" r="6" fill="#163f36" stroke="white" stroke-width="2"/>'+
 '<path d="M'+X(shifted.quantity)+' '+Y(shifted.price)+'V'+(top+h)+' M'+left+' '+Y(shifted.price)+'H'+X(shifted.quantity)+'" stroke="currentColor" opacity=".25" stroke-dasharray="5 5"/></g>'+
 '<g fill="currentColor" font-size="13"><text x="'+(left+9)+'" y="'+(top+22)+'">D: červeně</text><text x="'+(left+110)+'" y="'+(top+22)+'">S: zeleně</text></g></svg>';
}
export function laborProblemSvg(problem:CalcProblem,deltaMpl=0):string{
 if(!problem.labor)return '';
 const {mpl,price,wage}=problem.labor,mrpl=(mpl+deltaMpl)*price,max=Math.max(mrpl,wage,100)*1.15;
 const w1=Math.max(0,mrpl/max*510),w2=Math.max(0,wage/max*510);
 return '<svg class="worked-market-svg" viewBox="0 0 660 206" role="img" aria-label="Porovnání dodatečného příjmu '+mrpl+' korun s nákladem '+wage+' korun">'+
 '<g fill="currentColor" font-size="14"><text x="24" y="34">MRPL – dodatečný příjem</text><text x="24" y="112">Mzdový náklad</text></g>'+
 '<rect x="24" y="45" width="510" height="31" rx="6" fill="currentColor" opacity=".09"/><rect x="24" y="45" width="'+w1+'" height="31" rx="6" fill="#28966a"/><text x="550" y="67" fill="currentColor" font-size="16" font-weight="700">'+mrpl+' Kč</text>'+
 '<rect x="24" y="124" width="510" height="31" rx="6" fill="currentColor" opacity=".09"/><rect x="24" y="124" width="'+w2+'" height="31" rx="6" fill="#d47765"/><text x="550" y="146" fill="currentColor" font-size="16" font-weight="700">'+wage+' Kč</text>'+
 '<text x="24" y="188" fill="currentColor" font-size="12">Stejné časové období, ostatní podmínky nezměněné.</text></svg>';
}
