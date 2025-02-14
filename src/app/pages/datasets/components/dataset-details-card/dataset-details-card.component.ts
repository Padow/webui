import {
  ChangeDetectionStrategy, Component, Input,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { DatasetType } from 'app/enums/dataset.enum';
import { OnOff } from 'app/enums/on-off.enum';
import { ZfsPropertySource } from 'app/enums/zfs-property-source.enum';
import { DatasetDetails } from 'app/interfaces/dataset.interface';
import { DatasetFormComponent } from 'app/pages/datasets/components/dataset-form/dataset-form.component';
import { DeleteDatasetDialogComponent } from 'app/pages/datasets/components/delete-dataset-dialog/delete-dataset-dialog.component';
import { DatasetTreeStore } from 'app/pages/datasets/store/dataset-store.service';
import { ModalService } from 'app/services/modal.service';

@UntilDestroy()
@Component({
  selector: 'ix-dataset-details-card',
  templateUrl: './dataset-details-card.component.html',
  styleUrls: ['./dataset-details-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetDetailsCardComponent {
  @Input() dataset: DatasetDetails;
  @Input() isLoading: boolean;
  OnOff = OnOff;

  constructor(
    private modalService: ModalService,
    private translate: TranslateService,
    private mdDialog: MatDialog,
    private datasetStore: DatasetTreeStore,
  ) { }

  get datasetCompression(): string {
    return this.dataset?.compression?.source === ZfsPropertySource.Inherited
      ? 'Inherit (' + this.dataset.compression?.value + ')'
      : this.dataset.compression?.value;
  }

  get datasetSpace(): string {
    return (this.dataset.quota.value !== null || this.dataset.quota.value !== '0')
    || (this.dataset.refquota.value !== null || this.dataset.refquota.value !== '0')
      ? this.dataset.available.value + ' (Quota set)' : this.dataset.available.value;
  }

  get isFilesystem(): boolean {
    return this.dataset.type === DatasetType.Filesystem;
  }

  get isZvol(): boolean {
    return this.dataset.type === DatasetType.Volume;
  }

  deleteDataset(): void {
    this.mdDialog.open(DeleteDatasetDialogComponent, { data: this.dataset })
      .afterClosed()
      .pipe(filter(Boolean), untilDestroyed(this))
      .subscribe(() => {
        this.datasetStore.datasetUpdated();
      });
  }

  editDataset(): void {
    const editDatasetComponent = this.modalService.openInSlideIn(DatasetFormComponent, this.dataset.id);
    editDatasetComponent.setPk(this.dataset.id);
    editDatasetComponent.setVolId(this.dataset.pool);
    editDatasetComponent.setTitle(this.translate.instant('Edit Dataset'));
  }
}
