import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { of } from 'rxjs';
import { IxFormControlHarness } from 'app/modules/ix-forms/interfaces/ix-form-control-harness.interface';
import { getErrorText } from 'app/modules/ix-forms/utils/harness.utils';

export interface IxFileInputHarnessFilters extends BaseHarnessFilters {
  label: string;
}

export class IxFileInputHarness extends ComponentHarness implements IxFormControlHarness {
  static hostSelector = 'ix-file-input';

  static with(options: IxFileInputHarnessFilters): HarnessPredicate<IxFileInputHarness> {
    return new HarnessPredicate(IxFileInputHarness, options)
      .addOption('label', options.label,
        (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label));
  }

  getInput = this.locatorFor('input');
  getErrorText = getErrorText;

  async getNativeInput(): Promise<HTMLInputElement> {
    const input = await this.getInput();
    return TestbedHarnessEnvironment.getNativeElement(input) as HTMLInputElement;
  }

  async getLabelText(): Promise<string> {
    const label = await this.locatorFor('label')();
    return label.text({ exclude: '.required' });
  }

  async getValue(): Promise<File[]> {
    // Not supported.
    return of([]).toPromise();
  }

  async setValue(files: File[]): Promise<void> {
    const nativeInput = await this.getNativeInput();

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: {
        files,
      },
      writable: true,
    });

    nativeInput.dispatchEvent(event);
  }

  async isDisabled(): Promise<boolean> {
    return (await this.getInput()).getProperty('disabled');
  }
}
