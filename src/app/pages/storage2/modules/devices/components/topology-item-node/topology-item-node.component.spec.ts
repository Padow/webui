import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { DiskType } from 'app/enums/disk-type.enum';
import { TopologyItemType } from 'app/enums/v-dev-type.enum';
import { TopologyItemStatus } from 'app/enums/vdev-status.enum';
import { Disk, TopologyDisk } from 'app/interfaces/storage.interface';
import { TopologyItemIconComponent } from 'app/pages/storage2/modules/devices/components/topology-item-icon/topology-item-icon.component';
import { TopologyItemNodeComponent } from 'app/pages/storage2/modules/devices/components/topology-item-node/topology-item-node.component';

describe('TopologyItemNodeComponent', () => {
  let spectator: Spectator<TopologyItemNodeComponent>;
  const topologyDisk = {
    type: TopologyItemType.Disk,
    path: null,
    guid: '123',
    status: TopologyItemStatus.Offline,
    stats: {
      read_errors: 1,
      write_errors: 2,
      checksum_errors: 3,
    },
    children: [],
    disk: 'sdf',
  } as TopologyDisk;
  const disk = {
    type: DiskType.Hdd,
    size: 1024 * 1024 * 16,
  } as Disk;
  const createComponent = createComponentFactory({
    component: TopologyItemNodeComponent,
    declarations: [
      MockComponent(TopologyItemIconComponent),
    ],
  });

  beforeEach(() => {
    spectator = createComponent({
      props: { disk, topologyItem: topologyDisk },
    });
  });

  it('shows "Device Name"', () => {
    expect(spectator.query('.name')).toHaveText(topologyDisk.disk);
    expect(spectator.query(TopologyItemIconComponent).disk).toBe(disk);
    expect(spectator.query(TopologyItemIconComponent).topologyItem).toBe(topologyDisk);
  });

  it('shows "Status"', () => {
    expect(spectator.query('.cell-status span')).toHaveText(topologyDisk.status);
    expect(spectator.component.statusColor).toEqual('var(--magenta)');
  });

  it('shows "Capacity"', () => {
    expect(spectator.query('.cell-capacity')).toHaveText('16.00MiB');
  });

  it('shows "Errors"', () => {
    expect(spectator.query('.cell-errors')).toHaveText('6 Errors');
  });
});
