import { Plugin, CachedMetadata, MarkdownView, MarkdownRenderer, App, Component, TFile, FileView } from 'obsidian';
import { NavigationSettingsTab, DEFAULT_SETTINGS, type NavigationSettings } from './settings';
import { navToc } from './navToc';
// import { store } from './store';
// import { drawPath, sync } from './uilts';
// import { DEFAULT_SETTINGS } from './settings';

export default class Navigation extends Plugin {
  settings: NavigationSettings;
  current_view: FileView;
  current_file: TFile | null;
  headings: CachedMetadata;

  pathLength = 0;
  lastPathStart = 0;
  lastPathEnd = 0;
  tocItems;
  tocPath;

  async onload() {
    console.log('Loading navigation plugin')

    await this.loadSettings();
    this.addSettingTab(new NavigationSettingsTab(this.app, this))

    // 这里是主函数
    // 获取当前的文件标题、根据组合成导航目录、插入页面
    let view = this.app.workspace.getActiveViewOfType(MarkdownView);
    this.drawPath = this.drawPath.bind(this);
    this.sync = this.sync.bind(this);

    if (this.current_view) {
      console.log('qweqwe')
      this.current_view.setEphemeralState({ line });
      setTimeout(() => { this.current_view.setEphemeralState({ line }); console.log('111111222222') }, 100);
    }

    // 动态获取当前文件的标题
    this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
      view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view && !view?.containerEl.querySelector('.navigation-toc')) {
        this.current_file = this.app.workspace.getActiveFile();
        this.current_view = this.app.workspace.getActiveFileView();
        if (!this.current_file || !this.current_view) return;
        this.headings = this.app.metadataCache.getFileCache(this.current_file)?.headings;
        
        console.log('headings');
        console.log(this.headings[0].position.start.line);
        let line = this.headings[0].position.start.line;

        if (!this.headings) return;
        const filterHeading = this.headings.filter(h => (h.level === 2 || h.level === 3));

        const navHeading = [];
        let index = -1;
        for (let i in filterHeading) {
          if (filterHeading[i].level === 2) {
            const newHeading = new navToc(filterHeading[i].heading, 2);
            navHeading.push(newHeading);
            index++;
          } else {
            if (index == -1) {
              console.log('index error');
              return;
            }
            const newChildHeading = { heading: filterHeading[i].heading, level: 3 };
            navHeading[index].children.push(newChildHeading);
          }
        }

        view.containerEl.appendChild(createNavigation(this.app, navHeading));

        // 添加监听器，监听页面滚动事件和窗口大小变化事件
        // window.addEventListener( 'resize', this.drawPath, false );
        // window.addEventListener( 'scroll', this.sync, false );
        this.registerDomEvent(window, 'resize', this.drawPath);
        this.registerDomEvent(activeDocument, 'scroll', this.sync);
        // activeDocument.addEventListener('scroll', this.sync, false);

        const tmp = view.containerEl.querySelector('.view-content');
        // tmp?.setAttribute('style', 'overflow-y: scroll;')
        tmp?.addEventListener('mousewheel', () => {
          console.log(123123);

          this.sync();
        })
        this.drawPath();
      }
    }))

    // 为标题添加定时器，定时为标题添加id，方便后续锚点跳转
    setInterval(() => {
      let heading = document.querySelectorAll('.workspace-leaf.mod-active .cm-header-2, .workspace-leaf.mod-active .cm-header-3');
      heading.forEach((h: HTMLElement) => {
        if (h.id) return;
        h.setAttribute('id', 'navId-' + h.innerText + h.offsetTop);
      })
    }, 1000);
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  drawPath() {
    console.log(1)
    // console.log(window.onresize)
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    this.tocPath = view.containerEl.querySelector('.navigation-toc path') as SVGPathElement;
    this.tocItems = [].slice.call(view.containerEl.querySelectorAll('.navigation-toc li'));

    // this.tocItems = this.tocItems.map( function( item ) {
    //   let target = document.getElementById( .getAttribute( 'href' ).slice( 1 ) );

    //   return {
    //     listItem: item,
    //     target: target
    //   };
    // });

    let path = [];
    let pathIndent = 0;
    this.tocItems.forEach((item, i) => {
      let x = item.offsetLeft - 5;
      let y = item.offsetTop;
      let height = item.offsetHeight;

      if (i === 0) {
        path.push('M', x, y, 'L', x, y + height);
        item.pathStart = 0;
      }
      else {
        // Draw an additional line when there's a change in
        // indent levels
        if (pathIndent !== x) path.push('L', pathIndent, y);

        path.push('L', x, y);

        // Set the current path so that we can measure it
        this.tocPath.setAttribute('d', path.join(' '));
        item.pathStart = this.tocPath.getTotalLength() || 0;

        path.push('L', x, y + height);
      }


      pathIndent = x;

      this.tocPath.setAttribute('d', path.join(' '));
      item.pathEnd = this.tocPath.getTotalLength();
    });
    // console.log(111)

    this.pathLength = this.tocPath.getTotalLength();
    this.sync();
  }

  sync(): void {
    let windowHeight = window.innerHeight;
    let pathStart = this.pathLength, pathEnd = 0;
    let visibleItems = 0;

    this.tocItems.forEach(function (item) {
      let targetBounds = item.getBoundingClientRect();

      if (targetBounds.bottom > windowHeight * DEFAULT_SETTINGS.TOP_MARGIN && targetBounds.top < windowHeight * (1 - DEFAULT_SETTINGS.BOTTOM_MARGIN)) {
        pathStart = Math.min(item.pathStart, pathStart);
        pathEnd = Math.max(item.pathEnd, pathEnd);

        visibleItems += 1;

        item.classList.add('visible');
      }
      else {
        item.classList.remove('visible');
      }

    });

    // Specify the visible path or hide the path altogether
    // if there are no visible items
    if (visibleItems > 0 && pathStart < pathEnd) {
      if (pathStart !== this.lastPathStart || pathEnd !== this.lastPathEnd) {
        this.tocPath.setAttribute('stroke-dashoffset', '1');
        this.tocPath.setAttribute('stroke-dasharray', '1, ' + pathStart + ', ' + (pathEnd - pathStart) + ', ' + this.pathLength);
        this.tocPath.setAttribute('opacity', 1);
      }
    }
    else {
      this.tocPath.setAttribute('opacity', 0);
    }

    this.lastPathStart = pathStart;
    this.lastPathEnd = pathEnd;

  }
}

function createNavigation(app: App, headings: navToc[]): HTMLElement {
  const nav = document.createElement('nav');
  nav.addClass('navigation-toc');
  const navToc = nav.createEl('ul');
  headings ? headings.forEach(h => {
    const l = navToc.appendChild(document.createElement('li'));
    // const a = l.appendChild(document.createElement('a'));
    // a.addClass('data-href=Navigation#' + h.heading)
    const component = new Component();
    // l.innerHTML = `<a data-href="Navigation#${h.heading}"></a>`;
    // const navHeading = l.appendChild(document.createElement('a'));
    MarkdownRenderer.render(app, h.heading, l, 'Navigation', component);
    component.load();
    if (h.children) {
      // l.appendChild(createChildNavigation(app, h.children));
      const navChild = l.createEl('ul');
      h.children.forEach(ch => {
        const cl = navChild.appendChild(document.createElement('li'));
        const component = new Component();
        MarkdownRenderer.render(app, ch.heading, cl, 'Navigation', component);
        component.load();
      })
    }
  }) : null;
  // 创建SVG元素
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "toc-marker");
  svg.setAttribute("width", "200");
  svg.setAttribute("height", "200");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // 创建path元素
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("stroke", "#444");
  path.setAttribute("stroke-width", "3");
  path.setAttribute("fill", "transparent");
  path.setAttribute("stroke-dasharray", "0, 0, 0, 1000");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("transform", "translate(-0.5, -0.5)");

  // 将path元素添加到svg元素中
  svg.appendChild(path);

  // 将svg元素添加到文档中的某个位置，例如body
  nav.appendChild(svg);

  return nav;
}

export function markdownJump(plugin: Navigation, key: number) {
    let line: number = store.headers[key].position.start.line;

    // const view = store.plugin.app.workspace.getActiveViewOfType(MarkdownView)
    const view = plugin.current_note;
    if (view) {
        view.setEphemeralState({ line });
        setTimeout(() => { view.setEphemeralState({ line }); }, 100);
    }
}