/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { TabTemplateContext } from './interfaces';

import { Subject } from 'rxjs';

import { InputBoolean } from 'ng-zorro-antd/core/util';

import { ProTabLinkDirective, ProTabLinkTemplateDirective } from './tab-link.directive';
import { ProTabDirective } from './tab.directive';

/**
 * Used to provide a tab set to a tab without causing a circular dependency.
 */
export const PRO_TAB_SET = new InjectionToken<any>('PRO_TAB_SET');

@Component({
  selector: 'pro-tab',
  exportAs: 'proTab',
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #tabLinkTemplate>
      <ng-content select="[pro-tab-link]"></ng-content>
    </ng-template>
    <ng-template #contentTemplate><ng-content></ng-content></ng-template>
  `
})
export class ProTabComponent implements OnChanges, OnDestroy, OnInit {

  @Input() nzTitle: string | TemplateRef<TabTemplateContext> = '';
  @Input() @InputBoolean() nzClosable = false;
  @Input() nzCloseIcon: string | TemplateRef<any> = 'close';
  @Input() @InputBoolean() nzDisabled = false;
  @Input() @InputBoolean() nzForceRender = false;
  @Output() readonly nzSelect = new EventEmitter<void>();
  @Output() readonly nzDeselect = new EventEmitter<void>();
  @Output() readonly nzClick = new EventEmitter<void>();
  @Output() readonly nzContextmenu = new EventEmitter<MouseEvent>();

  /**
   * @deprecated Will be removed in 11.0.0
   * @breaking-change 11.0.0
   */
  @ViewChild('tabLinkTemplate', { static: true }) tabLinkTemplate!: TemplateRef<void>;
  @ContentChild(ProTabLinkTemplateDirective) ProTabLinkTemplateDirective!: ProTabLinkTemplateDirective;
  @ContentChild(ProTabDirective, { read: TemplateRef }) template: TemplateRef<void> | null = null;
  @ContentChild(ProTabLinkDirective) linkDirective!: ProTabLinkDirective;
  @ViewChild('contentTemplate', { static: true }) contentTemplate!: TemplateRef<any>;

  isActive: boolean = false;
  position: number | null = null;
  origin: number | null = null;
  readonly stateChanges = new Subject<void>();

  get content(): TemplateRef<any> {
    return this.template || this.contentTemplate;
  }

  get label(): string | TemplateRef<any> {
    return this.nzTitle || this.ProTabLinkTemplateDirective.templateRef || this.tabLinkTemplate;
  }

  constructor(@Inject(PRO_TAB_SET) public closestTabSet: any) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { nzTitle, nzDisabled, nzForceRender } = changes;
    if (nzTitle || nzDisabled || nzForceRender) {
      this.stateChanges.next();
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }

  ngOnInit(): void {}
}
