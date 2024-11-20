import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FirstKeyPipe],
  templateUrl: './registration.component.html',
  styles: ``
})
export class RegistrationComponent {
  form!: FormGroup; // Declare the form here
  isSubmitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder, // Make this private (it's a best practice)
    private service: AuthService,
    private toastr: ToastrService
  ) {
    // Initialize the form after the constructor has been called
    this.initializeForm();
  }

  // Validator function for password match
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  // Initialize the form
  initializeForm() {
    this.form = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)
      ]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  // Submit handler
  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      this.service.createUser(this.form.value)
        .subscribe({
          next: (res: any) => {
            if (res.succeeded) {
              this.form.reset();
              this.isSubmitted = false;
              this.toastr.success('New user created!', 'Registration Successful');
            }
          },
          error: err => {
            if (err.error.errors) {
              err.error.errors.forEach((x: any) => {
                switch (x.code) {
                  case 'DuplicateUserName':
                    this.toastr.error('Username is already taken.', 'Registration Failed');
                    break;
                  case 'DuplicateEmail':
                    this.toastr.error('Email is already taken.', 'Registration Failed');
                    break;
                  default:
                    this.toastr.error('Contact the developer', 'Registration Failed');
                    console.log(x);
                    break;
                }
              });
            } else {
              console.log('error:', err);
            }
          }
        });
    }
  }

  // Check for displayable error
  hasDisplayableError(controlName: string): Boolean {
    const control = this.form.get(controlName);
    return Boolean(control?.invalid) &&
      (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty));
  }
}
