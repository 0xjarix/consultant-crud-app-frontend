import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrl: './delete-confirm-dialog.component.scss'
})
export class DeleteConfirmDialogComponent {
  @Input() visible = false;
  @Input() targetName = '';
  @Input() deleting = false;
  @Input() errorMessage: string | null = null;

  @Output() cancelRequested = new EventEmitter<void>();
  @Output() deleteConfirmed = new EventEmitter<void>();

  requestCancel(): void {
    if (this.deleting) {
      return;
    }

    this.cancelRequested.emit();
  }

  requestDelete(): void {
    if (this.deleting) {
      return;
    }

    this.deleteConfirmed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestCancel();
    }
  }
}
