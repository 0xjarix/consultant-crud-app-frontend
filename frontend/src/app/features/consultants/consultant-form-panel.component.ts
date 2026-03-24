import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Consultant, CreateConsultantRequest } from '../../core/models/consultant.model';

type PanelMode = 'create' | 'edit';

type ConsultantFormField = keyof CreateConsultantRequest;

@Component({
  selector: 'app-consultant-form-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consultant-form-panel.component.html',
  styleUrl: './consultant-form-panel.component.scss'
})
export class ConsultantFormPanelComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() mode: PanelMode = 'create';
  @Input() consultant: Consultant | null = null;
  @Input() saving = false;
  @Input() serverMessage: string | null = null;
  @Input() serverFieldErrors: Record<string, string> | null = null;

  @Output() closeRequested = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateConsultantRequest>();

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    expertise: ['', Validators.required],
    age: [18, [Validators.required, Validators.min(18)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultant'] || changes['mode'] || (changes['visible'] && this.visible)) {
      this.resetForm();
    }

    if (changes['serverFieldErrors']) {
      this.applyServerErrors();
    }
  }

  close(): void {
    if (this.saving) {
      return;
    }

    this.closeRequested.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  submit(): void {
    this.clearAllServerErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitted.emit({
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim(),
      expertise: value.expertise.trim(),
      age: Number(value.age)
    });
  }

  clearFieldServerError(field: ConsultantFormField): void {
    const control = this.form.controls[field];
    const existing = control.errors;

    if (!existing || !existing['server']) {
      return;
    }

    const { server, ...remaining } = existing;
    void server;

    control.setErrors(Object.keys(remaining).length > 0 ? remaining : null);
  }

  getFieldError(field: ConsultantFormField): string | null {
    const control = this.form.controls[field];

    if (!control || (!control.touched && !control.dirty)) {
      return null;
    }

    if (control.hasError('server')) {
      return String(control.getError('server'));
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address.';
    }

    if (control.hasError('min')) {
      return 'Age must be at least 18.';
    }

    return null;
  }

  private resetForm(): void {
    this.clearAllServerErrors();

    if (this.mode === 'edit' && this.consultant) {
      this.form.reset({
        firstName: this.consultant.firstName,
        lastName: this.consultant.lastName,
        email: this.consultant.email,
        expertise: this.consultant.expertise,
        age: this.consultant.age
      });
    } else {
      this.form.reset({
        firstName: '',
        lastName: '',
        email: '',
        expertise: '',
        age: 18
      });
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private applyServerErrors(): void {
    this.clearAllServerErrors();

    if (!this.serverFieldErrors) {
      return;
    }

    for (const [field, message] of Object.entries(this.serverFieldErrors)) {
      const control = this.form.get(field);

      if (!control || typeof message !== 'string' || message.trim().length === 0) {
        continue;
      }

      control.setErrors({ ...(control.errors ?? {}), server: message });
      control.markAsTouched();
    }
  }

  private clearAllServerErrors(): void {
    const fields: ConsultantFormField[] = ['firstName', 'lastName', 'email', 'expertise', 'age'];

    for (const field of fields) {
      this.clearFieldServerError(field);
    }
  }
}
