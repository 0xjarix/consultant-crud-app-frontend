import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { normalizeApiError } from '../../core/api/api-error';
import { ConsultantApiService } from '../../core/api/consultant-api.service';
import { Consultant, CreateConsultantRequest } from '../../core/models/consultant.model';
import { ConsultantFormPanelComponent } from './consultant-form-panel.component';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';

type PanelMode = 'create' | 'edit';

@Component({
  selector: 'app-consultants-page',
  imports: [CommonModule, ConsultantFormPanelComponent, DeleteConfirmDialogComponent],
  templateUrl: './consultants-page.component.html',
  styleUrl: './consultants-page.component.scss'
})
export class ConsultantsPageComponent implements OnInit {
  private readonly api = inject(ConsultantApiService);

  readonly consultants = signal<Consultant[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  readonly pageError = signal<string | null>(null);
  readonly pageNotice = signal<string | null>(null);

  readonly panelVisible = signal(false);
  readonly panelMode = signal<PanelMode>('create');
  readonly activeConsultant = signal<Consultant | null>(null);

  readonly formServerMessage = signal<string | null>(null);
  readonly formServerFieldErrors = signal<Record<string, string> | null>(null);

  readonly deleteTarget = signal<Consultant | null>(null);
  readonly deleteError = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchConsultants();
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.deleteTarget() && !this.deleting()) {
      this.closeDeleteDialog();
      return;
    }

    if (this.panelVisible() && !this.saving()) {
      this.closePanel();
    }
  }

  trackByConsultantId(index: number, consultant: Consultant): number {
    return consultant.id;
  }

  openCreatePanel(): void {
    this.panelMode.set('create');
    this.activeConsultant.set(null);
    this.formServerMessage.set(null);
    this.formServerFieldErrors.set(null);
    this.panelVisible.set(true);
  }

  openEditPanel(consultant: Consultant): void {
    this.panelMode.set('edit');
    this.activeConsultant.set(consultant);
    this.formServerMessage.set(null);
    this.formServerFieldErrors.set(null);
    this.panelVisible.set(true);
  }

  closePanel(force = false): void {
    if (this.saving() && !force) {
      return;
    }

    this.panelVisible.set(false);
    this.activeConsultant.set(null);
    this.formServerMessage.set(null);
    this.formServerFieldErrors.set(null);
  }

  submitForm(payload: CreateConsultantRequest): void {
    if (this.saving()) {
      return;
    }

    const panelMode = this.panelMode();
    const consultantToUpdate = this.activeConsultant();

    if (panelMode === 'edit' && !consultantToUpdate) {
      this.formServerMessage.set('No consultant selected for update.');
      return;
    }

    this.saving.set(true);
    this.formServerMessage.set(null);
    this.formServerFieldErrors.set(null);

    const request$ =
      panelMode === 'create'
        ? this.api.create(payload)
        : this.api.update(consultantToUpdate!.id, payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          const actionMessage = panelMode === 'create' ? 'Consultant created successfully.' : 'Consultant updated successfully.';
          this.closePanel(true);
          this.fetchConsultants();
          this.setPageNotice(actionMessage);
        },
        error: (error: unknown) => {
          const normalizedError = normalizeApiError(error);
          this.formServerFieldErrors.set(normalizedError.fieldErrors);
          this.formServerMessage.set(normalizedError.fieldErrors ? null : normalizedError.message);
        }
      });
  }

  openDeleteDialog(consultant: Consultant): void {
    this.deleteTarget.set(consultant);
    this.deleteError.set(null);
  }

  closeDeleteDialog(force = false): void {
    if (this.deleting() && !force) {
      return;
    }

    this.deleteTarget.set(null);
    this.deleteError.set(null);
  }

  confirmDelete(): void {
    const consultantToDelete = this.deleteTarget();

    if (!consultantToDelete || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);

    this.api
      .delete(consultantToDelete.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.closeDeleteDialog(true);
          this.fetchConsultants();
          this.setPageNotice('Consultant deleted successfully.');
        },
        error: (error: unknown) => {
          this.deleteError.set(normalizeApiError(error).message);
        }
      });
  }

  private fetchConsultants(): void {
    this.loading.set(true);
    this.pageError.set(null);

    this.api
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (consultants) => {
          this.consultants.set(consultants);
        },
        error: (error: unknown) => {
          this.pageError.set(normalizeApiError(error).message);
        }
      });
  }

  private setPageNotice(message: string): void {
    this.pageNotice.set(message);

    setTimeout(() => {
      if (this.pageNotice() === message) {
        this.pageNotice.set(null);
      }
    }, 3500);
  }
}
