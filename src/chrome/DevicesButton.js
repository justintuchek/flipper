/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

import {Component, Button, styled} from 'flipper';
import {connect} from 'react-redux';
import {spawn} from 'child_process';
import {selectDevice, preferDevice} from '../reducers/connections.js';
import type BaseDevice from '../devices/BaseDevice.js';

type Props = {
  selectedDevice: ?BaseDevice,
  androidEmulators: Array<string>,
  devices: Array<BaseDevice>,
  selectDevice: (device: BaseDevice) => void,
  preferDevice: (device: string) => void,
};

const DropdownButton = styled(Button)({
  fontSize: 11,
});

// Remove this if the flow fixme at the bottom is addressed (or has already been removed).
/* eslint-disable prettier/prettier */
class DevicesButton extends Component<Props> {
  launchEmulator = (name: string) => {
    const child = spawn('emulator', [`@${name}`], {
      detached: true,
    });
    child.stderr.on('data', data => {
      console.error(`Android emulator error: ${data}`);
    });
    child.on('error', console.error);
    this.props.preferDevice(name);
  };

  render() {
    const {
      devices,
      androidEmulators,
      selectedDevice,
      selectDevice,
    } = this.props;
    let text = 'No device selected';
    let icon = 'minus-circle';

    if (selectedDevice) {
      text = selectedDevice.title;
      icon = 'mobile';
    }

    const dropdown = [];

    if (devices.length > 0) {
      dropdown.push(
        {
          label: 'Running devices',
          enabled: false,
        },
        ...devices.map((device: BaseDevice) => ({
          click: () => selectDevice(device),
          checked: device === selectedDevice,
          label: `${device.deviceType === 'physical' ? '📱 ' : ''}${
            device.title
          }`,
          type: 'checkbox',
        })),
      );
    }
    if (androidEmulators.length > 0) {
      const emulators = Array.from(androidEmulators)
        .filter(
          (name: string) =>
            devices.findIndex((device: BaseDevice) => device.title === name) ===
            -1,
        )
        .map((name: string) => ({
          label: name,
          click: () => this.launchEmulator(name),
        }));

      if (emulators.length > 0) {
        dropdown.push(
          {type: 'separator'},
          {
            label: 'Launch Android emulators',
            enabled: false,
          },
          ...emulators,
        );
      }
    }
    return (
      <DropdownButton compact={true} icon={icon} dropdown={dropdown}>
        {text}
      </DropdownButton>
    );
  }
} /* $FlowFixMe(>=0.86.0) This comment suppresses an error found when Flow v0.86
 * was deployed. To see the error, delete this comment and run Flow.
 */
export default connect(
  ({connections: {devices, androidEmulators, selectedDevice}}) => ({
    devices,
    androidEmulators,
    selectedDevice,
  }),
  {selectDevice, preferDevice},
)(DevicesButton);
