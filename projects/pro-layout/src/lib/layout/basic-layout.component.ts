import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  HostListener,
  Input, OnChanges, OnDestroy,
  OnInit, Output, SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {GlobalFooterProps} from './global-footer.component';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {ContentWidth} from '../core/default-settings';
import {InputBoolean, InputNumber} from 'ng-zorro-antd/core/util';
import {MenuDataItem} from './base-menu.component';
import {urlToList} from '../utils/path-tools';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'pro-basic-layout',
  templateUrl: './basic-layout.component.html',
  // styleUrls: ['./style/entry.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'proBasicLayout',
  preserveWhitespaces: false
})
export class BasicLayoutComponent implements OnInit, OnChanges, OnDestroy {
  // side menu
  @Input() title: TemplateRef<void> | string = 'Ant Design Pro';   // layout 的 左上角 的 title
  @Input() logo: TemplateRef<void> | string; // layout 的 左上角 logo 的 url
  @Input() menuHeaderRender: TemplateRef<void>;
  @Output() onMenuHeaderClick = new EventEmitter<any>();

  @Input() mode = 'inline';

  // base menu
  @Input() layout = 'sidemenu'; // layout 的菜单模式,sidemenu：右侧导航，topmenu：顶部导航
  @Input() contentWidth: ContentWidth = 'Fluid'; // layout 的内容模式,Fluid：定宽 1200px，Fixed：自适应
  @Input() navTheme = 'dark'; // 导航的主题


  @Input() @InputBoolean() fixedHeader = false; // 是否固定 header 到顶部
  @Input() @InputBoolean() fixSiderbar = false; // 是否固定导航
  @Input() @InputBoolean() autoHideHeader = false; // 是否下滑时自动隐藏 header
  @Input() menu: any = {locale: true}; // 关于 menu 的配置，暂时只有 locale,locale 可以关闭 menu 的自带的全球化

  // @Input() iconfontUrl:string; // 使用 IconFont 的图标配置
  // @Input() locale: string; // 当前 layout 的语言设置,'zh-CN' | 'zh-TW' | 'en-US'
  // @Input() settings: any; // layout 的设置

  @Input() @InputNumber() siderWidth = 256; // 侧边菜单宽度
  @Input() @InputBoolean() collapsed; // 控制菜单的收起和展开
  @Output() onCollapse = new EventEmitter<boolean>(); // 菜单的折叠收起事件

  // header
  @Input() headerRender: TemplateRef<void>; // 自定义头的 render 方法
  @Input() rightContentRender: TemplateRef<void>; // 自定义头右部的 render 方法
  @Input() collapsedButtonRender: TemplateRef<boolean>;  // 自定义 collapsed button 的方法

  // footer
  @Input() footerRender: TemplateRef<void> | false;
  @Input() links: GlobalFooterProps['links'];
  @Input() copyright: TemplateRef<void>;

  // 是否禁用移动端模式，有的管理系统不需要移动端模式，此属性设置为true即可
  // @Input() @InputBoolean() disableMobile: boolean;

  // 多标签
  @Input() @InputBoolean() reuseTab: boolean = true;

  // wrapper
  @Input() menuData: MenuDataItem[];
  isMobile = false;
  selectedKey: string;
  openKeys: Array<string> = [];

  visible = true;
  ticking = false;
  oldScrollTop = 0;
  destroy$ = new Subject();

  constructor(private breakpointObserver: BreakpointObserver,
              private cdf: ChangeDetectorRef,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width: 599px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: BreakpointState) => {
        // if (!this.disableMobile) {
        if (state.matches) {
          this.isMobile = true;
        } else {
          this.isMobile = false;
        }
        this.cdf.markForCheck();
        // }
      });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.openKeys = urlToList(this.router.url);
      this.cdf.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.layout) {
      this.openKeys = urlToList(this.router.url);
      console.log('ngOnChanges');
    }
  }

  menuOpenChange(event: { status: boolean; item: MenuDataItem }) {
    if (event.status) {
      this.openKeys = urlToList(event.item.path);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  handScroll(): void {
    if (!this.autoHideHeader) {
      return;
    }
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (!this.ticking) {
      requestAnimationFrame(() => {
        if (this.oldScrollTop > scrollTop) {
          this.visible = true;
        } else if (scrollTop > 300 && this.visible) {
          this.visible = false;
        } else if (scrollTop < 300 && !this.visible) {
          this.visible = true;
        }
        this.oldScrollTop = scrollTop;
        this.ticking = false;
      });
    }
  }

  getPaddingLeft(): string | undefined {
    // If it is a fix menu, calculate padding, don't need padding in phone mode
    const hasLeftPadding = this.fixSiderbar && this.layout !== 'topmenu' && !this.isMobile;
    if (hasLeftPadding) {
      return (this.collapsed ? '80' : this.siderWidth) + 'px';
    }
    return undefined;
  }

  getHeadWidth() {
    if (this.isMobile || !this.fixedHeader || this.layout === 'topmenu') {
      return '100%';
    }
    return this.collapsed ? 'calc(100% - 80px)' : `calc(100% - ${this.siderWidth}px)`;
  }

  onDrawerClose(event: Event) {
    this.collapsed = !this.collapsed;
  }

  getContentPaddingTop() {
    if (this.fixedHeader && this.reuseTab) {
      return "110px";
    }
    if (!this.fixedHeader) {
      return '0px'
    } else {
      return ''
    }
  }
}
