import Navigation from './main';

export function markdownJump(plugin: Navigation, key: number) {
  let line: number = store.headers[key].position.start.line;

  // const view = store.plugin.app.workspace.getActiveViewOfType(MarkdownView)
  const view = plugin.current_note;
  if (view) {
      view.setEphemeralState({ line });
      setTimeout(() => { view.setEphemeralState({ line }); }, 100);
  }
}

// import { MarkdownView } from 'obsidian';
// import Navigation from './main';

// export const TOP_MARGIN = 0.1;
// export const BOTTOM_MARGIN = 0.2;

// export let pathLength = 0;
// export let lastPathStart = 0;
// export let lastPathEnd = 0;
// export let tocItems;
// export let tocPath;

// export function drawPath() {
//   const view = this.app.workspace.getActiveViewOfType(MarkdownView) as MarkdownView;
//   if (!view) return;
//   tocPath = view.containerEl.querySelector('.navigation-toc path') as SVGPathElement;
//   tocItems = [].slice.call(view.containerEl.querySelectorAll('.navigation-toc li'));

//   let path = [];
//   let pathIndent = 0;

//   tocItems.forEach((item, i) => {
//     let x = item.offsetLeft - 5;
//     let y = item.offsetTop;
//     let height = item.offsetHeight;

//     if( i === 0 ) {
//       path.push( 'M', x, y, 'L', x, y + height );
//       item.pathStart = 0;
//     }
//     else {
//       // Draw an additional line when there's a change in
//       // indent levels
//       if( pathIndent !== x ) path.push( 'L', pathIndent, y );

//       path.push( 'L', x, y );
      
//       // Set the current path so that we can measure it
//       tocPath.setAttribute( 'd', path.join( ' ' ) );
//       item.pathStart = tocPath.getTotalLength() || 0;
      
//       path.push( 'L', x, y + height );
//     }
    

//     pathIndent = x;
    
//     tocPath.setAttribute( 'd', path.join(' '));
//     item.pathEnd = tocPath.getTotalLength();
//   });

//   pathLength = tocPath.getTotalLength();
//   sync();
// }

// export function sync() {
  
//   let windowHeight = window.innerHeight;
//   let pathStart = pathLength, pathEnd = 0;
//   let visibleItems = 0;
  
//   tocItems.forEach( function( item ) {
//     let targetBounds = item.target.getBoundingClientRect();
    
//     if( targetBounds.bottom > windowHeight * TOP_MARGIN && targetBounds.top < windowHeight * ( 1 - BOTTOM_MARGIN ) ) {
//       pathStart = Math.min( item.pathStart, pathStart );
//       pathEnd = Math.max( item.pathEnd, pathEnd );
      
//       visibleItems += 1;
      
//       item.listItem.classList.add( 'visible' );
//     }
//     else {
//       item.listItem.classList.remove( 'visible' );
//     }
    
//   } );
  
//   // Specify the visible path or hide the path altogether
//   // if there are no visible items
//   if( visibleItems > 0 && pathStart < pathEnd ) {
//     if( pathStart !== lastPathStart || pathEnd !== lastPathEnd ) {
//       tocPath.setAttribute( 'stroke-dashoffset', '1' );
//       tocPath.setAttribute( 'stroke-dasharray', '1, '+ pathStart +', '+ ( pathEnd - pathStart ) +', ' + pathLength );
//       tocPath.setAttribute( 'opacity', 1 );
//     }
//   }
//   else {
//     tocPath.setAttribute( 'opacity', 0 );
//   }
  
//   lastPathStart = pathStart;
//   lastPathEnd = pathEnd;

// }