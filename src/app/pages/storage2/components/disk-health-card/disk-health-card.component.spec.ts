import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import {
  createComponentFactory, Spectator, mockProvider, byText,
} from '@ngneat/spectator/jest';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { mockCall, mockWebsocket } from 'app/core/testing/utils/mock-websocket.utils';
import { DiskBus } from 'app/enums/disk-bus.enum';
import { DiskPowerLevel } from 'app/enums/disk-power-level.enum';
import { DiskStandby } from 'app/enums/disk-standby.enum';
import { DiskType } from 'app/enums/disk-type.enum';
import { Pool } from 'app/interfaces/pool.interface';
import { DiskTemperatureAgg, Disk } from 'app/interfaces/storage.interface';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { DiskHealthCardComponent } from 'app/pages/storage2/components/disk-health-card/disk-health-card.component';
import { PoolsDashboardStore } from 'app/pages/storage2/stores/pools-dashboard-store.service';

const diskDictionary: { [key: string]: Disk } = {
  sdd: {
    advpowermgmt: DiskPowerLevel.Disabled,
    bus: DiskBus.Spi,
    critical: 0,
    description: '',
    devname: 'sdd',
    difference: 0,
    duplicate_serial: [],
    enclosure: {
      number: 0,
      slot: 0,
    },
    expiretime: '',
    hddstandby: DiskStandby.AlwaysOn,
    identifier: '{uuid}b3ba146f-1ab6-4a45-ae6b-37ea00baf0aa',
    informational: 0,
    model: 'VMware_Virtual_S',
    multipath_member: '',
    multipath_name: '',
    name: 'sdd',
    number: 2096,
    pool: 'lio',
    rotationrate: 0,
    serial: '',
    size: 5368709120,
    smartoptions: '',
    subsystem: 'scsi',
    togglesmart: true,
    transfermode: 'Auto',
    type: DiskType.Hdd,
    zfs_guid: '12387051346845729003',
  },
};

const temperatureAgg = {
  sda: { min: 10, max: 30, avg: 20 },
  sdd: { min: 20, max: 50, avg: 40 },
} as DiskTemperatureAgg;

describe('DiskHealthCardComponent', () => {
  let spectator: Spectator<DiskHealthCardComponent>;
  let loader: HarnessLoader;

  const createComponent = createComponentFactory({
    component: DiskHealthCardComponent,
    imports: [
      NgxSkeletonLoaderModule,
    ],
    providers: [
      mockProvider(PoolsDashboardStore),
      mockProvider(SnackbarService),
      mockWebsocket([
        mockCall('disk.temperature_alerts', []),
        mockCall('smart.test.results', []),
        mockCall('disk.temperature_agg', temperatureAgg),
      ]),
    ],
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        poolState: { id: 1, name: 'DEV' } as Pool,
        diskDictionary,
        loading: false,
      },
    });
    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
  });

  it('shows a button to manage all disks', async () => {
    const manageDisksButton = await loader.getHarness(MatButtonHarness.with({ text: 'Manage Disks' }));

    expect(manageDisksButton).toBeTruthy();
    expect(await (await manageDisksButton.host()).getAttribute('href')).toBe('/storage2/disks');
  });

  describe('Temperatures', () => {
    it('shows disks temperature related alerts', () => {
      const detailsItem = spectator.query(byText('Disks temperature related alerts:')).parentElement;
      expect(detailsItem.querySelector('.value')).toHaveText('0');
    });

    it('shows highest temperature', () => {
      const detailsItem = spectator.query(byText('Highest Temperature:')).parentElement;
      expect(detailsItem.querySelector('.value')).toHaveText('50 °C');
    });

    it('shows lowest temperature', () => {
      const detailsItem = spectator.query(byText('Lowest Temperature:')).parentElement;
      expect(detailsItem.querySelector('.value')).toHaveText('10 °C');
    });

    it('shows average temperature', () => {
      const detailsItem = spectator.query(byText('Average Disk Temperature:')).parentElement;
      expect(detailsItem.querySelector('.value')).toHaveText('30 °C');
    });
  });

  describe('Smart Tests', () => {
    it('shows failed smart tests', () => {
      const detailsItem = spectator.query(byText('Failed S.M.A.R.T. Tests:')).parentElement;
      expect(detailsItem.querySelector('.value')).toHaveText('0');
    });
  });
});
